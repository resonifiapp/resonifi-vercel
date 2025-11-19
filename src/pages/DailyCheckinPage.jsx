// src/pages/DailyCheckinPage.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const HISTORY_KEY = "resonifi_checkins_v1";

// ---- Question banks: 10 per pillar ----
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

// Deterministic “rotation”: pick 2 distinct questions from each bank based on the day number
function pickTwoFromBank(bank, dayOffset = 0) {
  const dayNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) + dayOffset;
  const firstIndex = dayNumber % bank.length;
  const secondIndex = (dayNumber + 3) % bank.length; // offset by 3 so it's different
  return [bank[firstIndex], bank[secondIndex]];
}

export default function DailyCheckinPage() {
  const navigate = useNavigate();

  // Question sliders (0–10) – 2 per pillar
  const [emotionalQ1, setEmotionalQ1] = useState(5);
  const [emotionalQ2, setEmotionalQ2] = useState(5);

  const [physicalQ1, setPhysicalQ1] = useState(5);
  const [physicalQ2, setPhysicalQ2] = useState(5);

  const [spiritualQ1, setSpiritualQ1] = useState(5);
  const [spiritualQ2, setSpiritualQ2] = useState(5);

  const [financialQ1, setFinancialQ1] = useState(5);
  const [financialQ2, setFinancialQ2] = useState(5);

  // Gratitude + good deed dropdowns + notes
  const [gratitude, setGratitude] = useState("");
  const [gratitudeNote, setGratitudeNote] = useState("");
  const [goodDeed, setGoodDeed] = useState("");
  const [goodDeedNote, setGoodDeedNote] = useState("");

  // Pick today’s rotating questions
  const [emotionalText1, emotionalText2] = pickTwoFromBank(
    EMOTIONAL_QUESTIONS,
    0
  );
  const [physicalText1, physicalText2] = pickTwoFromBank(
    PHYSICAL_QUESTIONS,
    11
  );
  const [spiritualText1, spiritualText2] = pickTwoFromBank(
    SPIRITUAL_QUESTIONS,
    23
  );
  const [financialText1, financialText2] = pickTwoFromBank(
    FINANCIAL_QUESTIONS,
    37
  );

  // ---- Styles ----
  const page = {
    backgroundColor: "#020617",
    color: "#f8fafc",
    minHeight: "100vh",
    padding: "24px 16px 90px",
    boxSizing: "border-box",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    maxWidth: "960px",
    margin: "0 auto",
  };

  const title = {
    fontSize: "22px",
    fontWeight: 600,
    marginBottom: "8px",
  };

  const subtitle = {
    fontSize: "13px",
    color: "#94a3b8",
    marginBottom: "24px",
  };

  const section = {
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "1px solid #1e293b",
  };

  const label = {
    fontSize: "14px",
    fontWeight: 500,
    marginBottom: "8px",
  };

  const pillarTitle = {
    fontSize: "14px",
    fontWeight: 600,
    marginBottom: "8px",
  };

  const slider = {
    width: "100%",
    appearance: "none",
    height: "8px",
    borderRadius: "999px",
    background: "#1e293b",
    outline: "none",
    marginTop: "4px",
    marginBottom: "6px",
  };

  const smallRow = {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    color: "#9ca3af",
    marginBottom: "6px",
  };

  const valueText = {
    fontSize: "12px",
    color: "#e5e7eb",
    marginBottom: "4px",
  };

  const select = {
    width: "100%",
    borderRadius: "999px",
    border: "1px solid #1e293b",
    backgroundColor: "#020617",
    color: "#e5e7eb",
    padding: "8px 12px",
    fontSize: "13px",
    outline: "none",
  };

  const smallLabel = {
    fontSize: "12px",
    color: "#9ca3af",
    marginTop: "8px",
    marginBottom: "4px",
  };

  const noteArea = {
    width: "100%",
    minHeight: "60px",
    resize: "vertical",
    borderRadius: "12px",
    border: "1px solid #1e293b",
    padding: "8px 10px",
    fontSize: "13px",
    backgroundColor: "#020617",
    color: "#e5e7eb",
    outline: "none",
  };

  const saveButton = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: 600,
    background: "linear-gradient(135deg, #6366f1, #22d3ee)",
    color: "#f9fafb",
    boxShadow: "0 12px 30px rgba(79,70,229,0.5)",
    marginTop: "26px",
  };

  // ---- Save handler ----
  function handleSave() {
    // Pillar scores are the average of the 2 question sliders (0–10)
    const emotionalScore =
      (Number(emotionalQ1) + Number(emotionalQ2)) / 2 || 0;
    const physicalScore = (Number(physicalQ1) + Number(physicalQ2)) / 2 || 0;
    const spiritualScore =
      (Number(spiritualQ1) + Number(spiritualQ2)) / 2 || 0;
    const financialScore =
      (Number(financialQ1) + Number(financialQ2)) / 2 || 0;

    const avg =
      (emotionalScore +
        physicalScore +
        spiritualScore +
        financialScore) /
      4;

    const overallIndex = Math.round((avg / 10) * 100); // 0–100 %

    // Save % for Home.jsx
    try {
      window.localStorage.setItem(
        "resonifi_latest_index",
        JSON.stringify(overallIndex)
      );
    } catch (err) {
      console.error("Error saving wellness index", err);
    }

    // Save full check-in history for Insights + pillars
    try {
      const raw = window.localStorage.getItem(HISTORY_KEY);
      const existing = raw ? JSON.parse(raw) : [];

      const newEntry = {
        timestamp: new Date().toISOString(),
        index: overallIndex,

        // Pillar scores derived from the question sliders
        emotional: emotionalScore,
        physical: physicalScore,
        spiritual: spiritualScore,
        financial: financialScore,

        gratitude,
        gratitudeNote,
        goodDeed,
        goodDeedNote,

        emotionalQuestions: [
          { text: emotionalText1, value: Number(emotionalQ1) },
          { text: emotionalText2, value: Number(emotionalQ2) },
        ],
        physicalQuestions: [
          { text: physicalText1, value: Number(physicalQ1) },
          { text: physicalText2, value: Number(physicalQ2) },
        ],
        spiritualQuestions: [
          { text: spiritualText1, value: Number(spiritualQ1) },
          { text: spiritualText2, value: Number(spiritualQ2) },
        ],
        financialQuestions: [
          { text: financialText1, value: Number(financialQ1) },
          { text: financialText2, value: Number(financialQ2) },
        ],
      };

      const updated = [newEntry, ...existing];
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Error saving check-in history", err);
    }

    navigate("/");
  }

  // Helper to render a question slider with pillar-specific anchors
  function QuestionSlider({ text, value, onChange, anchors }) {
    return (
      <div style={{ marginBottom: "14px" }}>
        <p style={{ fontSize: "13px", marginBottom: "4px" }}>{text}</p>
        <input
          type="range"
          min="0"
          max="10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={slider}
        />
        <div style={smallRow}>
          <span>{anchors[0]}</span>
          <span>{anchors[1]}</span>
          <span>{anchors[2]}</span>
        </div>
        <p style={valueText}>{value} / 10</p>
      </div>
    );
  }

  return (
    <div style={page}>
      <h1 style={title}>Daily Check-In</h1>
      <p style={subtitle}>
        Answer two sliders for each pillar. Then close with a quick note on
        gratitude and kindness. Your responses update how your pillars glow and
        how your Wellness Index feels on the Home screen.
      </p>

      {/* Emotional questions */}
      <div style={section}>
        <p style={pillarTitle}>Emotional reflections</p>
        <QuestionSlider
          text={emotionalText1}
          value={emotionalQ1}
          onChange={setEmotionalQ1}
          anchors={[
            "Heavy / overwhelmed",
            "Mixed / manageable",
            "Light / steady",
          ]}
        />
        <QuestionSlider
          text={emotionalText2}
          value={emotionalQ2}
          onChange={setEmotionalQ2}
          anchors={[
            "Heavy / overwhelmed",
            "Mixed / manageable",
            "Light / steady",
          ]}
        />
      </div>

      {/* Physical questions */}
      <div style={section}>
        <p style={pillarTitle}>Physical reflections</p>
        <QuestionSlider
          text={physicalText1}
          value={physicalQ1}
          onChange={setPhysicalQ1}
          anchors={["Drained / tense", "Okay", "Energized / strong"]}
        />
        <QuestionSlider
          text={physicalText2}
          value={physicalQ2}
          onChange={setPhysicalQ2}
          anchors={["Drained / tense", "Okay", "Energized / strong"]}
        />
      </div>

      {/* Spiritual questions */}
      <div style={section}>
        <p style={pillarTitle}>Spiritual reflections</p>
        <QuestionSlider
          text={spiritualText1}
          value={spiritualQ1}
          onChange={setSpiritualQ1}
          anchors={["Disconnected", "Unsure", "Connected / in tune"]}
        />
        <QuestionSlider
          text={spiritualText2}
          value={spiritualQ2}
          onChange={setSpiritualQ2}
          anchors={["Disconnected", "Unsure", "Connected / in tune"]}
        />
      </div>

      {/* Financial questions */}
      <div style={section}>
        <p style={pillarTitle}>Financial reflections</p>
        <QuestionSlider
          text={financialText1}
          value={financialQ1}
          onChange={setFinancialQ1}
          anchors={["On edge / stressed", "Managing", "Steady / secure"]}
        />
        <QuestionSlider
          text={financialText2}
          value={financialQ2}
          onChange={setFinancialQ2}
          anchors={["On edge / stressed", "Managing", "Steady / secure"]}
        />
      </div>

      {/* Gratitude & Good Deeds at the end */}
      <div style={section}>
        <p style={label}>Gratitude & kindness</p>

        <p style={{ fontSize: "13px", marginBottom: "6px" }}>Gratitude</p>
        <select
          style={select}
          value={gratitude}
          onChange={(e) => setGratitude(e.target.value)}
        >
          <option value="">Choose one (or leave blank)</option>
          <option value="connection">A person or connection</option>
          <option value="body">Something your body allowed you to do</option>
          <option value="opportunity">An opportunity that showed up</option>
          <option value="small-moment">A small, ordinary moment</option>
        </select>

        <p style={smallLabel}>Want to add your own?</p>
        <textarea
          style={noteArea}
          placeholder="Write your own gratitude reflection..."
          value={gratitudeNote}
          onChange={(e) => setGratitudeNote(e.target.value)}
        />

        <p
          style={{
            fontSize: "13px",
            marginTop: "14px",
            marginBottom: "6px",
          }}
        >
          Good deed / kindness
        </p>
        <select
          style={select}
          value={goodDeed}
          onChange={(e) => setGoodDeed(e.target.value)}
        >
          <option value="">Choose one (or leave blank)</option>
          <option value="for-someone-else">
            Did something kind for someone
          </option>
          <option value="for-yourself">Did something kind for yourself</option>
          <option value="listened">Really listened to someone</option>
          <option value="support">Offered support or encouragement</option>
        </select>

        <p style={smallLabel}>Want to describe it?</p>
        <textarea
          style={noteArea}
          placeholder="Describe your act of kindness..."
          value={goodDeedNote}
          onChange={(e) => setGoodDeedNote(e.target.value)}
        />
      </div>

      <button type="button" style={saveButton} onClick={handleSave}>
        Save Check-In
      </button>
    </div>
  );
}
