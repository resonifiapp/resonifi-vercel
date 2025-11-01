import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { getGuestCheckins, clearGuestData } from "../components/lib/guestMode";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Migrating your data...");

  useEffect(() => {
    migrateGuestData();
  }, []);

  const migrateGuestData = async () => {
    try {
      const guestCheckins = getGuestCheckins();
      
      if (guestCheckins.length === 0) {
        setStatus("Welcome! Redirecting...");
        setTimeout(() => navigate(createPageUrl("Dashboard")), 1000);
        return;
      }

      // Verify authentication
      const user = await base44.auth.me();
      
      // Bulk create check-ins
      const checkinRecords = guestCheckins.map(gc => ({
        date: new Date(gc.ts).toISOString().split('T')[0],
        frequency_today: gc.index || 0,
        mood_rating: gc.mood || 5,
        energy_level: gc.energy || 5,
        sleep: gc.sleep || 7,
        exercise: gc.exercise || 0,
        stress_level: gc.stress || 5,
        connection_rating: gc.connection || 5,
        gratitude_rating: gc.gratitude || 5,
        hydration: gc.hydration || 2,
        resilience: gc.resilience || 5,
        purpose: gc.purpose || 5
      }));

      await base44.entities.DailyCheckin.bulkCreate(checkinRecords);
      
      // Clear guest data
      clearGuestData();
      
      if (typeof window !== "undefined" && window.plausible) {
        window.plausible("Guest_Migration_Success", {
          props: { count: guestCheckins.length }
        });
      }

      setStatus(`✅ Migrated ${guestCheckins.length} check-ins! Redirecting...`);
      setTimeout(() => navigate(createPageUrl("Dashboard")), 2000);

    } catch (error) {
      console.error('[AuthCallback] Migration failed:', error);
      
      if (typeof window !== "undefined" && window.plausible) {
        window.plausible("Guest_Migration_Error");
      }

      setStatus("⚠️ Migration failed, but you're logged in. Redirecting...");
      setTimeout(() => navigate(createPageUrl("Dashboard")), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">{status}</p>
      </div>
    </div>
  );
}