import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { feedback } from "./lib/feedback";

// Resonifi Brand Colors
const COLOR_PRIMARY = "#2E6AFF";
const COLOR_HOVER = "#5083FF";

const BTN_PRIMARY = `
  px-4 py-2 rounded-2xl text-white font-medium
  bg-[${COLOR_PRIMARY}] hover:bg-[${COLOR_HOVER}]
  shadow-sm focus:ring-2 focus:ring-white/30 transition-all
`;

const CARD = `
  rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-sm
`;

const TAG = `
  px-2.5 py-1 rounded-xl bg-white/10 border border-white/15 text-xs text-white/70
`;

export function SpiritualQuickLink({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  if (!user) return null;
  if (loading) return null;

  const enabled = user?.show_spiritual_resonance || false;

  // Opt-in view
  if (!enabled) {
    return (
      <div className={`${CARD} p-4 flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-2">
          <span className={TAG}>Spiritual</span>
          <span className="text-sm text-white/80">Try the 5-question check-in</span>
        </div>
        <button
          className="px-4 py-2 rounded-2xl text-white font-medium bg-[#2E6AFF] hover:bg-[#5083FF] shadow-sm focus:ring-2 focus:ring-white/30 transition-all"
          onClick={async () => {
            try {
              await base44.auth.updateMe({ show_spiritual_resonance: true });
              feedback('success');
              navigate(createPageUrl("SpiritualResonance"));
            } catch (error) {
              console.error('[Spiritual] Opt-in failed:', error);
              feedback('error');
            }
          }}
        >
          Opt in & Start
        </button>
      </div>
    );
  }

  // Enabled view
  return (
    <div className={`${CARD} p-4 flex items-center justify-between gap-3`}>
      <div className="flex items-center gap-2">
        <span className={TAG}>Spiritual</span>
        <span className="text-sm text-white/80">5 questions • total /20</span>
      </div>
      <button
        className="px-4 py-2 rounded-2xl text-white font-medium bg-[#2E6AFF] hover:bg-[#5083FF] shadow-sm focus:ring-2 focus:ring-white/30 transition-all"
        onClick={() => {
          feedback('nav');
          navigate(createPageUrl("SpiritualResonance"));
        }}
      >
        Open Spiritual
      </button>
    </div>
  );
}