import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import DailyCheckin from "./pages/DailyCheckin.jsx";
import LiteCheckin from "./pages/LiteCheckin.jsx";
import Insights from "./pages/Insights.jsx";
import DailyJournal from "./pages/DailyJournal.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/checkin" element={<DailyCheckin />} />
      <Route path="/lite-checkin" element={<LiteCheckin />} />
      <Route path="/insights" element={<Insights />} />
      <Route path="/journal" element={<DailyJournal />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
