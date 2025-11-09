import React, { useState } from "react";
import {
  ShieldCheck,
  LifeBuoy,
  Mail,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Support() {
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");

  const submit = (e) => {
    e.preventDefault();
    // local-only demo submit; swap with your API later
    try {
      const key = "resonifi:support:messages";
      const arr = JSON.parse(localStorage.getItem(key) || "[]");
      arr.unshift({ ts: Date.now(), email, topic, message });
      localStorage.setItem(key, JSON.stringify(arr.slice(0, 200)));
      setTopic("");
      setMessage("");
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Simple page header (no animation deps) */}
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-300 via-teal-300 to-violet-400 shadow-lg shadow-cyan-500/20" />
            <span className="text-lg font-semibold tracking-tight">Resonifi</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4" />
            Private by default
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-3 bg-slate-900/60 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <LifeBuoy className="h-5 w-5" />
              Contact Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Your email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">Topic</label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Billing, account, feedback…"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">Message</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help?"
                  className="min-h-[120px]"
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="gap-2">
                  Send <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="md:col-span-2 grid gap-6">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Direct email
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              Prefer email? Reach us at <span className="text-slate-100">support@resonifi.app</span>.
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Quick tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-2">
              <p>• Try without signup keeps everything local to your device.</p>
              <p>• Pillar sliders adjust your current snapshot; nothing is uploaded.</p>
              <p>• You can clear saved snapshots anytime in your browser storage.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
