
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function WeeklyRecap({ checkins }) {
  const recap = useMemo(() => {
    if (!checkins || checkins.length < 2) return null;

    const today = new Date();
    const isMonday = today.getDay() === 1;
    
    // Only show on Mondays
    if (!isMonday) {
      console.log('[WeeklyRecap] Not Monday, skipping. Day:', today.getDay());
      return null;
    }

    // Check if already shown this week
    const lastShown = localStorage.getItem('res:weeklyRecap:lastShown');
    const thisMonday = new Date(today);
    thisMonday.setHours(0, 0, 0, 0);
    const thisMondayStr = thisMonday.toISOString().split('T')[0];
    
    if (lastShown === thisMondayStr) {
      console.log('[WeeklyRecap] Already shown this Monday, skipping');
      return null;
    }

    // Get last 7 days of check-ins
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const startDate = sevenDaysAgo.toISOString().split('T')[0];
    
    const weekCheckins = checkins.filter(c => c.date >= startDate);
    
    if (weekCheckins.length < 2) return null;

    // Calculate delta (this week vs last week average)
    const thisWeekScores = weekCheckins.slice(0, Math.min(7, weekCheckins.length));
    const thisWeekAvg = thisWeekScores.reduce((sum, c) => sum + c.frequency_today, 0) / thisWeekScores.length;
    
    const lastWeekCheckins = checkins.filter(c => {
      const fourteenDaysAgo = new Date(today);
      fourteenDaysAgo.setDate(today.getDate() - 14);
      return c.date >= fourteenDaysAgo.toISOString().split('T')[0] && c.date < startDate;
    });
    
    let delta = 0;
    if (lastWeekCheckins.length > 0) {
      const lastWeekAvg = lastWeekCheckins.reduce((sum, c) => sum + c.frequency_today, 0) / lastWeekCheckins.length;
      delta = Math.round(thisWeekAvg - lastWeekAvg);
    }

    // Find best day
    const bestDayCheckin = thisWeekScores.reduce((best, current) => 
      current.frequency_today > best.frequency_today ? current : best
    );
    const bestDay = new Date(bestDayCheckin.date).toLocaleDateString('en-US', { weekday: 'short' });

    // Find top mover (which metric improved most)
    const metrics = ['mood_rating', 'energy_level', 'sleep', 'connection_rating', 'gratitude_rating'];
    const metricNames = {
      mood_rating: 'Mood',
      energy_level: 'Energy',
      sleep: 'Sleep',
      connection_rating: 'Connection',
      gratitude_rating: 'Gratitude'
    };
    
    let topMover = 'Balance';
    let topMoverdelta = 0;
    
    metrics.forEach(metric => {
      const thisWeekMetric = thisWeekScores
        .filter(c => c[metric] != null)
        .reduce((sum, c) => sum + c[metric], 0) / thisWeekScores.filter(c => c[metric] != null).length;
      
      const lastWeekMetric = lastWeekCheckins
        .filter(c => c[metric] != null)
        .reduce((sum, c) => sum + c[metric], 0) / lastWeekCheckins.filter(c => c[metric] != null).length;
      
      const metricDelta = thisWeekMetric - lastWeekMetric;
      
      if (Math.abs(metricDelta) > Math.abs(topMoverdelta)) {
        topMoverdelta = metricDelta;
        topMover = metricNames[metric];
      }
    });

    return { delta, bestDay, topMover };
  }, [checkins]);

  const handleDismiss = () => {
    const today = new Date();
    const thisMonday = new Date(today);
    thisMonday.setHours(0, 0, 0, 0);
    localStorage.setItem('res:weeklyRecap:lastShown', thisMonday.toISOString().split('T')[0]);
    
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('Weekly Recap Viewed');
    }
  };

  if (!recap) return null;

  const { delta, bestDay, topMover } = recap;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-[#1A2035]/80 border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-[#2DD4BF]" />
            Weekly Recap
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-[#2DD4BF]" />
              <h3 className="text-lg font-semibold text-white">
                Last week: {delta > 0 ? `+${delta}` : delta} points
              </h3>
            </div>
            <p className="text-sm text-gray-300">
              Best day: <strong className="text-white">{bestDay}</strong>
            </p>
            <p className="text-sm text-gray-300">
              Most impact: <strong className="text-white">{topMover}</strong>
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              asChild 
              size="sm"
              className="bg-[#2DD4BF] hover:bg-[#0D9488] text-white"
            >
              <Link to={createPageUrl("Insights")} onClick={handleDismiss}>
                See Full Insights
              </Link>
            </Button>
            <Button 
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-gray-300 hover:text-white"
            >
              Got it
            </Button>
          </div>

          <p className="text-xs text-gray-500 italic">
            Repeat what worked this week to keep the momentum going.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
