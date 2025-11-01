// Tracks "unread" Direct Messages using localStorage only
import { useEffect, useState } from "react";

const LS_KEY = "res:lastSeen:dms"; // stores ISO timestamp string
const LS_COUNT_KEY = "res:unread:dms:count"; // stores unread count

export function getDMsLastSeen() {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(LS_KEY);
  return v ? new Date(v) : null;
}

export function markDMsSeenNow() {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, new Date().toISOString());
  localStorage.setItem(LS_COUNT_KEY, "0");
  
  // Trigger storage event for other tabs/components
  window.dispatchEvent(new CustomEvent("dmsSeenUpdate"));
}

export function incrementDMUnreadCount() {
  if (typeof window === "undefined") return;
  const current = parseInt(localStorage.getItem(LS_COUNT_KEY) || "0", 10);
  localStorage.setItem(LS_COUNT_KEY, String(current + 1));
  
  // Trigger storage event for other components
  window.dispatchEvent(new CustomEvent("dmsSeenUpdate"));
}

export function getDMUnreadCount() {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(LS_COUNT_KEY) || "0", 10);
}

// Hook returns { count, display, clear }
export function useDMUnread() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Initial load
    setCount(getDMUnreadCount());

    // Listen for updates
    const handleUpdate = () => {
      setCount(getDMUnreadCount());
    };

    window.addEventListener("dmsSeenUpdate", handleUpdate);
    
    // Also listen to storage events from other tabs
    window.addEventListener("storage", (e) => {
      if (e.key === LS_COUNT_KEY) {
        setCount(parseInt(e.newValue || "0", 10));
      }
    });

    return () => {
      window.removeEventListener("dmsSeenUpdate", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const display = count > 9 ? "9+" : count;
  
  return { 
    count, 
    display, 
    clear: markDMsSeenNow 
  };
}