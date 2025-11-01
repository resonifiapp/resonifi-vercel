import React from "react";
import { Card } from "@/components/ui/card";

export default function SupportResources() {
  return (
    <Card className="p-4 rounded-2xl bg-[#1A2035]/80 border-slate-700/50">
      <h3 className="text-lg font-semibold mb-3 text-white">Need professional support?</h3>
      <ul className="space-y-2 text-sm text-gray-300">
        <li>
          📞 Canada: <a href="tel:988" className="underline text-[#2DD4BF] hover:text-[#0D9488]">988</a> (Suicide & Crisis Helpline)
        </li>
        <li>
          🌐 <a href="https://kidshelpphone.ca" target="_blank" rel="noopener noreferrer" className="underline text-[#2DD4BF] hover:text-[#0D9488]">Kids Help Phone</a> — text CONNECT to 686868
        </li>
        <li>
          💬 <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="underline text-[#2DD4BF] hover:text-[#0D9488]">FindAHelpline.com</a> for global hotlines
        </li>
      </ul>
    </Card>
  );
}