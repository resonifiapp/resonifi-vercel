// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AppShell from "./components/AppShell.jsx";
import Landing from "./pages/Landing";

// Pages that exist in your project
import Home from "./pages/Home.jsx";
import CheckIn from "./pages/DailyCheckinPage.jsx";
import Insights from "./pages/Insights.jsx";
import Account from "./pages/Account.jsx";        // Profile / settings page
import Onboarding from "./pages/Onboarding.jsx";  // Guided walkthrough
import CycleTracking from "./pages/CycleTracking.jsx";
import PillarDetail from "./pages/PillarDetail.jsx";

export default function App() {
  return (
    <Routes>
      {/* Landing – no bottom nav */}
      <Route
        path="/"
        element={
          <AppShell hideBottomNav={true}>
            <Landing />
          </AppShell>
        }
      />

      {/* Home */}
      <Route
        path="/home"
        element={
          <AppShell>
            <Home />
          </AppShell>
        }
      />

      {/* Home alias for BottomNav ("/app" → Home) */}
      <Route
        path="/app"
        element={
          <AppShell>
            <Home />
          </AppShell>
        }
      />

      {/* Check-in */}
      <Route
        path="/check-in"
        element={
          <AppShell>
            <CheckIn />
          </AppShell>
        }
      />

      {/* Cycle Tracking */}
      <Route
        path="/cycle-tracking"
        element={
          <AppShell>
            <CycleTracking />
          </AppShell>
        }
      />

      {/* Insights */}
      <Route
        path="/insights"
        element={
          <AppShell>
            <Insights />
          </AppShell>
        }
      />

      {/* Account / Profile page */}
      <Route
        path="/account"
        element={
          <AppShell>
            <Account />
          </AppShell>
        }
      />

      {/* Onboarding walkthrough (from Landing or Account) */}
      <Route
        path="/onboarding"
        element={
          <AppShell hideBottomNav={true}>
            <Onboarding />
          </AppShell>
        }
      />

      {/* Pillar detail pages */}
      <Route
        path="/pillar/:pillarId"
        element={
          <AppShell>
            <PillarDetail />
          </AppShell>
        }
      />

      {/* Fallback – anything unknown goes back to Landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
