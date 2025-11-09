import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Play, Upload, LineChart, BookOpen, Music2, Heart, HandHeart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

/**
 * Resonifi Home.jsx — Rebuild v2
 *
 * Design notes (locked-in):
 * - Central glowing "Resonance Dot" (the only numeric element lives inside tooltip, not shown by default).
 * - Four vertical bars for pillars (Emotional, Physical, Financial, Spiritual) without numbers.
 * - Gratitude + Act of Kindness are gentle balancing inputs.
 * - Solfeggio frequency cues (visual/audio hooks) without scientific claims.
 * - Privacy-first tone; encourage reflection over logging.
 * - Minimal, calm UI using Tailwind + shadcn/ui; soft shadows, rounded-2xl, grid layout.
 */

const PILLARS = [
  { key: "emotional", label: "Emotional", freq: 396 },
  { key: "physical", label: "Physical", freq: 417 },
  { key: "financial", label: "Financial", freq: 741 },
  { key: "spiritual", label: "Spiritual", freq: 852 },
];

/** Utility for soft clamp */
const clamp01 = (n) => Math.max(0, Math.min(1, n));

/**
 * Core resonance calculation (privacy‑first, local only)
 * - No external calls; demo weights are gentle and easily swappable.
 */
function useResonance({ pillars, gratitudeBoost, kindnessBoost }) {
  return useMemo(() => {
    const avg = pillars.reduce((acc, v) => acc + v, 0) / pillars.length;
    const nudged = clamp01(avg * 0.94 + gratitudeBoost * 0.03 + kindnessBoost * 0.03);
    // Map 0..1 → gentle glow scale 0.8..1.15
    const scale = 0.8 + nudged * 0.35;
    return { score01: nudged, glowScale: scale };
  }, [pillars, gratitudeBoost, kindnessBoost]);
}

/**
 * Thin audio hook (optional): attaches a Solfeggio tone on hover/tap.
 * This is opt‑in and very subtle; no autoplay.
 */
function useTone() {
  const [ctx, setCtx] = useState(null);
  const [osc, setOsc] = useState(null);
  const start = (frequency = 528) => {
    if (osc) return; // already playing
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ac = new AudioCtx();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "sine";
    o.frequency.value = frequency; // core or pillar freq
    g.gain.value = 0.02; // whisper‑quiet
    o.connect(g).connect(ac.destination);
    o.start();
    setCtx(ac);
    setOsc(o);
  };
  const stop = () => {
    if (osc && ctx) {
      try {
        osc.stop();
        ctx.close();
      } catch {}
    }
    setOsc(null);
    setCtx(null);
  };
  return { start, stop };
}

export default function Home() {
  // Local, private state representing pillar balance (0..1)
  const [pillars, setPillars] = useState([0.55, 0.5, 0.45, 0.6]);
  const [gratitude, setGratitude] = useState(0.0); // 0..1 gentle boost
  const [kindness, setKindness] = useState(0.0); // 0..1 gentle boost
  const [note, setNote] = useState("");

  // ---- Wellness Index (internal) ----
  // No numbers shown in UI; used only for glow/animation.
  const computeWellnessIndex = (p, g, k) => {
    const avg = p.reduce((a, b) => a + b, 0) / p.length;
    // gentle, privacy-first shaping: pillars dominate; gratitude/kindness nudge.
    const nudged = clamp01(avg * 0.94 + g * 0.03 + k * 0.03);
    return nudged; // 0..1
  };

  // Map to dot glow scale; tie conceptually to "grounding" (no numeric display)
  const score01 = computeWellnessIndex(pillars, gratitude * 0.6, kindness * 0.6);
  const glowScale = 0.8 + score01 * 0.35;

  // ---- Persistence (local only) ----
  const STORAGE_KEY = "resonifi:home:v2";
  const SNAPSHOT_KEY = "resonifi:snapshots";

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.pillars) && parsed.pillars.length === 4) setPillars(parsed.pillars.map(clamp01));
        if (typeof parsed.gratitude === "number") setGratitude(clamp01(parsed.gratitude));
        if (typeof parsed.kindness === "number") setKindness(clamp01(parsed.kindness));
        if (typeof parsed.note === "string") setNote(parsed.note);
      }
    } catch {}
  }, []);

  const saveLocal = () => {
    const payload = { pillars, gratitude, kindness, note, ts: Date.now() };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  };

  const completeReflection = () => {
    // save snapshot history (private local)
    try {
      const existing = JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || "[]");
      const entry = { ts: Date.now(), pillars, gratitude, kindness, note: note?.trim() || null, score01 };
      existing.unshift(entry);
      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(existing.slice(0, 100))); // cap history
      // one-off event hook if analytics present (no-op otherwise)
      if (typeof window !== "undefined" && window.plausible) {
        try { window.plausible("Snapshot Completed"); } catch {}
      }
    } catch {}
    // gentle reset of note only (do not erase pillars/inputs)
    setNote("");
  };

  const core = useTone();
  const pillarTones = useTone();

  const setPillar = (i, v) => setPillars((prev) => prev.map((p, idx) => (idx === i ? v : p)));

  // Local, private state representing pillar balance (0..1)
  const [pillars, setPillars] = useState([0.55, 0.5, 0.45, 0.6]);
  const [gratitude, setGratitude] = useState(0.0); // 0..1 gentle boost
  const [kindness, setKindness] = useState(0.0); // 0..1 gentle boost
  const [note, setNote] = useState("");

  // (Replaced by integrated Wellness Index + persistence)

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

      {/* Hero / Resonance core */}
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
                data-score={score01.toFixed(3)}
                aria-label="Resonance dot"
                className="relative h-44 w-44 rounded-full"
              >
                {/* Glow layers */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-200/25 via-teal-200/20 to-violet-200/25 blur-2xl" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-teal-300 to-violet-400 opacity-30 blur" />

                {/* The dot */}
                <div className="absolute inset-3 rounded-full bg-slate-950 shadow-inner" />
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-cyan-300 via-teal-300 to-violet-400 shadow-xl" />
              </motion.div>
            </div>
            <p className="text-center text-sm text-slate-300">
              A calm snapshot of where you are. You can adjust pillars below or add a brief note.
            </p>
          </CardContent>
        </Card>

        {/* Snapshot & actions */}
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

      {/* Pillars + Inputs */}
      <section className="mx-auto max-w-6xl px-4 pb-14 grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Pillar bars */}
        <Card className="col-span-1 md:col-span-3 bg-slate-900/60 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base">Your four pillars</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 h-64">
              {pillars.map((v, i) => (
                <div key={i} className="flex flex-col items-center justify-end">
                  {/* Bar */}
                  <div className="relative w-8 flex-1 rounded-xl bg-slate-800 overflow-hidden">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-teal-400 via-cyan-300 to-violet-400"
                      style={{ height: `${v * 100}%` }}
                    />
                  </div>
                  <div className="mt-3 text-xs text-slate-300">{PILLARS[i].label}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {pillars.map((v, i) => (
                <div key={i} className="space-y-2">
                  <div className="text-xs text-slate-400">Adjust {PILLARS[i].label}</div>
                  <Slider
                    defaultValue={[v]}
                    max={1}
                    step={0.01}
                    onValueChange={(arr) => setPillar(i, clamp01(arr[0]))}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reflection inputs */}
        <Card className="col-span-1 md:col-span-2 bg-slate-900/60 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base">Gently rebalance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-200 flex items-center gap-2">
                  <Heart className="h-4 w-4" /> Gratitude
                </label>
                <Slider defaultValue={[gratitude]} max={1} step={0.01} onValueChange={(a) => setGratitude(clamp01(a[0]))} />
                <p className="text-xs text-slate-400">A small moment you appreciated today.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-200 flex items-center gap-2">
                  <HandHeart className="h-4 w-4" /> Act of kindness
                </label>
                <Slider defaultValue={[kindness]} max={1} step={0.01} onValueChange={(a) => setKindness(clamp01(a[0]))} />
                <p className="text-xs text-slate-400">Something you did (or received) that brought ease.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-200">Add a brief note (private)</label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What feels present right now?"
                className="min-h-[90px]"
              />
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={saveLocal}>Save locally</Button>
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
ite/80 hover:text-white">Profile</Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold mb-2">Welcome back</h1>
        <p className="text-white/60 mb-8">Ready to check in for today?</p>

        {/* Orb + Score */}
        <section className="mx-auto max-w-md">
          <div
            aria-hidden
            className="orb relative mx-auto h-56 w-56 rounded-full"
            style={{
              background:
                "radial-gradient(45% 45% at 50% 50%, rgba(167, 139, 250, 0.85) 0%, rgba(99, 102, 241, 0.75) 55%, rgba(59, 130, 246, 0.55) 100%)",
              filter: "saturate(120%)",
            }}
          />
          <div className="mt-6 text-center">
            <div className="text-white/60 text-sm mb-1">Today’s Wellness Index</div>
            <div className="text-4xl font-semibold">{todaysScore}</div>
          </div>

          {/* Primary action */}
          <div className="mt-6 flex justify-center">
            <Link
              to="/DailyCheckin"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-500/90 hover:bg-indigo-500 px-5 py-3 text-sm font-medium shadow-md shadow-indigo-900/30 transition"
            >
              Update Check-In
            </Link>
          </div>

          {/* Quick actions */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              to="/DailyCheckin"
              className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-center hover:bg-white/7 transition"
            >
              Check-In
            </Link>
            <Link
              to="/Insights"
              className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-center hover:bg-white/7 transition"
            >
              Insights
            </Link>
            <Link
              to="/Profile"
              className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-center hover:bg-white/7 transition"
            >
              Journal
            </Link>
          </div>
        </section>

        {/* Weekly snapshot placeholder (matches older design vibe) */}
        <section className="mt-10 max-w-xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-medium mb-4">Weekly snapshot</h2>
          <div className="space-y-3 text-sm">
            <Bar label="Sleep" />
            <Bar label="Hydration" />
            <Bar label="Purpose" />
            <Bar label="Resilience" />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-white/40 text-sm border-t border-white/10">
        Resonifi™ — Reflect. Transform. Thrive.
      </footer>
    </div>
  );
}

/* Small helper component for the snapshot bars */
function Bar({ label }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-white/70">{label}</span>
        <span className="text-white/50">—</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div className="h-full w-0 bg-indigo-400/70" />
      </div>
    </div>
  );
}
