import React from "react";
import SupportRoom from "../components/SupportRoom";

export default function SupportTest() {
  return (
    <div className="min-h-screen bg-[#0F172A] p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Support Circle (Test)</h1>
        <p className="text-gray-400 mb-6">Testing the community support chat feature</p>
        <SupportRoom onRipple={(n) => console.log("Ripple +", n)} />
      </div>
    </div>
  );
}