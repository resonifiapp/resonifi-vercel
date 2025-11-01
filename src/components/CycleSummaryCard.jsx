import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

const PHASE_EMOJI = {
  menstrual: "🌑",
  follicular: "🌒",
  ovulatory: "🌕",
  luteal: "🌘",
};

const PHASE_NAMES = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulatory: "Ovulatory",
  luteal: "Luteal",
};

export default function CycleSummaryCard() {
  const [user, setUser] = useState(null);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [cycleDay, setCycleDay] = useState(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const loadCycleData = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        const cycleUser = JSON.parse(localStorage.getItem("cycle:user") || "{}");
        const isEnabled = cycleUser.enableCycleResonance === true;
        setEnabled(isEnabled);
        
        if (!isEnabled) return;

        // Get latest cycle log
        const logs = await base44.entities.CycleLog.filter(
          { created_by: userData.email },
          "-date",
          1
        );

        if (logs.length > 0) {
          const latest = logs[0];
          setCurrentPhase(latest.phase);
          setCycleDay(latest.cycle_day);
        }
      } catch (error) {
        console.log('[CycleSummary] Failed to load (silent):', error);
      }
    };

    loadCycleData();
    
    // Listen for cycle updates
    const handleUpdate = () => loadCycleData();
    if (typeof window !== "undefined") {
      window.addEventListener("res:cycle-updated", handleUpdate);
    }
    
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("res:cycle-updated", handleUpdate);
      }
    };
  }, []);

  if (!enabled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-[#1A2035] to-[#4A1F35] border-[#F9A8D4]/30 shadow-lg shadow-[#F9A8D4]/10">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌸</span>
                <span>Cycle Resonance™</span>
              </div>
              <Link to={createPageUrl("CycleTracking")}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-[#F9A8D4] hover:text-[#F472B6] hover:bg-[#F9A8D4]/10"
                >
                  Enable
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-gray-300 mb-2">Track your cycle phases</p>
              <p className="text-xs text-gray-400">Enable to optimize wellness around your cycle</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-[#1A2035] to-[#4A1F35] border-[#F9A8D4]/30 shadow-lg shadow-[#F9A8D4]/10">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌸</span>
              <span>Cycle Resonance™</span>
            </div>
            <Link to={createPageUrl("CycleTracking")}>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-[#F9A8D4] hover:text-[#F472B6] hover:bg-[#F9A8D4]/10"
              >
                View More
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentPhase ? (
            <div className="text-center">
              <div className="text-5xl mb-3">{PHASE_EMOJI[currentPhase] || "🌸"}</div>
              <p className="text-lg font-semibold text-white mb-1">
                {PHASE_NAMES[currentPhase] || "Tracking"}
              </p>
              {cycleDay && (
                <p className="text-sm text-gray-300">Day {cycleDay} of cycle</p>
              )}
              <p className="text-xs text-gray-400 mt-2">Cycle tracking active</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-300 mb-4">No cycle data yet</p>
              <Link to={createPageUrl("CycleTracking")}>
                <Button 
                  size="sm"
                  className="bg-[#F9A8D4] hover:bg-[#F472B6] text-gray-900"
                >
                  Log Today
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}