// src/App.jsx

import React from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Home from "./pages/Home";
import DailyCheckinPage from "./pages/DailyCheckinPage";
import Insights from "./pages/Insights";
import Journal from "./pages/Journal";
import CycleTracking from "./pages/CycleTracking";
import Account from "./pages/Account";
import Onboarding from "./pages/Onboarding";
import PillarDetail from "./pages/PillarDetail";
import InsightsWhy from "./pages/InsightsWhy";
import Landing from "./pages/Landing";
import BottomNav from "./components/BottomNav";

export default function App() {
  const location = useLocation();

  const appContainer = {
    minHeight: "100vh",
    backgroundColor: "#020617",
    color: "#f9fafb",
    paddingBottom: "72px", // space for the fixed bottom nav (when shown)
    boxSizing: "border-box",
  };

  // Hide the in-app bottom nav on the public landing page
  const hideBottomNav = location.pathname === "/";

  return (
    <div style={appContainer}>
      <Routes>
        {/* Public marketing / landing page */}
        <Route path="/" element={<Landing />} />

        {/* Core app lives under /app */}
        <Route path="/app" element={<Home />} />
        <Route path="/home" element={<Navigate to="/app" replace />} />

        {/* App pages */}
        <Route path="/check-in" element={<DailyCheckinPage />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/cycle-tracking" element={<CycleTracking />} />
        <Route path="/account" element={<Account />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Pillar detail + insights explainer */}
        <Route path="/pillar/:pillarId" element={<PillarDetail />} />
        <Route path="/insights-why" element={<InsightsWhy />} />

        {/* Catch-all: send unknown routes to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Show bottom nav only inside the app, not on the public landing */}
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}
