import React from "react";
import { Link } from "react-router-dom";

function GlowingBall({ score = 0 }) {
  return (
    <>
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

      <div className="relative flex flex-col items-center justify-center mt-2 mb-4">
        <div
          className="absolute rounded-full bg-indigo-500/40"
          style={{
            width: "11rem",
            height: "11rem",
            animation: "breathe 7.83s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full bg-blue-400/30"
          style={{
            width: "9.5rem",
            height: "9.5rem",
            animation: "breathe-mid 3.915s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full bg-violet-500/25"
          style={{
            width: "8.25rem",
            height: "8.25rem",
            animation: "breathe-fast 2.61s ease-in-out infinite",
          }}
        />

        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 via-blue-500 to-violet-500 shadow-[0_0_46px_rgba(99,102,241,0.85)]" />

        <div className="mt-4 text-center">
          <div className="text-white/60 text-xs">Today’s Wellness Index</div>
          <div className="text-3xl font-semibold text-white">{score}</div>
        </div>
      </div>
    </>
  );
}

export default function Home() {
  const firstName = "jpcromnien!";
  const todayScore = 0;

  return (
    <main className="max-w-3xl mx-auto px-4 md:px-0 py-10 text-white">
      <div className="text-center text-white/70 text-sm mb-3">Resonifi™</div>

      <section className="mb-6">
        <h1 className="text-xl font-semibold">Welcome back, {firstName}</h1>
        <p className="text-white/60">Ready to check in for today?</p>
      </section>

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
      </section>
    </main>
  );
}

  );
}
