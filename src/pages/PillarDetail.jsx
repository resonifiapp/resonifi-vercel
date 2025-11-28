// src/pages/PillarDetail.jsx

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const HISTORY_KEY = "resonifi_checkins_v1";

const PILLAR_META = {
  emotional: {
    id: "emotional",
    name: "Emotional",
    description:
      "Your inner weather: mood, stress, and how steady or stormy today felt inside.",
    historyKey: "emotional",
    questionsKey: "emotionalQuestions",
  },
  physical: {
    id: "physical",
    name: "Physical",
    description:
      "Your body’s signal: energy, rest, and how supported you felt moving through the day.",
    historyKey: "physical",
    questionsKey: "physicalQuestions",
  },
  spiritual: {
    id: "spiritual",
    name: "Spiritual",
    description:
      "Your sense of meaning: connection to something bigger, and whether life felt aligned.",
    historyKey: "spiritual",
    questionsKey: "spiritualQuestions",
  },
  financial: {
    id: "financial",
    name: "Financial",
    description:
      "Your money ground: stability, control, and how safe your financial world felt.",
    historyKey: "financial",
    questionsKey: "financialQuestions",
  },
  digital: {
    id: "digital",
    name: "Digital",
    description:
      "Your tech balance: how screens, feeds, and notifications shaped your nervous system.",
    historyKey: "digital",
    questionsKey: "digitalQuestions",
  },
};

function scoreToWord(score) {
  if (!Number.isFinite(score)) return "No data";
  if (score <= 2) return "Low";
  if (score <= 4) return "Managing";
  if (score <= 6) return "Okay";
  if (score <= 8) return "Good";
  return "High";
}

export default function PillarDetail() {
  const navigate = useNavigate();
  const { pillarId } = useParams();

  const meta = PILLAR_META[pillarId] || null;

  const [score, setScore] = useState(null);
  const [stateWord, setStateWord] = useState("No data");
  const [todayQuestion, setTodayQuestion] = useState(null);

  useEffect(() => {
    if (!meta) return;

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

      const value = Number(newest[meta.historyKey] ?? NaN);
      if (Number.isFinite(value)) {
        const clamped = Math.max(1, Math.min(10, value));
        setScore(clamped);
        setStateWord(scoreToWord(clamped));
      } else {
        setScore(null);
        setStateWord("No data");
      }

      const questionsArray = newest[meta.questionsKey];
      if (Array.isArray(questionsArray) && questionsArray.length > 0) {
        // use first question text
        const q = questionsArray[0]?.text || null;
        setTodayQuestion(q);
      } else {
        setTodayQuestion(null);
      }
    } catch (err) {
      console.error("Error loading pillar detail", err);
    }
  }, [meta]);

  if (!meta) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#020617",
          color: "#f9fafb",
          padding: "24px 16px",
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            color: "#e5e7eb",
            fontSize: "14px",
            padding: 0,
            marginBottom: "16px",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
        <p>Unknown pillar.</p>
      </div>
    );
  }

  const container = {
    minHeight: "100vh",
    backgroundColor: "#020617",
    color: "#f9fafb",
    padding: "24px 16px 90px",
    boxSizing: "border-box",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    maxWidth: "960px",
    margin: "0 auto",
  };

  const backLink = {
    background: "none",
    border: "none",
    color: "#e5e7eb",
    fontSize: "14px",
    padding: 0,
    marginBottom: "16px",
    cursor: "pointer",
  };

  const title = {
    fontSize: "22px",
    fontWeight: 600,
    marginBottom: "4px",
  };

  const description = {
    fontSize: "13px",
    color: "#cbd5e1",
    marginBottom: "28px",
    lineHeight: 1.5,
  };

  const tubeContainer = {
    marginTop: "12px",
    marginBottom: "32px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const tubeLabelWord = {
    fontSize: "13px",
    fontWeight: 500,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#bae6fd",
    marginBottom: "12px",
  };

  const tubeWrapper = {
    width: 36,
    height: 200,
    borderRadius: 9999,
    background: "rgba(15,23,42,0.95)",
    border: "1px solid rgba(148,163,184,0.6)",
    overflow: "hidden",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    boxShadow:
      "0 0 26px rgba(56,189,248,0.75), 0 0 60px rgba(79,70,229,0.6)",
  };

  const heightPercent = score ? (score / 10) * 100 : 0;

  let gradient;
  switch (meta.id) {
    case "emotional":
      gradient = "linear-gradient(180deg, #a855f7, #3b82f6)";
      break;
    case "physical":
      gradient = "linear-gradient(180deg, #3b82f6, #22d3ee)";
      break;
    case "spiritual":
      gradient = "linear-gradient(180deg, #22d3ee, #8b5cf6)";
      break;
    case "financial":
      gradient = "linear-gradient(180deg, #facc15, #22c55e)";
      break;
    case "digital":
    default:
      gradient = "linear-gradient(180deg, #38bdf8, #6366f1)";
      break;
  }

  const tubeFill = {
    width: "100%",
    height: `${heightPercent}%`,
    background: gradient,
    transition: "height 0.35s ease-out, box-shadow 0.35s ease-out",
    borderRadius: 9999,
    boxShadow:
      "0 0 22px rgba(56,189,248,0.9), 0 0 48px rgba(79,70,229,0.8)",
  };

  const numericScore = {
    marginTop: "10px",
    fontSize: "13px",
    color: "#e5e7eb",
  };

  const sectionTitle = {
    fontSize: "14px",
    fontWeight: 600,
    marginBottom: "6px",
  };

  const questionText = {
    fontSize: "13px",
    color: "#cbd5e1",
    lineHeight: 1.5,
  };

  const questionSection = {
    marginTop: "18px",
    paddingTop: "16px",
    borderTop: "1px solid #1e293b",
  };

  return (
    <div style={container}>
      <button type="button" onClick={() => navigate(-1)} style={backLink}>
        ← Back
      </button>

      <h1 style={title}>{meta.name}</h1>
      <p style={description}>{meta.description}</p>

      {/* Test-tube bar with word state */}
      <div style={tubeContainer}>
        <div style={tubeLabelWord}>{stateWord}</div>
        <div style={tubeWrapper}>
          <div style={tubeFill} />
        </div>
        {score !== null && Number.isFinite(score) && (
          <p style={numericScore}>{score.toFixed(1)} / 10</p>
        )}
      </div>

      {/* Today's question */}
      <div style={questionSection}>
        <p style={sectionTitle}>Today&apos;s question</p>
        <p style={questionText}>
          {todayQuestion
            ? todayQuestion
            : "You haven't checked in for this pillar yet today."}
        </p>
      </div>
    </div>
  );
}
