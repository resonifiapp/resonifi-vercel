import React, { useEffect, useState } from "react";
import Home from "./pages/Home.jsx";
import CheckIn from "./pages/CheckIn.jsx";
import Insights from "./pages/Insights.jsx";
import Support from "./pages/Support.jsx";
import Profile from "./pages/Profile.jsx";

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
  const Page = route === "/home"     ? Home
            : route === "/checkin"  ? CheckIn
            : route === "/insights" ? Insights
            : route === "/support"  ? Support
            : route === "/profile"  ? Profile
            : Home;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <a href="#/home" className="flex items-center gap-2">
            <span className="inline-block h-6 w-6 rounded-full bg-gradient-to-br from-cyan-300 via-teal-300 to-violet-400" />
            <span className="font-semibold">Resonifi</span>
          </a>
          <div className="flex items-center gap-5 text-sm">
            <a href="#/home" className="hover:text-cyan-300">Home</a>
            <a href="#/checkin" className="hover:text-cyan-300">Check-In</a>
            <a href="#/insights" className="hover:text-cyan-300">Insights</a>
            <a href="#/support" className="hover:text-cyan-300">Support</a>
            <a href="#/profile" className="hover:text-cyan-300">Profile</a>
          </div>
        </div>
      </nav>
      <Page />
    </div>
  );
}
