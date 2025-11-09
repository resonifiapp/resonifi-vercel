import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Insights() {
  const [snapshots, setSnapshots] = useState([]);
  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem("resonifi:snapshots") || "[]");
      setSnapshots(Array.isArray(arr) ? arr : []);
    } catch {}
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <Card className="bg-slate-900/60 border-slate-800">
        <CardHeader>
          <CardTitle className="text-base">Insights</CardTitle>
        </CardHeader>
        <CardContent>
          {snapshots.length === 0 ? (
            <div className="text-sm text-slate-400">
              No snapshots yet. Complete one on <a href="#/home" className="text-cyan-300">Home</a>.
            </div>
          ) : (
            <ul className="divide-y divide-slate-800">
              {snapshots.slice(0, 20).map((s, i) => (
                <li key={i} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <span className="text-slate-200">Score: </span>
                    <span className="font-medium">
                      {typeof s.score === "number" ? s.score : Math.round((s.score01 ?? 0) * 100)}
                    </span>
                    {s.note ? <span className="text-slate-400"> — {s.note.slice(0, 60)}</span> : null}
                  </div>
                  <div className="text-xs text-slate-500">{new Date(s.ts).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
