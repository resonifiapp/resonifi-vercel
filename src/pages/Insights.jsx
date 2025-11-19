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

  let biggestChange = null;
  if (entries.length >= 2) {
    const last = entries[entries.length - 1];
    const prev = entries[entries.length - 2];

    const deltas = pillarList.map((p) => {
      const lastVal = Number(last.pillars?.[p.key] ?? 0);
      const prevVal = Number(prev.pillars?.[p.key] ?? 0);
      return { ...p, delta: lastVal - prevVal };
    });

    biggestChange = deltas.reduce((best, current) => {
      if (!best) return current;
      return Math.abs(current.delta) > Math.abs(best.delta) ? current : best;
    }, null);
  }

  return { averages, strongest, softest, biggestChange };
}

function computeAchievements(entries) {
  const count = entries.length;
  if (!count) {
    return [
      {
        id: "first",
        title: "First check-in",
        description: "Log your very first Daily Check-In.",
        earned: false,
        icon: "🌱",
      },
      {
        id: "five",
        title: "Five check-ins",
        description: "Show up for five separate days.",
        earned: false,
        icon: "🖐️",
      },
      {
        id: "ten",
        title: "Ten check-ins",
        description: "Keep going for ten days.",
        earned: false,
        icon: "🔟",
      },
      {
        id: "streak3",
        title: "3-day streak",
        description: "Check in three days in a row.",
        earned: false,
        icon: "🔥",
      },
      {
        id: "streak7",
        title: "7-day streak",
        description: "Stay with it for a full week.",
        earned: false,
        icon: "💫",
      },
    ];
  }

  // build a set of YYYY-MM-DD strings
  const dates = entries.map((e) => {
    const d = new Date(e.timestamp);
    return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }).filter(Boolean);

  const dateSet = new Set(dates);
  const latestDateStr = dates[dates.length - 1];
  const latestDate = latestDateStr ? new Date(latestDateStr + "T00:00:00") : null;

  let currentStreak = 0;
  if (latestDate) {
    let cursor = new Date(latestDate);
    while (true) {
      const key = cursor.toISOString().slice(0, 10);
      if (dateSet.has(key)) {
        currentStreak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return [
    {
      id: "first",
      title: "First check-in",
      description: "Log your very first Daily Check-In.",
      earned: count >= 1,
      icon: "🌱",
    },
    {
      id: "five",
      title: "Five check-ins",
      description: "Show up for five separate days.",
      earned: count >= 5,
      icon: "🖐️",
    },
    {
      id: "ten",
      title: "Ten check-ins",
      description: "Keep going for ten days.",
      earned: count >= 10,
      icon: "🔟",
    },
    {
      id: "streak3",
      title: "3-day streak",
      description: "Check in three days in a row.",
      earned: currentStreak >= 3,
      icon: "🔥",
    },
    {
      id: "streak7",
      title: "7-day streak",
      description: "Stay with it for a full week.",
      earned: currentStreak >= 7,
      icon: "💫",
    },
  ];
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

function formatNumber(value) {
  if (value == null || Number.isNaN(value)) return 0;
  return Number(value.toFixed(1));
}

function StatCard({ title, value, description }) {
  const v = value != null ? formatNumber(value) : null;
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
        {v !== null ? v.toFixed(1) : "—"}
        <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>/10</span>
      </div>
      <p style={{ fontSize: "0.8rem", opacity: 0.7, margin: 0 }}>{description}</p>
    </section>
  );
}

function AchievementBadge({ achievement }) {
  const { title, description, earned, icon } = achievement;
  return (
    <div
      style={{
        padding: "0.5rem 0.7rem",
        borderRadius: "0.9rem",
        border: earned
          ? "1px solid rgba(144, 238, 144, 0.9)"
          : "1px solid rgba(160, 160, 200, 0.5)",
        background: earned
          ? "linear-gradient(135deg, rgba(144, 238, 144, 0.25), rgba(40, 120, 80, 0.5))"
          : "rgba(255,255,255,0.03)",
        opacity: earned ? 1 : 0.6,
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        fontSize: "0.8rem",
      }}
    >
      <span style={{ fontSize: "1.2rem" }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 600, marginBottom: "0.1rem" }}>{title}</div>
        <div style={{ opacity: 0.8 }}>{description}</div>
        {!earned && (
          <div style={{ opacity: 0.7, marginTop: "0.1rem", fontSize: "0.75rem" }}>
            Not yet unlocked
          </div>
        )}
      </div>
    </div>
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
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    const loaded = loadEntries();
    setEntries(loaded);
    setStats(computeStats(loaded));
    setAchievements(computeAchievements(loaded));
  }, []);

  const { averages, strongest, softest, biggestChange } = stats;

  const hasData = entries.length > 0;
  const latest = hasData ? entries[entries.length - 1] : null;
  const recent = hasData ? [...entries].slice(-7).reverse() : [];

  return (
    <div style={{ padding: "1.5rem 1rem", maxWidth: "950px", margin: "0 auto" }}>
      {/* Header */}
      <header style={{ marginBottom: "1.4rem" }}>
        <h1 style={{ fontSize: "1.4rem", marginBottom: "0.35rem" }}>Insights</h1>
        <p style={{ fontSize: "0.9rem", opacity: 0.75, maxWidth: "520px" }}>
          See how your check-ins are adding up over time. These insights and
          awards are here to help you notice patterns, not judge your scores.
        </p>
      </header>

      {/* Awards & milestones */}
      <section
        style={{
          marginBottom: "1.5rem",
          padding: "1rem 1.1rem",
          borderRadius: "1rem",
          background:
            "radial-gradient(circle at top left, rgba(120,180,255,0.2), rgba(10,10,20,0.95))",
          border: "1px solid rgba(120, 140, 230, 0.7)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.65)",
        }}
      >
        <h2
          style={{
            fontSize: "0.95rem",
            margin: 0,
            marginBottom: "0.6rem",
            fontWeight: 600,
          }}
        >
          Awards & milestones
        </h2>

        {!hasData && (
          <p style={{ fontSize: "0.8rem", opacity: 0.8, margin: 0 }}>
            As you keep checking in, you’ll start unlocking gentle milestones for
            showing up — first check-in, streaks, and more. There are no penalties
            here, just quiet encouragement.
          </p>
        )}

        {hasData && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "0.6rem",
            }}
          >
            {achievements.map((a) => (
              <AchievementBadge key={a.id} achievement={a} />
            ))}
          </div>
        )}
      </section>

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
              ({formatNumber(strongest?.value)}/10), while the area that may need
              the most care is <strong>{softest?.label}</strong>{" "}
              ({formatNumber(softest?.value)}/10).
            </p>

            {biggestChange && Math.abs(biggestChange.delta) >= 0.3 && (
              <p style={{ margin: 0, opacity: 0.85 }}>
                Since your last check-in on{" "}
                <strong>{formatDate(latest?.timestamp)}</strong>, the biggest
                shift has been in your{" "}
                <strong>{biggestChange.label}</strong> pillar, which is{" "}
                {biggestChange.delta > 0 ? "up" : "down"} by{" "}
                {formatNumber(Math.abs(biggestChange.delta))} points. That might
                be a helpful place to pause and reflect.
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

      {/* Recent check-ins */}
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
                      <strong>
                        {formatNumber(Number(entry.wellnessIndex ?? 0))}/10
                      </strong>
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
                    <span>
                      Emotional {formatNumber(Number(p.emotional ?? 0))}/10
                    </span>
                    <span>
                      Physical {formatNumber(Number(p.physical ?? 0))}/10
                    </span>
                    <span>
                      Spiritual {formatNumber(Number(p.spiritual ?? 0))}/10
                    </span>
                    <span>
                      Financial {formatNumber(Number(p.financial ?? 0))}/10
                    </span>
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
