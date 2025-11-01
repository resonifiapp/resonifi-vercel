import { toSeries, delta7, align, pearson, fmt } from "./analytics";

export function generateInsights(rows) {
  const out = [];
  const sleepS = toSeries(rows, "sleep");
  const stressS = toSeries(rows, "stress_level");
  const energyS = toSeries(rows, "energy_level");
  const exerciseS = toSeries(rows, "exercise");
  const moodS = toSeries(rows, "mood_rating");
  const connectionS = toSeries(rows, "connection_rating");
  const resilienceS = toSeries(rows, "resilience");

  // A) Week-over-week sleep drop
  const dSleep = delta7(sleepS.points);
  if (dSleep != null && dSleep <= -0.5) {
    out.push({
      id: "sleep_drop",
      title: "Sleep dipped this week",
      body: `Average sleep fell by ${Math.abs(dSleep).toFixed(1)}h vs last week. Try a wind-down routine: dim lights 60 min before bed, no screens 30 min before, and keep your wake time consistent.`,
      severity: "tip",
      cta: { label: "3 Sleep Tips", action: "sleep_tips" },
    });
  }

  // B) Correlation: sleep vs energy (last 30 days)
  const corrWindow = 30;
  const sleep30 = lastN(sleepS.points, corrWindow);
  const energy30 = lastN(energyS.points, corrWindow);
  const { xs, ys } = align(
    { key: "sleep", points: sleep30 }, 
    { key: "energy_level", points: energy30 }
  );
  const rSE = xs.length >= 7 ? pearson(xs, ys) : null;
  if (rSE != null && rSE > 0.3) {
    out.push({
      id: "sleep_energy_corr",
      title: "Sleep ↔ Energy are linked for you",
      body: `When sleep increases, energy tends to rise (r=${rSE.toFixed(2)}). Protect your ${fmt("sleep", 7.5)} target on demanding days.`,
      severity: "info",
    });
  }

  // C) High stress + low energy pattern
  const dStress = delta7(stressS.points);
  const dEnergy = delta7(energyS.points);
  if (dStress != null && dEnergy != null && dStress > 0.5 && dEnergy < -0.5) {
    out.push({
      id: "stress_energy",
      title: "Stress may be draining energy",
      body: "Stress climbed while energy fell this week. Try a 60-second box breathing before tasks. Inhale 4 • hold 4 • exhale 4 • hold 4 ×4.",
      severity: "warn",
      cta: { label: "Start Breathing", action: "breathing" },
    });
  }

  // D) Exercise consistency (≥3 days with ≥20 min last week)
  const ex7 = lastN(exerciseS.points, 7).filter(p => p.y >= 20).length;
  if (ex7 >= 3) {
    out.push({
      id: "exercise_consistency",
      title: "Nice consistency with movement",
      body: `You logged ${ex7} days ≥20m last week. Consider 1 longer session (40–60m) to boost mood & sleep quality.`,
      severity: "info",
      cta: { label: "Micro-workout ideas", action: "exercise_micro" },
    });
  }

  // E) Mood trend (up or down)
  const dMood = delta7(moodS.points);
  if (dMood != null) {
    out.push({
      id: dMood >= 0 ? "mood_up" : "mood_down",
      title: dMood >= 0 ? "Mood trending up" : "Mood trending down",
      body: dMood >= 0 
        ? `Up by ${Math.abs(dMood).toFixed(1)}/10 vs last week. What's working? Capture 1 win to reinforce it.`
        : `Down by ${Math.abs(dMood).toFixed(1)}/10 vs last week. Consider a light day + early night to reset.`,
      severity: dMood >= 0 ? "info" : "tip",
    });
  }

  // F) Connection score
  const dConnection = delta7(connectionS.points);
  if (dConnection != null && dConnection < -0.5) {
    out.push({
      id: "connection_low",
      title: "Social connection decreased",
      body: `Connection rating dropped by ${Math.abs(dConnection).toFixed(1)}/10 this week. Consider reaching out to a friend or joining a group activity.`,
      severity: "tip",
      cta: { label: "Connection ideas", action: "connection_tips" },
    });
  }

  // G) Resilience trend (NEW)
  const dResilience = delta7(resilienceS.points);
  if (dResilience != null && dResilience < -1) {
    out.push({
      id: "resilience_down",
      title: "Resilience has dropped",
      body: `Your resilience decreased by ${Math.abs(dResilience).toFixed(1)}/10 this week. This might indicate burnout or overwhelm. Consider taking breaks, delegating tasks, or practicing self-compassion.`,
      severity: "warn",
      cta: { label: "Resilience tips", action: "resilience_tips" },
    });
  } else if (dResilience != null && dResilience > 1) {
    out.push({
      id: "resilience_up",
      title: "Resilience is growing",
      body: `Your resilience increased by ${dResilience.toFixed(1)}/10 this week! You're building mental strength and adaptability. Keep up the practices that support this.`,
      severity: "info",
    });
  }

  return dedupe(out);
}

function lastN(arr, n) { 
  return arr.slice(-n); 
}

function dedupe(arr) {
  const seen = new Set();
  const out = [];
  for (const i of arr) { 
    if (!seen.has(i.id)) { 
      seen.add(i.id);
      out.push(i);
    }
  }
  return out;
}

export function buildAdvisorPrompt(stats) {
  return `You are a concise, friendly wellness coach. User metrics (weekly avg): ${JSON.stringify(stats.week)}. 
Key insights: ${stats.insights.map(i => i.title).join("; ")}.
Give 2–3 tailored, *actionable* tips (<=80 words total). Prioritize sleep, stress, energy, and resilience links. Avoid medical claims.`;
}