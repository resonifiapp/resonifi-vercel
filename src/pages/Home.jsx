import React from "react";
import Ring from "../components/Ring.jsx";
import NextStepsCard from "../components/NextStepsCard.jsx";
import DashboardNote from "../components/DashboardNote.jsx";

export default function Home() {
  return (
    <main className="px-4 md:px-0 max-w-3xl mx-auto py-10 text-white">
      {/* Top banner */}
      <section className="mb-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="text-white/80">
              <div className="font-semibold">Try Resonifi</div>
              <div className="text-sm text-white/60">
                No sign-up needed to explore. Try a check-in below!
              </div>
            </div>
            <a
              href="/Profile"
              className="rounded-xl px-4 py-2 bg-indigo-500/90 hover:bg-indigo-500 text-white text-sm font-medium"
            >
              Sign up free
            </a>
          </div>
        </div>
      </section>

      {/* Main ring + quick actions */}
      <section className="grid gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <Ring />
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/DailyCheckin"
              className="w-full sm:w-auto rounded-xl px-5 py-3 bg-indigo-500/90 hover:bg-indigo-500 text-white font-medium text-center"
            >
              Try a check-in (no sign-up)
            </a>
            <div className="flex gap-3">
              <a href="/DailyCheckin" className="rounded-xl px-4 py-2 bg-white/10 hover:bg-white/15 text-sm">Check-In</a>
              <a href="/Insights" className="rounded-xl px-4 py-2 bg-white/10 hover:bg-white/15 text-sm">Insights</a>
              <a href="/Profile" className="rounded-xl px-4 py-2 bg-white/10 hover:bg-white/15 text-sm">Journal</a>
            </div>
          </div>
        </div>

        {/* “Next steps” + dashboard note */}
        <NextStepsCard />
        <DashboardNote />
      </section>

      {/* Sign-up banner */}
      <section className="mt-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 flex items-center justify-between">
          <div className="text-white/70">
            <div className="font-medium">Sign up to unlock insights</div>
            <div className="text-sm">Track patterns and get personalized recommendations.</div>
          </div>
          <a
            href="/Profile"
            className="rounded-xl px-4 py-2 bg-white/10 hover:bg-white/15 text-sm"
          >
            Sign up
          </a>
        </div>
      </section>
    </main>
  );
}
