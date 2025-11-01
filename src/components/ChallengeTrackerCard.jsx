import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { getChallengeProgress } from './lib/challengeTracker';

export default function ChallengeTrackerCard() {
  const [progress, setProgress] = useState({ completed: 0, total: 7, dates: [] });
  const [isLoading, setIsLoading] = useState(true);

  const loadProgress = async () => {
    try {
      const data = await getChallengeProgress();
      console.log('[ChallengeTrackerCard] Progress loaded:', data);
      setProgress(data);
    } catch (err) {
      console.log('[Challenge] Load failed (silent):', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();

    // Listen for check-in completion events
    const handleCheckinComplete = () => {
      console.log('[ChallengeTrackerCard] Check-in completed, refreshing...');
      loadProgress();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('res:checkin-completed', handleCheckinComplete);
    }

    // Refresh every 10 seconds (down from 30)
    const interval = setInterval(loadProgress, 10000);
    
    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('res:checkin-completed', handleCheckinComplete);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <Card className="bg-[#1A2035]/80 border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white text-base">
            <Target className="w-4 h-4 text-blue-400" />
            7-Day Challenge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-400">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1A2035]/80 border-slate-700/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white text-base">
          <Target className="w-4 h-4 text-blue-400" />
          7-Day Challenge
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Progress</span>
            <span className="text-white font-medium">{progress.completed}/{progress.total} days</span>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 7 }).map((_, i) => {
              const isCompleted = i < progress.completed;
              return (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all
                    ${isCompleted
                      ? 'bg-blue-500 border-blue-500 shadow-lg shadow-blue-500/50' 
                      : 'bg-transparent border-gray-600'}`}
                >
                  {isCompleted && <span className="text-white text-xs font-bold">✓</span>}
                </motion.div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400">
            {progress.completed === 0 
              ? 'Log your first check-in to begin!' 
              : progress.completed === 7 
                ? '🎉 Challenge complete!' 
                : `${7 - progress.completed} more ${7 - progress.completed === 1 ? 'day' : 'days'} to go!`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}