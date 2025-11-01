// Guest Mode utilities for Resonifi
// Allows users to try the app without signing up

const GUEST_KEY = "resonifi_guest_id";
const CHECKINS_KEY = "resonifi_guest_checkins";

export function getOrCreateGuestId() {
  try {
    let id = localStorage.getItem(GUEST_KEY);
    if (!id) {
      id = "guest_" + Math.random().toString(36).slice(2, 10);
      localStorage.setItem(GUEST_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

export function isGuestMode() {
  try {
    return Boolean(localStorage.getItem(GUEST_KEY)) && !localStorage.getItem("resonifi_auth_token");
  } catch {
    return false;
  }
}

export function saveGuestCheckin(payload) {
  try {
    const list = JSON.parse(localStorage.getItem(CHECKINS_KEY) || "[]");
    list.push({ ...payload, ts: Date.now() });
    localStorage.setItem(CHECKINS_KEY, JSON.stringify(list));
    
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible("Guest_CheckIn_Saved");
    }
  } catch (error) {
    console.error('[GuestMode] Save failed:', error);
  }
}

export function getGuestCheckins() {
  try {
    return JSON.parse(localStorage.getItem(CHECKINS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function clearGuestData() {
  try {
    localStorage.removeItem(GUEST_KEY);
    localStorage.removeItem(CHECKINS_KEY);
  } catch {}
}

export function getGuestStats() {
  const checkins = getGuestCheckins();
  if (checkins.length === 0) {
    return { count: 0, lastCheckin: null, avgIndex: 0 };
  }

  const avgIndex = checkins.reduce((sum, c) => sum + (c.index || 0), 0) / checkins.length;
  const lastCheckin = checkins[checkins.length - 1];

  return {
    count: checkins.length,
    lastCheckin: lastCheckin ? new Date(lastCheckin.ts) : null,
    avgIndex: Math.round(avgIndex)
  };
}