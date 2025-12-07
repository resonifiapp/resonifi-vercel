// src/pages/Journal.jsx

import React, { useState, useEffect } from "react";

/* 🔹 Plausible helper (safe call) */
function track(eventName) {
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible(eventName, { props: { ts: Date.now() } });
  }
}

const JOURNAL_KEY = "resonifi_journal_entries_v1";

export default function Journal() {
  const [entries, setEntries] = useState([]);

  /* 🔹 Fire analytics event on page open */
  useEffect(() => {
    track("journal_page_opened");
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(JOURNAL_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setEntries(Array.isArray(parsed) ? parsed : []);
    } catch (err) {
      console.error("Error loading journal entries", err);
      setEntries([]);
    }
  }, []);

  const page = {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "80px 16px",
    color: "white",
  };

  const title = {
    fontSize: "32px",
    fontWeight: 700,
    marginBottom: "8px",
  };

  const subtitle = {
    fontSize: "14px",
    color: "#a8b3cf",
    marginBottom: "32px",
  };

  const emptyText = {
    fontSize: "14px",
    color: "#64748b",
    marginTop: "24px",
  };

  const card = {
    backgroundColor: "#0d1529",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "16px",
  };

  const cardTitle = {
    fontSize: "18px",
    fontWeight: 600,
    marginBottom: "8px",
  };

  const cardBody = {
    fontSize: "14px",
    lineHeight: "1.55",
    marginBottom: "12px",
    whiteSpace: "pre-wrap",
  };

  const cardDate = {
    fontSize: "12px",
    color: "#94a3b8",
  };

  return (
    <div style={page}>
      <h1 style={title}>Journal</h1>
      <p style={subtitle}>
        See your saved reflections. New entries are added from the Daily Journal
        screen.
      </p>

      {entries.length === 0 ? (
        <p style={emptyText}>
          No journal entries yet. Write your first one in the Daily Journal tab.
        </p>
      ) : (
        entries.map((entry, index) => (
          <div key={index} style={card}>
            {entry.title?.trim() !== "" && (
              <div style={cardTitle}>{entry.title}</div>
            )}

            {entry.body?.trim() !== "" && (
              <div style={cardBody}>{entry.body}</div>
            )}

            <div style={cardDate}>
              {new Date(entry.timestamp).toLocaleString()}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
