// src/pages/Landing.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/resonifi-logo.png";

export default function Landing() {
  const navigate = useNavigate();

  const page = {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, #0b1120, #020617 55%, #020617 100%)",
    padding: "32px 20px 48px",
    color: "#f1f5f9",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxSizing: "border-box",
  };

  const frame = {
    width: "100%",
    maxWidth: "1040px",
  };

  const topRow = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
  };

  const logoImg = {
    height: "54px",
  };

  const pill = {
    fontSize: "11px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    padding: "8px 14px",
    borderRadius: "999px",
    border: "1px solid rgba(148,163,184,0.45)",
    background: "rgba(15,23,42,0.9)",
    color: "#cbd5e1",
    whiteSpace: "nowrap",
  };

  const mainRow = {
    marginTop: "48px",
    display: "flex",
    gap: "28px",
    alignItems: "stretch",
  };

  const heroCol = {
    flex: 1.2,
    minWidth: 0,
  };

  const cardCol = {
    flex: 1,
    minWidth: 0,
  };

  const tag = {
    fontSize: "11px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#9ca3af",
  };

  const h1 = {
    marginTop: "10px",
    fontSize: "32px",
    lineHeight: 1.2,
    fontWeight: 700,
  };

  const body = {
    marginTop: "14px",
    fontSize: "15px",
    color: "#cbd5e1",
    maxWidth: "32rem",
  };

  const buttons = {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "24px",
  };

  const primaryBtn = {
    padding: "13px 22px",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #22d3ee, #6366f1)",
    border: "none",
    color: "#0b1120",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
  };

  const secondaryBtn = {
    padding: "13px 22px",
    borderRadius: "999px",
    background: "rgba(15,23,42,0.9)",
    border: "1px solid rgba(148,163,184,0.6)",
    color: "#e5e7eb",
    fontWeight: 500,
    fontSize: "14px",
    cursor: "pointer",
  };

  const founderLine = {
    marginTop: "18px",
    fontSize: "12px",
    color: "#9ca3af",
    maxWidth: "34rem",
  };

  const card = {
    borderRadius: "20px",
    border: "1px solid rgba(148,163,184,0.45)",
    background:
      "linear-gradient(145deg, rgba(15,23,42,0.96), rgba(15,23,42,0.88))",
    padding: "18px 20px 20px",
    boxShadow: "0 24px 70px rgba(15,23,42,0.9)",
  };

  const cardLabel = {
    fontSize: "11px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#9ca3af",
    marginBottom: "4px",
  };

  const cardTitle = {
    fontSize: "18px",
    fontWeight: 600,
    marginBottom: "10px",
  };

  const cardBody = {
    fontSize: "13px",
    color: "#cbd5e1",
  };

  const ringRow = {
    marginTop: "18px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  };

  const ringOuter = {
    width: "90px",
    height: "90px",
    borderRadius: "999px",
    background:
      "conic-gradient(#22d3ee, #6366f1, #22c55e, #22d3ee)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 30px rgba(59,130,246,0.6)",
  };

  const ringInner = {
    width: "60px",
    height: "60px",
    borderRadius: "999px",
    backgroundColor: "#020617",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(148,163,184,0.7)",
    fontSize: "22px",
    fontWeight: 600,
  };

  const ringCaptionTop = {
    fontSize: "11px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#9ca3af",
  };

  const ringCaptionBottom = {
    fontSize: "11px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#e5e7eb",
    marginTop: "4px",
  };

  const pillarList = {
    marginTop: "10px",
    fontSize: "12px",
    color: "#e5e7eb",
    lineHeight: 1.5,
  };

  const footer = {
    marginTop: "40px",
    fontSize: "11px",
    color: "#64748b",
    textAlign: "center",
  };

  return (
    <div style={page}>
      <div style={frame}>
        {/* Top row: logo + badge */}
        <div style={topRow}>
          <img src={logo} alt="Resonifi logo" style={logoImg} />

          <div style={pill}>Early access · Personal wellness OS</div>
        </div>

        {/* Main row: hero + right card */}
        <div style={mainRow}>
          {/* HERO LEFT */}
          <div style={heroCol}>
            <p style={tag}>FOR PEOPLE WHO FEEL MORE THAN THEY TRACK</p>

            <h1 style={h1}>
              Track how life actually feels, not just steps and sleep.
            </h1>

            <p style={body}>
              Resonifi is a simple daily check-in that turns your mood, energy,
              meaning, money, and digital life into one Wellness Index™ you can
              feel at a glance.
            </p>

            <div style={buttons}>
              <button
                type="button"
                style={primaryBtn}
                onClick={() => navigate("/app")}
              >
                Open the app
              </button>

              <button
                type="button"
                style={secondaryBtn}
                onClick={() => navigate("/insights")}
              >
                See how it works
              </button>
            </div>

            <p style={founderLine}>
              Built by a teacher who walked the Camino and wanted a calmer way
              to look at life than another productivity dashboard. No
              gamification, no streak shame — just honest check-ins that add up
              over time.
            </p>
          </div>

          {/* RIGHT CARD */}
          <div style={cardCol}>
            <div style={card}>
              <p style={cardLabel}>At a glance</p>
              <h2 style={cardTitle}>What is the Wellness Index?</h2>

              <p style={cardBody}>
                Every day you slide five pillars from 1 to 10. Resonifi blends
                them into a single score so you can feel how things are trending
                without getting lost in charts.
              </p>

              <div style={ringRow}>
                <div style={ringOuter}>
                  <div style={ringInner}>72</div>
                </div>

                <div>
                  <p style={ringCaptionTop}>Today&#39;s snapshot</p>
                  <p style={ringCaptionBottom}>Wellness Index™</p>
                </div>
              </div>

              <p style={pillarList}>
                <strong>Emotional</strong> — mood, stress, resilience, your inner
                world
                <br />
                <strong>Physical</strong> — energy, rest, how your body feels
                <br />
                <strong>Spiritual</strong> — meaning, purpose, “bigger than me”
                <br />
                <strong>Financial</strong> — stability, control, confidence
                <br />
                <strong>Digital</strong> — screen time, noise, and tech balance
              </p>
            </div>
          </div>
        </div>

        <p style={footer}>© 2025 Resonifi. All rights reserved.</p>
        </div>
    </div>
  );
}
