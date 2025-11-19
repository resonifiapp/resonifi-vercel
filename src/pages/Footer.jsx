// src/components/Footer.jsx
import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        textAlign: "center",
        padding: "1.5rem 0 2rem",
        color: "rgba(255,255,255,0.55)", // soft neutral
        fontSize: "0.75rem",
        opacity: 0.85,
      }}
    >
      Resonifi Wellness Inc.™ — All data stays on this device. Nothing is stored or sold.
    </footer>
  );
}
