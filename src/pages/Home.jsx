// src/pages/Home.jsx
import React, { useMemo } from "react";

/** tiny helpers just for the score ring */
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
function computeIndex({ mood = 5, energy = 5, sleep = 6, exercise = 20, water = 2 }) {
  const mood10 = clamp(mood, 0, 10);
  const energy10 = clamp(energy, 0, 10);
  const sleep10 = clamp((sleep / 12) * 10, 0, 10);
  const exercise10 = clamp((exercise / 60) * 10, 0, 10);
  const water10 = clamp((water / 3) * 10, 0, 10);
  const score = (mood10 * 0.25 + energy10 * 0.25 + sleep10 * 0.20 + exercise10 * 0.15 + water10 * 0.15) / 1.0;
  return Math.round(score * 10); // number like 49, 55, 80 etc.
}

export default function Home() {
  // fixed snapshot for the ring (no sliders here by design)
  const score = useMemo(
    () =>
      computeIndex({
        mood: 5,
        energy: 5,
        sleep: 6,
        exercise: 20,
        water: 2,
      }),
    []
  );

  const css = `
    @keyframes breathe {
      0%   { transform: scale(1);   box-shadow: 0 0 0 0 rgba(20,184,166,.25); }
      50%  { transform: scale(1.04); box-shadow: 0 0 8px 0 rgba(20,184,166,.10); }
      100% { transform: scale(1);   box-shadow: 0 0 0 0 rgba(20,184,166,.25); }
    }
  `;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <style>{css}</style>

      {/* Top bar with simple links (hash links so no router needed) */}
      <header className="sticky top-0 z-10 border-b border-white/5 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-teal-400" />
            <span className="text-sm font-semibold tracking-wide">Resonifi</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <a href="#/checkin" className="hover:text-white/90 text-white/70">
              Check-In
            </a>
            <a href="#/insights" className="hover:text-white/90 text-white/70">
              Insights
            </a>
            <a href="#/support" className="hover:text-white/90 text-white/70">
              Support
            </a>
            <a href="#/profile" className="hover:text-white/90 text-white/70">
              Profile
            </a>
            <a
              href="#/checkin"
              className="rounded-md bg-teal-500 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-teal-400"
            >
              Start Reflection →
            </a>
          </nav>
        </div>
      </header>

      {/* Hero with breathing ring and score */}
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-2">
        <section className="rounded-xl border border-white/5 bg-slate-900/40 p-6">
          <h2 className="mb-6 text-sm font-semibold tracking-wide text-white/80">Core Resonance</h2>
          <div className="mx-auto grid place-items-center">
            <div
              className="relative grid h-44 w-44 place-items-center rounded-full bg-gradient-to-b from-slate-800 to-slate-900"
              style={{ animation: "breathe 4s ease-in-out infinite" }}
            >
              <div className="absolute inset-0 rounded-full ring-8 ring-slate-800" />
              <div className="absolute inset-3 rounded-full bg-slate-950 shadow-inner" />
              <span className="relative text-4xl font-bold text-teal-300">{score}</span>
            </div>
            <p className="mt-6 text-center text-sm text-white/70">
              A calm snapshot of where you are. Start a check-in to update your wellness index.
            </p>
            <a
              href="#/checkin"
              className="mt-6 rounded-md bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-teal-400"
            >
              Start Check-In
            </a>
          </div>
        </section>

        <section className="rounded-xl border border-white/5 bg-slate-900/40 p-6">
          <h3 className="mb-4 text-sm font-semibold tracking-wide text-white/80">Snapshot</h3>
          <p className="text-sm text-white/70">
            Private by default. Reflection over logging. You own your data.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <a
              href="#/checkin"
              className="rounded-lg border border-white/10 bg-slate-900/60 px-4 py-3 text-center text-sm hover:border-white/20"
            >
              Try without signup
            </a>
            <a
              href="#/support"
              className="rounded-lg border border-white/10 bg-slate-900/60 px-4 py-3 text-center text-sm hover:border-white/20"
            >
              Learn the approach
            </a>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-white/10 bg-slate-900/60 p-3 text-xs text-white/70">
              Emotional · 396 Hz (gentle cue)
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-900/60 p-3 text-xs text-white/70">
              Physical · 417 Hz (gentle cue)
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-900/60 p-3 text-xs text-white/70">
              Financial · 741 Hz (gentle cue)
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-900/60 p-3 text-xs text-white/70">
              Spiritual · 852 Hz (gentle cue)
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
