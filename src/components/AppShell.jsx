// src/components/AppShell.jsx

import React, { useEffect } from "react";
import BottomNav from "./BottomNav";
import {
  requestNotificationPermission,
  showNotification,
  isNotificationSupported,
} from "../utils/notifications.js";

const DAILY_KEY = "resonifi_notif_daily_date";
const WEEKLY_KEY = "resonifi_notif_weekly_date";

export default function AppShell({ children, hideBottomNav = false }) {
  // 🔔 Local notification logic
  useEffect(() => {
    if (!isNotificationSupported()) return;

    requestNotificationPermission();

    function checkAndNotify() {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const dayOfWeek = now.getDay();
      const today = now.toISOString().slice(0, 10);

      const lastDaily = window.localStorage.getItem(DAILY_KEY);
      const lastWeekly = window.localStorage.getItem(WEEKLY_KEY);

      // DAILY CHECK-IN REMINDER @ 7:00 PM
      if (
        hours === 19 &&
        minutes < 15 &&
        lastDaily !== today &&
        Notification.permission === "granted"
      ) {
        showNotification("How did today *feel*?", {
          body: "Take 30 seconds to slide your Wellness Index™ in Resonifi.",
        });
        window.localStorage.setItem(DAILY_KEY, today);
      }

      // WEEKLY INSIGHTS REMINDER (SUNDAY @ 6:00 PM)
      if (
        dayOfWeek === 0 &&
        hours === 18 &&
        minutes < 15 &&
        lastWeekly !== today &&
        Notification.permission === "granted"
      ) {
        showNotification("Peek at your patterns", {
          body: "Open Insights to see how the last week has really felt.",
        });
        window.localStorage.setItem(WEEKLY_KEY, today);
      }
    }

    const id = window.setInterval(checkAndNotify, 60 * 1000);
    return () => window.clearInterval(id);
  }, []);

  // 🧱 Global layout wrapper - spacing handled by CSS (index.css)
  return (
    <div className="app-shell">
      <div className="app-safe-area app-main">{children}</div>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}
