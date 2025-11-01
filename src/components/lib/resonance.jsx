// lib/resonance.js
export const RESONANCE_VERSION = "resonance-v1.3";

export function computeResonanceScore(
  input,
  { mode = "pilot5", hormonalShiftToday = false, overrides = {} } = {}
) {
  const cfg = mode === "pillars9" ? NINE_PILLAR_CONFIG : PILOT5_CONFIG;
  const weights = { ...cfg.weights, ...(overrides.weights || {}) };
  const caps    = { ...cfg.caps,    ...(overrides.caps || {}) };

  // Hormonal adaptation
  let adapt = { ...cfg.adapt };
  if (hormonalShiftToday) {
    adapt = {
      ...adapt,
      moodPenaltyCap: Math.min(adapt.moodPenaltyCap ?? caps.moodPenaltyCap, -8),
      energyPenaltyCap: Math.min(adapt.energyPenaltyCap ?? caps.energyPenaltyCap, -8),
      sleepPenaltyCap: Math.min(adapt.sleepPenaltyCap ?? caps.sleepPenaltyCap ?? -8, -8),
      agencyBoost: (cfg.adapt.agencyBoost || 1.1) * 1.09 // ≈1.2 default
    };
  }

  const norm = (v) => (Number(v ?? 5) - 5) / 5;
  const clampPenalty = (v, cap) => (v < cap ? cap : v);
  const clamp01 = (v) => (v < 0 ? 0 : v > 100 ? 100 : v);

  let raw = 0;

  // --- Pilot 5 factors
  const moodContrib    = clampPenalty(norm(input.mood)    * 15, (adapt.moodPenaltyCap ?? caps.moodPenaltyCap)) * (weights.mood    ?? 1);
  const energyContrib  = clampPenalty(norm(input.energy)  * 12, (adapt.energyPenaltyCap ?? caps.energyPenaltyCap)) * (weights.energy  ?? 0.8);

  const boost = hormonalShiftToday ? (adapt.agencyBoost ?? 1) : 1;
  const gratitudeContrib  = norm(input.gratitude)  * 8 * (weights.gratitude  ?? 0.5) * boost;
  const goodDeedsContrib  = norm(input.goodDeeds)  * 8 * (weights.goodDeeds  ?? 0.6) * boost;
  const reflectionContrib = norm(input.reflection) * 6 * (weights.reflection ?? 0.4) * boost;

  raw = moodContrib + energyContrib + gratitudeContrib + goodDeedsContrib + reflectionContrib;

  const score = Math.round(clamp01(50 + raw));

  // 🚨 Debug line to prove this file is in use
  if (typeof window !== "undefined") {
    console.log(`[${RESONANCE_VERSION}] score=`, score, { hormonalShiftToday });
    window.__RESONANCE_VERSION__ = RESONANCE_VERSION;
  }

  return score;
}

const PILOT5_CONFIG = {
  weights: { mood:1.0, energy:0.8, gratitude:0.5, goodDeeds:0.6, reflection:0.4 },
  caps: { moodPenaltyCap:-15, energyPenaltyCap:-12 },
  adapt: { moodPenaltyCap:-10, energyPenaltyCap:-10, agencyBoost:1.1 }
};

const NINE_PILLAR_CONFIG = {
  weights: {
    mood:1.0, energy:0.8, sleep:0.8, stress:0.8, // inverse
    purpose:0.6, resilience:0.6, connection:0.5, movement:0.5, focus:0.5
  },
  caps: { moodPenaltyCap:-12, energyPenaltyCap:-10, sleepPenaltyCap:-10, stressPenaltyCap:-10 },
  adapt: { moodPenaltyCap:-10, energyPenaltyCap:-10, sleepPenaltyCap:-10, agencyBoost:1.1 }
};