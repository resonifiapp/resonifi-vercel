// ===== Checkin Data Cache (optional draft storage) =====

const STORAGE_KEY = "resonifi.checkin.draft";

/**
 * Load draft checkin data from localStorage
 * Useful for preserving unsaved changes
 */
export function loadCheckinDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      // Check if it's from today
      const today = new Date().toISOString().split('T')[0];
      if (data.date === today) {
        return data;
      }
      // Clear old draft
      clearCheckinDraft();
    }
  } catch {}
  return null;
}

/**
 * Save checkin data as draft to localStorage
 */
export function saveCheckinDraft(data) {
  try {
    const draft = {
      ...data,
      date: new Date().toISOString().split('T')[0],
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch (error) {
    console.error("Failed to save checkin draft:", error);
  }
}

/**
 * Clear the checkin draft
 */
export function clearCheckinDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

/**
 * Auto-save hook - call this when form data changes
 */
export function autoSaveCheckin(formData, delay = 2000) {
  // Debounced save
  clearTimeout(autoSaveCheckin.timer);
  autoSaveCheckin.timer = setTimeout(() => {
    saveCheckinDraft(formData);
  }, delay);
}