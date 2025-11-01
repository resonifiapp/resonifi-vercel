import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const NUDGES = {
  midday: {
    time: "13:00",
    icon: Sun,
    message: "Two sliders in 10 seconds = today's Resonance. Tap to tune.",
    startHour: 13,
    endHour: 16
  },
  evening: {
    time: "20:30",
    icon: Moon,
    message: "Lock in today: Sleep + 1 reflection → clearer Resonance tomorrow.",
    startHour: 20,
    endHour: 23
  }
};

export default function DailyNudges({ hasCheckedInToday }) {
  const [activeNudge, setActiveNudge] = useState(null);
  const [dismissed, setDismissed] = useState(() => {
    try {
      const stored = localStorage.getItem('res:nudges:dismissed');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (hasCheckedInToday) {
      setActiveNudge(null);
      return;
    }

    const checkNudge = () => {
      const now = new Date();
      const hour = now.getHours();
      const today = now.toISOString().split('T')[0];

      // Check midday nudge
      if (hour >= NUDGES.midday.startHour && hour < NUDGES.midday.endHour) {
        if (!dismissed[`midday-${today}`]) {
          setActiveNudge('midday');
          return;
        }
      }

      // Check evening nudge
      if (hour >= NUDGES.evening.startHour && hour < NUDGES.evening.endHour) {
        if (!dismissed[`evening-${today}`]) {
          setActiveNudge('evening');
          return;
        }
      }

      setActiveNudge(null);
    };

    checkNudge();
    const interval = setInterval(checkNudge, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [hasCheckedInToday, dismissed]);

  const handleDismiss = () => {
    const today = new Date().toISOString().split('T')[0];
    const key = `${activeNudge}-${today}`;
    
    const newDismissed = { ...dismissed, [key]: true };
    setDismissed(newDismissed);
    localStorage.setItem('res:nudges:dismissed', JSON.stringify(newDismissed));
    
    setActiveNudge(null);

    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('Nudge Dismissed', { props: { type: activeNudge } });
    }
  };

  const handleAction = () => {
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('Nudge Clicked', { props: { type: activeNudge } });
    }
  };

  if (!activeNudge) return null;

  const nudge = NUDGES[activeNudge];
  const Icon = nudge.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-24 md:bottom-6 right-6 z-40 max-w-sm"
      >
        <Card className="bg-gradient-to-br from-[#1A2035] to-[#0F172A] border-[#2DD4BF]/30 shadow-2xl">
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-5 h-5 text-[#2DD4BF]" />
                  <span className="text-xs text-gray-400">{nudge.time}</span>
                </div>
                <p className="text-sm text-gray-200 mb-3">
                  {nudge.message}
                </p>
                <Button 
                  asChild 
                  size="sm" 
                  onClick={handleAction}
                  className="bg-[#2DD4BF] hover:bg-[#0D9488] text-white"
                >
                  <Link to={createPageUrl("DailyCheckin")}>
                    Tune Now
                  </Link>
                </Button>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white transition"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}