import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import DailyCheckin from "./DailyCheckin.jsx";
import Insights from "./pages/Insights.jsx";
import Support from "./pages/Support.jsx";
import Profile from "./pages/Profile.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white">
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="text-lg font-semibold">Resonifi™</div>
        <nav className="flex items-center gap-6 text-white/80">
          <Link to="/">Home</Link>
          <Link to="/DailyCheckin">Check-In</Link>
          <Link to="/Insights">Insights</Link>
          <Link to="/Support">Support</Link>
          <Link to="/Profile">Profile</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/DailyCheckin" element={<DailyCheckin />} />
        <Route path="/Insights" element={<Insights />} />
        <Route path="/Support" element={<Support />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
