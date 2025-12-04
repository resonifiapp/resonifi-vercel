// src/App.jsx
import AppShell from "./components/AppShell";

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

  // Hide the in-app bottom nav on the public landing page
  const hideBottomNav = location.pathname === "/";

  return (
    <AppShell>
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

        {/* Catch-all: send unknown routes to app home */}
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>

      {/* Show bottom nav only inside the app, not on the public landing */}
      {!hideBottomNav && <BottomNav />}
    </AppShell>
  );
}
