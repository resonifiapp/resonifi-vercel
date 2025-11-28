// src/pages/Insights.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HISTORY_KEY = "resonifi_checkins_v1";
// Same key used in DailyCheckinPage for cycle info
const CYCLE_LAST_START_KEY = "resonifi_cycle_last_period_start";

function loadEntries() {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Error reading check-ins for Insights:", err);
    return [];
  }
}

// Compute averages per pillar (1–10), handling missing values gracefully
function computeAverages(entries) {
  const keys = ["emotional", "physical", "spiritual", "financial", "digital"];
  const sums = { emotional: 0, physical: 0, spiritual: 0, financial: 0, digital: 0 };
  const counts = { emotional: 0, physical: 0, spiritual: 0, financial: 0, digital: 0 };

  entries.forEach((entry) => {
    keys.forEach((key) => {
      const raw = entry[key];
      const num = Number(raw);
      if (Number.isFinite(num) && num > 0) {
        sums[key] += num;
        counts[key] += 1;
      }
    });
  });

  const averages = {};
  keys.forEach((key) => {
    if (counts[key] > 0) {
      averages[key] = sums[key] / counts[key];
    } else {
      averages[key] = null;
    }
  });

  return averages;
}

function formatDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function PillarCard({ label, value }) {
  const avg = typeof value === "number" ? value : null;
  const display = avg !== null ? avg.toFixed(1) : "—";
  const percent = avg !== null ? Math.max(0, Math.min(100, (avg / 10) * 100)) : 0;

  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: "16px",
        background: "rgba(15,23,42,0.9)",
        border: "1px solid rgba(148,163,184,0.45)",
        boxShadow: "0 4px 18px rgba(15,23,42,0.9)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "6px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: 500,
            color: "#e2e8f0",
          }}
        >
          {label}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: 600,
            color: "#f9fafb",
          }}
        >
          {display}
          <span style={{ fontSize: "11px", opacity: 0.7 }}> / 10</span>
        </p>
      </div>
      <div
        style={{
          marginTop: "6px",
          width: "100%",
          height: "6px",
          borderRadius: "999px",
          background: "rgba(30,64,175,0.7)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            borderRadius: "999px",
            background:
              "linear-gradient(90deg, #22d3ee, #0ea5e9, #6366f1)",
            boxShadow: "0 0 12px rgba(56,189,248,0.8)",
            transition: "width 0.3s ease-out",
          }}
        />
      </div>
    </div>
  );
}

export default function Insights() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [averages, setAverages] = useState({
    emotional: null,
    physical: null,
    spiritual: null,
    financial: null,
    digital: null,
  });
  const [lastPeriodStart, setLastPeriodStart] = useState(null);

  useEffect(() => {
    const loaded = loadEntries();
    setEntries(loaded);
    setAverages(computeAverages(loaded));

    // Load cycle info for "Last period start"
    try {
      const rawCycle = window.localStorage.getItem(CYCLE_LAST_START_KEY);
      if (rawCycle) {
        const parsed = JSON.parse(rawCycle);
        if (typeof parsed === "string") {
          setLastPeriodStart(parsed);
        } else if (parsed && typeof parsed === "object" && parsed.lastStart) {
          setLastPeriodStart(parsed.lastStart);
        }
      } else if (loaded.length > 0) {
        // Fallback: look at latest entry if it has lastPeriodStart
        const latest = loaded[0]; // assuming newest first in our history
        if (latest.lastPeriodStart) {
          setLastPeriodStart(latest.lastPeriodStart);
        }
      }
    } catch (err) {
      console.error("Error loading cycle info in Insights:", err);
    }
  }, []);

  const hasData = entries.length > 0;
  const recentEntries = hasData ? [...entries].slice(0, 5) : [];

  const page = {
    backgroundColor: "#020617",
    color: "#f9fafb",
    minHeight: "100vh",
    padding: "24px 16px 90px",
    boxSizing: "border-box",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    maxWidth: "960px",
    margin: "0 auto",
  };

  const headerTitle = {
    fontSize: "20px",
    fontWeight: 600,
    marginBottom: "4px",
  };

  const headerSubtitle = {
    fontSize: "13px",
    color: "#94a3b8",
    marginBottom: "18px",
  };

  const pillarList = {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "20px",
  };

  const cycleCard = {
    marginTop: "8px",
    padding: "14px 16px",
    borderRadius: "16px",
    background:
      "linear-gradient(135deg, rgba(56,189,248,0.12), rgba(37,99,235,0.2))",
    border: "1px solid rgba(125,211,252,0.5)",
    boxShadow: "0 0 22px rgba(56,189,248,0.35)",
    fontSize: "13px",
    color: "#e0f2fe",
  };

  const cycleHeader = {
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "6px",
  };

  const cycleButton = {
    marginTop: "10px",
    padding: "8px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(248,250,252,0.7)",
    backgroundColor: "rgba(15,23,42,0.2)",
    color: "#f9fafb",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
  };

  const recentSection = {
    marginTop: "24px",
  };

  const recentTitle = {
    fontSize: "14px",
    fontWeight: 600,
    marginBottom: "8px",
  };

  const recentPlaceholder = {
    fontSize: "12px",
    color: "#9ca3af",
  };

  return (
    <div style={page}>
      <header>
        <h1 style={headerTitle}>Insights</h1>
        <p style={headerSubtitle}>
          A quick snapshot of how your pillars have been feeling over time.
          These numbers are here to help you notice patterns, not judge your scores.
        </p>
      </header>

      {/* Pillar average cards (scrollable page — 3 above fold, 2 below) */}
      <section style={pillarList}>
        <PillarCard label="Emotional" value={averages.emotional} />
        <PillarCard label="Physical" value={averages.physical} />
        <PillarCard label="Spiritual" value={averages.spiritual} />
        <PillarCard label="Financial" value={averages.financial} />
        <PillarCard label="Digital" value={averages.digital} />
      </section>

      {/* Cycle tracking card */}
      <section style={cycleCard}>
        <div style={cycleHeader}>Cycle tracking</div>
        <div>
          Last period start:{" "}
          <strong>
            {lastPeriodStart ? lastPeriodStart : "Not set"}
          </strong>
        </div>
        <button
          type="button"
          style={cycleButton}
          onClick={() => navigate("/cycle-tracking")}
        >
          Open cycle tracking
        </button>
      </section>

      {/* Recent check-ins placeholder */}
      <section style={recentSection}>
        <h2 style={recentTitle}>Recent check-ins</h2>
        {!hasData && (
          <p style={recentPlaceholder}>
            Once you&apos;ve logged a few Daily Check-Ins, this section will
            show a simple history of your most recent days.
          </p>
        )}

        {hasData && (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              fontSize: "12px",
              color: "#e5e7eb",
            }}
          >
            {recentEntries.map((entry, idx) => (
              <li key={entry.timestamp ?? idx}>
                {formatDate(entry.timestamp) || "Unknown date"}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
