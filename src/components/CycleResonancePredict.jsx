import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * Cycle Resonance Predict
 * Shows 7-day forecast of expected phase shifts and RAI adjustments
 * Helps users anticipate energy/mood patterns
 */

const LS_KEY = "resonifi.cycle";

const PHASE_META = {
  "Menstrual Phases": {
    band: "#E7CFA3",
    emoji: "🌙",
    label: "Rest",
    energyShift: "Lower energy expected",
    color: "text-amber-200",
  },
  Bloom: {
    band: "#F9C86B",
    emoji: "🌱",
    label: "Bloom",
    energyShift: "Rising energy",
    color: "text-yellow-300",
  },
  Glow: {
    band: "#FFD78A",
    emoji: "✨",
    label: "Glow",
    energyShift: "Peak energy & confidence",
    color: "text-yellow-200",
  },
  Reflect: {
    band: "#D9C48E",
    emoji: "🍂",
    label: "Reflect",
    energyShift: "Gentle wind-down",
    color: "text-orange-200",
  },
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : { enabled: false, length: 28 };
  } catch {
    return { enabled: false, length: 28 };
  }
}

function dayOfCycle(startISO, L = 28, offsetDays = 0) {
  if (!startISO) return null;
  const start = new Date(`${startISO}T00:00:00`);
  const target = new Date();
  target.setDate(target.getDate() + offsetDays);
  const days = Math.floor((target.getTime() - start.getTime()) / 86400000);
  if (days < 0) return null;
  return (days % L) + 1;
}

function phaseFromDay(d) {
  if (d == null) return null;
  if (d <= 5) return "Menstrual Phases";
  if (d <= 13) return "Bloom";
  if (d <= 17) return "Glow";
  return "Reflect";
}

function energyFactor(d, L = 28) {
  if (d == null) return 1.0;
  if (d <= 5) return 0.9;
  if (d <= 13) return 1.05;
  if (d <= 17) return 1.1;
  const t = (d - 17) / (L - 17);
  return Number((1.05 - 0.15 * t).toFixed(3));
}

export default function CycleResonancePredict({ baseScore }) {
  const [state] = useState(() => loadState());
  const [expanded, setExpanded] = useState(false);

  const L = state.length ?? 28;

  // Generate 7-day forecast
  const forecast = useMemo(() => {
    if (!state.enabled || !state.startDate || baseScore == null) return [];

    return Array.from({ length: 7 }, (_, i) => {
      const d = dayOfCycle(state.startDate, L, i);
      const phase = phaseFromDay(d);
      const E = energyFactor(d, L);
      const predictedRAI = Math.round(
        clamp(baseScore / E, baseScore - 8, baseScore + 8)
      );
      const delta = predictedRAI - baseScore;

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + i);

      return {
        day: d,
        date: targetDate,
        phase,
        E,
        predictedRAI,
        delta,
        isToday: i === 0,
      };
    });
  }, [state.enabled, state.startDate, baseScore, L]);

  // Don't show if not enabled
  if (!state.enabled || !state.startDate || baseScore == null) return null;

  const todayForecast = forecast[0];
  const upcomingPhaseChanges = forecast.filter(
    (f, i) => i > 0 && f.phase !== forecast[i - 1].phase
  );

  return (
    <div className="bg-[#1A2035]/80 border border-slate-700/50 rounded-xl p-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between hover:bg-white/5 transition-colors rounded-lg p-2"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{PHASE_META[todayForecast.phase]?.emoji}</span>
          <div className="text-left">
            <div className="font-semibold text-white">7-Day Forecast</div>
            <div className="text-sm text-gray-400">
              {upcomingPhaseChanges.length > 0
                ? `${upcomingPhaseChanges.length} phase shift${upcomingPhaseChanges.length > 1 ? 's' : ''} ahead`
                : "Steady phase ahead"}
            </div>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2"
          >
            {forecast.map((f, i) => {
              const meta = PHASE_META[f.phase];
              const isPhaseChange =
                i > 0 && f.phase !== forecast[i - 1].phase;

              return (
                <div
                  key={i}
                  className={`p-3 rounded-lg border ${
                    f.isToday
                      ? "bg-white/10 border-white/20"
                      : "bg-black/20 border-gray-700/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{meta.emoji}</span>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {f.date.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                          {f.isToday && (
                            <span className="ml-2 text-xs text-gray-400">
                              (Today)
                            </span>
                          )}
                        </div>
                        <div className={`text-xs ${meta.color}`}>
                          Day {f.day} · {meta.label}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-white">
                        {f.predictedRAI}
                      </div>
                      <div
                        className={`text-xs flex items-center gap-1 ${
                          f.delta > 0
                            ? "text-green-400"
                            : f.delta < 0
                            ? "text-red-400"
                            : "text-gray-400"
                        }`}
                      >
                        {f.delta > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : f.delta < 0 ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                        {f.delta > 0 ? "+" : ""}
                        {f.delta}
                      </div>
                    </div>
                  </div>

                  {isPhaseChange && (
                    <div className="mt-2 pt-2 border-t border-gray-700/50">
                      <div className="text-xs text-gray-400">
                        ✨ Entering {meta.label} · {meta.energyShift}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="mt-4 p-3 bg-black/30 rounded-lg border border-gray-700/30">
              <div className="text-xs text-gray-400">
                <strong className="text-white">What this means:</strong>{" "}
                Predicted scores adjust your base wellness by your natural
                rhythm. Plan lighter days during Rest, power through during
                Glow.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}