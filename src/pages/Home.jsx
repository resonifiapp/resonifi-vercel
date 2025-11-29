// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HISTORY_KEY = "resonifi_checkins_v1";
const NAME_KEY = "resonifi_user_name";

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

  // Load latest check-in and index
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(HISTORY_KEY);
      if (!raw) return;

      const arr = JSON.parse(raw);
      if (!Array.isArray(arr) || arr.length === 0) return;

      // newest first
      const sorted = [...arr].sort((a, b) => {
        const ta = new Date(a.timestamp || 0).getTime();
        const tb = new Date(b.timestamp || 0).getTime();
        return tb - ta;
      });

      const newest = sorted[0];
      setLatest(newest);

      // Prefer stored index (0–100)
      const stored = Number(newest.index);
      if (Number.isFinite(stored)) {
        const clamped = Math.max(0, Math.min(100, stored));
        setIndexValue(clamped);
        return;
      }

      // Fallback: compute from pillars 1–10 → 0–100
      const keys = ["emotional", "physical", "spiritual", "financial", "digital"];
      let sum = 0;
      let count = 0;

      keys.forEach((key) => {
        const num = Number(newest[key]);
        if (Number.isFinite(num)) {
          sum += num;
          count += 1;
        }
      });

      if (count > 0) {
        const avg = sum / count; // 1–10
        const percent = Math.round(avg * 10); // 0–100
        setIndexValue(percent);
      }
    } catch (err) {
      console.error("Error loading latest check-in for Home:", err);
    }
  }, []);

  // Load stored name from Account page
  useEffect(() => {
    try {
      const storedName = window.localStorage.getItem(NAME_KEY);
      if (storedName) {
        setUserName(storedName);
      }
    } catch {
      // ignore
    }
  }, []);

  // --- Styles ---
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
    position: "relative",
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
    color: "#f9fafb",
    lineHeight: 1,
  };

  const ballLabelOutside = {
    textAlign: "center",
    fontSize: "11px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#cbd5e1",
    marginTop: "8px",
    marginBottom: "24px",
  };

  const pillarsRow = {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    marginTop: "4px",
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
  };

  const bottomButtonWrapper = {
    marginTop: "auto",
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

  function getPillarValue(id) {
    if (!latest) return null;
    const num = Number(latest[id]);
    if (!Number.isFinite(num)) return null;
    return Math.max(0, Math.min(10, num));
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

  return (
    <div style={container}>
      <header>
        <h1 style={headerTitle}>Home</h1>
        <p style={headerSubtitle}>
          How do you feel today, {userName || "there"}?
        </p>
      </header>

      {/* Wellness Index ball */}
      <div style={ballWrapper}>
        <div style={ballOuter}>
          <div style={ballInner}>
            <div style={ballNumber}>
              {indexValue !== null ? indexValue : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Label outside the circle */}
      <div style={ballLabelOutside}>WELLNESS INDEX™</div>

      {/* Pillars */}
      <section style={pillarsRow}>
        {PILLARS.map((pillar) => {
          const val = getPillarValue(pillar.id);
          const heightPercent = val ? (val / 10) * 100 : 0;

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
              }}
            >
              <div style={tubeShell}>
                <div
                  style={{
                    width: "100%",
                    height: `${heightPercent}%`,
                    borderRadius: 9999,
                    background: getPillarGradient(pillar.id),
                    transition: "height 0.3s ease-out",
                  }}
                />
              </div>
              <span style={tubeLabel}>{pillar.label}</span>
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
    </div>
  );
}
