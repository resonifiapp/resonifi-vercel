import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function SpiritualSummaryCard() {
  const [todayScore, setTodayScore] = useState(null);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  useEffect(() => {
    const loadTodayScore = () => {
      try {
        const history = JSON.parse(localStorage.getItem("sr:history") || "[]");
        const today = new Date().toISOString().split('T')[0];
        const todayEntry = history.find(entry => entry.ts.startsWith(today));
        
        if (todayEntry && todayEntry.score !== undefined) {
          // Ensure score is within 0-100 range
          const score = Math.min(100, Math.max(0, todayEntry.score));
          setTodayScore(score);
          setHasCheckedIn(true);
        } else {
          setHasCheckedIn(false);
        }
      } catch (error) {
        console.log('[SpiritualSummary] Failed to load (silent):', error);
      }
    };

    loadTodayScore();
    
    const handleUpdate = () => loadTodayScore();
    if (typeof window !== "undefined") {
      window.addEventListener("res:spiritual-updated", handleUpdate);
    }
    
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("res:spiritual-updated", handleUpdate);
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-[#1A2035] to-[#0D4D4A] border-[#2DD4BF]/30 shadow-lg shadow-[#2DD4BF]/10">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#2DD4BF]" />
              <span>Spiritual Resonance</span>
            </div>
            <Link to={createPageUrl("SpiritualResonance")}>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-[#2DD4BF] hover:text-[#0D9488] hover:bg-[#2DD4BF]/10"
              >
                View More
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasCheckedIn ? (
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#2DD4BF] to-[#0D9488] shadow-lg mb-3">
                <div className="text-3xl font-bold text-white">{todayScore}</div>
              </div>
              <p className="text-sm text-gray-300 mt-2">Today's Inner Alignment</p>
              <p className="text-xs text-gray-400 mt-1">Tracking your spiritual wellness</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-300 mb-4">No check-in today yet</p>
              <Link to={createPageUrl("SpiritualResonance")}>
                <Button 
                  size="sm"
                  className="bg-[#2DD4BF] hover:bg-[#0D9488] text-white"
                >
                  Check In Now
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}