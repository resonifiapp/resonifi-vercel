import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const prompts = [
  "Pause for 3 deep breaths before your next task.",
  "Name one thing you're grateful for right now.",
  "Check in: are your shoulders tense? Roll them back.",
  "Drink a glass of water as a mindful reset.",
  "Look away from screens for 20 seconds.",
  "Stretch your arms overhead for 10 seconds.",
  "Text someone you appreciate.",
  "Notice 3 things you can see, hear, and feel.",
  "Take a 2-minute walk, even if it's just around the room.",
  "Write down one positive thing from today."
];

export default function CommunityPulseCard() {
  const [pulse, setPulse] = useState({ sleep: null, stressPercent: null, totalUsers: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const prompt = prompts[dayOfYear % prompts.length];

  useEffect(() => {
    const loadCommunityPulse = async () => {
      try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const startDate = sevenDaysAgo.toISOString().split('T')[0];
        
        const recentCheckins = await base44.entities.DailyCheckin.filter({
          date: { $gte: startDate }
        });

        if (recentCheckins.length > 0) {
          const sleepData = recentCheckins.filter(c => c.sleep != null).map(c => c.sleep);
          const avgSleep = sleepData.length > 0 
            ? (sleepData.reduce((sum, val) => sum + val, 0) / sleepData.length).toFixed(1)
            : null;

          const stressData = recentCheckins.filter(c => c.stress_level != null);
          const highStress = stressData.filter(c => c.stress_level >= 5).length;
          const stressPercent = stressData.length > 0
            ? Math.round((highStress / stressData.length) * 100)
            : null;

          const uniqueUsers = new Set(recentCheckins.map(c => c.created_by)).size;

          setPulse({ 
            sleep: avgSleep, 
            stressPercent, 
            totalUsers: uniqueUsers 
          });
        }
      } catch (error) {
        console.log('[CommunityPulse] Load failed (silent):', error);
        // Fail silently
      } finally {
        setIsLoading(false);
      }
    };

    loadCommunityPulse();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-[#1A2035]/80 border-slate-700/50 h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-base">
              <Users className="w-4 h-4 text-blue-400" />
              Community Pulse
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-gray-400 text-sm">Loading...</div>
            ) : (
              <div className="space-y-2 text-sm">
                <p className="text-gray-300">
                  Avg sleep: <strong className="text-white">{pulse.sleep ? `${pulse.sleep}h` : '--'}</strong>
                </p>
                <p className="text-gray-300">
                  <strong className="text-white">{pulse.stressPercent ?? '--'}%</strong> felt stressed (≥5/10)
                </p>
                <p className="text-xs text-gray-500 mt-3">
                  Based on {pulse.totalUsers} user{pulse.totalUsers !== 1 ? 's' : ''} (last 7 days)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-[#1A2035]/80 border-slate-700/50 h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-base">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              Daily Prompt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 text-sm leading-relaxed italic">
              {prompt}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}