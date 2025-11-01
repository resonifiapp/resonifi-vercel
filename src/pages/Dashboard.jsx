import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, Calendar, Sparkles, Heart, Users } from "lucide-react";
import { motion } from "framer-motion";
import BottomNav from "../components/BottomNav";
import Meta from "../components/Meta";
import { computeWellnessIndex } from "../components/lib/wellnessIndex";

function WellnessBall({ value = 0 }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;

  return (
    <div className="relative">
      <svg width="180" height="180" className="transform -rotate-90">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="90" cy="90" r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          stroke="#2DD4BF"
          strokeWidth="8"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter="url(#glow)"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl font-bold text-white">{value}</span>
      </div>
    </div>
  );
}

function QuickAction({ to, label, icon, color = "#2DD4BF" }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-6 text-center transition-all hover:bg-slate-800/80 hover:scale-105"
    >
      <div className="mb-2" style={{ color }}>{icon}</div>
      <div className="text-sm font-medium text-slate-200">{label}</div>
    </Link>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [todayCheckin, setTodayCheckin] = useState(null);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadDashboardData();

    // Listen for checkin completion events
    const handleCheckinComplete = () => {
      loadDashboardData();
    };

    window.addEventListener('res:checkin-completed', handleCheckinComplete);
    return () => window.removeEventListener('res:checkin-completed', handleCheckinComplete);
  }, []);

  const loadDashboardData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const today = new Date().toISOString().split('T')[0];
      
      // Load today's checkin
      const todayCheckins = await base44.entities.DailyCheckin.filter(
        { created_by: userData.email, date: today },
        "-created_date",
        1
      );

      if (todayCheckins.length > 0) {
        setTodayCheckin(todayCheckins[0]);
        setCurrentIndex(todayCheckins[0].frequency_today || 0);
      } else {
        setTodayCheckin(null);
        setCurrentIndex(0);
      }

      // Load recent checkins for trends
      const recent = await base44.entities.DailyCheckin.filter(
        { created_by: userData.email },
        "-date",
        7
      );
      setRecentCheckins(recent);

    } catch (error) {
      console.error('[Dashboard] Load failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2DD4BF] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const avgIndex = recentCheckins.length > 0
    ? Math.round(recentCheckins.reduce((sum, c) => sum + (c.frequency_today || 0), 0) / recentCheckins.length)
    : 0;

  const streak = recentCheckins.length;

  return (
    <>
      <Meta
        title="Resonifi™ — Dashboard"
        description="Your personal wellness dashboard"
        url="https://resonifiapp.com/dashboard"
      />

      <div className="page-has-bottom-nav min-h-screen bg-[#0F172A] px-6 pt-6 pb-24 md:pb-6">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.full_name || 'Friend'}! 👋
            </h1>
            <p className="text-gray-400">
              {todayCheckin ? "Today's wellness snapshot" : "Ready for today's check-in?"}
            </p>
          </motion.div>

          {/* Wellness Index Ball */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-[#1A2035]/80 border-slate-700/50">
              <CardContent className="p-8">
                <div className="flex flex-col items-center">
                  <WellnessBall value={currentIndex} />
                  <h2 className="text-2xl font-bold text-white mt-6 mb-2">
                    Wellness Index™
                  </h2>
                  <p className="text-gray-400 text-center">
                    {todayCheckin 
                      ? "Your resonance score for today"
                      : "Complete your check-in to see your score"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            <Card className="bg-[#1A2035]/80 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-[#2DD4BF]" />
                  <span className="text-xs text-gray-400">7-Day Average</span>
                </div>
                <div className="text-2xl font-bold text-white">{avgIndex}</div>
              </CardContent>
            </Card>

            <Card className="bg-[#1A2035]/80 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-[#2DD4BF]" />
                  <span className="text-xs text-gray-400">Check-in Streak</span>
                </div>
                <div className="text-2xl font-bold text-white">{streak} days</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickAction
                to={createPageUrl("DailyCheckin")}
                label="Check-In"
                icon={<Activity className="w-6 h-6" />}
                color="#2DD4BF"
              />
              <QuickAction
                to={createPageUrl("Insights")}
                label="Insights"
                icon={<TrendingUp className="w-6 h-6" />}
                color="#2DD4BF"
              />
              <QuickAction
                to={createPageUrl("Support")}
                label="Support"
                icon={<Users className="w-6 h-6" />}
                color="#2DD4BF"
              />
              <QuickAction
                to={createPageUrl("Profile")}
                label="Profile"
                icon={<Heart className="w-6 h-6" />}
                color="#2DD4BF"
              />
            </div>
          </motion.div>

          {/* Spiritual Resonance Card */}
          {user?.show_spiritual_resonance && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-[#1A2035]/80 to-[#0D4D4A]/60 border-[#2DD4BF]/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Sparkles className="w-5 h-5 text-[#2DD4BF]" />
                    Spiritual Resonance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    Track your inner alignment, gratitude, and connection to meaning.
                  </p>
                  <Link
                    to={createPageUrl("SpiritualResonance")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#2DD4BF] hover:bg-[#0D9488] text-white rounded-lg font-medium transition-colors"
                  >
                    Open Spiritual Check-in
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </>
  );
}