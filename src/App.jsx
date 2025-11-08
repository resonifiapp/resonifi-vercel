import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";

// Your original Daily Check-in lives at src/DailyCheckin.jsx (per your sidebar)
import DailyCheckin from "./DailyCheckin.jsx";

// If you later add real files under src/pages/, swap these placeholders:
function Insights() { return <main className="p-6">Insights</main>; }
function Support() { return <main className="p-6">Support</main>; }
function Profile() { return <main className="p-6">Profile</main>; }

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white">
      {/* Top bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="text-lg font-semibold">Resonifi™</div>
        <nav className="flex items-center gap-6 text-white/80">
          <Link to="/DailyCheckin">Check-In</Link>
          <Link to="/Insights">Insights</Link>
          <Link to="/Support">Support</Link>
          <Link to="/Profile">Profile</Link>
        </nav>
      </header>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Navigate to="/DailyCheckin" replace />} />
        <Route path="/DailyCheckin" element={<DailyCheckin />} />
        <Route path="/Insights" element={<Insights />} />
        <Route path="/Support" element={<Support />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/DailyCheckin" replace />} />
      </Routes>

      {/* Footer (optional) */}
      <footer className="mt-10 px-6 py-6 text-xs text-white/40">
        © {new Date().getFullYear()} Resonifi Wellness Inc.
      </footer>
    </div>
  );
}
