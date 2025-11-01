import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, TrendingDown, Activity, Shield } from "lucide-react";

export default function ResiliencePanel({ resilienceData }) {
  if (!resilienceData) {
    return null;
  }

  const { score, pillars, notes, suggestions } = resilienceData;

  const getPillarIcon = (name) => {
    switch (name) {
      case 'recovery': return <Activity className="w-4 h-4" />;
      case 'stability': return <Shield className="w-4 h-4" />;
      case 'consistency': return <TrendingUp className="w-4 h-4" />;
      case 'tolerance': return <Brain className="w-4 h-4" />;
      default: return null;
    }
  };

  const getPillarColor = (value) => {
    if (value >= 1) return "text-green-500";
    if (value >= 0) return "text-yellow-500";
    return "text-red-500";
  };

  const getPillarLabel = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <Card className="bg-[#1A2035]/80 border-slate-700/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Brain className="w-5 h-5 text-purple-400" />
          Computed Resilience
          <Badge className="ml-auto bg-purple-500/20 text-purple-300 border-purple-500/30">
            {score.toFixed(1)}/10
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-400">
          Based on your recovery patterns, emotional stability, habit consistency, and stress tolerance.
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(pillars).map(([name, value]) => (
            <div 
              key={name}
              className="flex items-center gap-2 p-3 bg-black/20 rounded-lg"
            >
              <div className={getPillarColor(value)}>
                {getPillarIcon(name)}
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-400">{getPillarLabel(name)}</div>
                <div className={`text-sm font-semibold ${getPillarColor(value)}`}>
                  {value > 0 ? '+' : ''}{value.toFixed(1)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        {notes.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-400 uppercase">Analysis</div>
            {notes.map((note, i) => (
              <div key={i} className="text-xs text-gray-300 bg-black/20 p-2 rounded">
                {note}
              </div>
            ))}
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-400 uppercase">Suggestions</div>
            {suggestions.map((suggestion, i) => (
              <div key={i} className="text-xs text-gray-300 bg-purple-500/10 p-2 rounded border border-purple-500/20">
                💡 {suggestion}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}