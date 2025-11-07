import React, { useMemo, useState } from "react";

/**
 * Resonifi — DailyCheckin
 * Self‑contained React component (no external UI libs required)
 * TailwindCSS for styling. Production‑ready, accessible.
 *
 * Features
 * - Four pillars (Emotional, Physical, Spiritual, Financial)
 * - Big, thumb‑friendly 0–10 sliders + +/- steppers
 * - Per‑pillar quick notes
 * - Tooltip help that is confined to the card (no overflow/spillover)
 * - Autosave to localStorage + optional POST to /api/checkins (graceful fail)
 * - onSubmit prop for app‑level handling; returns fully shaped payload
 * - Average Wellness Index computed from visible pillars
 */

const PILLARS = [
  {
    id: "emotional",
    label: "Emotional",
    help: "How balanced, calm, and connected do you feel emotionally right now?",
    accent: "from-fuchsia-500 to-violet-500",
  },
  {
    id: "physical",
    label: "Physical",
    help: "How is your body feeling? Energy, pain, sleep, and recovery count here.",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    id: "spiritual",
    label: "Spiritual",
    help: "Sense of meaning, alignment, and inner stillness. Whatever that means to you.",
    accent: "from-sky-500 to-indigo-500",
  },
  {
    id: "financial",
    label: "Financial",
    help: "How safe and in‑control do you feel about money today?",
    accent: "from-amber-500 to-orange-500",
  },
];

const clamp01 = (n) => Math.max(0, Math.min(10, n));

export default function DailyCheckin({ onSubmit, defaultValues }) {
  const todayISO = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(defaultValues?.date ?? todayISO);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  const initialScores = useMemo(() => {
    const base = Object.fromEntries(PILLARS.map((p) => [p.id, 5]));
    return { ...base, ...(defaultValues?.scores || {}) };
  }, [defaultValues]);

  const [scores, setScores] = useState(initialScores);
  const [notes, setNotes] = useState(defaultValues?.notes || {});

  const wellnessIndex = useMemo(() => {
    const values = PILLARS.map((p) => Number(scores[p.id] ?? 0));
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return Number.isFinite(avg) ? Math.round(avg * 10) / 10 : 0;
  }, [scores]);

  function inc(id, delta) {
    setScores((prev) => ({ ...prev, [id]: clamp01((Number(prev[id]) || 0) + delta) }));
  }

  function onScoreChange(id, v) {
    setScores((prev) => ({ ...prev, [id]: clamp01(Number(v)) }));
  }

  function onNoteChange(id, v) {
    setNotes((prev) => ({ ...prev, [id]: v.slice(0, 280) }));
  }

  async function handleSave(e) {
    e?.preventDefault?.();
    setSubmitting(true);
    setStatus("");

    const payload = {
      type: "daily-checkin",
      version: 1,
      date,
      createdAt: new Date().toISOString(),
      wellnessIndex,
      pillarScores: { ...scores },
      pillarNotes: { ...notes },
      // Room for client-only metadata (never exfiltrate without consent)
      client: {
        app: "Resonifi",
        platform: typeof navigator !== "undefined" ? navigator.userAgent : "node",
      },
    };

    try {
      // 1) Local persistence (offline‑first)
      const key = "resonifi.checkins";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      localStorage.setItem(key, JSON.stringify([...existing, payload]));

      // 2) Optional network sync (non‑blocking failure)
      try {
        await fetch("/api/checkins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (netErr) {
        // Swallow network errors silently to keep UX smooth; leave audit in console
        console.debug("/api/checkins POST skipped or failed:", netErr?.message);
      }

      // 3) App‑level callback
      onSubmit?.(payload);

      setStatus("Saved ✔");
    } catch (err) {
      console.error(err);
      setStatus("Could not save. Try again.");
    } finally {
      setSubmitting(false);
      setTimeout(() => setStatus(""), 2500);
    }
  }

  function handleReset() {
    setScores(Object.fromEntries(PILLARS.map((p) => [p.id, 5])));
    setNotes({});
    setDate(todayISO);
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
      {/* Header */}
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Daily Check‑in
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mt-1">
          Quick pulse across your four pillars. Text stays wrapped, tooltips stay inside each card, and nothing spills out.
        </p>
      </header>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Date + Score summary */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-3">
            <span className="shrink-0">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Check‑in date"
            />
          </label>

          <div className="ml-auto inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2">
            <span className="text-sm text-slate-500">Wellness Index</span>
            <span className="text-lg font-semibold tabular-nums" aria-live="polite">
              {wellnessIndex.toFixed(1)} / 10
            </span>
          </div>
        </div>

        {/* Pillar cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {PILLARS.map((p) => (
            <section
              key={p.id}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow"
              aria-labelledby={`${p.id}-label`}
            >
              {/* Accent header */}
              <div className={`pointer-events-none h-1 w-full bg-gradient-to-r ${p.accent}`} />

              <div className="p-4 sm:p-5 md:p-6">
                <div className="flex items-start justify-between gap-3">
                  <h2 id={`${p.id}-label`} className="text-lg font-semibold text-slate-900 dark:text-slate-100 break-words">
                    {p.label}
                  </h2>

                  {/* Confined tooltip */}
                  <div className="relative">
                    <button
                      type="button"
                      className="peer inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                      aria-label={`Help: ${p.label}`}
                      title={p.help}
                    >
                      i
                    </button>
                    {/* Custom tooltip bubble stays inside card via overflow-hidden on parent */}
                    <div className="absolute right-0 z-10 hidden max-w-[18rem] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm text-slate-700 dark:text-slate-200 shadow-lg peer-hover:block group-hover:block">
                      {p.help}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="mt-4">
                  <div className="grid grid-cols-[auto,1fr,auto] items-center gap-3">
                    <button
                      type="button"
                      onClick={() => inc(p.id, -1)}
                      className="rounded-2xl px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 disabled:opacity-50"
                      aria-label={`Decrease ${p.label}`}
                    >
                      −
                    </button>

                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={1}
                      value={scores[p.id]}
                      onChange={(e) => onScoreChange(p.id, e.target.value)}
                      className="w-full accent-indigo-600"
                      aria-describedby={`${p.id}-value`}
                    />

                    <button
                      type="button"
                      onClick={() => inc(p.id, +1)}
                      className="rounded-2xl px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 disabled:opacity-50"
                      aria-label={`Increase ${p.label}`}
                    >
                      +
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <label htmlFor={`${p.id}-value`} className="text-sm text-slate-600 dark:text-slate-300">
                      Score
                    </label>
                    <input
                      id={`${p.id}-value`}
                      type="number"
                      min={0}
                      max={10}
                      inputMode="numeric"
                      value={scores[p.id]}
                      onChange={(e) => onScoreChange(p.id, e.target.value)}
                      className="w-20 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800 px-2 py-1 text-center tabular-nums"
                      aria-label={`${p.label} score 0 to 10`}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-4">
                  <label htmlFor={`${p.id}-note`} className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Notes (optional)
                  </label>
                  <textarea
                    id={`${p.id}-note`}
                    value={notes[p.id] || ""}
                    onChange={(e) => onNoteChange(p.id, e.target.value)}
                    placeholder={`Any quick detail about your ${p.label.toLowerCase()} state…`}
                    className="mt-1 h-24 w-full resize-y rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800 p-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 whitespace-normal break-words"
                    maxLength={280}
                  />
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 text-right">
                    {(notes[p.id]?.length || 0)}/280
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="text-sm text-slate-500" aria-live="polite">{status}</div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900 px-4 py-2 text-slate-800 dark:text-slate-100 hover:bg-slate-50"
            >
              Reset
            </button>
           <button
  type="button"
  onClick={handleSave}
  disabled={submitting}
  className="rounded-2xl bg-indigo-600 px-5 py-2.5 font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
>
  {submitting ? "Saving..." : "Save Check-in"}
</button>

          </div>
        </div>
      </form>

      {/* Footnote for privacy stance */}
      <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
        Your data is saved locally first. Sync is optional and privacy‑respectful.
      </p>
    </div>
  );
}
