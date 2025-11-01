import { useState } from "react";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CheckinGuidance({ compact = false }) {
  const [open, setOpen] = useState(false);

  const onDetails = () => {
    setOpen((v) => !v);
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible("Checkin Guidance Toggled", { props: { state: !open ? "open" : "closed" } });
    }
  };

  return (
    <Card className={`rounded-2xl bg-blue-500/10 border border-blue-500/30 ${compact ? "p-3" : "p-4"}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          <Info className="w-5 h-5 text-blue-400" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-200">
            Best time to check in: Often...
          </p>
          <p className="text-sm text-blue-200/80">
            Our moods shift throughout the day, so check in regularly. What matters most is awareness, not a schedule. 🌿
          </p>

          <div className="mt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDetails} 
              className="px-2 text-blue-300 hover:text-blue-200 hover:bg-blue-500/20"
            >
              {open ? "Hide details" : "Why this matters"}
            </Button>
          </div>

          {open && (
            <div className="mt-2 text-xs text-blue-200/80 leading-relaxed">
              Consistency can help, but it doesn't mean the *same hour* every day.
              If mornings feel rushed or variable, choose a calmer moment—after lunch, evening wind-down,
              or right after you finish something meaningful. A gentle habit beats a rigid routine.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}