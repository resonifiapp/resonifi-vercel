import React from "react";

export default function Support() {
  return (
    <div
      style={{
        maxWidth: "520px",
        margin: "40px auto",
        padding: "0 16px"
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          padding: "24px",
          borderRadius: "20px",
          boxShadow: "0 0 20px rgba(0,0,0,0.3)"
        }}
      >
        <h1 style={{ margin: "0 0 8px" }}>Support</h1>
        <p
          style={{
            margin: "0 0 20px",
            fontSize: "14px",
            opacity: 0.8
          }}
        >
          Resonifi is a reflection tool, not a crisis service.
        </p>

        <div
          style={{
            marginBottom: "18px",
            padding: "14px",
            borderRadius: "14px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.09)",
            fontSize: "13px",
            lineHeight: 1.5
          }}
        >
          <strong>If you feel unsafe or overwhelmed:</strong>
          <ul style={{ margin: "8px 0 0 18px", padding: 0 }}>
            <li>Call your local emergency number.</li>
            <li>
              Reach out to a trusted friend, family member, or professional.
            </li>
            <li>
              Use national or regional crisis lines available in your country.
            </li>
          </ul>
        </div>

        <div
          style={{
            fontSize: "13px",
            opacity: 0.85,
            lineHeight: 1.6
          }}
        >
          <p style={{ marginBottom: "10px" }}>
            Resonifi is here to help you notice patterns, build awareness, and
            support your wellness practice. It does not replace therapy, medical
            care, or professional advice.
          </p>
          <p style={{ marginBottom: 0 }}>
            In future versions, this page will include links to mental health
            resources and support options tailored to your region.
          </p>
        </div>
      </div>
    </div>
  );
}
