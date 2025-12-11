// src/pages/DailyCheckinPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HISTORY_KEY = "resonifi_checkins_v1";
const TODAY_STATE_KEY = "resonifi_today_checkin_v1";

// ---- Question banks: 10 per pillar (ONE is used per day) ----
const EMOTIONAL_QUESTIONS = [
  "How steady did your emotions feel overall today?",
  "How well did you bounce back from stress or setbacks?",
  "How connected did you feel to your own feelings?",
  "How understood did you feel by others today?",
  "How kind were you to yourself when things were hard?",
  "How much did worry or rumination run the show today?",
  "How comfortable were you expressing what you felt?",
  "How often did joy or lightness show up today?",
  "How much did old patterns or triggers pull you off track?",
  "How safe did your inner world feel today?",
];

const PHYSICAL_QUESTIONS = [
  "How much natural energy did you feel in your body?",
  "How rested did you feel when you woke up?",
  "How supported did your body feel by movement today?",
  "How much did pain, tension, or discomfort show up?",
  "How well did your food today support your energy?",
  "How grounded did you feel in your body overall?",
  "How much did you breathe deeply or consciously today?",
  "How well did you honour your need to rest?",
  "How strong did you feel in simple everyday tasks?",
  "How in tune were you with your physical limits?",
];

const SPIRITUAL_QUESTIONS = [
  "How connected did you feel to something bigger than yourself?",
  "How aligned did your actions feel with your values today?",
  "How much meaning did you experience in ordinary moments?",
  "How present did you feel (vs. lost in past or future)?",
  "How supported did you feel by your beliefs or practices?",
  "How often did you pause for stillness or reflection today?",
  "How open did you feel to wonder, awe, or curiosity?",
  "How much did you feel life had a sense of direction today?",
  "How congruent did your inner and outer lives feel?",
  "How much did you feel part of a larger story today?",
];

const FINANCIAL_QUESTIONS = [
  "How steady did your money situation feel today?",
  "How in control did you feel of your spending choices?",
  "How much did money-related stress show up in your thoughts?",
  "How aligned did your spending or earning feel with your values?",
  "How clear did your short-term financial picture feel?",
  "How much did you feel you were moving in the right direction?",
  "How supported did you feel by the systems around your money?",
  "How confident did you feel handling obligations today?",
  "How much did money feel like a tool vs. a threat?",
  "How safe did you feel about your financial future today?",
];

const DIGITAL_QUESTIONS = [
  "How easy was it to step away from your phone or devices today?",
  "How calm did your mind feel after time online today?",
  "How intentional did your scrolling and screen time feel?",
  "How often did notifications pull you away from what mattered?",
  "How much did you feel in control of your tech, vs. pulled by it?",
  "How refreshed did you feel after using digital tools today?",
  "How well did you protect your focus from digital distractions?",
  "How grounded did you feel after being on social or news feeds?",
  "How much did tech support your wellbeing (vs. drain it) today?",
  "How easy was it to put your phone down when you chose to?",
];

// Deterministic rotation: pick ONE question from a bank per day
function pickOneFromBank(bank, offset = 0) {
  const dayNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) + offset;
  const index = dayNumber % bank.length;
  return bank[index];
}

// Reusable pillar section
function PillarSection({
  title,
  question,
  value,
  onChange,
  leftLabel,
  rightLabel,
}) {
  const section = {
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "1px solid #1e293b",
  };

  const pillarTitle = {
    fontSize: "14px",
    fontWeight: 600,
    marginBottom: "8px",
  };

  const questionText = {
    fontSize: "13px",
    color: "#e5e7eb",
    marginBottom: "8px",
  };

  const slider = {
    width: "100%",
    appearance: "none",
    height: "8px",
    borderRadius: "999px",
    background: "#0f172a",
    outline: "none",
    marginBottom: "6px",
  };

  const anchorsRow = {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    color: "#9ca3af",
  };

  return (
    <div style={section}>
      <p style={pillarTitle}>{title}</p>
      <p style={questionText}>{question}</p>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={slider}
      />
      <div style={anchorsRow}>
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

export default function DailyCheckinPage() {
  const navigate = useNavigate();
  const todayKey = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  const [emotional, setEmotional] = useState(5);
  const [physical, setPhysical] = useState(5);
  const [spiritual, setSpiritual] = useState(5);
  const [financial, setFinancial] = useState(5);
  const [digital, setDigital] = useState(5);

  const [reflection, setReflection] = useState("");

  const emotionalQuestion = pickOneFromBank(EMOTIONAL_QUESTIONS, 0);
  const physicalQuestion = pickOneFromBank(PHYSICAL_QUESTIONS, 11);
  const spiritualQuestion = pickOneFromBank(SPIRITUAL_QUESTIONS, 23);
  const financialQuestion = pickOneFromBank(FINANCIAL_QUESTIONS, 37);
  const digitalQuestion = pickOneFromBank(DIGITAL_QUESTIONS, 51);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(TODAY_STATE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.date === todayKey) {
          if (typeof saved.emotional === "number") setEmotional(saved.emotional);
          if (typeof saved.physical === "number") setPhysical(saved.physical);
          if (typeof saved.spiritual === "number") setSpiritual(saved.spiritual);
          if (typeof saved.financial === "number")
            setFinancial(saved.financial);
          if (typeof saved.digital === "number") setDigital(saved.digital);
          if (typeof saved.reflection === "string")
            setReflection(saved.reflection);
        }
      }
    } catch (err) {
      console.error("Error loading today's check-in state", err);
    }
  }, [todayKey]);

  const page = {
    backgroundColor: "#020617",
    color: "#f8fafc",
    padding: "24px 16px 24px",
    boxSizing: "border-box",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    maxWidth: "960px",
    margin: "0 auto",
  };

  const title = {
    fontSize: "22px",
    fontWeight: 600,
    marginBottom: "16px",
  };

  const journalSection = {
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #1e293b",
  };

  const journalLabel = {
    fontSize: "14px",
    fontWeight: 500,
    marginBottom: "6px",
  };

  const journalQuestion = {
    fontSize: "13px",
    color: "#cbd5e1",
    marginBottom: "8px",
  };

  const journalArea = {
    width: "100%",
    minHeight: "80px",
    resize: "vertical",
    borderRadius: "12px",
    border: "1px solid #1e293b",
    padding: "10px 12px",
    fontSize: "13px",
    backgroundColor: "#020617",
    color: "#e5e7eb",
    outline: "none",
  };

  const saveButton = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 600,
    background: "linear-gradient(135deg, #6366f1, #22d3ee)",
    color: "#f9fafb",
    boxShadow: "0 12px 30px rgba(79,70,229,0.5)",
    marginTop: "24px",
  };

  function handleSave() {
    const emotionalScore = emotional || 1;
    const physicalScore = physical || 1;
    const spiritualScore = spiritual || 1;
    const financialScore = financial || 1;
    const digitalScore = digital || 1;

    const avg =
      (emotionalScore +
        physicalScore +
        spiritualScore +
        financialScore +
        digitalScore) / 5;

    const overallIndex = Math.round((avg / 10) * 100); // 0–100 %

    // Save latest index for Home
    try {
      window.localStorage.setItem(
        "resonifi_latest_index",
        JSON.stringify(overallIndex)
      );
    } catch (err) {
      console.error("Error saving wellness index", err);
    }

    // Save check-in history
    try {
      const raw = window.localStorage.getItem(HISTORY_KEY);
      const existing = raw ? JSON.parse(raw) : [];

      const newEntry = {
        timestamp: new Date().toISOString(),
        index: overallIndex,
        emotional: emotionalScore,
        physical: physicalScore,
        spiritual: spiritualScore,
        financial: financialScore,
        digital: digitalScore,
        reflection,
        emotionalQuestions: [{ text: emotionalQuestion, value: emotionalScore }],
        physicalQuestions: [{ text: physicalQuestion, value: physicalScore }],
        spiritualQuestions: [{ text: spiritualQuestion, value: spiritualScore }],
        financialQuestions: [{ text: financialQuestion, value: financialScore }],
        digitalQuestions: [{ text: digitalQuestion, value: digitalScore }],
      };

      const updated = [newEntry, ...existing];
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Error saving check-in history", err);
    }

    // Save today's partial state
    try {
      const todayState = {
        date: todayKey,
        emotional,
        physical,
        spiritual,
        financial,
        digital,
        reflection,
      };

      window.localStorage.setItem(
        TODAY_STATE_KEY,
        JSON.stringify(todayState)
      );
    } catch (err) {
      console.error("Error saving today's check-in state", err);
    }

    // Analytics
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible("Check-in Completed");
    }

    navigate("/app");
  }

  return (
    <div style={page}>
      <h1 className="page-header" style={title}>
        Daily Check-In
      </h1>

      <PillarSection
        title="Emotional"
        question={emotionalQuestion}
        value={emotional}
        onChange={setEmotional}
        leftLabel="Low"
        rightLabel="Steady"
      />

      <PillarSection
        title="Physical"
        question={physicalQuestion}
        value={physical}
        onChange={setPhysical}
        leftLabel="Drained"
        rightLabel="Energized"
      />

      <PillarSection
        title="Spiritual"
        question={spiritualQuestion}
        value={spiritual}
        onChange={setSpiritual}
        leftLabel="Disconnected"
        rightLabel="Connected"
      />

      <PillarSection
        title="Financial"
        question={financialQuestion}
        value={financial}
        onChange={setFinancial}
        leftLabel="Stressed"
        rightLabel="Secure"
      />

      <PillarSection
        title="Digital"
        question={digitalQuestion}
        value={digital}
        onChange={setDigital}
        leftLabel="Overloaded"
        rightLabel="Balanced"
      />

      <div style={journalSection}>
        <p style={journalLabel}>Mini reflection</p>
        <p style={journalQuestion}>What stood out to you today?</p>
        <textarea
          style={journalArea}
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
        />
      </div>

      <button type="button" style={saveButton} onClick={handleSave}>
        Complete check-in
      </button>
    </div>
  );
}
