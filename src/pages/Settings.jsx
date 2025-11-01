import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Volume2, VolumeX, Vibrate, Zap, Sparkles } from 'lucide-react';
import { getFeedback, setFeedback } from '../components/lib/feedbackPrefs';
import { motion } from 'framer-motion';

export default function Settings() {
  const [feedbackPrefs, setFeedbackPrefs] = useState(getFeedback());
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  const handleFeedbackUpdate = (setting, value) => {
    setFeedback({ [setting]: value });
    setFeedbackPrefs(getFeedback());

    if (window.resoAudio) {
      const updatedPrefs = getFeedback();
      window.resoAudio.updateSettings({
        sounds_enabled: updatedPrefs.sound,
        haptics_enabled: updatedPrefs.haptic,
      });
    }
  };

  return (
    <div className="min-h-screen p-6 bg-[#0F172A] text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <SettingsIcon className="w-8 h-8 text-[#2DD4BF]" />
            Settings
          </h1>
          <p className="text-gray-400">Customize your Resonifi experience</p>
        </motion.div>

        {/* Feedback Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-[#1A2035]/80 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Feedback & Interaction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div className="flex items-center gap-3">
                  {feedbackPrefs.sound ? (
                    <Volume2 className="w-5 h-5 text-gray-400" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <div className="font-medium text-white">Sound Effects</div>
                    <div className="text-sm text-gray-400">Audio feedback for interactions</div>
                  </div>
                </div>
                <Switch
                  checked={feedbackPrefs.sound}
                  onCheckedChange={(checked) => handleFeedbackUpdate('sound', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Vibrate className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-white">Haptic Feedback</div>
                    <div className="text-sm text-gray-400">Vibration feedback on mobile</div>
                  </div>
                </div>
                <Switch
                  checked={feedbackPrefs.haptic}
                  onCheckedChange={(checked) => handleFeedbackUpdate('haptic', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lite Mode */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-[#1A2035]/80 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#2DD4BF]/20 rounded-lg">
                    <Zap className="w-6 h-6 text-[#2DD4BF]" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg mb-2">Lite Mode Check-in</div>
                    <div className="text-sm text-gray-300 mb-3">
                      Minimal steppers with units, quick save, resilience score, and insights.
                      Perfect for quick daily tracking without the full interface.
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-[#2DD4BF]/20 text-[#2DD4BF] px-2 py-1 rounded-full">Fast</span>
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">Minimal</span>
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">Resilience</span>
                    </div>
                  </div>
                </div>

                <Link to={createPageUrl('LiteCheckin')}>
                  <Button className="bg-[#2DD4BF] hover:bg-[#0D9488] text-white whitespace-nowrap">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Try Lite Mode
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* User Info */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-[#1A2035]/80 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Account</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-gray-300">
                  <div><span className="text-gray-400">Name:</span> {user.full_name}</div>
                  <div><span className="text-gray-400">Email:</span> {user.email}</div>
                  <div><span className="text-gray-400">Role:</span> {user.role}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}