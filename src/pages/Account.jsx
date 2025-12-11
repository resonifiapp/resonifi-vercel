// src/pages/Account.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NAME_KEY = "resonifi_user_name";
const CYCLE_ENABLED_KEY = "resonifi_cycle_enabled_v1";

export default function Account() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [cycleEnabled, setCycleEnabled] = useState(false);

  // Load stored name + cycle toggle
  useEffect(() => {
    try {
      const savedName = localStorage.getItem(NAME_KEY);
      if (savedName) setUserName(savedName);
    } catch {}

    try {
      const enabled =
        localStorage.getItem(CYCLE_ENABLED_KEY) === "true" ? true : false;
      setCycleEnabled(enabled);
    } catch {}
  }, []);

  function handleNameChange(e) {
    const value = e.target.value;
    setUserName(value);
    try {
      localStorage.setItem(NAME_KEY, value.trim());
    } catch {}
  }

  function toggleCycle(e) {
    const value = e.target.checked;
    setCycleEnabled(value);
    try {
      localStorage.setItem(CYCLE_ENABLED_KEY, value);
    } catch {}
  }

  // ---- Styles ----
  const page = {
    backgroundColor: "#020617",
    color: "#f1f5f9",
    minHeight: "100vh",
    padding: "24px 16px 90px",
    maxWidth: "900px",
    margin: "0 auto",
    fontFamily: "system-ui, -apple-system, sans-serif",
  };

  const card = {
    padding: "18px 20px",
    borderRadius: "16px",
    background: "rgba(15,23,42,0.75)",
    border: "1px solid rgba(148,163,184,0.25)",
    marginBottom: "20px",
    boxShadow: "0 0 24px rgba(0,0,0,0.4)",
  };

  const cardTitle = {
    fontSize: "1.1rem",
    fontWeight: 600,
    marginBottom: "6px",
  };

  const small = {
    fontSize: "0.85rem",
    opacity: 0.9,
    lineHeight: 1.45,
  };

  const button = {
    marginTop: "12px",
    padding: "10px 14px",
    borderRadius: "999px",
    border: "none",
    background: "linear-gradient(135deg, #22d3ee, #6366f1)",
    color: "#020617",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
  };

  const nameInputWrapper = {
    marginTop: "14px",
    padding: "10px 14px",
    borderRadius: "999px",
    background: "rgba(15,23,42,0.9)",
    border: "1px solid rgba(148,163,184,0.45)",
    display: "flex",
    gap: "10px",
    alignItems: "center",
    maxWidth: "340px",
  };

  const nameInput = {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "#f1f5f9",
    outline: "none",
    fontSize: "0.9rem",
  };

  return (
    <div style={page}>
      <h1 style={{ fontSize: "1.4rem", marginBottom: "12px" }}>Account</h1>
      <p style={{ fontSize: "0.9rem", opacity: 0.8, marginBottom: "24px" }}>
        Basic settings for how Resonifi works on this device.
      </p>

      {/* ---- Device profile ---- */}
      <section style={card}>
        <h2 style={cardTitle}>Your device profile</h2>
        <p style={small}>
          Resonifi stays focused on your daily check-ins, not your identity.
          No login or cloud account required.
        </p>

        <ul style={{ marginTop: "10px", marginLeft: "14px" }}>
          <li style={small}>Your check-ins, journal entries, and cycle data stay on this device.</li>
          <li style={small}>Deleting the app clears your stored data.</li>
          <li style={small}>Future versions may support backups and sync.</li>
        </ul>

        {/* ---- Name input ---- */}
        <div style={nameInputWrapper}>
          <span style={{ opacity: 0.8 }}>Name</span>
          <input
            type="text"
            placeholder="Optional"
            value={userName}
            onChange={handleNameChange}
            style={nameInput}
          />
        </div>
      </section>

      {/* ---- Experience onboarding ---- */}
      <section style={card}>
        <h2 style={cardTitle}>Experience Resonifi</h2>
        <p style={small}>
          Preview how new users are introduced to Resonifi. Useful for sharing the app with others.
        </p>

        {/* FIXED — points to real onboarding route */}
        <button style={button} onClick={() => navigate("/onboarding")}>
          See how Resonifi works
        </button>
      </section>

      {/* ---- Cycle tracking ---- */}
      <section style={card}>
        <h2 style={cardTitle}>Cycle tracking</h2>
        <p style={small}>
          When enabled, Resonifi shows a Cycle button on your Home screen and uses private cycle data
          on this device to predict key cycle moments.
        </p>

        <label style={{ display: "flex", gap: "10px", marginTop: "14px", alignItems: "center" }}>
          <input
            type="checkbox"
            checked={cycleEnabled}
            onChange={toggleCycle}
            style={{ width: "18px", height: "18px" }}
          />
          <span style={small}>Enable cycle tracking features</span>
        </label>

        <p style={{ ...small, color: "#f87171", marginTop: "8px" }}>
          Resonifi does not store or send reproductive data to any server. All data stays on
          this device only.
        </p>
      </section>

      {/* ---- Data & privacy ---- */}
      <section style={card}>
        <h2 style={cardTitle}>Data & privacy</h2>
        <p style={small}>
          Resonifi is a reflection tool. Your goal is to notice patterns, not build an ad profile.
        </p>

        <ul style={{ marginTop: "10px", marginLeft: "14px" }}>
          <li style={small}>Your data never leaves this device.</li>
          <li style={small}>No online account is required.</li>
          <li style={small}>Future versions will let you export or delete your data.</li>
        </ul>
      </section>
    </div>
  );
}
