// src/pages/InsightsWhy.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

function InsightsWhy() {
  const navigate = useNavigate();

  const pageStyle = {
    minHeight: "100vh",
    padding: "4.5rem 1.5rem 6rem",
    display: "flex",
    justifyContent: "center",
  };

  const innerStyle = {
    width: "100%",
    maxWidth: "800px",
  };

  const cardStyle = {
    background:
      "radial-gradient(circle at top left, rgba(110, 86, 255, 0.35), rgba(12, 18, 40, 0.95))",
    borderRadius: "1.25rem",
    padding: "1.8rem 1.6rem 1.6rem",
    border: "1px solid rgba(140, 120, 255, 0.28)",
    boxShadow: "0 22px 60px rgba(0, 0, 0, 0.55)",
  };

  const headingStyle = {
    fontSize: "1.5rem",
    fontWeight: 600,
    marginBottom: "0.9rem",
  };

  const pStyle = {
    fontSize: "0.95rem",
    opacity: 0.9,
    lineHeight: 1.6,
    marginBottom: "0.8rem",
  };

  const listStyle = {
    margin: "0.9rem 0 0",
    paddingLeft: "1.1rem",
    fontSize: "0.95rem",
    opacity: 0.95,
    lineHeight: 1.6,
  };

  const buttonRowStyle = {
    marginTop: "1.3rem",
  };

  const buttonStyle = {
    padding: "0.6rem 1.3rem",
    borderRadius: "999px",
    border: "none",
    background:
      "linear-gradient(135deg, rgba(167, 130, 255, 1), rgba(104, 208, 255, 1))",
    color: "#050510",
    fontWeight: 600,
    fontSize: "0.85rem",
    cursor: "pointer",
  };

  const handleBack = () => {
    navigate("/insights");
  };

  return (
    <div style={pageStyle}>
      <div style={innerStyle}>
        <div style={cardStyle}>
          <h1 style={headingStyle}>Why patterns need a little time</h1>

          <p style={pStyle}>
            Resonifi does not guess from one rough day. It waits for a bit of history so it
            can reflect what is really happening in your life.
          </p>

          <ol style={listStyle}>
            <li>
              <strong>It looks at about two weeks of check-ins.</strong>{" "}
              The Insights page focuses on roughly the last couple of weeks. Life is noisy.
              You might miss a day, have a great weekend, or go through a stressful moment.
            </li>
            <li>
              <strong>It compares two short windows.</strong>{" "}
              Resonifi groups recent check-ins into small windows and compares them.
              If the change is big enough, a category shows up as lifting or needing care.
            </li>
            <li>
              <strong>It protects you from noisy “insights”.</strong>{" "}
              Without enough history, almost any day can look like a trend. Waiting for a
              bit of consistent data keeps the system honest, not jumpy.
            </li>
            <li>
              <strong>What you can do in the meantime.</strong>{" "}
              The most powerful thing you can do is simply keep checking in. A week or two
              of regular entries gives Resonifi enough context to see gentle movements in
              your Wellness Categories.
            </li>
          </ol>

          <div style={buttonRowStyle}>
            <button type="button" style={buttonStyle} onClick={handleBack}>
              ← Back to Insights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InsightsWhy;
