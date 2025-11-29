// src/pages/Landing.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/resonifi-logo.png";

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < breakpoint);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}

export default function Landing() {
  const navigate = useNavigate();
  const isMobile = useIsMobile(768);

  const page = {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, #0b1120, #020617 55%, #020617 100%)",
    padding: isMobile ? "24px 16px 40px" : "32px 20px 48px",
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
    margin: "0 auto",
  };

  // HEADER: logo + Early Access badge grouped together
  const topRow = {
    display: "flex",
    justifyContent: "flex-start",          // group on the left
    alignItems: "center",
    gap: isMobile ? "16px" : "20px",       // space *between* logo and badge
    flexDirection: "row",
    width: "100%",
    padding: isMobile ? "0 8px" : "0 4px",
    boxSizing: "border-box",
  };

  const logoImg = {
    height: isMobile ? "150px" : "200px",
    width: "auto",
    objectFit: "contain",
  };

  // Badge: stacked box on mobile, pill on desktop
  const pill = {
    fontSize: isMobile ? "10px" : "11px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    padding: isMobile ? "10px 12px" : "8px 14px",
    borderRadius: isMobile ? "12px" : "999px",
    border: "1px solid rgba(148,163,184,0.45)",
    background: "rgba(15,23,42,0.9)",
    color: "#cbd5e1",
    whiteSpace: isMobile ? "normal" : "nowrap",
    lineHeight: isMobile ? 1.35 : 1,
    textAlign: isMobile ? "center" : "left",
    width: isMobile ? "120px" : "auto",
    flexShrink: 0,
  };

  const mainRow = {
    marginTop: isMobile ? "32px" : "48px",
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    gap: isMobile ? "32px" : "28px",
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
    fontSize: isMobile ? "28px" : "32px",
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
    marginTop: "24px",
    fontSize: "12px",
    color: "#9ca3af",
    maxWidth: "36rem",
    textAlign: "left",
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
    alignItems: isMobile ? "flex-start" : "center",
    flexDirection: isMobile ? "column" : "row",
    gap: "16px",
  };

  const ringOuter = {
    width: "90px",
    aspectRatio: "1 / 1",
    borderRadius: "50%",
    background: "conic-gradient(#22d3ee, #6366f1, #22c55e, #22d3ee)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 30px rgba(59,130,246,0.6)",
    flexShrink: 0,
  };

  const ringInner = {
    width: "60px",
    aspectRatio: "1 / 1",
    borderRadius: "50%",
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
    marginTop: isMobile ? "32px" : "40px",
    fontSize: "11px",
    color: "#64748b",
    textAlign: "center",
  };

  return (
    <div style={page}>
      <div style={frame}>
        {/* HEADER */}
        <div style={topRow}>
          <img src={logo} alt="Resonifi logo" style={logoImg} />
          <div style={pill}>
            {isMobile ? (
              <>
                EARLY ACCESS
                <br />
                PERSONAL
                <br />
                WELLNESS OS
              </>
            ) : (
              "EARLY ACCESS · PERSONAL WELLNESS OS"
            )}
          </div>
        </div>

        {/* MAIN */}
        <div style={mainRow}>
          {/* LEFT COLUMN */}
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
          </div>

          {/* RIGHT CARD */}
          <div style={cardCol}>
            <div style={card}>
              <p style={cardLabel}>AT A GLANCE</p>
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
                  <p style={ringCaptionTop}>TODAY&apos;S SNAPSHOT</p>
                  <p style={ringCaptionBottom}>WELLNESS INDEX™</p>
                </div>
              </div>

              <p style={pillarList}>
                <strong>Emotional</strong> — mood, stress, resilience
                <br />
                <strong>Physical</strong> — energy, rest
                <br />
                <strong>Spiritual</strong> — meaning, purpose
                <br />
                <strong>Financial</strong> — stability, confidence
                <br />
                <strong>Digital</strong> — screen time, balance
              </p>
            </div>
          </div>
        </div>

        {/* FOUNDER LINE UNDER CARD */}
        <p style={founderLine}>
          Built by a teacher who walked the Camino and wanted a calmer way to
          look at life than another productivity dashboard. No gamification, no
          streak shame — just honest check-ins that add up over time.
        </p>

        <p style={footer}>© 2025 Resonifi. All rights reserved.</p>
      </div>
    </div>
  );
}
