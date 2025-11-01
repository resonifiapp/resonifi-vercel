// Simplified Wellness Index calculation (4 pillars, 25% each)
// Matches the reference implementation to fix the "37 bug"

const clamp = (n, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n));

/**
 * SIMPLIFIED Wellness Index - 4 pillars only
 * @param {Object} params
 * @param {number} params.sleep - Sleep hours 0-12 (normalized to 0-100)
 * @param {number} params.hydration - Water liters 0-4 (normalized to 0-100)
 * @param {number} params.purpose - Purpose rating 0-10 (normalized to 0-100)
 * @param {number} params.resilience - Resilience rating 0-10 (normalized to 0-100)
 * @returns {number} Wellness Index 0-100
 */
export function computeWellnessIndex({ 
  sleep = 7, 
  hydration = 2,
  purpose = 5,
  resilience = 5
}) {
  // Normalize all to 0-100 scale
  const sleepNorm = clamp((sleep / 12) * 100);
  const hydrationNorm = clamp((hydration / 4) * 100);
  const purposeNorm = clamp((purpose / 10) * 100);
  const resilienceNorm = clamp((resilience / 10) * 100);

  // Simple average (25% each)
  const score = (sleepNorm + hydrationNorm + purposeNorm + resilienceNorm) / 4;
  
  return Math.round(score);
}

// Social tracking (kept for future features)
const LIMITS = {
  sentPerDay: 3,
  receivedPerDay: 3,
  reciprocityPerDay: 1,
  socialMaxDaily: 7,
};

const todayKey = () => new Date().toISOString().slice(0, 10);
const lsGet = (k, v = null) => {
  try { return JSON.parse(localStorage.getItem(k)); } catch { return v; }
};
const lsSet = (k, v) => { 
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {} 
};

function getDailyBucket() {
  const key = `res:daily:${todayKey()}:social`;
  let bucket = lsGet(key);
  if (!bucket) {
    bucket = { sent: 0, received: 0, reciprocity: 0, lastSendTimestamps: {} };
    lsSet(key, bucket);
  }
  return { key, bucket };
}

function saveDailyBucket(key, bucket) { 
  lsSet(key, bucket); 
}

export const Social = {
  recordSent: (recipientUid, { type = "dm" } = {}) => {
    const { key, bucket } = getDailyBucket();
    bucket.sent = (bucket.sent || 0) + 1;
    if (recipientUid) bucket.lastSendTimestamps[recipientUid] = Date.now();
    saveDailyBucket(key, bucket);
    
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible(type === "dm" ? "DM Sent (Score)" : "Community Sent (Score)");
    }
  },

  recordReceived: (peerUid) => {
    const { key, bucket } = getDailyBucket();
    bucket.received = (bucket.received || 0) + 1;

    const last = bucket.lastSendTimestamps?.[peerUid];
    const within24h = last && (Date.now() - last) <= 24*60*60*1000;
    if (within24h && (bucket.reciprocity || 0) < LIMITS.reciprocityPerDay) {
      bucket.reciprocity = (bucket.reciprocity || 0) + 1;
      delete bucket.lastSendTimestamps[peerUid];
    }

    saveDailyBucket(key, bucket);
    
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible("DM Received (Score)");
    }
  },

  getToday: () => {
    const { bucket } = getDailyBucket();
    const sent = clamp(bucket.sent || 0, 0, LIMITS.sentPerDay);
    const received = clamp(bucket.received || 0, 0, LIMITS.receivedPerDay);
    const reciprocity = clamp(bucket.reciprocity || 0, 0, LIMITS.reciprocityPerDay);
    const dailyPoints = clamp(sent + received + reciprocity, 0, LIMITS.socialMaxDaily);
    const social10 = Math.round((dailyPoints / LIMITS.socialMaxDaily) * 10 * 10) / 10;
    return { sent, received, reciprocity, dailyPoints, social10 };
  },
};