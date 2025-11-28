// src/pages/DailyJournal.jsx

import React, { useState } from "react";

const JOURNAL_KEY = "resonifi_journal_entries_v1";

export default function DailyJournal() {
  const [title, setTitle] = useState("");
  const [entry, setEntry] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  // ---- Styles ----
  const page = {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "80px 16px",
    color: "white",
  };

  const titleStyle = {
    fontSize: "32px",
    fontWeight: 700,
    marginBottom: "8px",
  };

  const subtitle = {
    fontSize: "14px",
    color: "#a8b3cf",
    marginBottom: "32px",
  };

  const label = {
    display: "block",
    fontSize: "14px",
    fontWeight: 500,
    marginBottom: "8px",
  };

  const input = {
    width: "100%",
    borderRadius: "999px",
    border: "1px solid #1e293b",
    backgroundColor: "#020617",
    color: "#e5e7eb",
    padding: "10px 14px",
    fontSize: "14px",
    outline: "none",
    marginBottom: "16px",
  };

  const noteArea = {
    width: "100%",
    minHeight: "120px",
    resize: "vertical",
    borderRadius: "12px",
    border: "1px solid #1e293b",
    padding: "10px 12px",
    fontSize: "14px",
    backgroundColor: "#020617",
    color: "#e5e7eb",
    outline: "none",
    marginBottom: "20px",
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
    marginTop: "4px",
  };

  const savedText = {
    marginTop: "10px",
    fontSize: "13px",
    color: "#22c55e",
    fontWeight: 500,
  };

  // ---- Save handler ----
  function handleSave() {
    const trimmedTitle = title.trim();
    const trimmedEntry = entry.trim();

    if (!trimmedTitle && !trimmedEntry) return;

    const newEntry = {
      id: Date.now(),
      title: trimmedTitle,
      body: trimmedEntry,
      timestamp: new Date().toISOString(),
    };

    try {
      const raw = window.localStorage.getItem(JOURNAL_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      const existing = Array.isArray(parsed) ? parsed : [];
      const updated = [newEntry, ...existing];

      window.localStorage.setItem(JOURNAL_KEY, JSON.stringify(updated));
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1500);
    } catch (err) {
      console.error("Error saving journal entry", err);
    }

    setTitle("");
    setEntry("");
  }

  return (
    <div style={page}>
      <h1 style={titleStyle}>Daily Journal</h1>
      <p style={subtitle}>
        Capture one small snapshot of today. Your entries will show up on the
        Journal tab so you can look back over time.
      </p>

      <label style={label}>Title</label>
      <input
        style={input}
        type="text"
        placeholder="Give this entry a short title (optional)..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label style={label}>Entry</label>
      <textarea
        style={noteArea}
        placeholder="What actually mattered today?"
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
      />

      <button type="button" style={saveButton} onClick={handleSave}>
        Save Journal
      </button>

      {justSaved && <div style={savedText}>Saved to your Journal.</div>}
    </div>
  );
}
