// Helper to trigger the post-check-in prompt
export function triggerPostCheckinPrompt() {
  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("res:checkin-completed"));
      if (window.plausible) window.plausible("Checkin Completed (Prompt Shown)");
    }
  } catch {}
}