// src/pages/Onboarding.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const steps = [
  {
    id: 1,
    title: "Welcome to Resonifi",
    tag: "Big picture",
    body:
      "Resonifi is a simple daily check in tool. It helps you see how your inner and outer life are adding up over time, without judgement, advice, or noise.",
    bullets: [
      "Built for real life, not perfection",
      "Short daily reflections, not a therapy session",
      "Your data stays on your account, it is your story",
    ],
  },

  // MINSPAN STEP
  {
    id: 2,
    title: "What Mindspan Really Means",
    tag: "Clarity",
    body:
      "Mindspan is the stability of your inner world over time. It is the space between stimulus and response. It is where good decisions, emotional balance, and personal clarity live.",
    bullets: [
      "Mindspan grows as your awareness grows",
      "Better clarity leads to better choices",
      "Your Wellness Index reflects Mindspan over time",
    ],
  },

  {
    id: 3,
    title: "Your five pillars",
    tag: "Framework",
    body:
      "Every day, you check in on five core pillars of your life. Together, they make up your overall Wellness Index.",
    bullets: [
      "Emotional: mood, stress, resilience, and your inner world",
      "Physical: energy, movement, rest, and how your body feels",
      "Spiritual: connection, meaning, purpose, and bigger than me",
      "Financial: stability, control, and confidence with money",
      "Digital wellness: screen time, online noise, and your relationship with tech",
    ],
  },
  {
    id: 4,
    title: "Daily check ins and the Wellness Index",
    tag: "How it works",
    body:
      "Each check in is a small snapshot of your day. Resonifi turns those snapshots into a simple Wellness Index you can feel, not obsess over.",
    bullets: [
      "Answer quick questions for each pillar using sliders",
      "Add a short note or reflection if you like",
      "Your latest check in updates the Index on your Home screen",
    ],
  },
  {
    id: 5,
    title: "Your data, your pace",
    tag: "Safety and privacy",
    body:
      "Resonifi is a reflection tool, not a crisis service. It is here to help you notice patterns, not to turn your life into data for advertisers.",
    bullets: [
      "Check ins are stored privately in your own account on this device",
      "We do not sell reproductive or wellness data",
      "You can pause, skip days, or stop any time and pick it back up later",
    ],
  },
];

function StepDot({ active }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: active ? "14px" : "8px",
        height: "8px",
        borderRadius: "999px",
        margin: "0 4px",
        background: active
          ? "rgba(176, 144, 255, 1)"
          : "rgba(176, 144, 255, 0.35)",
        transition: "all 0.2s ease",
      }}
    />
  );
}

function Onboarding() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const step = steps[current];

  const goNext = () => {
    if (current < steps.length - 1) {
      setCurrent(current + 1);
    } else {
      navigate("/home");   // UPDATED
    }
  };

  const goBack = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const handleSkip = () => {
    navigate("/home");    // UPDATED
  };

  const isLast = current === steps.length - 1;

  const showFooterLine = isLast;

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "4.5rem 1.5rem 2rem",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "720px" }}>
        
        {/* Header */}
        <header style={{ marginBottom: "1.5rem" }}>
          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: 600,
              marginBottom: "0.25rem",
            }}
          >
            Getting started with Resonifi
          </h1>
          <p
            style={{
              fontSize: "0.9rem",
              opacity: 0.7,
            }}
          >
            A quick walkthrough of how Resonifi works before you start tracking your own days.
          </p>
        </header>

        {/* Card */}
        <section
          style={{
            background:
              "radial-gradient(circle at top left, rgba(110, 86, 255, 0.35), rgba(12, 18, 40, 0.95))",
            borderRadius: "1.25rem",
            padding: "1.6rem 1.5rem 1.4rem",
            border: "1px solid rgba(140, 120, 255, 0.28)",
            boxShadow: "0 22px 60px rgba(0, 0, 0, 0.55)",
          }}
        >
          {/* Step header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "0.9rem",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  opacity: 0.75,
                  marginBottom: "0.15rem",
                }}
              >
                Step {current + 1} of {steps.length} · {step.tag}
              </div>
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 600,
                }}
              >
                {step.title}
              </h2>
            </div>

            <button
              onClick={handleSkip}
              style={{
                fontSize: "0.8rem",
                opacity: 0.7,
                border: "none",
                background: "transparent",
                color: "#ffffff",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Skip for now
            </button>
          </div>

          <p
            style={{
              fontSize: "0.9rem",
              opacity: 0.9,
              marginBottom: "0.9rem",
              lineHeight: 1.45,
            }}
          >
            {step.body}
          </p>

          {/* Bullets */}
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              fontSize: "0.88rem",
              opacity: 0.95,
            }}
          >
            {step.bullets.map((b, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  marginBottom: "0.45rem",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    marginTop: "0.35rem",
                    marginRight: "0.6rem",
                    borderRadius: "999px",
                    background: "rgba(186, 160, 255, 1)",
                    flexShrink: 0,
                  }}
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div
            style={{
              marginTop: "1.2rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            {/* Step dots */}
            <div>
              {steps.map((s, i) => (
                <StepDot key={s.id} active={i === current} />
              ))}
            </div>

            {/* Nav buttons */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={goBack}
                disabled={current === 0}
                style={{
                  padding: "0.55rem 0.9rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(160, 160, 185, 0.6)",
                  background:
                    current === 0 ? "transparent" : "rgba(12, 18, 40, 0.9)",
                  color:
                    current === 0
                      ? "rgba(255,255,255,0.3)"
                      : "#ffffff",
                  cursor: current === 0 ? "default" : "pointer",
                  fontSize: "0.8rem",
                }}
              >
                Back
              </button>

              <button
                onClick={goNext}
                style={{
                  padding: "0.55rem 1.3rem",
                  borderRadius: "999px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, rgba(167, 130, 255, 1), rgba(104, 208, 255, 1))",
                  color: "#050510",
                  fontWeight: 600,
                  fontSize: "0.83rem",
                  cursor: "pointer",
                }}
              >
                {isLast ? "Finish and go to Home" : "Next"}
              </button>
            </div>
          </div>
        </section>

        {/* Footer line on final step */}
        {showFooterLine && (
          <p
            style={{
              marginTop: "1rem",
              fontSize: "0.8rem",
              opacity: 0.7,
              textAlign: "center",
            }}
          >
            Resonifi is your Mindspan OS.
          </p>
        )}

        {/* Bottom static note */}
        <p
          style={{
            marginTop: "1rem",
            fontSize: "0.75rem",
            opacity: 0.6,
            textAlign: "center",
          }}
        >
          You can revisit this walkthrough any time from your Profile screen.
        </p>

      </div>
    </div>
  );
}

export default Onboarding;
