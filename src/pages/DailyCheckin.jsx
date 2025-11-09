import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, ArrowLeft, Plus, Minus } from "lucide-react";

/* helpers */
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

export default function CheckIn() {
  const [step, setStep] = useState(1); // 1..4

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

  const saveSnapshot = (completed) => {
    const snap = {
      ts: Date.now(),
      completed,
      index,
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
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Daily Check-in</h1>

      {/* Index banner */}
      <Card className="mb-6 bg-slate-900/60 border-slate-800">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="text-slate-300">Current Wellness Index</div>
            <div className="text-xl font-semibold">{index}</div>
          </div>
          <div className="mt-3 h-2 rounded bg-slate-800 overflow-hidden">
            <div className="h-full bg-teal-400" style={{ width: `${index}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Step card */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {step === 1 && "How are you feeling?"}
              {step === 2 && "Physical wellness"}
              {step === 3 && "Gently rebalance"}
              {step === 4 && "Review & complete"}
            </CardTitle>
            <div className="text-xs text-slate-400">Step {step} of 4</div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1 */}
          {step === 1 && (
            <>
              <SliderBlock
                title={`Mood: ${mood}/10`}
                minLabel="Low"
                maxLabel="Great"
                value={mood}
                setValue={setMood}
                min={0}
                max={10}
                step={1}
              />
              <SliderBlock
                title={`Energy: ${energy}/10`}
                minLabel="Exhausted"
                maxLabel="Energized"
                value={energy}
                setValue={setEnergy}
                min={0}
                max={10}
                step={1}
              />
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <SliderBlock
                title={`Sleep (hours): ${sleepHrs}/12`}
                minLabel="0h"
                maxLabel="12h"
                value={sleepHrs}
                setValue={(v) => setSleepHrs(Number(v))}
                min={0}
                max={12}
                step={0.5}
              />

              <div>
                <div className="mb-2 text-sm text-slate-300">Exercise (minutes)</div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => setExerciseMin((m) => clamp(m - 5, 0, 180))}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-center text-teal-300 text-lg font-semibold">
                    {exerciseMin} / 60
                  </div>
                  <Button variant="outline" onClick={() => setExerciseMin((m) => clamp(m + 5, 0, 180))}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-1 text-xs text-slate-500">60 minutes is a gentle daily target.</div>
              </div>

              <div>
                <div className="mb-2 text-sm text-slate-300">Water intake</div>
                <div className="grid grid-cols-8 gap-2">
                  {[0,0.5,1,1.5,2,2.5,3,4].map((lit) => (
                    <button
                      key={lit}
                      onClick={() => setWaterL(lit)}
                      className={`rounded-lg border px-3 py-2 text-sm ${
                        waterL === lit
                          ? "border-teal-400 bg-teal-500/10 text-teal-300"
                          : "border-slate-700 bg-slate-900/70 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {lit}L
                    </button>
                  ))}
                </div>
                <div className="mt-1 text-xs text-slate-500">Recommended: 2–3 liters per day.</div>
              </div>
            </>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <>
              <Field
                label="Gratitude"
                placeholder="A small moment you appreciated today."
                value={gratitude}
                onChange={setGratitude}
              />
              <Field
                label="Act of kindness"
                placeholder="Something you did (or received) that brought ease."
                value={kindness}
                onChange={setKindness}
              />
            </>
          )}

          {/* Step 4: review */}
          {step === 4 && (
            <div className="space-y-4">
              <SummaryRow label="Mood" value={`${mood}/10`} />
              <SummaryRow label="Energy" value={`${energy}/10`} />
              <SummaryRow label="Sleep" value={`${sleepHrs}h / 12h`} />
              <SummaryRow label="Exercise" value={`${exerciseMin} min / 60`} />
              <SummaryRow label="Water" value={`${waterL}L (target 3L)`} />
              {gratitude && <SummaryRow label="Gratitude" value={gratitude} />}
              {kindness && <SummaryRow label="Kindness" value={kindness} />}

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

          {/* Nav buttons */}
          <div className="flex items-center justify-between pt-2">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <span />
            )}

            {step < 4 ? (
              <Button onClick={() => setStep((s) => s + 1)}>
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => saveSnapshot(false)}>
                  Save locally
                </Button>
                <Button
                  onClick={() => {
                    saveSnapshot(true);
                    setStep(1);
                    window.location.hash = "#/insights"; // go see the result
                  }}
                >
                  <Check className="h-4 w-4" />
                  Complete
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* small UI helpers */
function SliderBlock({ title, minLabel, maxLabel, value, setValue, min, max, step }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
      <div className="text-sm font-medium text-slate-200">{title}</div>
      <div className="mt-1 flex justify-between text-xs text-slate-400">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
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
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/30"
      />
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm">
      <div className="text-slate-300">{label}</div>
      <div className="text-slate-100 font-medium">{value}</div>
    </div>
  );
}
