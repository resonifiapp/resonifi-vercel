import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Brand color styles (Resonifi theme)
const BTN_PRIMARY = `
  px-4 py-2 rounded-2xl text-white font-medium
  bg-[#2E6AFF] hover:bg-[#5083FF]
  shadow-sm focus:ring-2 focus:ring-white/30 transition-all
`;

const CARD = `
  flex items-center justify-between gap-3
  rounded-2xl border border-white/10 bg-white/5
  px-4 py-3 shadow-sm backdrop-blur-sm
`;

const TAG = `
  px-2.5 py-1 rounded-xl bg-white/10 border border-white/15
  text-xs text-white/70
`;

export function CycleQuickLink({ user }) {
  const navigate = useNavigate();
  
  // Only show if user is female and has cycle tracking enabled
  const enabled = 
    user?.gender_identity === 'female' && 
    Array.isArray(user?.life_stage_preferences) && 
    user.life_stage_preferences.length > 0;
  
  if (!enabled) return null;

  return (
    <div className={CARD}>
      <div className="flex items-center gap-2">
        <span className={TAG}>Cycle</span>
        <span className="text-sm text-white/80">
          Track today's cycle signals
        </span>
      </div>
      <button
        onClick={() => navigate(createPageUrl("CycleTracking"))}
        className={BTN_PRIMARY}
      >
        Open Tracker
      </button>
    </div>
  );
}