/**
 * 7-Day Challenge Tracker
 * Tracks consecutive daily check-ins and manages completion state
 */

import { base44 } from "@/api/base44Client";

const CHALLENGE_KEY = 'res:challenge:7day';

/**
 * Get current challenge progress
 * @returns {Promise<{completed: number, total: number, dates: string[]}>}
 */
export async function getChallengeProgress() {
  try {
    const user = await base44.auth.me();
    if (!user?.email) {
      return { completed: 0, total: 7, dates: [] };
    }

    // Get check-ins from last 7 days
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const startDate = sevenDaysAgo.toISOString().split('T')[0];

    const checkins = await base44.entities.DailyCheckin.filter(
      { 
        created_by: user.email,
        date: { $gte: startDate }
      },
      "-date",
      7
    );

    console.log('[ChallengeTracker] Found checkins:', checkins);

    // Get unique dates (in case of multiple check-ins per day)
    const uniqueDates = [...new Set(checkins.map(c => c.date))].sort();
    
    console.log('[ChallengeTracker] Unique dates:', uniqueDates);

    // Count consecutive days from today backwards
    let consecutiveDays = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (uniqueDates.includes(dateStr)) {
        consecutiveDays++;
      } else {
        // Break on first missing day
        break;
      }
    }

    console.log('[ChallengeTracker] Consecutive days:', consecutiveDays);

    return {
      completed: consecutiveDays,
      total: 7,
      dates: uniqueDates,
    };
  } catch (error) {
    console.log('[ChallengeTracker] Error (silent):', error);
    return { completed: 0, total: 7, dates: [] };
  }
}

/**
 * Check if challenge was just completed
 * Returns true if user just hit 7 consecutive days for the first time
 */
export async function checkChallengeCompletion() {
  try {
    const progress = await getChallengeProgress();
    
    if (progress.completed === 7) {
      const completedBefore = localStorage.getItem(`${CHALLENGE_KEY}:completed`);
      
      if (!completedBefore) {
        // First time completing!
        localStorage.setItem(`${CHALLENGE_KEY}:completed`, new Date().toISOString());
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.log('[ChallengeTracker] Completion check error (silent):', error);
    return false;
  }
}

/**
 * Reset challenge (for testing or user request)
 */
export function resetChallenge() {
  localStorage.removeItem(`${CHALLENGE_KEY}:completed`);
  console.log('[ChallengeTracker] Challenge reset');
}