
import React, { useState, useEffect, useMemo } from "react";
import { DailyCheckin } from "@/api/entities";
import { User } from "@/api/entities";
import { generateInsights } from "../components/lib/insights";
import { computeResilience } from "../components/lib/resilience";
import { InsightsPanel } from "../components/InsightsPanel";
import ResiliencePanel from "../components/ResiliencePanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BottomNav from "../components/BottomNav";

export default function Insights() {
  const [checkins, setCheckins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTipDialog, setShowTipDialog] = useState(false);
  const [currentTip, setCurrentTip] = useState({ title: "", content: "" });

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await User.me();
        const data = await DailyCheckin.filter(
          { created_by: currentUser.email },
          "-date",
          90
        );
        setCheckins(data);
      } catch (error) {
        console.error("Error loading insights data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const insights = useMemo(() => {
    if (checkins.length < 7) return [];
    return generateInsights(checkins);
  }, [checkins]);

  const resilienceData = useMemo(() => {
    if (checkins.length < 7) return null;
    return computeResilience(checkins);
  }, [checkins]);

  const handleCta = (action) => {
    const tips = {
      breathing: {
        title: "Box Breathing Exercise",
        content: "Take 60 seconds right now:\n\n1. Inhale for 4 counts\n2. Hold for 4 counts\n3. Exhale for 4 counts\n4. Hold for 4 counts\n\nRepeat 4 times. This activates your parasympathetic nervous system and reduces stress."
      },
      sleep_tips: {
        title: "3 Sleep Tips",
        content: "1. Same wake time every day (even weekends)\n2. Dim lights 60 minutes before bed\n3. No screens 30 minutes before bed\n\nConsistency is key for quality sleep."
      },
      exercise_micro: {
        title: "Micro-Workout Ideas",
        content: "Quick wins for busy days:\n\n• 3×10 squats\n• 10-minute brisk walk\n• 5 push-ups every hour\n• Desk stretches every 90 minutes\n\nSmall movements compound over time!"
      },
      connection_tips: {
        title: "Connection Ideas",
        content: "Simple ways to strengthen social bonds:\n\n• Send a voice message to a friend\n• Schedule a coffee chat\n• Join a local group or class\n• Reach out to someone you've been thinking about\n\nConnection is a pillar of well-being."
      },
      resilience_tips: {
        title: "Building Resilience",
        content: "Strengthen your mental resilience:\n\n• Practice self-compassion daily\n• Break big challenges into small steps\n• Take regular breaks (Pomodoro technique)\n• Reframe setbacks as learning opportunities\n• Build a support network\n\nResilience is a skill you can develop!"
      }
    };

    const tip = tips[action] || tips.breathing;
    setCurrentTip(tip);
    setShowTipDialog(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2DD4BF] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (checkins.length < 7) {
    return (
      <div className="page-has-bottom-nav p-6 bg-[#0F172A] pb-24 md:pb-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-[#1A2035]/80 border-slate-700/50">
              <CardContent className="p-12 text-center">
                <Sparkles className="w-16 h-16 mx-auto text-[#2DD4BF] mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Keep Going!
                </h3>
                <p className="text-gray-400">
                  Complete at least 7 daily check-ins to unlock personalized insights and patterns.
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  You have {checkins.length} check-in{checkins.length !== 1 ? 's' : ''} logged.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="page-has-bottom-nav p-6 bg-[#0F172A] pb-24 md:pb-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <TrendingUp className="w-8 h-8 text-[#2DD4BF]" />
            Your Insights
          </h1>
          <p className="text-gray-400">
            Personalized patterns and actionable tips based on your data
          </p>
        </motion.div>

        {resilienceData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ResiliencePanel resilienceData={resilienceData} />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <InsightsPanel insights={insights} onCta={handleCta} />
        </motion.div>

        {insights.length === 0 && !resilienceData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-[#1A2035]/80 border-slate-700/50">
              <CardContent className="p-8 text-center">
                <Zap className="w-12 h-12 mx-auto text-green-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  You're doing great!
                </h3>
                <p className="text-gray-400">
                  No major patterns detected right now. Keep up your consistent logging to unlock more insights.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <Dialog open={showTipDialog} onOpenChange={setShowTipDialog}>
        <DialogContent className="sm:max-w-md bg-[#1A2035] border-slate-700/50">
          <DialogHeader>
            <DialogTitle className="text-white">{currentTip.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-300 whitespace-pre-line">{currentTip.content}</p>
          </div>
          <Button
            onClick={() => setShowTipDialog(false)}
            className="w-full bg-[#2DD4BF] hover:bg-[#0D9488] text-white"
          >
            Got it!
          </Button>
        </DialogContent>
      </Dialog>
      
      <BottomNav />
    </div>
  );
}
