import React from "react";
import { InsightsPanel } from "@/components/InsightsPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Insights() {
  // Placeholder insights - in a real app, these would come from your data
  const sampleInsights = [];

  return (
    <div className="min-h-screen bg-[#0F172A] px-6 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Insights</h1>
          <p className="text-gray-400">Discover patterns in your wellness journey</p>
        </div>

        <InsightsPanel insights={sampleInsights} onCta={() => {}} />
      </div>
    </div>
  );
}
