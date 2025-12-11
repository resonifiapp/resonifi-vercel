// src/components/AppShell.jsx

import React from "react";
import BottomNav from "./BottomNav";

export default function AppShell({ children, hideBottomNav = false }) {
  return (
    <div className="app-shell">
      {/* Safe-area + main content */}
      <div className="app-safe-area app-main">
        {children}
      </div>

      {/* Bottom nav (hidden on landing page) */}
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}
