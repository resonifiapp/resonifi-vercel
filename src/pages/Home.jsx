// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  // Placeholder score for now
  const todaysScore = 0;

  return (
    <div className="min-h-screen bg-[#0a0a10] text-white flex flex-col justify-between">
      {/* Local CSS for the breathing glow (7.83s ~ Schumann-like cadence) */}
      <style>{`
        @keyframes breathe {
          0%   { box-shadow: 0 0 0 0 rgba(99,102,241,.35); transform: scale(1); }
          50%  { box-shadow: 0 0 60px 16px rgba(99,102,241,.55); transform: scale(1.02); }
          100% { box-shadow: 0 0 0 0 rgba(99,102,241,.35); transform: scale(1); }
        }
        .orb {
          animation: breathe 7.83s ease-in-out infinite;
        }
      `}</style>

      {/* Top bar (simple) */}
      <header className="w-full py-6 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="text-sm tracking-wide text-white/60">Resonifi™</div>
          <nav className="flex gap-6 text-sm">
            <Link to="/DailyCheckin" className="text-white/80 hover:text-white">Check-In</Link>
            <Link to="/Insights" className="text-white/80 hover:text-white">Insights</Link>
            <Link to="/Support" className="text-white/80 hover:text-white">Support</Link>
            <Link to="/Profile" className="text-white/80 hover:text-white">Profile</Link>
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
