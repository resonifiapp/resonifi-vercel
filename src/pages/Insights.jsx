// src/pages/Insights.jsx
import React from "react";

export default function Insights() {
  return (
    <div className="min-h-screen bg-[#0a0a10] text-white flex flex-col justify-between">
      <header className="w-full py-6 border-b border-white/10 text-center">
        <h1 className="text-2xl font-semibold tracking-wide">Insights</h1>
      </header>

      <main className="flex-grow max-w-3xl mx-auto px-6 py-12">
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-md">
          <h2 className="text-lg font-medium mb-2">Weekly Snapshot</h2>
          <p className="text-white/70 text-sm mb-6">
            Your personal patterns and reflections will appear here soon. As you
            check in more, Resonifi will help you notice trends across your
            emotional, physical, spiritual, and financial pillars.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className="text-sm text-white/60">Sleep</p>
              <p className="text-xl font-semibold">—</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className="text-sm text-white/60">Hydration</p>
              <p className="text-xl font-semibold">—</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className="text-sm text-white/60">Purpose</p>
              <p className="text-xl font-semibold">—</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className="text-sm text-white/60">Resilience</p>
              <p className="text-xl font-semibold">—</p>
            </div>
          </div>
        </section>

        <section className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-medium mb-2">Reflections</h2>
          <p className="text-white/70 text-sm">
            In future updates, you’ll see your journal insights and daily
            resonance trends here — helping you reflect, transform, and thrive
            through awareness.
          </p>
        </section>
      </main>

      <footer className="py-6 text-center text-white/40 text-sm border-t border-white/10">
        Resonifi™ — Reflect. Transform. Thrive.
      </footer>
    </div>
  );
}

