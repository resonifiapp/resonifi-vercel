import React, { useEffect, useState } from "react";
import Home from "./pages/Home.jsx";
import Profile from "./pages/Profile.jsx";
import Support from "./pages/Support.jsx";
import Insights from "./pages/Insights.jsx";
import CheckIn from "./pages/CheckIn.jsx"; // NEW

// Minimal hash router (no packages)
function useHashRoute(defaultRoute = "/home") {
  const read = () => (window.location.hash.replace(/^#/, "") || defaultRoute);
  const [route, setRoute] = useState(read());

  useEffect(() => {
    const onHash = () => setRoute(read());
    window.addEventListener("hashchange", onHash);
    if (!window.location.hash) window.location.hash = `#${defaultRoute}`;
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return route;
}

export default function App() {
  const route = useHashRoute("/home");

  const Page = (() => {
    switch (route) {
      case "/home":     return Home;
      case "/checkin":  return CheckIn;     // NEW
      case "/insights": return Insights;
      case "/profile":  return Profile;
      case "/support":  return Support;
      default:          return Home;
    }
  })();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top nav */}
      <nav className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <a href="#/home" className="flex items-center gap-2">
            <span className="inline-block h-6 w-6 rounded-full bg-gradient-to-br from-cyan-300 via-teal-300 to-violet-400" />
            <span className="font-semibold tracking-tight">Resonifi</span>
          </a>
          <div className="flex items-center gap-5 text-sm">
            <a href="#/home" className="hover:text-cyan-300 text-slate-200">Home</a>
            <a href="#/checkin" className="hover:text-cyan-300 text-slate-200">Check-In</a>
            <a href="#/insights" className="hover:text-cyan-300 text-slate-200">Insights</a>
            <a href="#/profile" className="hover:text-cyan-300 text-slate-200">Profile</a>
            <a href="#/support" className="hover:text-cyan-300 text-slate-200">Support</a>
          </div>
        </div>
      </nav>

      <Page />
    </div>
  );
}
