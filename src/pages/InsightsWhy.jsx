// src/pages/InsightsWhy.jsx

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function InsightsWhy() {
  const navigate = useNavigate();

  // 🔸 Plausible tracking
  useEffect(() => {
    if (typeof window.plausible === "function") {
      window.plausible("view_insights_why");
    }
  }, []);

  const wrapper = {
    minHeight: "100vh",
    backgroundColor: "#020617", // slate-950
    color: "#f9fafb",
  };

  const page = {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "80px 16px 96px",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  };

  const title = {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 8,
  };

  const subtitle = {
    fontSize: 13,
    color: "#cbd5f5",
    marginBottom: 24,
  };

  const sectionTitle = {
    fontSize: 14,
    fontWeight: 600,
    marginTop: 16,
    marginBottom: 4,
  };

  const text = {
    fontSize: 13,
    color: "#e5e7eb",
    lineHeight: 1.6,
  };

  const buttonRow = {
    marginTop: 32,
  };

  const backButton = {
    padding: "8px 14px",
    borderRadius: 999,
    border: "1px solid rgba(148,163,184,0.7)",
    backgroundColor: "transparent",
    color: "#e5e7eb",
    fontSize: 13,
    cursor: "pointer",
  };

  return (
    <div style={wrapper}>
      <main style={page}>
        <h1 style={title}>Why patterns need a little time</h1>
        <p style={subtitle}>
          Resonifi does not guess from one rough day. It waits for a bit of
          history so it can reflect what is really happening in your life.
        </p>

        <section>
          <h2 style={sectionTitle}>1. It looks at about two weeks of check-ins</h2>
          <p style={text}>
            The Insights page focuses on roughly the last couple of weeks.
            Life is noisy. You might miss a day, have a great weekend, or go
            through a stressful moment. By looking at a stretch of time
            instead of a single day, Resonifi avoids overreacting to one
            blip.
          </p>
        </section>

        <section>
          <h2 style={sectionTitle}>2. It compares two small windows</h2>
          <p style={text}>
            Under the hood, Resonifi groups your recent check-ins into two
            short windows. It averages the scores in the most recent window
            and compares them with the window just before it. If the change
            is big enough, a category shows up as lifting or needing care.
          </p>
        </section>

        <section>
          <h2 style={sectionTitle}>3. It protects you from noisy “insights”</h2>
          <p style={text}>
            Without enough history, almost any day can look like a trend.
            That is why Resonifi waits until there is at least a bit of
            consistent data before it lights anything up. If things feel
            quiet at first, it is the system being honest, not broken.
          </p>
        </section>

        <section>
          <h2 style={sectionTitle}>4. What you can do in the meantime</h2>
          <p style={text}>
            The most powerful thing you can do is simply keep checking in. A
            week or two of regular entries gives Resonifi enough context to
            see gentle movements in your Wellness Categories. Your notes also
            help you remember what was happening on the days when things
            shifted.
          </p>
        </section>

        <div style={buttonRow}>
          <button
            type="button"
            style={backButton}
            onClick={() => navigate("/insights")}
          >
            ← Back to Insights
          </button>
        </div>
      </main>
    </div>
  );
}
