import React, { useMemo, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ringCSS = `
@keyframes breathe {
  0%{transform:scale(1);box-shadow:0 0 0 0 rgba(20,184,166,.25)}
  50%{transform:scale(1.04);box-shadow:0 0 0 20px rgba(20,184,166,0)}
  100%{transform:scale(1);box-shadow:0 0 0 0 rgba(20,184,166,.25)}
}
`;

export default function Home() {
  const [last, setLast] = useState(null);

  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem("resonifi:snapshots") || "[]");
      setLast(arr[0] || null);
    } catch {}
  }, []);

  const score = useMemo(() => {
    // prefer last completed check-in index; fallback to 50
    if (last?.checkinIndex != null) return last.checkinIndex;
    if (last?.score != null) return Math.round(last.score);
    return 50;
  }, [last]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <style dangerouslySetInnerHTML={{ __html: ringCSS }} />

      <Card className="bg-slate-900/60 border-slate-800">
        <CardHeader>
          <CardTitle className="text-base">Core Resonance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="relative h-44 w-44 rounded-full bg-gradient-to-br from-cyan-300 via-teal-300 to-violet-400 p-[6px] animate-[breathe_5s_ease-in-out_infinite]">
              <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center">
                <div className="h-36 w-36 rounded-full bg-slate-800/70 flex items-center justify-center">
                  <span className="text-4xl font-semibold text-slate-50">{score}</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-slate-400">
            Your latest Wellness Index. Start a check-in to update it.
          </p>

          <div className="mt-6 flex justify-center">
            <Button onClick={() => (window.location.hash = "#/checkin")}>
              Start Check-In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
