import React from "react";
import Home from "./pages/Home.jsx";

export default function App() {
  // Render Home directly; no router, no suspense, nothing to block mount.
  return <Home />;
}
