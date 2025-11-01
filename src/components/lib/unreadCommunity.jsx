import { useEffect, useState, useRef } from "react";
import { CommunityMessage } from "@/api/entities";

const LS_KEY = "res:lastSeen:community";
const LS_COUNT_KEY = "res:unread:community:count";

export function getCommunityLastSeen() {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(LS_KEY);
  return v ? new Date(v) : null;
}

export function markCommunitySeenNow() {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, new Date().toISOString());
  localStorage.setItem(LS_COUNT_KEY, "0");
  window.dispatchEvent(new CustomEvent("communitySeenUpdate"));
}

export function incrementUnreadCount() {
  if (typeof window === "undefined") return;
  const current = parseInt(localStorage.getItem(LS_COUNT_KEY) || "0", 10);
  localStorage.setItem(LS_COUNT_KEY, String(current + 1));
  window.dispatchEvent(new CustomEvent("communitySeenUpdate"));
}

export function getUnreadCount() {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(LS_COUNT_KEY) || "0", 10);
}

// Check for new messages and update unread count
async function checkForNewMessages() {
  try {
    const lastSeen = getCommunityLastSeen();
    if (!lastSeen) return;

    const myEmail = localStorage.getItem('res:userEmail');
    if (!myEmail) return;

    // Fetch recent messages
    const messages = await CommunityMessage.list("-created_date", 10);
    
    // Count messages from others that are newer than lastSeen
    let newCount = 0;
    for (const msg of messages) {
      const msgDate = new Date(msg.created_date);
      if (msgDate > lastSeen && msg.created_by !== myEmail) {
        newCount++;
      }
    }

    if (newCount > 0) {
      localStorage.setItem(LS_COUNT_KEY, String(newCount));
      window.dispatchEvent(new CustomEvent("communitySeenUpdate"));
    }
  } catch (error) {
    console.warn("Failed to check for new community messages:", error);
  }
}

// Hook with optional background polling
export function useCommunityUnread(pollInterval = null) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Initial load
    setCount(getUnreadCount());

    // Listen for updates
    const handleUpdate = () => {
      setCount(getUnreadCount());
    };

    window.addEventListener("communitySeenUpdate", handleUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === LS_COUNT_KEY) {
        setCount(parseInt(e.newValue || "0", 10));
      }
    });

    // Set up polling if requested
    let intervalId;
    if (pollInterval) {
      intervalId = setInterval(checkForNewMessages, pollInterval);
      checkForNewMessages(); // Check immediately
    }

    return () => {
      window.removeEventListener("communitySeenUpdate", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      if (intervalId) clearInterval(intervalId);
    };
  }, [pollInterval]);

  const display = count > 9 ? "9+" : count;
  
  return { 
    count, 
    display, 
    clear: markCommunitySeenNow 
  };
}