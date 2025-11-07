import React from "react";
import DailyCheckin from "./DailyCheckin";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 md:px-8 py-8 md:py-10">
        {/* Top bar */}
        <header className="mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Resonifi
            </h1>
            <div className="rounded-full bg-slate-100/80 dark:bg-slate-800/70 px-3 py-1 text-xs text-slate-600 dark:text-slate-300">
              Daily Check-in
            </div>
          </div>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Quick pulse across your four pillars. Private by default; sync is optional.
          </p>
        </header>

        {/* Main card */}
        <main className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900 shadow-sm">
          <DailyCheckin />
        </main>

           {/* Footer */}
        <footer className="mt-6 text-xs text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} Resonifi Wellness Inc.
        </footer>
      </div>
    </div>
  );
}

