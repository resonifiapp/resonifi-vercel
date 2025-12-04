// src/utils/notifications.js

// Basic support check
export function isNotificationSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

// Ask the user for permission
export async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    return { supported: false, permission: "denied" };
  }

  let permission = Notification.permission;

  // If already decided, just return
  if (permission === "granted" || permission === "denied") {
    return { supported: true, permission };
  }

  try {
    permission = await Notification.requestPermission();
    return { supported: true, permission };
  } catch (err) {
    console.error("Notification permission error:", err);
    return { supported: true, permission: "denied" };
  }
}

// Generic helper to show a notification *now*
export function showNotification(title, body) {
  if (!isNotificationSupported()) return;
  if (Notification.permission !== "granted") return;

  new Notification(title, {
    body,
    // icon: "/icons/icon-192.png", // optional – point to your logo if you have it
  });
}
