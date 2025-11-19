// src/pages/Journal.jsx

import React, { useState, useEffect } from "react";

const STORAGE_KEY = "resonifi_journal_entries_v1";

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setEntries(parsed);
      }
    } catch (err) {
      console.error("Error loading journal entries", err);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (err) {
      console.error("Error saving journal entries", err);
    }
  }, [entries]);

  function handleSave() {
    const text = draft.trim();
    if (!text) {
      setError("Write a few lines before saving.");
      return;
    }

    const now = new Date().toISOString();
    const newEntry = {
      id: Date.now(),
      text,
      createdAt: now,
    };

    setEntries((prev) => [newEntry, ...prev]);
    setDraft("");
    setError("");
  }

  function handleDelete(id) {
    const confirmDelete = window.confirm("Delete this journal entry?");
    if (!confirmDelete) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function formatDate(isoString) {
    try {
      const d = new Date(isoString);
      return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }

  const container = {
    minHeight: "100vh",
    backgroundColor: "#020617",
    color: "#f8fafc",
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
    marginBottom: "18px",
  };

  const card = {
    backgroundColor: "#020617",
    borderRadius: "18px",
    border: "1px solid #1e293b",
    padding: "14px 16px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
    marginBottom: "20px",
  };

  const label = {
    fontSize: "13px",
    fontWeight: 500,
    marginBottom: "8px",
  };

  const textarea = {
    width: "100%",
    minHeight: "120px",
    resize: "vertical",
    borderRadius: "12px",
    border: "1px solid #1e293b",
    padding: "10px 12px",
    fontSize: "13px",
    backgroundColor: "#020617",
    color: "#e5e7eb",
    outline: "none",
  };

  const errorText = {
    fontSize: "12px",
    color: "#f97373",
    marginTop: "6px",
  };

  const saveButton = {
    marginTop: "12px",
    padding: "8px 16px",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
    background: "linear-gradient(135deg, #6366f1, #22d3ee)",
    color: "#f9fafb",
    boxShadow: "0 10px 24px rgba(79,70,229,0.5)",
  };

  const emptyBox = {
    marginTop: "10px",
    padding: "16px",
    borderRadius: "16px",
    border: "1px dashed #1e293b",
    backgroundColor: "#020617",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "13px",
  };

  const listContainer = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "6px",
  };

  const entryCard = {
    borderRadius: "16px",
    border: "1px solid #1e293b",
    backgroundColor: "#020617",
    padding: "12px 14px",
    boxShadow: "0 16px 36px rgba(0,0,0,0.5)",
  };

  const entryHeader = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px",
    gap: "8px",
  };

  const entryDate = {
    fontSize: "11px",
    color: "#9ca3af",
  };

  const deleteButton = {
    fontSize: "11px",
    color: "#f97373",
    border: "none",
    background: "transparent",
    cursor: "pointer",
  };

  const entryText = {
    fontSize: "13px",
    color: "#e5e7eb",
    whiteSpace: "pre-wrap",
  };

  return (
    <div style={container}>
      <h1 style={title}>Journal</h1>
      <p style={subtitle}>
        Capture a few lines about what sits behind your daily resonance.
      </p>

      {/* New entry card */}
      <div style={card}>
        <p style={label}>New entry</p>
        <textarea
          style={textarea}
          placeholder="Write about your day, a feeling, or something you noticed..."
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (error) setError("");
          }}
        />
        {error && <p style={errorText}>{error}</p>}
        <button type="button" style={saveButton} onClick={handleSave}>
          Save entry
        </button>
      </div>

      {/* Entries list */}
      {entries.length === 0 ? (
        <div style={emptyBox}>
          Nothing here yet. Your reflections will appear here after you start
          saving entries.
        </div>
      ) : (
        <div style={listContainer}>
          {entries.map((entry) => (
            <article key={entry.id} style={entryCard}>
              <div style={entryHeader}>
                <span style={entryDate}>{formatDate(entry.createdAt)}</span>
                <button
                  type="button"
                  style={deleteButton}
                  onClick={() => handleDelete(entry.id)}
                >
                  Delete
                </button>
              </div>
              <p style={entryText}>{entry.text}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
