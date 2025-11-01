import React from "react";
import { Droplets } from "lucide-react";

export default function HydrationStepper({ value, onChange }) {
  const liters = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">
          <Droplets className="inline w-4 h-4 mr-1" />
          Water Intake
        </label>
        <span className="text-2xl font-bold text-[#2DD4BF]">
          {value || 0}L
        </span>
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {liters.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => onChange(amount)}
            className={`
              px-3 py-2 rounded-lg font-medium text-sm transition-all
              ${value === amount
                ? 'bg-[#2DD4BF] text-[#0F172A] shadow-lg scale-105'
                : 'bg-[#1A2035] text-gray-300 hover:bg-[#2A3045] border border-slate-700'}
            `}
          >
            {amount}L
          </button>
        ))}
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        Recommended: 2-3 liters per day
      </div>
    </div>
  );
}