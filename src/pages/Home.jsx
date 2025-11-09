import React from "react";
import { Link } from "react-router-dom";

/** Breathing orb using Schumann-inspired timings (7.83s, 3.915s, 2.61s) */
function GlowingBall({ score = 0 }) {
  return (
    <div className="relative flex flex-col items-center justify-center mt-2 mb-4">
      {/* Local keyframes so we don't touch tailwind.config.js */}
      <style>{`
        @keyframes breathe {
          0%   { transform: scale(0.92); opacity: .35; filter: blur(34px); }
          50%  { transform: scale(1.06); opacity: .60; filter: blur(42px); }
          100% { transform: scale(0.92); opacity: .35; filter: blur(34px); }
        }
        @keyframes breathe-mid {
          0%   { transform: scale(0.96); opacity: .25; filter: blur(28px); }
          50%  { transform: scale(1.05); opacity: .45; filter: blur(34px); }
          100% { transform: scale(0.96); opacity: .25; filter: blur(28px); }
        }
        @keyframes breathe-fast {
          0%   { transform: scale(0.98); opacity: .20; filter: blur(22px); }
          50%  { transform: scale(1.03); opacity: .35; filter: blur(26px); }
          100% { transform: scale(0.98); opacity: .20; filter: blur(22px); }
        }
      `}</style>

      {/* Auras */}
      <div
        aria-hidden
        className="absolute rounded-full bg-indigo-500/40"
        style={{ width: "11rem", height: "11rem", animation: "breathe 7.83s ease-in-out infinite" }}
      />
      <div
        aria-hidden
        className="absolute rounded-full bg-blue-400/30"
        style={{ width: "9.5rem", height: "9.5rem", animation: "breathe-mid 3.915s ease-in-out infinite" }}
      />
      <div
        aria-hidden
        className="absolute rounded-full bg-violet-500/25"
        style={{ width: "8.25rem", height: "8.25rem", animation: "breathe-fast 2.61s ease-in-out infinite" }}
      />

      {/* Core sphere */}
      <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 via-blue-500 to-violet-500 shadow-[0_0_46px_rgba(99,102,241,0.85)]" />

      {/* Score */}
      <div className="mt-4 text-center">
        <div className="text-white/60 text-xs">Today’s Wellness Index</div>
        <div className="text-3xl font-semibold text-white">{score}</div>
      </div>
    </div>
  );
}

export default function Home() {
  const firstName = "jpcromnien!";
  const todayScore = 0;
  const weekly = [
    { label: "Sleep", value: 100 },
    { label: "Hydration", value: 100 },
    { label: "Purpose", value: 100 },
    { label: "Resilience", value: 100 },
  ];

  return (
    <main className="max-w-3xl mx-auto px-4 md:px-0 py-10 text-white">
      {/* Brand */}
      <div className="text-center text-white/70 text-sm mb-3">Resonifi™</div>

      {/* Welcome */}
      <section className="mb-6">
        <h1 className="text-xl font-semibold">Welcome back, {firstName}</h1>
        <p className="text-white/60">Ready to check in for today?</p>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-white/80">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
          1-day streak
        </div>
      </section>

      {/* Orb card */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex justify-center">
          <GlowingBall score={todayScore} />
        </div>

        <div className="flex justify-center">
          <Link
            to="/DailyCheckin"
            className="w-full sm:w-auto text-center rounded-xl px-5 py-3 bg-indigo-600 hover:bg-indigo-500 transition font-medium"
          >
            Update Check-In
          </Link>
        </div>

        {/* Quick actions */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link to="/DailyCheckin" className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-center">
            <div className="text-sm">Check-In</div>
          </Link>
          <Link to="/Insights" className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-center">
            <div className="text-sm">Insights</div>
          </Link>
          <Link to="/Profile" className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-center">
            <div className="text-sm">Journal</div>
          </Link>
        </div>
      </section>

      {/* Weekly snapshot */}
      <section className="mb-6">
        <h2 className="text-sm font-medium mb-3 text-white/90">Weekly snapshot</h2>
        <div className="grid gap-3">
          {weekly.map((item) => (
            <div key={item.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-white/70">{item.label}</span>
                <span className="text-white/60">{item.value}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Weekly summary */}
      <section className="mb-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-white/90 text-sm font-medium">New: Weekly Summary</div>
            <div className="text-white/60 text-sm">A clearer recap of how your week is trending.</div>
          </div>
          <Link to="/Insights" className="rounded-xl px-4 py-2 bg-white/10 hover:bg-white/15 text-sm">
            View
          </Link>
        </div>
      </section>

      {/* Wins */}
      <section className="mb-10">
        <h2 className="text-sm font-medium mb-3 text-white/90">Wins</h2>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs rounded-full bg-white/10 px-3 py-1">🏅 3 badges</span>
            <span className="text-xs rounded-full bg-white/10 px-3 py-1">✅ 7 check-ins this month</span>
            <span className="text-xs rounded-full bg-white/10 px-3 py-1">📈 Trend steady</span>
          </div>
        </div>
      </section>
    </main>
  );
}
