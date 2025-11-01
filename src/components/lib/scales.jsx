// ===== Scale Configuration System =====

const STORAGE_KEY = "resonifi.scales.v1";

const DEFAULTS = {
  mood: { type: "subjective", min: 0, max: 10, step: 1 },
  stress: { type: "subjective", min: 0, max: 10, step: 1 },
  focus: { type: "subjective", min: 0, max: 10, step: 1 },
  energy: { type: "subjective", min: 0, max: 10, step: 1 },
  connection: { type: "subjective", min: 0, max: 10, step: 1 },
  meditation: { type: "subjective", min: 0, max: 10, step: 1 },
  exercise: { type: "subjective", min: 0, max: 10, step: 1 },
  screen_time: { type: "subjective", min: 0, max: 10, step: 1 },
  sleep: { type: "quantitative", min: 0, max: 12, step: 0.5, unit: "h" },
  hydration: { type: "quantitative", min: 0, max: 12, step: 1, unit: "glasses" },
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULTS;
}

function save(cfg) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } catch {}
}

export let SCALES = load();

export function getScale(category) {
  // Fallback to a default subjective scale if category not found
  return SCALES[category] || DEFAULTS[category] || { type: "subjective", min: 0, max: 10, step: 1 };
}

export function setScale(category, cfg) {
  SCALES = { ...SCALES, [category]: { ...SCALES[category], ...cfg } };
  save(SCALES);
}

export function resetScales() {
  SCALES = { ...DEFAULTS };
  save(SCALES);
}