// src/pages/Insights.jsx
import React, { useEffect, useState } from "react";

const STORAGE_KEY = "resonifi_checkins_v1";

function loadEntries() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Error reading check-ins for Insights:", err);
    return [];
  }
}

function computeStats(entries) {
  if (!entries.length) {
    return {
      averages: null,
      strongest: null,
      softest: null,
      biggestChange: null,
    };
  }

  let emoSum = 0,
    physSum = 0,
    spirSum = 0,
    finSum = 0,
    wellSum = 0;

  entries.forEach((e) => {
    const p = e.pillars || {};
    emoSum += Number(p.emotional ?? 0);
    physSum += Number(p.physical ?? 0);
    spirSum += Number(p.spiritual ?? 0);
    finSum += Number(p.financial ?? 0);
    wellSum += Number(e.wellnessIndex ?? 0);
  });

  const count = entries.length;

  const averages = {
    emotional: emoSum / count,
    physical: physSum / count,
    spiritual: spirSum / count,
    financial: finSum / count,
    wellness: wellSum / count,
  };

  // strongest / softest pillar by average
  const pillarList = [
    { key: "emotional", label: "Emotional", value: averages.emotional },
    { key: "physical", label: "Physical", value: averages.physical },
    { key: "spiritual", label: "Spiritual", value: averages.spiritual },
    { key: "financial", label: "Financial", value: averages.financial },
  ];

  let strongest = pillarList[0];
  let softest = pillarList[0];

  pillarList.forEach((p) => {
    if (p.value > strongest.value) strongest = p;
    if (p.value < softest.value) softest = p;
  });

  // biggest change since last check-in (compared to previous one)
  let biggestChange = null;
  if (entries.length >= 2) {
    const last = entries[entries.length - 1];
    const prev = entries[entries.length - 2];

    const deltas = pillarList.map((p) => {
      const lastVal = Number(last.pillars?.[p.key] ?? 0);
      const prevVal = Number(prev.pillars?.[p.key] ?? 0);
      return { ...p, delta: lastVal - prevVal };
    });

    // pick the largest absolute change
    biggestChange = deltas.reduce((best, current) => {
      if (!best) return current;
      return Math.abs(current.delta) > Math.abs(best.delta) ? current : best;
    }, null);
  }

  return { averages, strongest, softest, biggestChange };
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

function StatCard({ title, value, description }) {
  return (
    <section
      style={{
        padding: "1rem",
        borderRadius: "1rem",
        background: "rgba(255,255,255,0.05)",
        minWidth: 0,
      }}
    >
      <h3 style={{ fontSize: "0.85rem", margin: "0 0 0.4rem" }}>{title}</h3>
      <div style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: "0.15rem" }}>
        {value?.toFixed(1) ?? "—"}
        <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>/10</span>
      </div>
      <p style={{ fontSize: "0.8rem", opacity: 0.7, margin: 0 }}>{description}</p>
    </section>
  );
}

export default function Insights() {
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState({
    averages: null,
    strongest: null,
    softest: null,
    biggestChange: null,
  });

  useEffect(() => {
    const loaded = loadEntries();
    setEntries(loaded);
    setStats(computeStats(loaded));
  }, []);

  const { averages, strongest, softest, biggestChange } = stats;

  const hasData = entries.length > 0;
  const latest = hasData ? entries[entries.length - 1] : null;

  const recent = hasData ? [...entries].slice(-7).reverse() : [];

  return (
    <div style={{ padding: "1.5rem 1rem", maxWidth: "950px", margin: "0 auto" }}>
      {/* Header */}
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.4rem", marginBottom: "0.35rem" }}>Insights</h1>
        <p style={{ fontSize: "0.9rem", opacity: 0.75, maxWidth: "520px" }}>
          See how your check-ins are adding up over time. These insights are here
          to help you notice patterns, not judge your scores.
        </p>
      </header>

      {/* Average cards */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "0.9rem",
          marginBottom: "1.5rem",
        }}
      >
        <StatCard
          title="Emotional (avg)"
          value={averages?.emotional}
          description="How your inner world has felt on average."
        />
        <StatCard
          title="Physical (avg)"
          value={averages?.physical}
          description="Your average sense of energy and body wellbeing."
        />
        <StatCard
          title="Spiritual (avg)"
          value={averages?.spiritual}
          description="Your average feeling of meaning and connection."
        />
        <StatCard
          title="Financial (avg)"
          value={averages?.financial}
          description="How steady money and obligations have felt."
        />
      </section>

      {/* Narrative summary */}
      <section
        style={{
          marginBottom: "1.5rem",
          padding: "1.15rem",
          borderRadius: "1rem",
          background: "rgba(255,255,255,0.05)",
          fontSize: "0.9rem",
        }}
      >
        {!hasData && (
          <p style={{ margin: 0, opacity: 0.8 }}>
            Once you’ve done a few Daily Check-Ins, this page will highlight
            which areas feel strongest, which might need extra care, and how your
            last check-in compares to the one before it.
          </p>
        )}

        {hasData && (
          <>
            <p style={{ marginTop: 0, marginBottom: "0.6rem", opacity: 0.9 }}>
              Based on your check-ins so far, your{" "}
              <strong>strongest pillar</strong> has been{" "}
              <strong>{strongest?.label}</strong>{" "}
              ({strongest?.value.toFixed(1)}/10), while the area that may need the
              most care is <strong>{softest?.label}</strong>{" "}
              ({softest?.value.toFixed(1)}/10).
            </p>

            {biggestChange && Math.abs(biggestChange.delta) >= 0.3 && (
              <p style={{ margin: 0, opacity: 0.85 }}>
                Since your last check-in on{" "}
                <strong>{formatDate(latest?.timestamp)}</strong>, the biggest
                shift has been in your{" "}
                <strong>{biggestChange.label}</strong> pillar, which is{" "}
                {biggestChange.delta > 0 ? "up" : "down"} by{" "}
                {Math.abs(biggestChange.delta).toFixed(1)} points. That might be
                a helpful place to pause and reflect.
              </p>
            )}

            {biggestChange && Math.abs(biggestChange.delta) < 0.3 && (
              <p style={{ margin: 0, opacity: 0.85 }}>
                Your most recent check-in on{" "}
                <strong>{formatDate(latest?.timestamp)}</strong> is fairly close
                to the previous one across all pillars. That consistency can be a
                sign of a stable phase — keep checking in to notice the smaller
                shifts.
              </p>
            )}
          </>
        )}
      </section>

      {/* Recent check-ins (compact) */}
      <section>
        <h2
          style={{
            fontSize: "1rem",
            marginBottom: "0.75rem",
            opacity: 0.9,
          }}
        >
          Recent check-ins
        </h2>

        {!hasData && (
          <p style={{ fontSize: "0.85rem", opacity: 0.75 }}>
            You haven’t logged any check-ins yet. Start with a Daily Check-In and
            this section will show a simple history of how things have been
            feeling over time.
          </p>
        )}

        {hasData && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {recent.map((entry, idx) => {
              const p = entry.pillars || {};
              return (
                <div
                  key={entry.timestamp ?? idx}
                  style={{
                    padding: "0.9rem 1rem",
                    borderRadius: "0.9rem",
                    background: "rgba(255,255,255,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.35rem",
                    fontSize: "0.8rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: "0.75rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>
                      {formatDate(entry.timestamp) || "Unknown date"}
                    </div>
                    <div style={{ opacity: 0.8 }}>
                      Wellness Index:{" "}
                      <strong>{Number(entry.wellnessIndex ?? 0).toFixed(1)}/10</strong>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.75rem",
                      opacity: 0.8,
                    }}
                  >
                    <span>Emotional {Number(p.emotional ?? 0).toFixed(1)}/10</span>
                    <span>Physical {Number(p.physical ?? 0).toFixed(1)}/10</span>
                    <span>Spiritual {Number(p.spiritual ?? 0).toFixed(1)}/10</span>
                    <span>Financial {Number(p.financial ?? 0).toFixed(1)}/10</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer trademark */}
      <div
        style={{
          textAlign: "center",
          marginTop: "2.5rem",
          opacity: 0.6,
          fontSize: "0.75rem",
        }}
      >
        Resonifi Wellness Inc.™
      </div>
    </div>
  );
}
