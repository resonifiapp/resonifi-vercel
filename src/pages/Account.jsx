// src/pages/Account.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NAME_KEY = "resonifi_user_name";
const PHOTO_KEY = "resonifi_user_photo";

export default function Account() {
  const navigate = useNavigate();

  const page = {
    backgroundColor: "#020617",
    color: "#f9fafb",
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
    marginBottom: "6px",
  };

  const subtitle = {
    fontSize: "13px",
    color: "#94a3b8",
    marginBottom: "20px",
  };

  const card = {
    background:
      "radial-gradient(circle at top left, rgba(56,189,248,0.14), transparent 55%), #020617",
    borderRadius: "18px",
    border: "1px solid #1e293b",
    padding: "16px 18px",
    marginBottom: "16px",
    boxShadow: "0 18px 40px rgba(15,23,42,0.65)",
  };

  const cardSimple = {
    ...card,
    backgroundColor: "#020617",
    backgroundImage: "none",
    boxShadow: "0 12px 30px rgba(15,23,42,0.7)",
  };

  const cardTitleRow = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "6px",
  };

  const cardIcon = {
    width: 32,
    height: 32,
    borderRadius: "999px",
    background:
      "radial-gradient(circle at 30% 0%, #22d3ee, #6366f1 55%, #020617)",
    boxShadow: "0 0 18px rgba(56,189,248,0.75)",
  };

  const cardTitle = {
    fontSize: "14px",
    fontWeight: 600,
  };

  const cardBody = {
    fontSize: "13px",
    color: "#cbd5f5",
    lineHeight: 1.5,
  };

  const small = {
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: "8px",
  };

  const link = {
    color: "#38bdf8",
    textDecoration: "underline",
    cursor: "pointer",
  };

  const primaryButton = {
    marginTop: "10px",
    padding: "8px 14px",
    borderRadius: "999px",
    border: "none",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    background: "linear-gradient(135deg, #6366f1, #22d3ee)",
    color: "#f9fafb",
    boxShadow: "0 10px 24px rgba(56,189,248,0.5)",
  };

  const checkboxRow = {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    marginTop: "8px",
    marginBottom: "8px",
    fontSize: "13px",
    color: "#e5e7eb",
  };

  const checkbox = {
    marginTop: "3px",
    cursor: "pointer",
  };

  const redText = {
    fontSize: "12px",
    color: "#f97373",
    marginTop: "6px",
  };

  const list = {
    marginTop: "6px",
    paddingLeft: "18px",
    fontSize: "12px",
    color: "#cbd5f5",
  };

  // --- Profile styles ---
  const profileRow = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  };

  const avatarOuter = {
    width: 64,
    height: 64,
    borderRadius: "999px",
    background:
      "radial-gradient(circle at 30% 0%, #22d3ee, #6366f1 55%, #020617)",
    boxShadow: "0 0 24px rgba(56,189,248,0.9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  };

  const avatarImg = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  const avatarInitial = {
    fontSize: "24px",
    fontWeight: 600,
    color: "#e5e7eb",
  };

  const profileTextCol = {
    flex: 1,
  };

  const nameInput = {
    marginTop: "6px",
    width: "100%",
    padding: "8px 10px",
    borderRadius: "999px",
    border: "1px solid #1e293b",
    backgroundColor: "#020617",
    color: "#e5e7eb",
    fontSize: "13px",
    outline: "none",
  };

  const uploadButton = {
    marginTop: "8px",
    padding: "6px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(148,163,184,0.8)",
    backgroundColor: "rgba(15,23,42,0.9)",
    color: "#e5e7eb",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
  };

  // --- State ---
  const [cycleEnabled, setCycleEnabled] = useState(false);
  const [userName, setUserName] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState(null);

  useEffect(() => {
    try {
      // Name
      const storedName = window.localStorage.getItem(NAME_KEY);
      if (storedName) {
        setUserName(storedName);
      }

      // Photo
      const storedPhoto = window.localStorage.getItem(PHOTO_KEY);
      if (storedPhoto) {
        setPhotoDataUrl(storedPhoto);
      }

      // Cycle toggle
      const rawCycle = window.localStorage.getItem("resonifi_cycle_enabled");
      if (rawCycle !== null) {
        setCycleEnabled(rawCycle === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  function handleToggleCycle(enabled) {
    setCycleEnabled(enabled);
    try {
      window.localStorage.setItem(
        "resonifi_cycle_enabled",
        enabled ? "true" : "false"
      );
    } catch {
      // ignore
    }
  }

  function handleNameChange(e) {
    const value = e.target.value;
    setUserName(value);
    try {
      window.localStorage.setItem(NAME_KEY, value);
    } catch {
      // ignore
    }
  }

  function handlePhotoChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setPhotoDataUrl(result);
        try {
          window.localStorage.setItem(PHOTO_KEY, result);
        } catch {
          // ignore
        }
      }
    };
    reader.readAsDataURL(file);
  }

  const initialLetter =
    userName && userName.trim().length > 0
      ? userName.trim().charAt(0).toUpperCase()
      : "•";

  return (
    <div style={page}>
      <h1 style={title}>Account</h1>
      <p style={subtitle}>
        Basic settings for how Resonifi works on <strong>this device</strong>.
        No login, no profile to manage — just the knobs that actually matter.
      </p>

      {/* Profile card: name + photo */}
      <section style={card}>
        <div style={profileRow}>
          <div style={avatarOuter}>
            {photoDataUrl ? (
              <img src={photoDataUrl} alt="Profile" style={avatarImg} />
            ) : (
              <span style={avatarInitial}>{initialLetter}</span>
            )}
          </div>
          <div style={profileTextCol}>
            <p style={cardTitle}>Your profile on this device</p>
            <p style={{ ...cardBody, marginTop: 2 }}>
              Add a name and photo so your Home screen feels a little more
              like you. This stays on this device only.
            </p>
            <input
              type="text"
              value={userName}
              onChange={handleNameChange}
              placeholder="Add your name"
              style={nameInput}
            />
            <div style={{ marginTop: "8px" }}>
              <label style={uploadButton}>
                Choose photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>
            <p style={small}>
              Your name and photo are stored locally in your browser&apos;s
              storage. Clearing site data will remove them.
            </p>
          </div>
        </div>
      </section>

      {/* Device profile */}
      <section style={card}>
        <div style={cardTitleRow}>
          <div style={cardIcon} />
          <div>
            <p style={cardTitle}>Your device profile</p>
            <p style={{ ...cardBody, marginTop: 2 }}>
              Resonifi stays focused on your daily check-ins, not your
              identity.
            </p>
          </div>
        </div>
        <p style={cardBody}>
          Right now, Resonifi runs as a <strong>device-based profile</strong>:
        </p>
        <ul style={list}>
          <li>No username, email, or account is required.</li>
          <li>
            Your check-ins, journal, and cycle data are stored locally on this
            device.
          </li>
          <li>
            Deleting the app or clearing browser storage will remove your data
            from this device.
          </li>
        </ul>
        <p style={small}>
          In future versions, you&apos;ll be able to{" "}
          <span style={{ fontWeight: 500 }}>
            opt in to private backups and sync
          </span>{" "}
          across devices — only if and when you want it.
        </p>
      </section>

      {/* Experience Resonifi / onboarding preview */}
      <section style={cardSimple}>
        <p style={cardTitle}>Experience Resonifi</p>
        <p style={cardBody}>
          Preview how new users are introduced to the platform. This is the same
          guided flow your users will see when they first open Resonifi.
        </p>
        <button
          type="button"
          style={primaryButton}
          onClick={() => navigate("/onboarding")}
        >
          See how Resonifi works
        </button>
        <p style={small}>
          Useful if you&apos;re sharing Resonifi with someone and want to walk
          them through the first-time experience.
        </p>
      </section>

      {/* Cycle tracking */}
      <section style={cardSimple}>
        <p style={cardTitle}>Cycle tracking</p>
        <div style={checkboxRow}>
          <input
            type="checkbox"
            checked={cycleEnabled}
            onChange={(e) => handleToggleCycle(e.target.checked)}
            style={checkbox}
          />
          <span>
            <strong>Enable cycle tracking features</strong>
            <br />
            When this is on, Resonifi shows a <strong>Cycle</strong> button on
            your Home screen and uses private cycle dates on this device to
            predict key cycle moments.
          </span>
        </div>
        <p style={small}>
          If you turn this <strong>off</strong>, cycle tracking features are
          hidden and cycle dates are not used. You can turn it back on at any
          time.
        </p>
        <p style={redText}>
          Resonifi is a Canadian company. We do <strong>not</strong> store, sell
          or transmit reproductive data to our servers. Cycle information stays
          on this device only.
        </p>
      </section>

      {/* Data & privacy */}
      <section style={cardSimple}>
        <p style={cardTitle}>Data & privacy</p>
        <p style={cardBody}>
          Resonifi is a reflection tool. The goal is to help you notice patterns
          over time, not to build an ad profile or sell your information.
        </p>
        <ul style={list}>
          <li>
            Your check-ins, journal entries, and cycle dates are stored in{" "}
            <strong>local storage</strong> on this device.
          </li>
          <li>
            Today&apos;s version does <strong>not</strong> require an online
            account, and your data is not synced to a cloud service.
          </li>
          <li>
            You&aposre always free to export or delete your data in future
            versions when those tools ship.
          </li>
        </ul>
        <p style={small}>
          Have questions or concerns about data? You can reach out to us at{" "}
          <span style={link}>support@resonifi.app</span> and we&apos;ll give you
          a direct, human answer.
        </p>
      </section>
    </div>
  );
}
