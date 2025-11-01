// Score band categorization
export const bandFromScore = (score) =>
  score >= 70 ? "high" : score >= 40 ? "mid" : "low";

// Affirmation messages by band
export const AFFIRMATIONS = {
  low: "Gentle day. One small habit shifts the vibe.",
  mid: "You're aligning. One more slider for momentum.",
  high: "You're in tune. Lock it in with 3 breaths."
};

// Debounce utility
export const debounce = (fn, ms = 200) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};