// src/components/BottomNav.jsx

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navBar = {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    height: "56px",
    backgroundColor: "#020617",
    borderTop: "1px solid #111827",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "0 8px",
    zIndex: 50,
  };

  const items = [
    { key: "home", label: "Home", icon: "🏠", path: "/app" },
    { key: "checkin", label: "Check-in", icon: "✨", path: "/check-in" },
    { key: "insights", label: "Insights", icon: "📊", path: "/insights" },
    { key: "account", label: "Account", icon: "👤", path: "/account" },
  ];

  function isActive(path) {
    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  }

  const buttonBase = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "2px",
    cursor: "pointer",
    padding: "4px 2px",
    borderRadius: 0, // no pill shapes
    backgroundColor: "transparent",
    border: "none",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  };

  const iconStyle = (active) => ({
    fontSize: "18px",
    color: active ? "#e5e7eb" : "#6b7280",
    filter: active ? "drop-shadow(0 0 6px rgba(56,189,248,0.7))" : "none",
  });

  const labelStyle = (active) => ({
    fontSize: "10px",
    color: active ? "#e5e7eb" : "#6b7280",
  });

  const dotStyle = (active) => ({
    width: 3,
    height: 3,
    borderRadius: "999px",
    backgroundColor: active ? "#22d3ee" : "transparent",
    marginTop: 1,
  });

  return (
    <nav style={navBar}>
      {items.map((item) => {
        const active = isActive(item.path);

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => navigate(item.path)}
            style={buttonBase}
          >
            <span style={iconStyle(active)} aria-hidden="true">
              {item.icon}
            </span>
            <span style={labelStyle(active)}>{item.label}</span>
            <span style={dotStyle(active)} />
          </button>
        );
      })}
    </nav>
  );
}
