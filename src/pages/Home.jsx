import React, { useState } from "react";

/** Simple “breathing” ring animation */
const css = `
@keyframes breathe {
  0%   { transform: scale(1);    box-shadow: 0 0 0 0 rgba(20,184,166,.20); }
  50%  { transform: scale(1.04); box-shadow: 0 0 0 8px rgba(20,184,166,.10); }
  100% { transform: scale(1);    box-shadow: 0 0 0 0 rgba(20,184,166,.20); }
}
`;

/** Small modal for “Start Reflection”. No router needed. */
function ReflectionModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0f172a] text-slate-100 p-6 shadow-xl border border-white/10">
        <h2 className="text-xl font-semibold mb-2">Quick check-in</h2>
        <p className="text-slate-300 mb-4">
          Take a short reflection. This is private—stored only on your device.
        </p>

        <label className="block text-sm text-slate-300 mb-1">Gratitude</label>
        <input
          className="w-full mb-3 rounded-md bg-[#0b1220] border border-white/10 px-3 py-2 outline-none focus:border-teal-400"
          placeholder="A small moment you appreciated today…"
        />

        <label className="block text-sm text-slate-300 mb-1">
          Act of kindness
        </label>
        <input
          className="w-full mb-6 rounded-md bg-[#0b1220] border border-white/10 px-3 py-2 outline-none focus:border-teal-400"
          placeholder="Something you did (or received) that brought ease…"
        />

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-teal-500/90 hover:bg-teal-400 text-slate-900 font-medium"
            onClick={onClose}
          >
            Save locally
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  // You can change this number to whatever you like (e.g., 80)
  const [score] = useState(49);
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b1220] text-slate-100">
      {/* inject ring CSS */}
      <style>{css}</style>

      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1220]/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-teal-400" />
            <span className="font-semibold tracking-wide">Resonifi</span>
          </div>

          {/* simple links – these will work if your routes/files exist */}
          <nav className="hidden sm:flex items-center gap-5 text-sm">
            <a href="/DailyCheckin" className="hover:text-teal-300">
              Check-In
            </a>
            <a href="/Insights" className="hover:text-teal-300">
              Insights
            </a>
            <a href="/Support" className="hover:text-teal-300">
              Support
            </a>
            <a href="/Profile" className="hover:text-teal-300">
              Profile
            </a>
          </nav>

          <button
            onClick={() => setOpen(true)}
            className="rounded-xl bg-teal-500/90 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-teal-400"
          >
            Start Reflection
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Score card */}
        <section className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#0f172a] p-6 shadow">
          <h2 className="text-sm text-slate-300 flex items-center gap-2 mb-6">
            <span className="opacity-80">Core resonance</span>
            <span className="opacity-40">•</span>
            <span className="opacity-60">Guiding tone: 528 Hz</span>
          </h2>

          <div className="flex items-center justify-center py-8">
            <div
              className="relative h-52 w-52 rounded-full grid place-items-center"
              style={{ animation: "breathe 3.8s ease-in-out infinite" }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#172036] to-[#0b1220] border border-white/10" />
              <div className="relative h-40 w-40 rounded-full grid place-items-center bg-gradient-to-tr from-[#0ddfc2] to-[#6ee7f2] text-[#052825] font-bold text-5xl">
                {score}
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-slate-300">
            A calm snapshot of where you are. Start a reflection when you’re
            ready.
          </p>
        </section>

        {/* Snapshot / actions */}
        <aside className="rounded-2xl border border-white/10 bg-[#0f172a] p-6 shadow space-y-6">
          <div>
            <h3 className="text-sm text-slate-300 mb-3">Snapshot</h3>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setOpen(true)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left hover:border-teal-400 hover:bg-white/10"
              >
                Try without signup
              </button>
              <a
                href="/Support"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left hover:border-teal-400 hover:bg-white/10"
              >
                Learn the approach
              </a>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Private by default. Reflection over logging. You own your data.
            </p>
          </div>

          <div>
            <h3 className="text-sm text-slate-300 mb-3">Solfeggio cues</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["Emotional", "396 Hz (gentle cue)"],
                ["Physical", "417 Hz (gentle cue)"],
                ["Financial", "741 Hz (gentle cue)"],
                ["Spiritual", "852 Hz (gentle cue)"],
              ].map(([title, sub]) => (
                <div
                  key={title}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                >
                  <div className="text-sm">{title}</div>
                  <div className="text-xs text-slate-400">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* Modal */}
      <ReflectionModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
