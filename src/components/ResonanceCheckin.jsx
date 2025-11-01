import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatScore, formatDelta } from "@/components/utils/formatters";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { computeResonanceScore, RESONANCE_VERSION } from "./lib/resonance";
import { bandFromScore, AFFIRMATIONS } from "./lib/scoreEngine";

// Analytics shim
function resolveAnalytics() {
  if (typeof window !== 'undefined' && window.plausible) {
    return (eventName, props) => window.plausible(eventName, { props });
  }
  return () => {};
}

// Audio feedback
let audioContext = null;
let unlocked = false;

function armAudio() {
  if (unlocked || typeof window === 'undefined') return;
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  unlocked = true;
}

function tick() {
  if (!unlocked || !audioContext) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.frequency.value = 800;
  gain.gain.setValueAtTime(0.15, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
  osc.start(audioContext.currentTime);
  osc.stop(audioContext.currentTime + 0.08);
}

// Step definitions
const STEP_DEFS = [
  { key: "mood", label: "Mood", info: "How you feel right now." },
  { key: "resilience", label: "Resilience", info: "Your ability to bounce back from setbacks." },
  { key: "purpose", label: "Purpose", info: "Sense of direction and meaning." },
  { key: "energy", label: "Energy", info: "Physical vitality throughout the day." },
  { key: "sleep", label: "Sleep", info: "Quality and duration of sleep." },
  { key: "stress", label: "Stress", info: "Current stress level (lower is better)." },
  { key: "social", label: "Social", info: "Quality of connections today." },
  { key: "exercise", label: "Exercise", info: "Physical activity level." },
  { key: "gratitude", label: "Gratitude", info: "Noticing and appreciating positives today." },
];

// Initial state
const initial = {
  mood: 5,
  resilience: 7,
  purpose: 5,
  energy: 5,
  sleep: 7,
  stress: 5,
  social: 7,
  exercise: 5,
  gratitude: 5,
  goodDeeds: 0,
  meditationDone: false,
  screenTimeHours: 2,
};

// Helper conversions
function convertSleepToScale(sleepValue) {
  if (!sleepValue && sleepValue !== 0) return 7;
  const hours = sleepValue;
  if (hours >= 8) {
    return Math.max(0, 10 - ((hours - 8) * 2.5));
  } else {
    return Math.max(0, (hours / 8) * 10);
  }
}

function convertExerciseToScale(exerciseValue) {
  if (!exerciseValue && exerciseValue !== 0) return 5;
  if (exerciseValue > 10) {
    const minutes = exerciseValue;
    return Math.min(10, (minutes / 60) * 10);
  }
  return exerciseValue;
}

export default function ResonanceCheckin({ 
  onSubmit, 
  initialValues = {}, 
  previousMood,
  goodDeedLevel,
  setGoodDeedLevel,
  goodDeedNote,
  setGoodDeedNote,
  showHormonalShifts = false
}) {
  const [inputs, setInputs] = useState({ ...initial, ...initialValues });
  const [hormonalShifts, setHormonalShifts] = useState(initialValues.hormonalShifts || 'none');
  const [hormonalShiftsNote, setHormonalShiftsNote] = useState(initialValues.hormonalShiftsNote || '');
  const [openedTracked, setOpenedTracked] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [expandedTooltip, setExpandedTooltip] = useState(null);
  const [affirmation, setAffirmation] = useState("");
  const track = useMemo(resolveAnalytics, []);

  const hasHormonalShifts = hormonalShifts !== 'none';
  
  // Use unified scorer with 0-100 output
  const score = useMemo(() => {
    return computeResonanceScore(
      {
        mood: inputs.mood,
        energy: inputs.energy,
        gratitude: inputs.gratitude,
        goodDeeds: goodDeedLevel,
        reflection: inputs.purpose
      },
      { 
        mode: "pilot5", 
        hormonalShiftToday: hasHormonalShifts 
      }
    );
  }, [inputs.mood, inputs.energy, inputs.gratitude, goodDeedLevel, inputs.purpose, hasHormonalShifts]);

  const moodDelta = (score / 10) - (inputs.mood ?? 5);
  
  const scoreDelta = previousMood ? score - (previousMood * 10) : null;
  const microInsight = useMemo(() => {
    if (!scoreDelta) return null;
    
    const drivers = [];
    if (inputs.sleep > 7) drivers.push("higher sleep");
    if (inputs.screenTimeHours < 2) drivers.push("less screen time");
    if (inputs.stress < 4) drivers.push("lower stress");
    if (inputs.exercise > 6) drivers.push("more exercise");
    
    const direction = scoreDelta >= 0 ? "Up" : "Down";
    const text = drivers.length > 0 
      ? `${direction} ${formatDelta(scoreDelta)}: ${drivers.join(" and ")}`
      : `${direction} ${formatDelta(scoreDelta)}`;
      
    return text;
  }, [scoreDelta, inputs.sleep, inputs.screenTimeHours, inputs.stress, inputs.exercise]);

  // Check for first check-in badge
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasShownFirstBadge = localStorage.getItem("res.firstCheckinShown");
    if (!hasShownFirstBadge) {
      setTimeout(() => {
        // Show first check-in badge - no toast needed
        localStorage.setItem("res.firstCheckinShown", "true");
      }, 1000);
    }
  }, []);

  // Track affirmations and celebrations
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const newBand = bandFromScore(score);
    const prevScore = Number(localStorage.getItem("res.prevScore") || "0");
    const prevBand = localStorage.getItem("res.prevBand") || "";
    
    setAffirmation(AFFIRMATIONS[newBand]);
    
    const bandChanged = newBand !== prevBand && prevBand !== "";
    const bigJump = score - prevScore >= 3;
    
    if (bigJump) {
      triggerConfetti();
    }
    
    localStorage.setItem("res.prevScore", String(score));
    localStorage.setItem("res.prevBand", newBand);
  }, [score]);

  const triggerConfetti = () => {
    if (typeof window === 'undefined') return;
    
    const confettiOverlay = document.getElementById('confettiOverlay');
    if (confettiOverlay) {
      confettiOverlay.classList.add('active');
      setTimeout(() => {
        confettiOverlay.classList.remove('active');
      }, 1500);
    }
  };

  useEffect(() => {
    if (!openedTracked) {
      setOpenedTracked(true);
      track("checkin_opened", { ts: Date.now() });
    }
  }, [openedTracked, track]);

  function setField(k, v) {
    setInputs((prev) => ({ ...prev, [k]: v }));
  }

  function renderSlider(key) {
    const def = STEP_DEFS.find((d) => d.key === key);
    const value = inputs[key];

    return (
      <div key={key} className="mb-4">
        <div className="flex items-center justify-between">
          <label className="font-medium text-neutral-100 flex items-center gap-2">
            {def.label}
            {def.info && (
              <button
                type="button"
                onClick={() => {
                  setExpandedTooltip(expandedTooltip === key ? null : key);
                  track("tooltip_opened", { metric: key });
                }}
                className="text-neutral-400 hover:text-neutral-200"
              >
                <Info className="w-4 h-4" />
              </button>
            )}
          </label>
          <span className="text-sm tabular-nums text-neutral-300">{Number(value ?? 0).toFixed(0)}/10</span>
        </div>
        <AnimatePresence>
          {expandedTooltip === key && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-neutral-400 mt-1 mb-2"
            >
              {def.info}
            </motion.div>
          )}
        </AnimatePresence>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={value ?? 0}
          onPointerDown={armAudio}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (Math.round(next) !== Math.round(value ?? 0)) tick();
            setField(key, next);
          }}
          className="w-full resonance-range"
        />
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .resonance-range { 
          -webkit-appearance: none; 
          appearance: none; 
          width: 100%; 
          background: transparent; 
        }
        .resonance-range::-webkit-slider-runnable-track { 
          height: 6px; 
          background: #3b82f6; 
          border-radius: 999px; 
        }
        .resonance-range::-moz-range-track { 
          height: 6px; 
          background: #3b82f6; 
          border-radius: 999px; 
        }
        .resonance-range::-webkit-slider-thumb {
          -webkit-appearance: none; 
          appearance: none; 
          height: 18px; 
          width: 18px;
          background: #fff; 
          border: 2px solid #2563eb; 
          border-radius: 999px; 
          margin-top: -6px;
          box-shadow: 0 1px 2px rgba(0,0,0,.5);
          cursor: pointer;
        }
        .resonance-range::-moz-range-thumb {
          height: 18px; 
          width: 18px; 
          background: #fff; 
          border: 2px solid #2563eb; 
          border-radius: 999px;
          box-shadow: 0 1px 2px rgba(0,0,0,.5);
          cursor: pointer;
          border: none;
        }

        .confetti-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 9999;
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
          background: transparent;
        }

        .confetti-overlay.active {
          opacity: 1;
          background: radial-gradient(circle at center, rgba(255,223,0,0.1) 0%, rgba(255,223,0,0) 70%), 
                      radial-gradient(circle at top left, rgba(0,255,0,0.1) 0%, rgba(0,255,0,0) 70%),
                      radial-gradient(circle at bottom right, rgba(0,0,255,0.1) 0%, rgba(0,0,255,0) 70%);
        }
      `}} />

      <div id="confettiOverlay" className="confetti-overlay"></div>

      <div className="max-w-xl mx-auto p-4 rounded-2xl border border-neutral-800 shadow-sm bg-neutral-900">
        
        <h2 className="text-2xl font-bold mb-2 text-neutral-100 text-center">Daily Check-In</h2>
        <p className="text-sm text-neutral-400 mb-6 text-center">
          Adjust sliders to reflect your day. Higher values = better well-being.
        </p>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-neutral-100">How are you feeling?</h3>
          {renderSlider("mood")}
        </section>

        {showHormonalShifts && (
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-neutral-100">Hormonal Shifts</h3>
            <p className="text-xs text-neutral-400 mb-3">
              Understanding your body's natural rhythms can provide valuable context for your daily well-being.
            </p>
            
            <div className="space-y-3 mb-3">
              {[
                { value: 'none', label: 'None today' },
                { value: 'pms_cycle', label: 'PMS / Cycle symptoms' },
                { value: 'perimenopause_menopause', label: 'Perimenopause / Menopause symptoms' }
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setHormonalShifts(option.value)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all text-left ${
                    hormonalShifts === option.value
                      ? 'bg-[#2DD4BF] text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {hormonalShifts !== 'none' && (
              <div>
                <label htmlFor="hormonal-note" className="text-sm text-gray-400 mb-2 block">
                  Add a quick note (optional)
                </label>
                <textarea
                  id="hormonal-note"
                  value={hormonalShiftsNote}
                  onChange={(e) => setHormonalShiftsNote(e.target.value)}
                  placeholder="How are you feeling?"
                  rows={2}
                  className="w-full bg-gray-700 border-gray-600 text-white rounded-lg p-3 text-sm"
                />
              </div>
            )}
            
            {hasHormonalShifts && (
              <div className="mt-3 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-sm text-blue-200">
                  💙 Your resonance shift today may be linked to hormonal changes. Be gentle with yourself.
                </p>
              </div>
            )}
          </section>
        )}

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-neutral-100">Good Deeds</h3>
          <p className="text-xs text-neutral-400 mb-3">Acts of kindness/helpfulness today — impact matters more than count.</p>
          
          <div className="flex gap-3 mb-3">
            {[
              { label: "None", value: 0 },
              { label: "Some", value: 5 },
              { label: "A lot", value: 10 }
            ].map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setGoodDeedLevel(option.value)}
                className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                  goodDeedLevel === option.value
                    ? 'bg-[#2DD4BF] text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="good-deed-note" className="text-sm text-gray-400 mb-2 block">Want to jot it down? (optional)</label>
            <textarea
              id="good-deed-note"
              value={goodDeedNote}
              onChange={(e) => setGoodDeedNote(e.target.value)}
              placeholder="What did you do?"
              rows={2}
              className="w-full bg-gray-700 border-gray-600 text-white rounded-lg p-3 text-sm"
            />
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-neutral-100">Core Factors</h3>
          {[
            "resilience",
            "purpose",
            "energy",
            "sleep",
            "stress",
            "social",
            "exercise",
          ].map((key) => renderSlider(key))}
          
          {renderSlider("gratitude")}
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-neutral-100">Modifiers</h3>

          <div className="mb-4 flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg">
            <div>
              <label className="font-medium text-neutral-100 flex items-center gap-2">
                Meditation
                <button
                  type="button"
                  onClick={() => {
                    setExpandedTooltip(expandedTooltip === "meditation" ? null : "meditation");
                    track("tooltip_opened", { metric: "meditation" });
                  }}
                  className="text-neutral-400 hover:text-neutral-200"
                >
                  <Info className="w-4 h-4" />
                </button>
              </label>
              <AnimatePresence>
                {expandedTooltip === "meditation" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-neutral-400 mt-1"
                  >
                    +5 bonus if you practiced today
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <input
              type="checkbox"
              checked={!!inputs.meditationDone}
              onChange={(e) => {
                setField("meditationDone", e.target.checked);
                tick();
              }}
              className="w-5 h-5 accent-[#2DD4BF]"
            />
          </div>

          <div className="mb-4 p-4 bg-neutral-800/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="font-medium text-neutral-100 flex items-center gap-2">
                Screen Time
                <button
                  type="button"
                  onClick={() => {
                    setExpandedTooltip(expandedTooltip === "screenTime" ? null : "screenTime");
                    track("tooltip_opened", { metric: "screenTime" });
                  }}
                  className="text-neutral-400 hover:text-neutral-200"
                >
                  <Info className="w-4 h-4" />
                </button>
              </label>
              <input
                type="number"
                min={0}
                max={12}
                step={0.5}
                value={inputs.screenTimeHours}
                onChange={(e) => {
                  setField("screenTimeHours", Number(e.target.value));
                  tick();
                }}
                className="w-20 border border-neutral-700 rounded px-2 py-1 text-right bg-neutral-800 text-neutral-100"
              />
            </div>
            <AnimatePresence>
              {expandedTooltip === "screenTime" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-neutral-400 mb-2"
                >
                  Passive screen time penalty (−1.5/hr, max −10)
                </motion.div>
              )}
            </AnimatePresence>
            <input
              type="range"
              min={0}
              max={12}
              step={0.5}
              value={inputs.screenTimeHours}
              onPointerDown={armAudio}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (Math.abs(next - (inputs.screenTimeHours ?? 0)) >= 0.5) tick();
                setField("screenTimeHours", next);
              }}
              className="w-full resonance-range"
            />
          </div>
        </section>

        <section className="mb-6 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 p-4">
          <div className="text-center">
            <div className="text-sm text-neutral-400 mb-1">Your Wellness Index</div>
            <div className="text-4xl font-bold text-[#2DD4BF] tabular-nums">
              {score}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              Out of 100
            </div>
            {affirmation && (
              <div className="mt-3 pt-3 border-t border-neutral-700">
                <p className="text-sm text-neutral-300 italic">{affirmation}</p>
              </div>
            )}
          </div>
        </section>

        {microInsight && (
          <section className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
            <p className="text-sm text-blue-200 text-center">{microInsight}</p>
          </section>
        )}

        <button
          className="w-full rounded-xl bg-[#2DD4BF] hover:bg-[#0D9488] active:bg-[#0B7F74] text-white py-4 font-semibold text-lg shadow-lg transition-colors"
          onClick={() => {
            const result = { 
              inputs: {
                ...inputs,
                hormonalShifts,
                hormonalShiftsNote
              }, 
              score, 
              moodDelta 
            };
            const drivers = [];
            if (inputs.sleep > 7) drivers.push("sleep");
            if (inputs.screenTimeHours < 2) drivers.push("lowScreen");
            if (inputs.stress < 4) drivers.push("lowStress");
            if (inputs.exercise > 6) drivers.push("exercise");
            
            track("checkin_submitted", { score, moodDelta, hasHormonalShifts, date: new Date().toISOString().slice(0, 10) });
            if (microInsight) track("insight_shown", { drivers });
            
            if (typeof onSubmit === "function") onSubmit(result);
          }}
        >
          Save Check-In
        </button>
      </div>
    </>
  );
}