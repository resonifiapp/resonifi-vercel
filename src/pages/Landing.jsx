// src/pages/Landing.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/resonifi-logo-landing.png";
import "./Landing.css";

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    window.plausible?.("Landing Viewed");
  }, []);

  return (
    <div className="landing-page">
      <div className="landing-frame">

        {/* LOGO ROW (centered, no pill) */}
        <div className="landing-logo-row">
          <img src={logo} alt="Resonifi logo" className="landing-logo" />
        </div>

        {/* MAIN CONTENT */}
        <div className="landing-columns">
          
          {/* LEFT COLUMN — TEXT */}
          <div className="landing-left">
            <p className="landing-tag">
              FOR PEOPLE WHO FEEL MORE THAN THEY TRACK
            </p>

            <h1 className="landing-h1">
              Track how life actually feels, not just steps and sleep.
            </h1>

            <p className="landing-body">
              Resonifi is a simple daily check-in that turns your mood, energy,
              meaning, money, and digital life into one Wellness Index™ you can
              feel at a glance.
            </p>

            <div className="landing-buttons">
              <button
                type="button"
                className="landing-btn landing-btn-primary"
                onClick={() => {
                  window.plausible?.("Landing Open App Clicked");
                  navigate("/app");
                }}
              >
                Open the app
              </button>

              <button
                type="button"
                className="landing-btn landing-btn-secondary"
                onClick={() => {
                  window.plausible?.("Landing What Is Resonifi Clicked");
                  navigate("/onboarding");
                }}
              >
                What is Resonifi?
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN — WELLNESS CARD */}
          <div className="landing-right">
            <div className="landing-card">
              <p className="landing-card-label">AT A GLANCE</p>
              <h2 className="landing-card-title">What is the Wellness Index?</h2>

              <p className="landing-card-body">
                Every day you slide five pillars from 1 to 10. Resonifi blends
                them into a single score so you can feel how things are trending
                without getting lost in charts.
              </p>

              <div className="landing-ring-row">
                <div className="landing-ring-outer">
                  <div className="landing-ring-inner">72</div>
                </div>

                <div>
                  <p className="landing-ring-caption-top">
                    TODAY&apos;s SNAPSHOT
                  </p>
                  <p className="landing-ring-caption-bottom">
                    WELLNESS INDEX™
                  </p>
                </div>
              </div>

              <p className="landing-pillar-list">
                <strong>Emotional</strong> — mood, stress, resilience
                <br />
                <strong>Physical</strong> — energy, rest
                <br />
                <strong>Spiritual</strong> — meaning, purpose
                <br />
                <strong>Financial</strong> — stability, confidence
                <br />
                <strong>Digital</strong> — screen time, balance
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <p className="landing-founder-line">
          Built by a teacher who walked the Camino and wanted a calmer way to
          look at life than another productivity dashboard. No gamification, no
          streak shame — just honest check-ins that add up over time.
        </p>

        <p className="landing-footer">© 2025 Resonifi. All rights reserved.</p>

      </div>
    </div>
  );
}
