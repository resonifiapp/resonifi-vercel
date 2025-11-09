import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  Play,
  Upload,
  LineChart,
  BookOpen,
  Music2,
  Heart,
  HandHeart,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

// Resonance pillars
const PILLARS = [
  { key: "emotional", label: "Emotional", freq: 396 },
  { key: "physical", label: "Physical", freq: 417 },
  { key: "financial", label: "Financial", freq: 741 },
  { key: "spiritual", label: "Spiritual", freq: 852 },
];

// Utility + formula
const clamp01 = (n) => Math.max(0, Math.min(1, n));
const computeWellnessIndex = (pillars, gratitude, kindness) => {
  const avg = pillars.reduce((a, b) => a + b, 0) / pillars.length;
  return clamp01(avg * 0.94 + gratitude * 0.03 + kindness * 0.03);
};

// Optional gentle tone generator
function useTone() {
  const [ctx, setCtx] = useState(null);
  const [osc, setOsc] = useState(null);
  const start = (frequency = 528) => {
    if (osc || typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ac = new AudioCtx();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "sine";
    o.frequency.value = frequency;
    g.gain.value = 0.02;
    o.connect(g).connect(ac.destination);
    o.start();
    setCtx(ac);
    setOsc(o);
  };
  const stop = () => {
    try {
      osc?.stop();
      ctx?.close();
    } catch {}
    setOsc(null);
    setCtx(null);
  };
  return { start, stop };
}

export default function Home() {
  const [pillars, setPillars] = useState([0.55, 0.5, 0.45, 0.6]);
  const [gratitude, setGratitude] = useState(0);
  const [kindness, setKindness] = useState(0);
  const [note, setNote] = useState("");

  const STORAGE_KEY = "resonifi:home:v2";
  const SNAPSHOT_KEY = "resonifi:snapshots";

  // Load saved data on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const v = JSON.parse(raw);
      if (Array.isArray(v.pillars) && v.pillars.length === 4)
        setPillars(v.pillars.map(clamp01));
      if (typeof v.gratitude === "number")
        setGratitude(clamp01(v.gratitude));
      if (typeof v.kindness === "number")
        setKindness(clamp01(v.kindness));
      if (typeof v.note === "string") setNote(v.note);
    } catch {}
  }, []);

  // Save snapshot locally
  const saveLocal = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ pillars, gratitude, kindness, note, ts: Date.now() })
      );
    } catch {}
  };

  // Complete reflection
  const completeReflection = () => {
    try {
      const arr = JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || "[]");
      const score = Math.round(
        computeWellnessIndex(pillars, gratitude * 0.6, kindness * 0.6) * 100
      );
      arr.unshift({
        ts: Date.now(),
        pillars,
        gratitude,
        kindness,
        note: note?.trim() || null,
        score,
      });
      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(arr.slice(0, 100)));
      if (typeof window !== "undefined" && window?.plausible) {
        try {
          window.plausible("Snapshot Completed");
        } catch {}
      }
    } catch {}
    setNote("");
  };

  const setPillar = (i, v) =>
    setPillars((prev) => prev.map((p, idx) => (idx === i ? clamp01(v) : p)));

  // Calculate score + glow
  const score = Math.round(
    computeWellnessIndex(pillars, gratitude * 0.6, kindness * 0.6) * 100
  );
  const glowScale = 0.8 + (score / 100) * 0.35;

  const core = useTone();
  const pillarTones = useTone();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-300 via-teal-300 to-violet-400 shadow-lg shadow-cyan-500/20" />
            <span className="text-lg font-semibold tracking-tight">Resonifi</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="gap-2">
              <ShieldCheck className="h-4 w-4" /> Privacy-first
            </Button>
            <Button className="gap-2 group">
              <Play className="h-4 w-4" />
              Start Reflection
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Core Resonance Section */}
      <section className="mx-auto max-w-6xl px-4 pt-10 pb-2 grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="col-span-1 md:col-span-3 bg-slate-900/60 border-slate-800">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5" /> Core Resonance
            </CardTitle>
            <div className="text-xs text-slate-400">Guiding tone: 528 Hz</div>
          </CardHeader>

          <CardContent>
            <div className="relative flex items-center justify-center py-10">
              <motion.div
                onMouseEnter={() => core.start(528)}
                onMouseLeave={core.stop}
                animate={{ scale: glowScale }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                className="relative h-44 w-44 rounded-full"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-200/25 via-teal-200/20 to-violet-200/25 blur-2xl" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-teal-300 to-violet-400 opacity-30 blur" />
                <div className="absolute inset-3 rounded-full bg-slate-950 shadow-inner" />
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-cyan-300 via-teal-300 to-violet-400 shadow-xl" />
                {/* Score inside the ball */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-semibold text-slate-100 drop-shadow-md">
                    {score}
                  </span>
                </div>
              </motion.div>
            </div>
            <p className="text-center text-sm text-slate-300">
              A calm snapshot of where you are. Adjust pillars below or add a private note.
            </p>
          </CardContent>
        </Card>

        {/* Snapshot + Solfeggio */}
        <div className="col-span-1 md:col-span-2 grid gap-6">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <LineChart className="h-5 w-5" /> Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" className="w-full gap-2">
                  <Upload className="h-4 w-4" /> Try without signup
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <BookOpen className="h-4 w-4" /> Learn the approach
                </Button>
              </div>
              <div className="rounded-xl border border-slate-800 p-3 text-sm text-slate-300">
                Private by default. Reflection over logging. You own your data.
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Music2 className="h-5 w-5" /> Solfeggio cues
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-xs text-slate-300">
              {PILLARS.map((p) => (
                <button
                  key={p.key}
                  onMouseEnter={() => pillarTones.start(p.freq)}
                  onMouseLeave={pillarTones.stop}
                  className="rounded-lg border border-slate-800 px-3 py-2 text-left hover:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-teal-400/30"
                >
                  <div className="font-medium text-slate-200">{p.label}</div>
                  <div className="text-slate-400">{p.freq} Hz (gentle cue)</div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pillars + Reflection */}
      <section className="mx-auto max-w-6xl px-4 pb-14 grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="col-span-1 md:col-span-3 bg-slate-900/60 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base">Your four pillars</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 h-64">
              {pillars.map((v, i) => (
                <div key={i} className="flex flex-col items-center justify-end">
                  <div className="relative w-8 flex-1 rounded-xl bg-slate-800 overflow-hidden">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-teal-400 via-cyan-300 to-violet-400"
                      style={{ height: `${v * 100}%` }}
                    />
                  </div>
                  <div className="mt-3 text-xs text-slate-300">
                    {PILLARS[i].label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {pillars.map((v, i) => (
                <div key={i} className="space-y-2">
                  <div className="text-xs text-slate-400">
                    Adjust {PILLARS[i].label}
                  </div>
                  <Slider
                    defaultValue={[v]}
                    max={1}
                    step={0.01}
                    onValueChange={(arr) => setPillar(i, arr[0])}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 bg-slate-900/60 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base">Gently rebalance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-200 flex items-center gap-2">
                  <Heart className="h-4 w-4" /> Gratitude
                </label>
                <Slider
                  defaultValue={[gratitude]}
                  max={1}
                  step={0.01}
                  onValueChange={(a) => setGratitude(clamp01(a[0]))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-200 flex items-center gap-2">
                  <HandHeart className="h-4 w-4" /> Act of kindness
                </label>
                <Slider
                  defaultValue={[kindness]}
                  max={1}
                  step={0.01}
                  onValueChange={(a) => setKindness(clamp01(a[0]))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-200">Add a private note</label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What feels present right now?"
                className="min-h-[90px]"
              />
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={saveLocal}>
                  Save locally
                </Button>
                <Button className="gap-2" onClick={completeReflection}>
                  Complete <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-4 pb-10">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-400 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Private by default. Reflection over logging.
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Mental wellness, amplified.
          </div>
        </div>
      </footer>
    </div>
  );
}
