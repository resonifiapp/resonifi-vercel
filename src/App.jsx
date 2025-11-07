import React from "react";
import DailyCheckin from '../DailyCheckin.jsx';


export default function App() {
  return (
    <div
      style={{
        fontFamily:
          "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        padding: 20,
      }}
    >
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Resonifi</h1>
        <p style={{ margin: "6px 0 0", opacity: 0.8 }}>
          Clean Vercel/Vite environment — UI bootstrapped.
        </p>
      </header>

      <section
        style={{
          border: "1px solid #eee",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Daily Check-in</h2>
        <DailyCheckin />
      </section>
    </div>
  );
}
