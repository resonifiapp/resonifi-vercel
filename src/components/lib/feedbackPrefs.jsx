// ===== Feedback Preferences Management =====

const STORAGE_KEY = "resonifi.feedback.prefs.v1";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { sound: true, haptic: true, motion: true };
}

function save(prefs) {
  try { 
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); 
  } catch {}
}

export const FEEDBACK = load();

/** Update one or more flags and persist */
export function setFeedback(patch) {
  Object.assign(FEEDBACK, patch);
  save(FEEDBACK);
}

/** Read-only copy (for UI) */
export function getFeedback() {
  return { ...FEEDBACK };
}