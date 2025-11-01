// Streak system with 12-hour grace period

const GRACE_HOURS = 12;

/**
 * Calculate streak with grace period
 * Returns: { currentStreak, isInGracePeriod, graceEndsAt }
 */
export function calculateStreakWithGrace(checkins) {
  if (!checkins || checkins.length === 0) {
    return { currentStreak: 0, isInGracePeriod: false, graceEndsAt: null };
  }

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Get most recent check-in
  const mostRecentCheckinDateStr = checkins[0].date;
  const mostRecentDate = new Date(mostRecentCheckinDateStr);
  mostRecentDate.setHours(12, 0, 0, 0);

  // Check if today's check-in exists
  const todayCheckin = checkins.find(c => c.date === now.toISOString().split('T')[0]);
  
  // If checked in today, no grace period
  if (todayCheckin) {
    const streak = calculateFullStreak(checkins);
    return { currentStreak: streak, isInGracePeriod: false, graceEndsAt: null };
  }

  // If most recent check-in was yesterday, we're in grace period
  if (mostRecentDate.getTime() === yesterday.getTime()) {
    const graceEndsAt = new Date(today);
    graceEndsAt.setHours(GRACE_HOURS, 0, 0, 0);
    
    // Check if still within grace period
    if (now.getTime() < graceEndsAt.getTime()) {
      const streak = calculateFullStreak(checkins);
      return { currentStreak: streak, isInGracePeriod: true, graceEndsAt };
    }
  }

  // Grace period expired or no recent check-in
  const streak = calculateFullStreak(checkins);
  return { currentStreak: streak > 0 ? 0 : 0, isInGracePeriod: false, graceEndsAt: null };
}

function calculateFullStreak(checkins) {
  if (checkins.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const mostRecentCheckinDate = new Date(checkins[0].date);
  mostRecentCheckinDate.setHours(12, 0, 0, 0);

  if (mostRecentCheckinDate.getTime() < yesterday.getTime()) {
    return 0;
  }

  let currentStreak = 1;
  let lastDate = mostRecentCheckinDate;

  for (let i = 1; i < checkins.length; i++) {
    const currentDate = new Date(checkins[i].date);
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
}

/**
 * Calculate the longest streak from check-in history
 * @param {Array} checkins - Array of check-in records sorted by date descending
 * @returns {number} Longest streak achieved
 */
export function calculateLongestStreak(checkins) {
  if (!checkins || checkins.length === 0) return 0;
  
  // Sort by date ascending for easier processing
  const sorted = [...checkins].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  let longestStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(sorted[i - 1].date);
    const currDate = new Date(sorted[i].date);
    
    prevDate.setHours(12, 0, 0, 0);
    currDate.setHours(12, 0, 0, 0);
    
    const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Consecutive day
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (diffDays === 0) {
      // Same day (multiple check-ins), don't count
      continue;
    } else {
      // Gap in streak
      currentStreak = 1;
    }
  }
  
  return longestStreak;
}

/**
 * Format grace period countdown
 */
export function formatGraceTime(graceEndsAt) {
  if (!graceEndsAt) return "";
  
  const now = new Date();
  const diff = graceEndsAt.getTime() - now.getTime();
  
  if (diff <= 0) return "expired";
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}