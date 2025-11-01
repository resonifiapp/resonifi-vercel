
import React, { useState, useEffect } from "react";
import { DailyCheckin } from "@/api/entities";
import { User } from "@/api/entities";
import { formatScore, formatDelta } from "@/components/utils/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { History, Flame, TrendingUp, TrendingDown, Minus } from "lucide-react";
import BottomNav from "../components/BottomNav";

const Sparkline = ({ data, width = 80, height = 20 }) => {
  if (data.length < 2) return <div className={`w-[${width}px] h-[${height}px]`} />;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        fill="none"
        stroke="#2DD4BF"
        strokeWidth="1.5"
        points={points}
      />
    </svg>
  );
};

export default function FrequencyHistory() {
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const currentUser = await User.me();
        const checkins = await DailyCheckin.filter(
          { created_by: currentUser.email },
          "-date",
          7
        );

        setRecentCheckins(checkins);
        calculateStreak(checkins);
      } catch (error) {
        console.error("Error loading frequency history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  const calculateStreak = (checkins) => {
    if (checkins.length === 0) {
      setStreak(0);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const mostRecentDate = new Date(checkins[0].date);
    mostRecentDate.setHours(12, 0, 0, 0);

    // If the most recent check-in was before yesterday, streak is broken
    if (mostRecentDate.getTime() < yesterday.getTime()) {
      setStreak(0);
      return;
    }

    let currentStreak = 1;
    let lastDate = mostRecentDate;

    for (let i = 1; i < checkins.length; i++) {
      const currentDate = new Date(checkins[i].date);
      currentDate.setHours(12, 0, 0, 0);
      
      const expectedPreviousDate = new Date(lastDate);
      expectedPreviousDate.setDate(expectedPreviousDate.getDate() - 1);

      if (currentDate.getTime() === expectedPreviousDate.getTime()) {
        currentStreak++;
        lastDate = currentDate;
      } else {
        // If there's a gap, or dates are out of order (shouldn't happen with "-date" sort)
        // or a date is duplicated, break the streak check.
        // For streak, we only care about consecutive days backwards from the most recent.
        break;
      }
    }
    setStreak(currentStreak);
  };

  const getTrend = (current, previous) => {
    if (!previous) return null;
    const diff = current - previous;
    if (diff > 0) return { icon: TrendingUp, color: "text-green-500", text: formatDelta(diff) };
    if (diff < 0) return { icon: TrendingDown, color: "text-red-500", text: formatDelta(diff) };
    return { icon: Minus, color: "text-gray-400", text: formatDelta(0) }; // Applied formatDelta here
  };

  const getResonanceColorClass = (score) => {
    if (score >= 7.5) {
      return "text-[#2DD4BF]"; // Teal/Green for high wellness
    } else if (score >= 4.5) {
      return "text-yellow-400"; // Yellow for medium wellness
    } else {
      return "text-red-500"; // Red for low wellness
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2DD4BF] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-has-bottom-nav p-6 bg-[#0F172A] text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-white mb-2">Recent History</h1>
            <p className="text-gray-400">Your last 7 daily check-ins</p>
          </div>
          {streak > 1 && (
             <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
              className="flex items-center justify-center gap-2 font-semibold text-orange-600 bg-orange-100/80 border border-orange-200 rounded-full px-4 py-2 max-w-sm mx-auto"
            >
              <Flame className="w-5 h-5" />
              {streak} day streak!
            </motion.div>
          )}
        </motion.div>

        {recentCheckins.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-[#1A2035]/80 backdrop-blur-sm border border-slate-700/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-white">Daily Check-ins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCheckins.map((checkin, index) => {
                    const trend = getTrend(checkin.frequency_today, recentCheckins[index + 1]?.frequency_today);
                    // Sparkline data should be in chronological order for correct display
                    // The slice creates an array from `index` up to `index + 7` (or end of array).
                    // .reverse() then makes the most recent data point (which is `checkin.frequency_today`)
                    // appear at the end of the sparkline.
                    const sparklineData = recentCheckins.slice(index, Math.min(index + 7, recentCheckins.length)).reverse().map(c => c.frequency_today);
                    
                    return (
                      <div key={checkin.id} className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-white">
                              {format(new Date(checkin.date), 'MMM')}
                            </div>
                            <div className="text-2xl font-bold text-white">
                              {format(new Date(checkin.date), 'd')}
                            </div>
                            <div className="text-xs text-gray-400">
                              {format(new Date(checkin.date), 'EEE')}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              {/* Ensure formatScore is used and existing color class is preserved */}
                              <div className={`text-2xl font-bold ${getResonanceColorClass(checkin.frequency_today)}`}>
                                {formatScore(checkin.frequency_today)}
                              </div>
                              <div className="text-xs text-gray-400">Wellness Index</div>
                            </div>
                            
                            {trend && (
                              <div className={`flex items-center gap-1 text-sm ${trend.color}`}>
                                <trend.icon className="w-4 h-4" />
                                <span className="font-medium">{trend.text}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <Sparkline data={sparklineData} />
                          <div className="text-xs text-gray-400 mt-1">Trend</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-[#1A2035]/80 backdrop-blur-sm border border-blue-900/50 shadow-lg">
              <CardContent className="p-12 text-center">
                <History className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No History Yet</h3>
                <p className="text-gray-400">
                  Complete your first daily check-in to start tracking your wellness history.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
      
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
