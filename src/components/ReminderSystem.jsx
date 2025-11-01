import React, { useEffect, useState } from "react";

export default function ReminderSystem({ hasSubmitted, handleSubmit }) {
  const [reminder, setReminder] = useState(null);

  useEffect(() => {
    const reminderMessages = {
      "08:00": "🌞 Good morning! How are you starting today?",
      "13:00": "💧 Midday check-in — how's your energy or hydration?",
      "20:30": "🌙 Ready to submit your day and see your Wellness Index?",
    };

    const checkTimeAndRemind = () => {
      const now = new Date();
      const hour = String(now.getHours()).padStart(2, "0");
      const min = String(now.getMinutes()).padStart(2, "0");
      const time = `${hour}:${min}`;

      const today = now.toDateString();
      const lastSubmitted = localStorage.getItem("submittedDate");
      const hasSubmittedToday = lastSubmitted === today;

      if (reminderMessages[time] && !hasSubmittedToday) {
        setReminder(reminderMessages[time]);
        setTimeout(() => setReminder(null), 60000); // auto-dismiss after 1 min
      }
    };

    checkTimeAndRemind(); // Run on load
    const interval = setInterval(checkTimeAndRemind, 60000); // Then every minute
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => setReminder(null);

  return (
    <>
      {reminder && (
        <div style={reminderStyle}>
          <p style={{ marginBottom: "0.5rem" }}>{reminder}</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
            <button style={submitBtn} onClick={handleSubmit}>Submit Now</button>
            <button style={dismissBtn} onClick={handleDismiss}>Dismiss</button>
          </div>
        </div>
      )}
    </>
  );
}

// 🌑 Dark Theme Styles
const reminderStyle = {
  position: "fixed",
  bottom: "2rem",
  left: "50%",
  transform: "translateX(-50%)",
  background: "#1e1e1e",
  color: "#ffffff",
  padding: "1.25rem",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  zIndex: 999,
  textAlign: "center",
  width: "90%",
  maxWidth: "360px"
};

const submitBtn = {
  background: "#3aa6ff",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "0.5rem 1rem",
  fontSize: "0.95rem",
  cursor: "pointer"
};

const dismissBtn = {
  background: "#333",
  color: "#ccc",
  border: "none",
  borderRadius: "8px",
  padding: "0.5rem 1rem",
  fontSize: "0.95rem",
  cursor: "pointer"
};