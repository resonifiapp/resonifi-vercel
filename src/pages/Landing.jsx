// src/pages/Landing.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/resonifi_logo.png";
import "./Landing.css";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-frame">

        {/* HEADER: logo + pill button */}
        <header className="landing-header-row">
          <img
            src={logo}
            alt="Resonifi logo"
            className="landing-logo"
          />

          <button
            type="button"
            className="landing-pill-btn"
            onClick={() => navigate("/onboarding")}
          >
            Discover Resonifi
          </button>
        </header>

        {/* MAIN CONTENT */}
        <main className="landing-columns">

          {/* LEFT SIDE */}
          <section className="landing-left">
            <p className="landing-tag">
              FOR PEOPLE WHO FEEL MORE THAN THEY TRACK
            </p>

            <h1 className="landing-h1">
              Your Wellness
              <br />
              Your Clarity
              <br />
              Your Mindspan
            </h1>

            <p className="landing-body">
              Resonifi helps you understand your internal world through small,
              meaningful daily reflections. Track your emotional, physical,
              spiritual, financial, and digital well being in one place.
            </p>

            <p className="landing-founder-line">
              Built by a teacher who walked the Camino and realized clarity
              comes from awareness, not willpower.
            </p>
          </section>

          {/* RIGHT SIDE */}
          <section className="landing-right">
            <div className="landing-card">
              <p className="landing-card-label">Your Wellness Index</p>

              <div className="landing-ring-row">
                <div className="landing-ring-outer">
                  <div className="landing-ring-inner">
                    72
                  </div>
                </div>

                <div>
                  <p className="landing-ring-caption-top">Current Index</p>
                  <p className="landing-ring-caption-bottom">Your Mindspan</p>
                </div>
              </div>

              <div className="landing-card-body">
                Measure how your five core pillars shift over time. Watch
                patterns emerge. Your Wellness Index is the simplest way to
                see your Mindspan in real time.
              </div>

              <ul className="landing-pillar-list">
                <li>• Emotional well being</li>
                <li>• Physical energy</li>
                <li>• Spiritual alignment</li>
                <li>• Financial confidence</li>
                <li>• Digital balance</li>
              </ul>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="landing-footer">
          © {new Date().getFullYear()} Resonifi. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
