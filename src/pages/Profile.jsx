// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Image as ImageIcon,
  ShieldCheck,
  Save,
  Trash2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// tiny class joiner (no deps)
const cn = (...a) => a.filter(Boolean).join(" ");

const PROFILE_KEY = "resonifi:profile";
const SNAPSHOT_KEY = "resonifi:snapshots";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [snapshots, setSnapshots] = useState([]);

  // Load profile + snapshots
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        setName(p.name || "");
        setEmail(p.email || "");
        setAvatarUrl(p.avatarUrl || "");
        setNewsletter(!!p?.preferences?.newsletter);
      }
    } catch {}
    try {
      const arr = JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || "[]");
      setSnapshots(Array.isArray(arr) ? arr.slice(0, 50) : []);
    } catch {}
    setLoading(false);
  }, []);

  const saveProfile = () => {
    const payload = {
      name: name.trim(),
      email: email.trim(),
      avatarUrl: avatarUrl.trim(),
      preferences: { newsletter },
      updatedAt: Date.now(),
      createdAt:
        JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}").createdAt ||
        Date.now(),
    };
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(payload));
    } catch {}
  };

  const clearProfile = () => {
    try {
      localStorage.removeItem(PROFILE_KEY);
    } catch {}
    setName("");
    setEmail("");
    setAvatarUrl("");
    setNewsletter(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
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

      <main className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Profile form */}
        <Card className="md:col-span-3 bg-slate-900/60 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-slate-400">Loading…</div>
            ) : (
              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  saveProfile();
                }}
              >
                <Field
                  label="Name"
                  icon={<User className="h-4 w-4" />}
                  value={name}
                  onChange={setName}
                  placeholder="Your name"
                />
                <Field
                  label="Email"
                  icon={<Mail className="h-4 w-4" />}
                  value={email}
                  onChange={setEmail}
                  placeholder="you@example.com"
                  type="email"
                />
                <Field
                  label="Avatar URL"
                  icon={<ImageIcon className="h-4 w-4" />}
                  value={avatarUrl}
                  onChange={setAvatarUrl}
                  placeholder="https://…"
                />

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newsletter}
                    onChange={(e) => setNewsletter(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-teal-500"
                  />
                  Subscribe to newsletter
                </label>

                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" type="button" onClick={clearProfile}>
                    <Trash2 className="h-4 w-4" />
                    Clear
                  </Button>
                  <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Recent local snapshots */}
        <Card className="md:col-span-2 bg-slate-900/60 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent snapshots (local)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {snapshots.length === 0 ? (
              <div className="text-sm text-slate-400">No snapshots yet.</div>
            ) : (
              <ul className="divide-y divide-slate-800">
                {snapshots.slice(0, 8).map((s, i) => (
                  <li key={i} className="py-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="text-slate-200">
                        Score:{" "}
                        <span className="font-medium">
                          {typeof s.score === "number"
                            ? s.score
                            : Math.round((s.score01 ?? 0) * 100)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(s.ts).toLocaleString()}
                      </div>
                    </div>
                    {s.note ? (
                      <div className="mt-1 text-slate-300 line-clamp-2">{s.note}</div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

/** Simple input field with icon, no external UI deps */
function Field({ label, icon, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="space-y-1.5">
      <div className="text-sm text-slate-300">{label}</div>
      <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2">
        <div className="text-slate-400">{icon}</div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full bg-transparent text-slate-100 placeholder:text-slate-500",
            "focus:outline-none"
          )}
        />
      </div>
    </div>
  );
}
