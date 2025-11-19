// src/pages/CycleOnboarding.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const SETTINGS_KEY = "resonifi_settings";

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSettings(next) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch (e) {
    console.error("Failed to save settings", e);
  }
}

export default function CycleOnboarding() {
  const navigate = useNavigate();

  function enable() {
    const current = loadSettings();
    const updated = { ...current, cycleTrackingEnabled: true };
    saveSettings(updated);
    navigate("/cycle");
  }

  return (
    <div
      style={{
        padding: "40px 24px 80px",
        maxWidth: "720px",
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontSize: "32px",
          fontWeight: 700,
          marginBottom: "24px",
        }}
      >
        Cycle tracking
      </h1>

      {/* Big privacy message */}
      <div
        style={{
          background: "rgba(255,255,255,0.07)",
          borderRadius: "20px",
          padding: "28px 26px",
          border: "1px solid rgba(255,255,255,0.15)",
          marginBottom: "30px",
        }}
      >
        <h2
          style={{
            fontSize: "22px",
            fontWeight: 800,
            marginBottom: "16px",
            lineHeight: 1.4,
          }}
        >
          Your cycle data stays private. Always.
        </h2>

        <p
          style={{
            fontSize: "18px",
            fontWeight: 500,
            lineHeight: 1.7,
            opacity: 0.95,
            marginBottom: "16px",
          }}
        >
          Resonifi is built in <strong>Canada</strong>, where reproductive data
          is treated with strict confidentiality.
        </p>

        <p
          style={{
            fontSize: "18px",
            fontWeight: 500,
            lineHeight: 1.7,
            opacity: 0.95,
            marginBottom: "16px",
          }}
        >
          Your cycle information is stored{" "}
          <strong>only on this device</strong>.
        </p>

        <p
          style={{
            fontSize: "18px",
            fontWeight: 600,
            lineHeight: 1.7,
            opacity: 0.95,
            marginBottom: "16px",
          }}
        >
          • Not uploaded  
          • Not shared  
          • <strong>Never sold</strong>
        </p>

        <p
          style={{
            fontSize: "17px",
            fontWeight: 400,
            lineHeight: 1.6,
            opacity: 0.85,
          }}
        >
          This matters especially for users in the United States, where many
          commercial period apps have been known to misuse or sell reproductive
          data.
        </p>
      </div>

      <p
        style={{
          fontSize: "16px",
          opacity: 0.85,
          marginBottom: "28px",
          lineHeight: 1.6,
        }}
      >
        Cycle tracking is optional and stays separate from your Wellness Index.
      </p>

      <button
        onClick={enable}
        style={{
          border: "none",
          borderRadius: "999px",
          padding: "14px 24px",
          fontSize: "18px",
          fontWeight: 700,
          cursor: "pointer",
          background:
            "linear-gradient(135deg, rgba(141,230,255,1), rgba(117,184,255,1))",
          color: "#020617",
          width: "100%",
          marginBottom: "24px",
        }}
      >
        Enable cycle tracking
      </button>

      <button
        onClick={() => navigate("/")}
        style={{
          background: "transparent",
          border: "none",
          color: "rgba(255,255,255,0.7)",
          textDecoration: "underline",
          cursor: "pointer",
          fontSize: "15px",
        }}
      >
        Not now
      </button>
    </div>
  );
}
