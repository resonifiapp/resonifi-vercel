import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Lightbulb, Info } from "lucide-react";

export function InsightsPanel({ insights, onCta }) {
  if (!insights.length) {
    return (
      <Card className="bg-[#1A2035]/80 border-slate-700/50">
        <CardContent className="p-8 text-center">
          <Info className="w-12 h-12 mx-auto text-gray-500 mb-3" />
          <p className="text-gray-400">No insights yet. Keep logging check-ins to see personalized patterns!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {insights.map(i => (
        <Card key={i.id} className="bg-[#1A2035]/80 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3 mb-3">
              {getSeverityIcon(i.severity)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={getSeverityColor(i.severity)}>
                    {i.severity.toUpperCase()}
                  </Badge>
                  <h3 className="font-semibold text-white">{i.title}</h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{i.body}</p>
              </div>
            </div>
            {i.cta && (
              <div className="mt-3 pl-9">
                <Button
                  onClick={() => onCta(i.cta.action)}
                  variant="outline"
                  size="sm"
                  className="border-[#2DD4BF] text-[#2DD4BF] hover:bg-[#2DD4BF] hover:text-white"
                >
                  {i.cta.label}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function getSeverityIcon(severity) {
  const icons = {
    info: <Info className="w-5 h-5 text-blue-400" />,
    tip: <Lightbulb className="w-5 h-5 text-green-400" />,
    warn: <AlertCircle className="w-5 h-5 text-orange-400" />,
  };
  return icons[severity] || icons.info;
}

function getSeverityColor(severity) {
  const colors = {
    info: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    tip: "bg-green-500/20 text-green-300 border-green-500/30",
    warn: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  };
  return colors[severity] || colors.info;
}