import { useEffect, useState } from "react";
import { getFeedback, setFeedback } from "./lib/feedbackPrefs";

export default function FeedbackSettings() {
  const [prefs, setPrefs] = useState(getFeedback());

  useEffect(() => {
    setPrefs(getFeedback());
  }, []);

  function handleChange(key) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setFeedback(next);
  }

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "0 auto",
        padding: 20,
        background: "var(--bg)",
        color: "var(--text)",
        border: "1px solid var(--border)",
        borderRadius: "14px",
        boxShadow: "0 2px 6px rgba(0,0,0,.05)",
      }}
    >
      <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>
        Feedback Settings
      </h2>

      <ToggleRow
        label="Enable Sounds"
        checked={prefs.sound}
        onChange={() => handleChange("sound")}
      />
      <ToggleRow
        label="Enable Haptics"
        checked={prefs.haptic}
        onChange={() => handleChange("haptic")}
      />
      <ToggleRow
        label="Enable Motion"
        checked={prefs.motion}
        onChange={() => handleChange("motion")}
      />
    </div>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: "1px solid var(--border)",
        cursor: "pointer",
        fontSize: 15,
      }}
    >
      <span>{label}</span>
      <div
        style={{
          position: "relative",
          width: 42,
          height: 24,
          borderRadius: 999,
          background: checked ? "dodgerblue" : "var(--border)",
          transition: "background 0.2s",
        }}
        onClick={onChange}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 20 : 2,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,.25)",
            transition: "left 0.2s",
          }}
        />
      </div>
    </label>
  );
}