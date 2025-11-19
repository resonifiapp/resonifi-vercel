// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CARD_GRADIENTS = {
  emotional: "linear-gradient(180deg, #8B5CF6, #3B82F6)",
  physical: "linear-gradient(180deg, #3B82F6, #22D3EE)",
  spiritual: "linear-gradient(180deg, #22D3EE, #A78BFA)",
  financial: "linear-gradient(180deg, #FCD34D, #4ADE80)",
};

const HISTORY_KEY = "resonifi_checkins_v1";

// ---- PillarCard component ----
function PillarCard({ title, description, value, gradient }) {
  const clamped = Math.max(0, Math.min(10, Number(value) || 0));
  const heightPercent = (clamped / 10) * 100;

  const card = {
    flex: 1,
    minWidth: "240px",
    padding: "16px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
    color: "#f9fafb",
    margin: "10px",
    backdropFilter: "blur(16px)",
  };

  const tubeWrapper = {
    width: 40,
    height: 150, // taller pillars
    borderRadius: "40px",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    overflow: "hidden",
    marginTop: "8px",
    marginBottom: "6px",
    marginLeft: "auto",
    marginRight: "auto",
    display: "flex",
    alignItems: "flex-end",
  };

  const tubeFill = {
    width: "100%",
    height: `${heightPercent}%`,
    background: gradient,
    transition: "height 0.4s ease, box-shadow 0.4s ease",
    borderRadius: "40px",
    boxShadow:
      "0 0 24px rgba(56,189,248,0.9), 0 0 60px rgba(56,189,248,0.55)",
  };

  const header = { fontSize: "15px", fontWeight: 600 };
  const desc = {
    fontSize: "13px",
    opacity: 0.75,
    lineHeight: "1.45",
    marginTop: "4px",
  };

  return (
    <div style={card}>
      <p style={header}>{title}</p>
      <p style={desc}>{description}</p>

      <div style={tubeWrapper}>
        <div style={tubeFill} />
      </div>
    </div>
  );
}

// ---- Main Home Page ----
export default function Home() {
  const navigate = useNavigate();
  const [latest, setLatest] = useState(null);
  const [indexValue, setIndexValue] = useState(70);

  useEffect(() => {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return;

    try {
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr) || arr.length === 0) return;

      // Make sure we really get the newest one by timestamp
      const sorted = [...arr].sort((a, b) => {
        const ta = new Date(a.timestamp || 0).getTime();
        const tb = new Date(b.timestamp || 0).getTime();
        return tb - ta; // newest first
      });

      const newest = sorted[0];
      setLatest(newest);

      const e = Number(newest.emotional ?? 0);
      const p = Number(newest.physical ?? 0);
      const s = Number(newest.spiritual ?? 0);
      const f = Number(newest.financial ?? 0);

      // clamp 0–10
      const clamp = (x) => Math.max(0, Math.min(10, x || 0));
      const avg = (clamp(e) + clamp(p) + clamp(s) + clamp(f)) / 4;

      // use stored index if it exists, otherwise compute from pillars
      const storedIndex =
        newest.index !== undefined && newest.index !== null
          ? Number(newest.index)
          : null;

      const computedIndex = Math.round(avg * 10); // 0–100
      const finalIndex =
        storedIndex !== null && !Number.isNaN(storedIndex)
          ? storedIndex
          : computedIndex;

      setIndexValue(Math.max(0, Math.min(100, finalIndex)));
    } catch {
      // ignore parse errors
    }
  }, []);

  const container = {
    padding: "24px",
    color: "#f9fafb",
    paddingBottom: "90px",
  };

  const sectionTitle = {
    fontSize: "18px",
    fontWeight: 600,
    marginBottom: "12px",
    opacity: 0.9,
  };

  const introBox = {
    background: "rgba(255,255,255,0.03)",
    padding: "24px",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.08)",
    marginBottom: "28px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
  };

  const indexCircleWrapper = {
    position: "relative",
    width: 120,
    height: 120,
    marginLeft: "auto",
  };

  const indexCircle = {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    background: "conic-gradient(#3B82F6, #06B6D4, #10B981)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 600,
    fontSize: "18px",
    boxShadow: "0 0 30px rgba(56,189,248,0.35)",
  };

  const indexText = {
    position: "absolute",
    inset: 0,
    margin: "auto",
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    backgroundColor: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#e2e8f0",
    fontSize: "15px",
    fontWeight: 600,
    border: "1px solid rgba(255,255,255,0.06)",
  };

  const navButtons = {
    display: "flex",
    gap: "12px",
    marginTop: "12px",
  };

  const navButton = {
    padding: "8px 16px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#f9fafb",
    cursor: "pointer",
    fontSize: "14px",
  };

  return (
    <div style={container}>
      <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "16px" }}>
        Welcome back
      </h2>

      {/* Wellness Index Card */}
      <div style={introBox}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <p style={{ opacity: 0.8, fontSize: "13px", marginBottom: "4px" }}>
              WELLNESS INDEX
            </p>

            <p style={{ fontSize: "20px", fontWeight: 600, marginBottom: 4 }}>
              Today
            </p>

            <p style={{ opacity: 0.7, fontSize: "14px", maxWidth: "260px" }}>
              Each check-in updates your Wellness Index and your four pillars.
            </p>

            <div style={navButtons}>
              <button style={navButton} onClick={() => navigate("/check-in")}>
                Check-In
              </button>
              <button style={navButton} onClick={() => navigate("/journal")}>
                Journal
              </button>
              <button
                style={navButton}
                onClick={() => navigate("/cycle-tracking")}
              >
                Cycle
              </button>
            </div>
          </div>

          <div style={indexCircleWrapper}>
            <div style={indexCircle}></div>
            <div style={indexText}>{`${indexValue}%`}</div>
          </div>
        </div>
      </div>

      {/* Pillars Section */}
      <p style={sectionTitle}>Today&apos;s pillars</p>

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <PillarCard
          title="Emotional"
          description="Mood, stress, resilience, and how your inner world feels today."
          value={latest?.emotional ?? 0}
          gradient={CARD_GRADIENTS.emotional}
        />

        <PillarCard
          title="Physical"
          description="Energy, movement, rest, and how your body feels overall."
          value={latest?.physical ?? 0}
          gradient={CARD_GRADIENTS.physical}
        />

        <PillarCard
          title="Spiritual"
          description="Connection, meaning, and whatever 'bigger than me' looks like to you."
          value={latest?.spiritual ?? 0}
          gradient={CARD_GRADIENTS.spiritual}
        />

        <PillarCard
          title="Financial"
          description="Stability, control, and confidence with money and obligations."
          value={latest?.financial ?? 0}
          gradient={CARD_GRADIENTS.financial}
        />
      </div>
    </div>
  );
}
