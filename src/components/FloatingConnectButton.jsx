import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MessageCircle } from "lucide-react";

export default function FloatingConnectButton() {
  return (
    <Link
      to={createPageUrl("Support")}
      aria-label="Open Connect & Support"
      className="fixed bottom-20 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-slate-700 shadow-lg px-4 py-2 bg-[#1A2035] hover:bg-[#2A3045] text-white transition-colors"
      onClick={() => typeof window !== "undefined" && window.plausible?.("Connect FAB Clicked")}
    >
      <MessageCircle className="w-5 h-5" />
      <span className="text-sm font-medium">Connect</span>
    </Link>
  );
}