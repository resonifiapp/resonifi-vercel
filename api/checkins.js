import React, { useState, useMemo } from "react";
import pillars from "../data/pillars.js";
import questions from "../data/questions.js";

const gratitudeOptions = [
  "Family",
  "Friends",
  "Health",
  "My home",
  "Nature",
  "My body",
  "A small win today"
];

const deedOptions = [
  "Helped someone",
  "Listened without interrupting",
  "Sent a kind message",
  "Did something for myself",
  "Contributed at work/school",
  "Other"
];

function DailyCheckin() {
  // Slider scores
  const [responses, setResponses] = useState({
    Emotional: 5,
    Physical: 5,
    Financial: 5,
    Spiritual: 5
  });

  // Gratitude / Good Deed / Journal
  const [gratitude, setGratitude] = useState("");
  const [deed, setDeed] = useState("");
  const [journal, setJournal] = useState("");

  // Save status
  const [saveStatus, setSaveStatus] = useState(null); // "saved" | "error" | null

  // Calculate resonance score (0–10)
  const score = useMemo(() => {
    const vals = Object.values(responses);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return Math.round(avg * 10) / 10;
  }, [responses]);

  // Bucket-of-questions DAILY rotation
  const todayQuestions = {};
  const dayIndex = new Date().getDate(); // 1–31

  pillars.forEach((p) => {
    const list = questions[p.name] || [];
    if (list.length === 0) {
      todayQuestions[p.name] = `How is your ${p.name.toLowerCase()} today?`;
    } else {
      const idx = dayIndex % list.length;
      todayQuestions[p.name] = list[idx];
    }
  });

  // Update slider
  const handleChange = (pillar, value) => {
    setResponses((prev) => ({ ...prev, [pillar]: value }));
  };

  // Save check-in locally
  const handleSave = () => {
    try {
      const payload = {
        date: new Date().toISOString(),
        responses,
        gratitude,
        deed,
        journal
        // later: period info can go here
      };

      const existingRaw =
        typeof window !== "undefined"
          ? window.localStorage.getItem("resonifi_checkins")
          : null;

      let existing = [];
      if (existingRaw) {
        const parsed = JSON.parse(existingRaw);
        if (Array.isArray(parsed)) existing = parsed;
      }

      existing.push(payload);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "resonifi_checkins",
          JSON.stringify(existing)
        );
      }

      setSaveStatus("saved");
      console.log("Check-in saved:", payload);
    } catch (err) {
      console.error("Error saving check-in", err);
      setSaveStatus("error");
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: "16px" }}>Daily Check-In</h1>

      {/* Glowing bubble */}
      <div
        style={{
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          margin: "0 auto 24px",
          background:
            "radial-gradient(circle at 30% 10%, #8cf5ff, #5462ff 40%, #050816)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "40px",
          fontWeight: "700",
          boxShadow: "0 0 30px rgba(101,243,255,0.7)"
        }}
      >
        {score}
      </div>

      {/* Sliders */}
      <h2 style={{ marginBottom: "12px" }}>Rate Your Pillars</h2>

      {pillars.map((p) => (
        <div
          key={p.name}
          style={{
            background: "rgba(255,255,255,0.06)",
            padding: "16px",
            borderRadius: "12px",
            marginBottom: "16px"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px"
            }}
          >
            <strong>{p.name}</strong>
            <span style={{ fontSize: "13px" }}>{responses[p.name]}/10</span>
          </div>

          <p style={{ fontSize: "13px", margin: "0 0 10px", opacity: 0.8 }}>
            {todayQuestions[p.name]}
          </p>

          <input
            type="range"
            min="0"
            max="10"
            value={responses[p.name]}
            onChange={(e) => handleChange(p.name, Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
      ))}

      {/* Gratitude & Good Deeds */}
      <h2 style={{ marginBottom: "10px", marginTop: "20px" }}>
        Gratitude & Good Deeds
      </h2>

      <div
        style={{
          background: "rgba(255,255,255,0.06)",
          padding: "16px",
          borderRadius: "12px",
          marginBottom: "20px"
        }}
      >
        <label style={{ fontSize: "13px" }}>
          Today I&apos;m grateful for:
          <select
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            style={{
              marginTop: "6px",
              width: "100%",
              padding: "8px",
              borderRadius: "6px"
            }}
          >
            <option value="">Select one...</option>
            {gratitudeOptions.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>

        <label
          style={{
            marginTop: "12px",
            display: "block",
            fontSize: "13px"
          }}
        >
          One kind thing I did today:
          <select
            value={deed}
            onChange={(e) => setDeed(e.target.value)}
            style={{
              marginTop: "6px",
              width: "100%",
              padding: "8px",
              borderRadius: "6px"
            }}
          >
            <option value="">Select one...</option>
            {deedOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Journal */}
      <h2 style={{ marginBottom: "8px" }}>Reflection</h2>
      <textarea
        value={journal}
        onChange={(e) => setJournal(e.target.value)}
        placeholder="Any thoughts or moments you want to remember from today?"
        rows={4}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "10px",
          border: "none",
          background: "rgba(255,255,255,0.06)",
          color: "#ffffff",
          resize: "vertical"
        }}
      />

      {/* Save button + status */}
      <div style={{ marginTop: "16px" }}>
        <button
          onClick={handleSave}
          style={{
            padding: "10px 18px",
            borderRadius: "999px",
            border: "none",
            background: "#65f3ff",
            color: "#050816",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Save Check-In
        </button>

        {saveStatus === "saved" && (
          <span
            style={{
              marginLeft: "10px",
              fontSize: "13px",
              opacity: 0.85
            }}
          >
            Check-in saved.
          </span>
        )}
        {saveStatus === "error" && (
          <span
            style={{
              marginLeft: "10px",
              fontSize: "13px",
              opacity: 0.85,
              color: "#ff9b9b"
            }}
          >
            Couldn&apos;t save. Try again.
          </span>
        )}
      </div>
    </div>
  );
}

export default DailyCheckin;
