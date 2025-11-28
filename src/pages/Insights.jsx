// src/pages/Insights.jsx

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

/* ---------- Constants ---------- */

const HISTORY_KEY = "resonifi_checkins_v1";

const PILLARS = [
  { key: "emotional", label: "Emotional" },
  { key: "physical", label: "Physical" },
  { key: "spiritual", label: "Spiritual" },
  { key: "financial", label: "Financial" },
  { key: "digital", label: "Digital" },
];

/* ---------- Helpers ---------- */

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDate(value) {
  const d = parseDate(value);
  if (!d) return "Unknown date";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function loadEntries() {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.error("Error loading check-ins:", err);
    return [];
  }
}

function computeAverages(entries, daysWindow = 14) {
  if (!entries.length) {
    return {
      avgIndex: null,
      pillarAverages: {},
      usedDays: 0,
      recentEntries: [],
    };
  }

  const now = new Date();
  const cutoff = now.getTime() - daysWindow * 24 * 60 * 60 * 1000;

  const recent = entries.filter((e) => {
    const d = parseDate(e.date || e.createdAt || e.timestamp);
    if (!d) return false;
    return d.getTime() >= cutoff;
  });

  if (!recent.length) {
    return {
      avgIndex: null,
      pillarAverages: {},
      usedDays: daysWindow,
      recentEntries: [],
    };
  }

  let indexSum = 0;
  const sums = {};
  const counts = {};

  PILLARS.forEach((p) => {
    sums[p.key] = 0;
    counts[p.key] = 0;
  });

  for (const entry of recent) {
    const idx = Number(entry.index ?? entry.wellnessIndex);
    if (!Number.isNaN(idx)) {
      indexSum += idx;
    }

    PILLARS.forEach((p) => {
      const val = Number(entry[p.key]);
      if (!Number.isNaN(val)) {
        sums[p.key] += val;
        counts[p.key] += 1;
      }
    });
  }

  const pillarAverages = {};
  PILLARS.forEach((p) => {
    if (counts[p.key] > 0) {
      pillarAverages[p.key] = sums[p.key] / counts[p.key];
    } else {
      pillarAverages[p.key] = null;
    }
  });

  const avgIndex = indexSum / recent.length;

  return {
    avgIndex,
    pillarAverages,
    usedDays: daysWindow,
    recentEntries: recent,
  };
}

function computeTrends(entries) {
  // Very simple trend logic: compare last 3 vs previous 3
  if (entries.length < 4) {
    return {
      rising: [],
      needsCare: [],
      steady: [],
      waiting: PILLARS.map((p) => p.key),
    };
  }

  const sorted = [...entries].sort((a, b) => {
    const da = parseDate(a.date || a.createdAt || a.timestamp) || new Date(0);
    const db = parseDate(b.date || b.createdAt || b.timestamp) || new Date(0);
    return db.getTime() - da.getTime();
  });

  const recent = sorted.slice(0, 3);
  const prev = sorted.slice(3, 6);

  const rising = [];
  const needsCare = [];
  const steady = [];
  const waiting = [];

  const avgFor = (list, key) => {
    const vals = list
      .map((e) => Number(e[key]))
      .filter((v) => !Number.isNaN(v));
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  PILLARS.forEach((p) => {
    const recentAvg = avgFor(recent, p.key);
    const prevAvg = avgFor(prev, p.key);

    if (recentAvg == null || prevAvg == null) {
      waiting.push(p.key);
      return;
    }

    const diff = recentAvg - prevAvg;

    if (diff >= 0.75) {
      rising.push(p.key);
    } else if (diff <= -0.75) {
      needsCare.push(p.key);
    } else {
      steady.push(p.key);
    }
  });

  return { rising, needsCare, steady, waiting };
}

/* ---------- Inline styles ---------- */

const wrapper = {
  minHeight: "100vh",
  backgroundColor: "#020617", // slate-950-ish
  color: "#f9fafb",
};

const page = {
  maxWidth: "900px",
  margin: "0 auto",
  padding: "80px 16px 96px",
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
};

const headerTitle = {
  fontSize: "32px",
  fontWeight: 700,
  marginBottom: 4,
};

const headerSubtitle = {
  fontSize: "13px",
  color: "#cbd5f5",
  marginBottom: 24,
};

const gridTwo = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 16,
  marginBottom: 24,
};

const card = {
  borderRadius: 16,
  border: "1px solid rgba(148, 163, 184, 0.4)",
  background:
    "linear-gradient(145deg, rgba(15,23,42,0.95), rgba(15,23,42,0.85))",
  padding: "14px 16px",
};

const sectionCard = {
  ...card,
  marginBottom: 24,
};

const labelCaps = {
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#94a3b8",
};

const bigNumber = {
  fontSize: 36,
  fontWeight: 600,
  marginTop: 6,
};

const smallText = {
  fontSize: 11,
  color: "#94a3b8",
  marginTop: 6,
};

const h2 = {
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 8,
};

const smallP = {
  fontSize: 12,
  color: "#e5e7eb",
};

const miniLabel = {
  fontSize: 12,
  fontWeight: 600,
  color: "#e5e7eb",
};

const recentCard = {
  borderRadius: 12,
  border: "1px solid rgba(30,64,175,0.4)",
  backgroundColor: "rgba(2,6,23,0.9)",
  padding: "8px 10px",
};

const recentDate = {
  fontSize: 11,
  color: "#94a3b8",
};

const recentIndex = {
  fontSize: 13,
  fontWeight: 600,
  marginTop: 4,
};

const recentLine = {
  fontSize: 11,
  color: "#e5e7eb",
  marginTop: 4,
};

const recentNote = {
  fontSize: 11,
  fontStyle: "italic",
  color: "#9ca3af",
  marginTop: 4,
};

const cycleCardOuter = {
  borderRadius: 18,
  border: "1px solid rgba(56,189,248,0.6)",
  background:
    "linear-gradient(135deg, rgba(8,47,73,0.9), rgba(8,47,73,0.7))",
  padding: "14px 16px",
  cursor: "pointer",
};

const cycleOptional = {
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#7dd3fc",
};

const cycleTitle = {
  fontSize: 15,
  fontWeight: 600,
  color: "#e0f2fe",
  marginTop: 4,
};

const cycleBody = {
  fontSize: 11,
  color: "#bae6fd",
  marginTop: 4,
};

const cycleFooter = {
  fontSize: 10,
  color: "#7dd3fc",
  marginTop: 8,
};

const cycleArrow = {
  width: 32,
  height: 32,
  borderRadius: 999,
  border: "1px solid rgba(125,211,252,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 16,
  color: "#e0f2fe",
  marginLeft: 12,
};

/* ---------- Main Component ---------- */

export default function Insights() {
  const navigate = useNavigate();

  const { avgIndex, pillarAverages, usedDays, recentEntries, allTrends } =
    useMemo(() => {
      const entries = loadEntries();
      const averages = computeAverages(entries, 14);
      const trends = computeTrends(entries);

      return {
        avgIndex: averages.avgIndex,
        pillarAverages: averages.pillarAverages,
        usedDays: averages.usedDays,
        recentEntries: averages.recentEntries.length
          ? averages.recentEntries
          : entries,
        allTrends: trends,
      };
    }, []);

  const lastFew = useMemo(() => {
    if (!recentEntries.length) return [];
    const sorted = [...recentEntries].sort((a, b) => {
      const da = parseDate(a.date || a.createdAt || a.timestamp) || new Date(0);
      const db = parseDate(b.date || b.createdAt || b.timestamp) || new Date(0);
      return db.getTime() - da.getTime();
    });
    return sorted.slice(0, 6);
  }, [recentEntries]);

  const { rising, needsCare, waiting } = allTrends;
  const hasHistory = recentEntries.length > 0;

  // Build the single horizontal Wellness Categories line
  const wellnessCategoriesLine = PILLARS.map((p) => {
    const avg = pillarAverages[p.key];
    const value = avg != null ? `${avg.toFixed(1)}/10` : "—/10";
    return `${p.label} ${value}`;
  }).join(" • ");

  return (
    <div style={wrapper}>
      <main style={page}>
        {/* Header */}
        <header style={{ marginBottom: 24 }}>
          <h1 style={headerTitle}>Insights</h1>
          <p style={headerSubtitle}>
            A clean snapshot of how life has felt over the last couple of weeks.
          </p>
        </header>

        {/* Top cards */}
        <section style={gridTwo}>
          {/* Average index */}
          <div style={card}>
            <p style={labelCaps}>Average Wellness Index</p>
            <p style={bigNumber}>
              {avgIndex != null ? avgIndex.toFixed(1) : "—"}
            </p>
            <p style={smallText}>
              {hasHistory ? (
                <>
                  Based on {recentEntries.length} recent check-ins
                  {usedDays ? ` (about ${usedDays} days).` : "."}
                </>
              ) : (
                "Your average will appear here after a few check-ins."
              )}
            </p>
          </div>

          {/* Patterns at a glance (NOT a full-card link anymore) */}
          <div style={card}>
            <p style={labelCaps}>Patterns at a glance</p>

            <p style={{ ...smallText, marginTop: 6 }}>
              Resonifi looks at roughly the last two weeks of check-ins. It
              compares your most recent few entries with the few just before
              them and surfaces gentle lifts and dips – not diagnoses – so you
              can see where things may be trending and decide where to give
              yourself a bit more care.
            </p>

            <div style={{ marginTop: 10 }}>
              <p style={miniLabel}>Lifting</p>
              <p style={{ ...smallP, marginTop: 2 }}>
                {rising.length
                  ? `These Wellness Categories have been moving up compared to the previous window of check-ins over the last couple of weeks: ${rising
                      .map((k) => PILLARS.find((p) => p.key === k)?.label)
                      .filter(Boolean)
                      .join(
                        ", "
                      )}. Notice what might be supporting that lift – routines, people, places – and consider protecting more of that time.`
                  : hasHistory
                  ? "Nothing is clearly lifting yet. Day-to-day ups and downs are normal, so this only lights up when there is a clearer upward drift over your recent check-ins."
                  : "As you build up about two weeks of history, this will highlight Wellness Categories that are gently lifting over time."}
              </p>
            </div>

            <div style={{ marginTop: 10 }}>
              <p style={miniLabel}>Needs care</p>
              <p style={{ ...smallP, marginTop: 2 }}>
                {needsCare.length
                  ? `These Wellness Categories have dipped compared to the previous window of check-ins in the last couple of weeks: ${needsCare
                      .map((k) => PILLARS.find((p) => p.key === k)?.label)
                      .filter(Boolean)
                      .join(
                        ", "
                      )}. Treat this as a soft nudge to check in with yourself there, not a verdict or a scorecard.`
                  : hasHistory
                  ? "No categories are showing a clear downward move right now. If a day feels off, your notes and detailed check-ins are still the best place to unpack what is going on."
                  : "Once you have around two weeks of entries, this will gently flag areas that might benefit from a little more attention."}
              </p>
            </div>

            <div style={{ marginTop: 10 }}>
              <p style={miniLabel}>Waiting on data</p>
              <p style={{ ...smallP, marginTop: 2 }}>
                {waiting.length
                  ? `We don’t yet have enough recent scores in these Wellness Categories to compare two short windows from the last couple of weeks: ${waiting
                      .map((k) => PILLARS.find((p) => p.key === k)?.label)
                      .filter(Boolean)
                      .join(
                        ", "
                      )}. Keep checking in and they’ll naturally move into the lifting or needs care lines as the pattern becomes clearer.`
                  : "Right now we have enough recent check-ins across all categories to show simple movement where it exists."}
              </p>
            </div>

            {/* Tiny WHY link */}
            <p
              style={{
                ...smallText,
                marginTop: 10,
                fontSize: 11,
                color: "#7dd3fc",
                cursor: "pointer",
                textDecoration: "underline",
              }}
              onClick={() => navigate("/insights-why")}
            >
              Why does this take about two weeks?
            </p>
          </div>
        </section>

        {/* Wellness Categories – single horizontal line */}
        <section style={sectionCard}>
          <h2 style={h2}>Wellness Categories</h2>
          <p
            style={{
              ...smallP,
              whiteSpace: "nowrap",
              overflowX: "auto",
              paddingBottom: 2,
            }}
          >
            {wellnessCategoriesLine}
          </p>
        </section>

        {/* Recent check-ins */}
        <section style={sectionCard}>
          <h2 style={h2}>Recent check-ins</h2>

          {!lastFew.length && (
            <p style={smallP}>
              Once you have a few check-ins, they will show up here with your
              daily scores and notes.
            </p>
          )}

          <div
            style={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {lastFew.map((entry, idx) => (
              <div key={idx} style={recentCard}>
                <p style={recentDate}>
                  {formatDate(
                    entry.date || entry.createdAt || entry.timestamp
                  )}
                </p>
                <p style={recentIndex}>
                  Wellness Index:{" "}
                  {entry.index != null
                    ? Number(entry.index).toFixed(1)
                    : entry.wellnessIndex != null
                    ? Number(entry.wellnessIndex).toFixed(1)
                    : "—"}
                </p>
                <p style={recentLine}>
                  Emotional {entry.emotional ?? "—"}/10 · Physical{" "}
                  {entry.physical ?? "—"}/10 · Spiritual{" "}
                  {entry.spiritual ?? "—"}/10 · Financial{" "}
                  {entry.financial ?? "—"}/10 · Digital{" "}
                  {entry.digital ?? "—"}/10
                </p>
                {entry.note && <p style={recentNote}>“{entry.note}”</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Cycle Tracking card */}
        <section style={{ marginTop: 12 }}>
          <button
            type="button"
            onClick={() => navigate("/cycle-tracking")}
            style={{
              width: "100%",
              textAlign: "left",
              border: "none",
              background: "none",
              padding: 0,
            }}
          >
            <div style={cycleCardOuter}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p style={cycleOptional}>Optional</p>
                  <h3 style={cycleTitle}>Cycle Tracking</h3>
                  <p style={cycleBody}>
                    Log cycles and see how they line up with your Wellness
                    Index over time.
                  </p>
                </div>
                <div style={cycleArrow}>→</div>
              </div>
              <p style={cycleFooter}>Tap to open the Cycle Tracking view.</p>
            </div>
          </button>
        </section>
      </main>
    </div>
  );
}
