// src/components/AppShell.jsx
import React, { useEffect } from "react";
import {
  requestNotificationPermission,
  showNotification,
  isNotificationSupported,
} from "../utils/notifications.js";

export default function AppShell({ children }) {
  useEffect(() => {
    if (!isNotificationSupported()) return;

    // Request permission once
    requestNotificationPermission();

    const DAILY_KEY = "resonifi_notif_daily_date";
    const WEEKLY_KEY = "resonifi_notif_weekly_date";

    function checkAndNotify() {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const dayOfWeek = now.getDay(); // 0 = Sunday
      const today = now.toISOString().slice(0, 10);

      const lastDaily = window.localStorage.getItem(DAILY_KEY);
      const lastWeekly = window.localStorage.getItem(WEEKLY_KEY);

      // -------- DAILY CHECK-IN REMINDER @ 7:00 PM --------
      if (
        hours === 19 &&
        minutes < 15 &&
        lastDaily !== today &&
        Notification.permission === "granted"
      ) {
        showNotification(
          "Time for your Resonifi check-in",
          "Take 30 seconds to update your Wellness Index™."
        );
        window.localStorage.setItem(DAILY_KEY, today);
      }

      // -------- WEEKLY REFLECTION (SUNDAYS @ 7PM) --------
      if (
        dayOfWeek === 0 &&
        hours === 19 &&
        minutes < 15 &&
        lastWeekly !== today &&
        Notification.permission === "granted"
      ) {
        showNotification(
          "Weekly reflection",
          "Look back at this week's Wellness Index™ and notice what shifted."
        );
        window.localStorage.setItem(WEEKLY_KEY, today);
      }
    }

    // Run immediately
    checkAndNotify();

    // And check every 60 seconds
    const id = setInterval(checkAndNotify, 60 * 1000);

    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        maxWidth: "500px",
        margin: "0 auto",
        backgroundColor: "#020617",
        paddingBottom: "80px", // space for bottom nav
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      {children}
    </div>
  );
}
