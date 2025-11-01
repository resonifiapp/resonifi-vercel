import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { formatGraceTime } from "./lib/streakSystem";

export default function StreakBanner({ currentStreak, isInGracePeriod, graceEndsAt }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!isInGracePeriod || !graceEndsAt) return;

    const updateTime = () => {
      setTimeLeft(formatGraceTime(graceEndsAt));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [isInGracePeriod, graceEndsAt]);

  if (isInGracePeriod) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30">
          <div className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-orange-400" />
                  <h3 className="font-semibold text-white">Streak Saver Active</h3>
                </div>
                <p className="text-sm text-gray-200 mb-3">
                  Do any 1 check-in in the next <strong>{timeLeft}</strong> to save your {currentStreak}-day streak!
                </p>
                <Button 
                  asChild 
                  size="sm" 
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Link to={createPageUrl("DailyCheckin")}>
                    Save My Streak
                  </Link>
                </Button>
              </div>
              <Flame className="w-8 h-8 text-orange-400 animate-pulse" />
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (currentStreak > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full border border-orange-500/30">
          <Flame className="w-5 h-5 text-orange-400" />
          <span className="text-white font-semibold">
            Day {currentStreak} tuning your resonance
          </span>
        </div>
      </motion.div>
    );
  }

  return null;
}