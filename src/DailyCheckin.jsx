import { useState } from "react";

const PILLARS = ["emotional", "physical", "spiritual", "financial"];

const TITLES = {
  emotional: "Emotional",
  physical: "Physical",
  spiritual: "Spiritual",
  financial: "Financial",
};

const QUESTIONS = {
  emotional: "How steady and emotionally balanced do you feel today?",
  physical: "How does your body feel overall today?",
  spiritual: "How connected do you feel to something bigger than yourself?",
  financial: "How calm and in-control do you feel about money today?",
};

export default function DailyCheckin() {
  const [values, setValues] = useState({
    emotional: 5,
    physical: 5,
    spiritual: 5,
    financial: 5,
  });

  const [saved, setSaved] = useState(false);

  function handleChange(pillar, value) {
    setValues((prev) => ({ ...prev, [pillar]: Number(value) }));
    setSaved(false);
  }

  function saveCheckIn() {
    setSaved(true);
  }

  const currentIndex =
    (values.emotional +
      values.physical +
      values.spiritual +
      values.financial) *
    2.5; // 0–100 score

  return (
    <div className="page">
      
      {/* -------------------- */}
      {/* MAIN PAGE HEADING    */}
      {/* -------------------- */}
      <div className="page-header page-title">Daily Check-In</div>

      <div className="page-subtitle">
        Slide each pillar to match how you feel right now. Your answers are saved
        on this device only.
      </div>

      {/* Wellness Index Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">CURRENT WELLNESS INDEX</div>
        </div>

        <div className="slider-label-box">
          <span></span>
          <span>{Math.round(currentIndex)}</span>
        </div>

        <input type="range" min="0" max="100" value={currentIndex} readOnly />
      </div>

      {/* Pillar Cards */}
      {PILLARS.map((pillar) => (
        <div key={pillar} className="card">
          <div className="card-header">
            <div className="card-title">{TITLES[pillar]}</div>
            <div className="card-description">{QUESTIONS[pillar]}</div>
          </div>

          <div className="slider-label-box">
            <span>Low</span>
            <span>{values[pillar]}/10</span>
            <span>Great</span>
          </div>

          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={values[pillar]}
            onChange={(e) => handleChange(pillar, e.target.value)}
          />
        </div>
      ))}

      {/* Saved indicator */}
      {saved && <div className="saved-text">Today’s check-in is saved.</div>}

      {/* Save Button */}
      <button
        style={{
          marginTop: "20px",
          background: "#4dd7c6",
          border: "none",
          padding: "14px 20px",
          borderRadius: "10px",
          width: "100%",
          fontSize: "16px",
          fontWeight: "600",
          cursor: "pointer",
        }}
        onClick={saveCheckIn}
      >
        Save Check-In
      </button>
    </div>
  );
}
