// src/App.jsx

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import DailyCheckinPage from "./pages/DailyCheckinPage";
import Insights from "./pages/Insights";
import Journal from "./pages/Journal";
import CycleTracking from "./pages/CycleTracking";
import Account from "./pages/Account";
import Onboarding from "./pages/Onboarding";

// ⭐ Pillar Detail
import PillarDetail from "./pages/PillarDetail";

// ⭐ NEW — Why patterns take two weeks
import InsightsWhy from "./pages/InsightsWhy";

import BottomNav from "./components/BottomNav";

export default function App() {
  const appContainer = {
    minHeight: "100vh",
    backgroundColor: "#020617",
    color: "#f9fafb",
    paddingBottom: "72px", // space for the fixed bottom nav
    boxSizing: "border-box",
  };

  return (
    <div style={appContainer}>
      <Routes>
        {/* Default route -> Home */}
        <Route path="/" element={<Home />} />

        {/* Redirect /home to / */}
        <Route path="/home" element={<Navigate to="/" replace />} />

        {/* Core app pages */}
        <Route path="/check-in" element={<DailyCheckinPage />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/cycle-tracking" element={<CycleTracking />} />
        <Route path="/account" element={<Account />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* ⭐ Full pillar detail page */}
        <Route path="/pillar/:pillarId" element={<PillarDetail />} />

        {/* ⭐ NEW — Why this takes about two weeks */}
        <Route path="/insights-why" element={<InsightsWhy />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Always show bottom nav */}
      <BottomNav />
    </div>
  );
}
