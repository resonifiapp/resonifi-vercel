import React from "react";
import { Outlet } from "react-router-dom";

/**
 * Resonifi Layout (Minimal App Shell)
 * - Removes the old top nav entirely
 * - Keeps consistent dark background
 * - Ensures bottom nav from each page stays visible
 * - Centers dashboard content with proper padding
 */

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Main scrollable content */}
      <div className="pb-20">
        <Outlet />
      </div>
    </div>
  );
}