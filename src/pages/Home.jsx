// src/pages/Home.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HISTORY_KEY = "resonifi_checkins_v1";
const NAME_KEY = "resonifi_user_name";

// Align with Account / CycleTracking keys
const CYCLE_ENABLED_KEY = "resonifi_cycle_enabled_v1";
const CYCLE_NEXT_KEY = "resonifi_cycle_nextExpected";

const PILLARS = [
  { id: "emotional", label: "Emotional" },
  { id: "physical", label: "Physical" },
  { id: "spiritual", label: "Spiritual" },
  { id: "financial", label: "Financial" },
  { id: "digital", label: "Digital" },
];

export default function Home() {
  const navigate = useNavigate();

  const [latest, setLatest] = useState(null);
  const [indexValue, setIndexValue] = useState(null);
  const [userName, setUserName] = useState("");

  const [showCycleCard, setShowCycleCard] = useState(false);
  const [nextPeriod, setNextPeriod] = useState("");

  // Plausible: app home opened
  useEffect(() => {
    if (window?.plausible) window.plausible("App Opened");
  }, []);

  // Load latest check-in & compute index
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return;

      const arr = JSON.parse(raw);
      if (!Array.isArray(arr) || arr.length === 0) return;

      arr.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      const newest = arr[0];
      setLatest(newest);

      const storedIndex = Number(newest.index);
      if (Number.isFinite(storedIndex)) {
        setIndexValue(Math.max(0, Math.min(100, storedIndex)));
        return;
      }

      const keys = ["emotional", "physical", "spiritual", "financial", "digital"];
      let sum = 0;
      let count = 0;

      keys.forEach((key) => {
        const num = Number(newest[key]);
        if (Number.isFinite(num)) {
          sum += num;
          count++;
        }
      });

      if (count > 0) setIndexValue(Math.round((sum / count) * 10));
    } catch (err) {
      console.error("Home check-in load error:", err);
    }
  }, []);

  // Load stored name
  useEffect(() => {
    try {
      const stored = localStorage.getItem(NAME_KEY);
      if (stored) setUserName(stored);
    } catch {}
  }, []);

  // Load cycle card toggle + next period label
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CYCLE_ENABLED_KEY);
      const enabled = raw === "true";
      if (enabled) {
        setShowCycleCard(true);
        const next = localStorage.getItem(CYCLE_NEXT_KEY);
        if (next) setNextPeriod(next);
      } else {
        setShowCycleCard(false);
      }
    } catch {}
  }, []);

  // ---------------- Styles ----------------

  const container = {
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
    marginBottom: "24px",
  };

  const ballWrapper = {
    display: "flex",
    justifyContent: "center",
    marginBottom: "8px",
  };

  const ballOuter = {
    width: 160,
    height: 160,
    borderRadius: "50%",
    background: "conic-gradient(#22d3ee, #6366f1, #22c55e, #22d3ee)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow:
      "0 0 40px rgba(56,189,248,0.7), 0 0 90px rgba(79,70,229,0.7)",
  };

  const ballInner = {
    width: 112,
    height: 112,
    borderRadius: "50%",
    backgroundColor: "#020617",
    border: "1px solid rgba(148,163,184,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const ballNumber = {
    fontSize: "32px",
    fontWeight: 600,
  };

  const ballLabelOutside = {
    textAlign: "center",
    fontSize: "11px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#cbd5e1",
    marginTop: "8px",
  };

  const pillarsHint = {
    textAlign: "center",
    fontSize: "11px",
    color: "#9ca3af",
    marginTop: "4px",
    marginBottom: "18px",
  };

  const pillarsRow = {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "32px",
  };

  const tubeWrapper = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: 40,
  };

  const tubeShell = {
    width: 24,
    height: 110,
    borderRadius: 9999,
    background: "rgba(15,23,42,0.95)",
    border: "1px solid rgba(148,163,184,0.6)",
    overflow: "hidden",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    boxShadow: "0 0 18px rgba(15,23,42,1)",
  };

  const tubeLabel = {
    marginTop: "8px",
    fontSize: "11px",
    color: "#cbd5e1",
    transition: "border-color 0.2s ease",
    borderBottom: "1px solid transparent",
    paddingBottom: "2px",
  };

  const bottomButtonWrapper = {
    marginTop: "auto",
    marginBottom: "20px",
  };

  const bottomButton = {
    width: "100%",
    padding: "14px 18px",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 600,
    background: "linear-gradient(90deg, #22d3ee, #6366f1)",
    color: "#f9fafb",
    boxShadow: "0 16px 40px rgba(37,99,235,0.7)",
  };

  // ---------------- Helpers ----------------

  function getPillarValue(id) {
    if (!latest) return 0;
    const num = Number(latest[id]);
    return Number.isFinite(num) ? Math.max(0, Math.min(10, num)) : 0;
  }

  function getPillarGradient(id) {
    switch (id) {
      case "emotional":
        return "linear-gradient(180deg, #a855f7, #3b82f6)";
      case "physical":
        return "linear-gradient(180deg, #3b82f6, #22d3ee)";
      case "spiritual":
        return "linear-gradient(180deg, #22d3ee, #8b5cf6)";
      case "financial":
        return "linear-gradient(180deg, #facc15, #22c55e)";
      case "digital":
      default:
        return "linear-gradient(180deg, #38bdf8, #6366f1)";
    }
  }

  // ---------------- Render ----------------

  return (
    <div style={container}>
      <header>
        <h1 style={headerTitle}>
          How do you feel today, {userName || "there"}?
        </h1>
        <p style={headerSubtitle}>
          Your Wellness Index updates every time you check in. The more days you
          track, the clearer your patterns become.
        </p>
      </header>

      {/* Wellness Index */}
      <div style={ballWrapper}>
        <div style={ballOuter}>
          <div style={ballInner}>
            <div style={ballNumber}>{indexValue ?? "—"}</div>
          </div>
        </div>
      </div>

      <div style={ballLabelOutside}>WELLNESS INDEX™</div>
      <p style={pillarsHint}>Tap a pillar to see its details</p>

      {/* Pillars */}
      <section style={pillarsRow}>
        {PILLARS.map((pillar) => {
          const val = getPillarValue(pillar.id);
          const heightPercent = (val / 10) * 100;

          return (
            <button
              key={pillar.id}
              type="button"
              onClick={() => navigate(`/pillar/${pillar.id}`)}
              style={{
                ...tubeWrapper,
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.06)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <div style={tubeShell}>
                <div
                  style={{
                    width: "100%",
                    height: `${heightPercent}%`,
                    background: getPillarGradient(pillar.id),
                    borderRadius: 9999,
                    transition: "height 0.3s ease-out",
                  }}
                />
              </div>

              <span
                style={tubeLabel}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "#94a3b8")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "transparent")
                }
              >
                {pillar.label} ›
              </span>
            </button>
          );
        })}
      </section>

      {/* Start check-in button */}
      <div style={bottomButtonWrapper}>
        <button
          type="button"
          style={bottomButton}
          onClick={() => navigate("/check-in")}
        >
          Start today&apos;s check-in
        </button>
      </div>

      {/* Cycle tracking card – below main CTA */}
      {showCycleCard && (
        <section
          style={{
            marginBottom: "24px",
            borderRadius: "16px",
            border: "1px solid rgba(248,113,166,0.45)",
            background:
              "linear-gradient(135deg, rgba(30,64,175,0.95), rgba(76,29,149,0.98))",
            padding: "14px 16px",
            boxShadow: "0 18px 50px rgba(15,23,42,0.9)",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#f9a8d4",
              marginBottom: "4px",
            }}
          >
            Cycle tracking
          </p>

          <p
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              marginBottom: "4px",
            }}
          >
            {nextPeriod
              ? `Next expected period: ${nextPeriod}`
              : "Add your cycle details to see your next expected period here."}
          </p>

          <p
            style={{
              fontSize: "0.8rem",
              opacity: 0.8,
              marginBottom: "10px",
            }}
          >
            Your data is safe here. Resonifi keeps all cycle details on this
            device only. Use this as a gentle planning signal, not a diagnosis.
          </p>

          <button
            onClick={() => navigate("/cycle-tracking")}
            style={{
              padding: "10px 16px",
              borderRadius: "999px",
              border: "none",
              background:
                "linear-gradient(135deg, rgba(244,114,182,1), rgba(129,140,248,1))",
              color: "#020617",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              boxShadow: "0 14px 36px rgba(236,72,153,0.45)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {nextPeriod
              ? `View cycle details · Next: ${nextPeriod}`
              : "Set up cycle tracking"}
          </button>
        </section>
      )}
    </div>
  );
}
