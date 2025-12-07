// src/App.jsx

import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import AppShell from "./components/AppShell";

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

export default function App() {
  const location = useLocation();

  // Fire Plausible pageview on route change
  useEffect(() => {
    try {
      if (
        typeof window !== "undefined" &&
        typeof window.plausible === "function"
      ) {
        window.plausible("pageview", {
          props: {
            path: location.pathname,
          },
        });
      }
    } catch (err) {
      console.error("Plausible tracking error:", err);
    }
  }, [location.pathname, location.search]);

  // Hide the in-app bottom nav on the public landing page
  const hideBottomNav = location.pathname === "/";

  return (
    <AppShell hideBottomNav={hideBottomNav}>
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
    </AppShell>
  );
}
