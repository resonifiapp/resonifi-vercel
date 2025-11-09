
import React, { useMemo, useState } from "react";

/* tiny helpers */
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
function computeIndex({ mood, energy, sleepHrs, exerciseMin, waterL }) {
  const mood10 = clamp(mood, 0, 10);
  const energy10 = clamp(energy, 0, 10);
  const sleep10 = clamp((sleepHrs / 12) * 10, 0, 10);
  const exercise10 = clamp((exerciseMin / 60) * 10, 0, 10);
  const water10 = clamp((waterL / 3) * 10, 0, 10);
  const score01 = (mood10*0.25 + energy10*0.25 + sleep10*0.20 + exercise10*0.15 + water10*0.15) / 10;
  return Math.round(score01 * 100);
}

/* simple CSS for the breathing ring */
const css = `
@keyframes breathe {
  0%   { transform: scale(1);   box-shadow: 0 0 0 0 rgba(20,184,166,.25); }
  50%  { transform: scale(1.04); box-shadow: 0 0 0 20px rgba(20,184,166,0); }
  100% { transform: scale(1);   box-shadow: 0 0 0 0 rgba(20,184,166,.25); }
}
`;

export default function Home() {
  // show the modal?
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1); // 1..4

  // check-in state (only used inside modal)
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [sleepHrs, setSleepHrs] = useState(7.5);
  const [exerciseMin, setExerciseMin] = useState(20);
  const [waterL, setWaterL] = useState(3);
  const [gratitude, setGratitude] = useState("");
  const [kindness, setKindness] = useState("");

  const index = useMemo(
    () => computeIndex({ mood, energy, sleepHrs, exerciseMin, waterL }),
    [mood, energy, sleepHrs, exerciseMin, waterL]
  );

  // big number in the circle on Home. For now use current computed index.
  const headlineScore = index;

  const saveSnapshot = (completed) => {
    const snap = {
      ts: Date.now(),
      completed,
      checkinIndex: index,
      mood, energy, sleepHrs, exerciseMin, waterL,
      gratitude: gratitude.trim(),
      kindness: kindness.trim(),
    };
    try {
      const key = "resonifi:snapshots";
      const arr = JSON.parse(localStorage.getItem(key) || "[]");
      arr.unshift(snap);
      localStorage.setItem(key, JSON.stringify(arr.slice(0, 500)));
    } catch {}
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* Top nav (no routing required – links can be wired later) */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-6 w-6 rounded-full bg-gradient-to-br from-cyan-300 via-teal-300 to-violet-400" />
            <span className="font-semibold tracking-tight">Resonifi</span>
          </div>
          <nav className="flex items-center gap-5 text-sm text-slate-300">
            <span className="hover:text-cyan-300 cursor-default">Home</span>
            <button className="hover:text-cyan-300" onClick={() => { setOpen(true); setStep(1); }}>
              Check-In
            </button>
            <span className="opacity-70">Insights</span>
            <span className="opacity-70">Support</span>
            <span className="opacity-70">Profile</span>
          </nav>
        </div>
      </header>

      {/* Main content: ONLY the score ring + CTA */}
      <main className="mx-auto max-w-6xl px-4 py-12">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
          <h2 className="text-base font-medium mb-6">Core Resonance</h2>

          <div className="flex items-center justify-center py-4">
            <div className="relative h-44 w-44 rounded-full bg-gradient-to-br from-cyan-300 via-teal-300 to-violet-400 p-[6px] animate-[breathe_5s_ease-in-out_infinite]">
              <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center">
                <div className="h-36 w-36 rounded-full bg-slate-800/70 flex items-center justify-center">
                  <span className="text-4xl font-semibold">{headlineScore}</span>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-2 text-center text-sm text-slate-400">
            Your Wellness Index. Start a check-in to update it.
          </p>

          <div className="mt-6 flex justify-center">
            <button
              className="rounded-xl px-4 py-2 bg-teal-500 text-slate-900 font-medium hover:bg-teal-400"
              onClick={() => { setOpen(true); setStep(1); }}
            >
              Start Check-In
            </button>
          </div>
        </section>
      </main>

      {/* Check-In modal (4 steps) */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70">
          <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Daily Check-In</h3>
              <button className="text-sm text-slate-400 hover:text-slate-200" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-4">Private by default. Stored in your browser.</p>

            <div className="text-xs text-slate-400 mb-2">Step {step} of 4</div>

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <Slider label={`Mood: ${mood}/10`} min={0} max={10} step={1} value={mood} onChange={setMood} minText="Low" maxText="Great" />
                <Slider label={`Energy: ${energy}/10`} min={0} max={10} step={1} value={energy} onChange={setEnergy} minText="Exhausted" maxText="Energized" />
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <Slider label={`Sleep (hours): ${sleepHrs}/12`} min={0} max={12} step={0.5} value={sleepHrs} onChange={(v)=>setSleepHrs(Number(v))} minText="0h" maxText="12h" />
                <div>
                  <div className="mb-2 text-sm text-slate-300">Exercise (minutes)</div>
                  <div className="flex items-center gap-3">
                    <button className="rounded-lg border border-slate-700 px-3 py-2 bg-slate-900/70 hover:bg-slate-800" onClick={()=>setExerciseMin((m)=>Math.max(0,m-5))}>−</button>
                    <div className="flex-1 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-center text-teal-300 text-lg font-semibold">
                      {exerciseMin} / 60
                    </div>
                    <button className="rounded-lg border border-slate-700 px-3 py-2 bg-slate-900/70 hover:bg-slate-800" onClick={()=>setExerciseMin((m)=>Math.min(180,m+5))}>+</button>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">60 minutes is a gentle daily target.</div>
                </div>
                <div>
                  <div className="mb-2 text-sm text-slate-300">Water intake</div>
                  <div className="grid grid-cols-8 gap-2">
                    {[0,0.5,1,1.5,2,2.5,3,4].map((lit)=>(
                      <button key={lit}
                        onClick={()=>setWaterL(lit)}
                        className={`rounded-lg border px-3 py-2 text-sm ${waterL===lit ? "border-teal-400 bg-teal-500/10 text-teal-300":"border-slate-700 bg-slate-900/70 text-slate-300 hover:bg-slate-800"}`}>
                        {lit}L
                      </button>
                    ))}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">Recommended: 2–3 liters per day.</div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-4">
                <Field label="Gratitude" value={gratitude} onChange={setGratitude} placeholder="A small moment you appreciated today." />
                <Field label="Act of kindness" value={kindness} onChange={setKindness} placeholder="Something you did (or received) that brought ease." />
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div className="space-y-3">
                <Row k="Mood" v={`${mood}/10`} />
                <Row k="Energy" v={`${energy}/10`} />
                <Row k="Sleep" v={`${sleepHrs}h / 12h`} />
                <Row k="Exercise" v={`${exerciseMin} min / 60`} />
                <Row k="Water" v={`${waterL}L (target 3L)`} />
                {gratitude && <Row k="Gratitude" v={gratitude} />}
                {kindness && <Row k="Kindness" v={kindness} />}
                <div className="pt-2">
                  <div className="text-sm text-slate-400">Current Wellness Index</div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="text-3xl font-semibold">{index}</div>
                    <div className="flex-1 h-2 rounded bg-slate-800 overflow-hidden">
                      <div className="h-full bg-teal-400" style={{ width: `${index}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer buttons */}
            <div className="mt-6 flex items-center justify-between">
              {step > 1 ? (
                <button className="rounded-xl border border-slate-700 px-4 py-2 bg-slate-900/70 hover:bg-slate-800" onClick={()=>setStep((s)=>s-1)}>
                  Back
                </button>
              ) : <span />}

              {step < 4 ? (
                <button className="rounded-xl px-4 py-2 bg-teal-500 text-slate-900 font-medium hover:bg-teal-400" onClick={()=>setStep((s)=>s+1)}>
                  Next
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button className="rounded-xl border border-slate-700 px-4 py-2 bg-slate-900/70 hover:bg-slate-800" onClick={()=>saveSnapshot(false)}>
                    Save locally
                  </button>
                  <button className="rounded-xl px-4 py-2 bg-teal-500 text-slate-900 font-medium hover:bg-teal-400"
                    onClick={()=>{ saveSnapshot(true); setOpen(false); }}>
                    Complete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* tiny UI bits (no external UI libs) */
function Slider({ label, value, onChange, min, max, step, minText, maxText }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
      <div className="text-sm font-medium text-slate-200">{label}</div>
      <div className="mt-1 flex justify-between text-xs text-slate-400">
        <span>{minText}</span><span>{maxText}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e)=>onChange(Number(e.target.value))}
        className="mt-3 w-full accent-teal-400"
      />
    </div>
  );
}
function Field({ label, value, onChange, placeholder }) {
  return (
    <div className="space-y-1.5">
      <div className="text-sm text-slate-300">{label}</div>
      <input
        type="text" value={value} onChange={(e)=>onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/30"
      />
    </div>
  );
}
function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm">
      <div className="text-slate-300">{k}</div>
      <div className="text-slate-100 font-medium">{v}</div>
    </div>
  );
}
