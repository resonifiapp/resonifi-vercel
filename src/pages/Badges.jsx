
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Badge as BadgeEntity } from "@/api/entities";
import { UserBadge } from "@/api/entities";
import { DailyCheckin } from "@/api/entities";
import { PositiveEntry } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Lock, Sparkles } from "lucide-react";

// Helper functions moved outside component to avoid dependency issues
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

const checkWeekendLogs = (checkins) => {
  const grouped = {};
  checkins.forEach(checkin => {
    const date = new Date(checkin.created_date);
    const year = date.getFullYear();
    const week = getWeekNumber(date);
    const day = date.getDay(); // 0 for Sunday, 6 for Saturday
    const key = `${year}-${week}`;
    
    if (!grouped[key]) grouped[key] = new Set();
    grouped[key].add(day);
  });
  
  // Check if any week has both Saturday (6) and Sunday (0)
  return Object.values(grouped).some(days => days.has(6) && days.has(0));
};

const checkPerfectWeek = (checkins) => {
  const grouped = {};
  checkins.forEach(checkin => {
    const date = new Date(checkin.created_date);
    const year = date.getFullYear();
    const week = getWeekNumber(date);
    const day = date.getDay(); // 0 for Sunday, 6 for Saturday
    const key = `${year}-${week}`;
    
    if (!grouped[key]) grouped[key] = new Set();
    grouped[key].add(day);
  });
  
  // Check if any week has all 7 days (0-6)
  return Object.values(grouped).some(days => days.size === 7);
};

const checkEarlyBirdLog = (checkins) => {
  return checkins.some(checkin => {
    const date = new Date(checkin.created_date);
    const hour = date.getHours();
    return hour < 7;
  });
};

const checkNightOwlLog = (checkins) => {
  return checkins.some(checkin => {
    const date = new Date(checkin.created_date);
    const hour = date.getHours();
    return hour >= 0 && hour < 5; // After midnight (00:00) until 4:59 AM
  });
};

export default function Badges() {
  const [allBadges, setAllBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [newlyEarned, setNewlyEarned] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const initializeBadges = useCallback(async () => {
    try {
      const existingBadges = await BadgeEntity.list();
      const existingNames = new Set(existingBadges.map(b => b.name));

      const initialBadges = [
        // Core Milestone Badges
        {
          name: "First Steps",
          description: "Complete your first daily check-in",
          icon: "🌱",
          unlock_criteria: "1 check-in",
          category: "milestone"
        },
        {
          name: "First Streak",
          description: "You've shown up for a full week",
          icon: "🔵",
          unlock_criteria: "7-day streak",
          category: "streak"
        },
        {
          name: "Consistency Champ",
          description: "You've built consistency across a month",
          icon: "🟢",
          unlock_criteria: "30-day streak",
          category: "streak"
        },
        {
          name: "Resonance Master",
          description: "You've achieved long-term resonance",
          icon: "🟣",
          unlock_criteria: "100-day streak",
          category: "streak"
        },
        
        // Extra Delight Badges
        {
          name: "Early Bird",
          description: "You started your day with resonance",
          icon: "🌅",
          unlock_criteria: "log before 7am",
          category: "delight"
        },
        {
          name: "Night Owl",
          description: "You found resonance late at night",
          icon: "🌙",
          unlock_criteria: "log after midnight",
          category: "delight"
        },
        {
          name: "Weekend Warrior",
          description: "You kept your practice through the weekend",
          icon: "🟡",
          unlock_criteria: "weekend logs",
          category: "delight"
        },
        {
          name: "Perfect Week",
          description: "You completed a flawless streak",
          icon: "🌟",
          unlock_criteria: "7 days in one week",
          category: "delight"
        },

        // Additional Achievement Badges (kept from previous implementation, but ensuring they are here)
        {
          name: "High Resonance",
          description: "Achieve a resonance score of 85+",
          icon: "💫",
          unlock_criteria: "85+ resonance score",
          category: "resonance"
        },
        {
          name: "Zen Master",
          description: "Achieve a resonance score of 90+",
          icon: "🧘",
          unlock_criteria: "90+ resonance score",
          category: "resonance"
        },
        {
          name: "Good Deed Doer",
          description: "Log 10 good deeds",
          icon: "❤️",
          unlock_criteria: "10 good deeds",
          category: "deeds"
        },
        {
          name: "Kindness Champion",
          description: "Log 5 kindness deeds",
          icon: "🤝",
          unlock_criteria: "5 kindness deeds",
          category: "deeds"
        }
      ];

      const badgesToCreate = initialBadges.filter(b => !existingNames.has(b.name));

      // Remove the specific "Weekly Winner" rename logic as it's no longer necessary with the updated initial badges
      // The new "First Streak" badge directly replaces the concept.

      if (badgesToCreate.length > 0) {
        await BadgeEntity.bulkCreate(badgesToCreate);
      }
    } catch (error) {
      console.error("Error initializing badges:", error);
    }
  }, []);

  const calculateStreak = useCallback((checkins) => {
    if (checkins.length === 0) return 0;

    const sortedCheckins = checkins.sort((a, b) => new Date(b.date) - new Date(a.date));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const mostRecentDate = new Date(sortedCheckins[0].date);
    mostRecentDate.setHours(12, 0, 0, 0);

    // If the most recent check-in is older than yesterday, streak is 0
    // This condition might need adjustment based on exact streak logic (e.g., if today's checkin hasn't happened yet but yesterday's did)
    // For simplicity, we are checking if the latest check-in is before yesterday.
    // A more robust solution might compare to `yesterday` and `today` directly considering a window.
    if (mostRecentDate.getTime() < yesterday.getTime()) {
      return 0;
    }

    let currentStreak = 1;
    let lastDate = mostRecentDate;

    for (let i = 1; i < sortedCheckins.length; i++) {
      const currentDate = new Date(sortedCheckins[i].date);
      currentDate.setHours(12, 0, 0, 0);
      
      const expectedPreviousDate = new Date(lastDate);
      expectedPreviousDate.setDate(expectedPreviousDate.getDate() - 1);

      if (currentDate.getTime() === expectedPreviousDate.getTime()) {
        currentStreak++;
        lastDate = currentDate;
      } else {
        break;
      }
    }
    return currentStreak;
  }, []);

  const checkForNewBadges = useCallback(async (user, allBadges, earnedBadges) => {
    try {
      const earnedBadgeIds = earnedBadges.map(ub => ub.badge_id);
      const newBadges = [];

      const checkins = await DailyCheckin.filter({ created_by: user.email });
      const deeds = await PositiveEntry.filter({ created_by: user.email });
      const kindnessDeeds = deeds.filter(d => d.category === 'Kindness');
      
      const streak = calculateStreak(checkins);
      // Ensure maxResonance defaults to 0 if no checkins to avoid -Infinity
      const maxResonance = checkins.length > 0 ? Math.max(...checkins.map(c => c.frequency_today)) : 0;

      // Check for weekend warrior and perfect week
      const hasWeekendLogs = checkWeekendLogs(checkins);
      const hasPerfectWeek = checkPerfectWeek(checkins);
      const hasEarlyBirdLog = checkEarlyBirdLog(checkins);
      const hasNightOwlLog = checkNightOwlLog(checkins);

      for (const badge of allBadges) {
        if (earnedBadgeIds.includes(badge.id)) continue;

        let shouldEarn = false;

        switch (badge.unlock_criteria) {
          case "1 check-in":
            shouldEarn = checkins.length >= 1;
            break;
          // Removed redundant "5 check-ins" and "7 check-ins" as per new badge set
          // Removed redundant "3-day streak" as per new badge set
          case "7-day streak":
            shouldEarn = streak >= 7;
            break;
          case "30-day streak":
            shouldEarn = streak >= 30;
            break;
          case "100-day streak":
            shouldEarn = streak >= 100;
            break;
          case "85+ resonance score": 
            shouldEarn = maxResonance >= 85;
            break;
          case "90+ resonance score": 
            shouldEarn = maxResonance >= 90;
            break;
          case "10 good deeds":
            shouldEarn = deeds.length >= 10;
            break;
          case "5 kindness deeds":
            shouldEarn = kindnessDeeds.length >= 5;
            break;
          case "log before 7am":
            shouldEarn = hasEarlyBirdLog;
            break;
          case "log after midnight":
            shouldEarn = hasNightOwlLog;
            break;
          case "weekend logs":
            shouldEarn = hasWeekendLogs;
            break;
          case "7 days in one week":
            shouldEarn = hasPerfectWeek;
            break;
          default:
            shouldEarn = false;
        }

        if (shouldEarn) {
          const today = new Date().toISOString().split('T')[0];
          await UserBadge.create({
            badge_id: badge.id,
            earned_date: today,
            created_by: user.email
          });
          newBadges.push(badge);

          // Track badge_unlocked event
          if (typeof window !== 'undefined' && window.plausible) {
            window.plausible('badge_unlocked', { props: { badge: badge.name } });
          }
        }
      }

      if (newBadges.length > 0) {
        setNewlyEarned(newBadges);
        const updated = await UserBadge.filter({ created_by: user.email });
        setUserBadges(updated);
        
        // Trigger badge unlock pulse animation
        setTimeout(() => {
          newBadges.forEach((badge, index) => {
            setTimeout(() => {
              const badgeElement = document.querySelector(`[data-badge-id="${badge.id}"]`);
              if (badgeElement) {
                badgeElement.classList.add('badge-unlock-pulse');
                setTimeout(() => {
                  badgeElement.classList.remove('badge-unlock-pulse');
                }, 1200); // Match animation duration
              }
            }, index * 200); // Stagger animation for multiple badges
          });
        }, 100); // Small delay to ensure DOM update
      }
    } catch (error) {
      console.error("Error checking for new badges:", error);
    }
  }, [calculateStreak]);

  const loadBadges = useCallback(async () => {
    try {
      setIsLoading(true);
      const currentUser = await User.me();
      
      const badges = await BadgeEntity.list();
      setAllBadges(badges);
      
      const earned = await UserBadge.filter({ created_by: currentUser.email });
      setUserBadges(earned);
      
      await checkForNewBadges(currentUser, badges, earned);
    } catch (error) {
      console.error("Error loading badges:", error);
    } finally {
      setIsLoading(false);
    }
  }, [checkForNewBadges]);

  useEffect(() => {
    // Add a stub for plausible if it's not already loaded
    if (typeof window !== 'undefined' && !window.plausible) {
      window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) };
    }

    initializeBadges().then(() => {
      loadBadges();
    });
  }, [initializeBadges, loadBadges]);

  const isBadgeEarned = (badgeId) => {
    return userBadges.some(ub => ub.badge_id === badgeId);
  };

  const getBadgesByCategory = (category) => {
    return allBadges.filter(b => b.category === category);
  };

  const categories = [
    { name: "milestone", title: "Milestones", icon: Sparkles },
    { name: "streak", title: "Streaks", icon: Award },
    { name: "resonance", title: "Resonance", icon: "💫" },
    { name: "deeds", title: "Good Deeds", icon: "❤️" },
    { name: "delight", title: "Extra Delight", icon: "✨" }
  ];

  const headerDescription = useMemo(() => {
    if (isLoading) {
      return "Loading your badge collection...";
    }
    if (allBadges.length === 0) {
      return "No badges defined yet. Check back later!";
    }
    if (userBadges.length === 0) {
      return "Start your journey by completing check-ins and logging positive entries to unlock your first badges!";
    }
    if (userBadges.length === allBadges.length) {
      return "Congratulations! You've earned all available badges. What an achievement!";
    }
    return "Your achievements and progress milestones. Discover what's next!";
  }, [allBadges.length, userBadges.length, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2DD4BF] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading badges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-[#0F172A] text-white">
      <style jsx>{`
        @keyframes badge-unlock-pulse {
          0% { 
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(45, 212, 191, 0.7);
          }
          50% { 
            transform: scale(1.2);
            box-shadow: 0 0 0 30px rgba(45, 212, 191, 0);
          }
          100% { 
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(45, 212, 191, 0);
          }
        }

        .badge-unlock-pulse {
          animation: badge-unlock-pulse 1.2s ease-out;
        }
      `}</style>
      
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Sticky Header with Dynamic Copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center sticky top-0 z-10 bg-[#0F172A] pt-4 pb-4 border-b border-blue-900/50" // Added sticky styles and background
        >
          <h1 className="text-3xl font-bold text-white mb-2">Badges</h1>
          <p className="text-gray-400">{headerDescription}</p>
          <div className="mt-4">
            <Badge className="bg-[#2DD4BF] text-white px-4 py-2">
              {userBadges.length} of {allBadges.length} earned
            </Badge>
          </div>
        </motion.div>

        {/* Newly Earned Badges */}
        <AnimatePresence>
          {newlyEarned.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-amber-800 mb-4">🎉 New Badge Earned!</h2>
                  <div className="flex flex-wrap justify-center gap-4">
                    {newlyEarned.map((badge, index) => (
                      <motion.div
                        key={badge.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ 
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                          delay: 0.2 + index * 0.1,
                        }}
                        className="text-center p-4 bg-white rounded-lg shadow-md"
                      >
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 1, ease: "easeInOut", repeat: 2 }}
                        >
                            <div className="text-4xl mb-2">{badge.icon}</div>
                        </motion.div>
                        <div className="font-bold text-gray-900">{badge.name}</div>
                        <div className="text-sm text-gray-600">{badge.description}</div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badge Categories */}
        {categories.map((category, categoryIndex) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
          >
            <Card className="bg-[#1A2035]/80 backdrop-blur-sm border border-blue-900/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#2DD4BF]">
                  {typeof category.icon === 'string' ? (
                    <span className="text-xl">{category.icon}</span>
                  ) : (
                    <category.icon className="w-5 h-5" />
                  )}
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {getBadgesByCategory(category.name).map(badge => {
                    const earned = isBadgeEarned(badge.id);
                    return (
                      <motion.div
                        key={badge.id}
                        data-badge-id={badge.id} // Added for the pulse animation trigger
                        whileHover={{ scale: earned ? 1.05 : 1 }}
                        className={`relative p-4 rounded-lg border-2 text-center transition-all duration-300 ${
                          earned 
                            ? 'bg-gradient-to-b from-[#1A2035] to-blue-900/20 border-[#2DD4BF] shadow-md' 
                            : 'bg-gray-800/50 border-gray-600 opacity-60'
                        }`}
                      >
                        {!earned && (
                          <div className="absolute top-2 right-2">
                            <Lock className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                        <div className={`text-4xl mb-2 ${earned ? '' : 'grayscale'}`}>
                          {badge.icon}
                        </div>
                        <div className={`font-bold mb-1 ${earned ? 'text-white' : 'text-gray-500'}`}>
                          {badge.name}
                        </div>
                        <div className={`text-sm ${earned ? 'text-gray-300' : 'text-gray-500'}`}>
                          {badge.description}
                        </div>
                        <div className={`text-xs mt-2 ${earned ? 'text-[#2DD4BF]' : 'text-gray-500'}`}>
                          {badge.unlock_criteria}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
