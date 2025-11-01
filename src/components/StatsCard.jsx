import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function StatsCard({ 
  currentStreak, 
  longestStreak, 
  weeklyCheckins, 
  lastCheckinDate 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-[#1A2035]/80 border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white text-base">
            <TrendingUp className="w-4 h-4 text-[#2DD4BF]" />
            Your Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current vs Longest Streak */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0F172A] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🔥</span>
                <span className="text-xs text-gray-400">Current</span>
              </div>
              <p className="text-2xl font-bold text-white">{currentStreak}</p>
              <p className="text-xs text-gray-500">day{currentStreak !== 1 ? 's' : ''}</p>
            </div>
            
            <div className="bg-[#0F172A] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-gray-400">Best</span>
              </div>
              <p className="text-2xl font-bold text-white">{longestStreak}</p>
              <p className="text-xs text-gray-500">day{longestStreak !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Weekly Summary */}
          <div className="bg-[#0F172A] rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">This Week</span>
              </div>
              <span className="text-lg font-bold text-white">{weeklyCheckins}/7</span>
            </div>
            <div className="w-full h-2 bg-[#1A2035] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(weeklyCheckins / 7) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 to-[#2DD4BF]"
              />
            </div>
          </div>

          {/* Last Check-in */}
          {lastCheckinDate && (
            <div className="text-center pt-2 border-t border-slate-700/50">
              <p className="text-xs text-gray-500">Last check-in</p>
              <p className="text-sm text-gray-300 mt-1">
                {new Date(lastCheckinDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}