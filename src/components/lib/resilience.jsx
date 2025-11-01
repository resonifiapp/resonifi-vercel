// Resilience computation based on four pillars: recovery, stability, consistency, tolerance

export function computeResilience(rows) {
  if (!rows || rows.length === 0) {
    return { 
      score: 5, 
      pillars: zeroPillars(), 
      notes: ["Not enough data to compute resilience"] 
    };
  }

  // Keep last 28 days, ascending by date
  const data = rows.slice(-28);

  // Helper to extract values
  const val = (key) => data.map(d => d[key]).filter(x => x != null);
  
  const mood = data.map(d => ({ day: d.date, v: d.mood_rating ?? null })).filter(p => p.v != null);
  const energy = data.map(d => ({ day: d.date, v: d.energy_level ?? null })).filter(p => p.v != null);
  const stress = data.map(d => ({ day: d.date, v: d.stress_level ?? null })).filter(p => p.v != null);

  const pillars = zeroPillars();
  const notes = [];

  // 1) RECOVERY: detect dips (≤4/10) and measure rebound within 48h
  const rec = recoveryScore(mood, energy);
  pillars.recovery += rec.score;
  if (rec.note) notes.push(rec.note);

  // 2) STABILITY: 7-day volatility of mood+energy (lower sd → better)
  const st = stabilityScore(mood, energy);
  pillars.stability += st.score;
  if (st.note) notes.push(st.note);

  // 3) CONSISTENCY: habits met in last 7 days
  const cn = consistencyScore(
    val("sleep"), 
    val("exercise"), 
    []  // hydration not tracked in our schema yet
  );
  pillars.consistency += cn.score;
  if (cn.note) notes.push(cn.note);

  // 4) TOLERANCE: weeks where stress↑ but mood/energy held
  const tol = toleranceScore(stress, mood, energy);
  pillars.tolerance += tol.score;
  if (tol.note) notes.push(tol.note);

  // Sum → 0..10 scale
  let score = 5
    + weight(pillars.recovery, 1.2)
    + weight(pillars.stability, 1.0)
    + weight(pillars.consistency, 0.9)
    + weight(pillars.tolerance, 0.9);

  score = Math.max(0, Math.min(10, Number(score.toFixed(1))));

  return { 
    score, 
    pillars, 
    notes, 
    suggestions: toSuggestions(pillars) 
  };
}

// ---------- Pillar implementations ----------

function recoveryScore(mood, energy) {
  // Find days with dip (≤4) and check if within next 2 entries avg rises by ≥1
  const seq = mergeByDay(mood, energy, (m, e) => (m ?? e));
  let good = 0, bad = 0;
  
  for (let i = 0; i < seq.length; i++) {
    const v = seq[i];
    if (v <= 4) {
      const next = seq.slice(i + 1, i + 3).filter(x => x != null);
      if (next.length && avg(next) >= v + 1) {
        good++;
      } else {
        bad++;
      }
    }
  }
  
  const score = clamp((good - bad) * 0.6, -2, +2);
  const note = (good + bad) >= 1 
    ? `Recovery: ${good} quick rebounds, ${bad} slow.` 
    : undefined;
  
  return { score, note };
}

function stabilityScore(mood, energy) {
  const last7m = mood.slice(-7).map(x => x.v);
  const last7e = energy.slice(-7).map(x => x.v);
  
  if (last7m.length < 5 || last7e.length < 5) {
    return { score: 0, note: "Stability: need more data" };
  }
  
  const sd = (arr) => {
    const m = avg(arr);
    const variance = avg(arr.map(x => Math.pow(x - m, 2)));
    return Math.sqrt(variance);
  };
  
  const sdm = sd(last7m);
  const sde = sd(last7e);
  const combined = (sdm + sde) / 2; // 0..~3
  
  const score = combined <= 1 ? +1.5 
    : combined <= 1.5 ? +0.5 
    : combined <= 2 ? -0.5 
    : -1.5;
  
  const note = `Stability sd≈${combined.toFixed(2)} (lower is steadier).`;
  
  return { score, note };
}

function consistencyScore(sleepH, exMin, hydG) {
  const last7s = lastN(sleepH, 7);
  const last7e = lastN(exMin, 7);
  const last7h = lastN(hydG, 7);
  
  const okSleep = last7s.filter(h => h >= 7).length;     // target: 7h+
  const okEx = last7e.filter(m => m >= 20).length;       // target: 20m+
  const okHyd = last7h.filter(g => g >= 6).length;       // target: 6+ (not used yet)
  
  const totalOK = okSleep + okEx; // 0..14 (hydration not tracked)
  
  const score = totalOK >= 8 ? +1.5 
    : totalOK >= 6 ? +0.5 
    : totalOK >= 4 ? 0 
    : -1.0;
  
  const note = `Consistency: ${okSleep}/7 sleep, ${okEx}/7 exercise days met.`;
  
  return { score, note };
}

function toleranceScore(stress, mood, energy) {
  // Last 14d: if stress up ≥1 vs its 14d mean but mood+energy didn't drop ≥1 → +, else −
  const sAvg = avg(stress.map(x => x.v)) || 0;
  let plus = 0, minus = 0;
  
  for (let i = 0; i < stress.length; i++) {
    const s = stress[i].v;
    if (s >= sAvg + 1) {
      const m = mood[i]?.v ?? null;
      const e = energy[i]?.v ?? null;
      if (m != null && e != null) {
        if (m >= 5 && e >= 5) {
          plus++;
        } else {
          minus++;
        }
      }
    }
  }
  
  const score = clamp((plus - minus) * 0.5, -1.5, +1.5);
  const note = (plus + minus) >= 1 
    ? `Tolerance: ${plus} held steady under stress, ${minus} tough days.` 
    : undefined;
  
  return { score, note };
}

// ---------- Feedback ----------

function toSuggestions(pillars) {
  const out = [];
  
  if (pillars.recovery < 0) {
    out.push("Plan a 10-min morning reset after hard days (walk/light stretch + water).");
  }
  if (pillars.stability < 0) {
    out.push("Keep a consistent wake time for 5 days; avoid caffeine after noon.");
  }
  if (pillars.consistency < 0) {
    out.push("Pick one tiny non-negotiable this week (7h sleep or 20-min movement).");
  }
  if (pillars.tolerance < 0) {
    out.push("Before demanding tasks: box-breathing 4-4-4-4 ×4 (≈60s).");
  }
  if (out.length === 0) {
    out.push("Great momentum — keep your anchors (sleep, movement, stress management).");
  }
  
  return out;
}

// ---------- Utils ----------

function avg(arr) {
  return arr.length ? arr.reduce((s, n) => s + n, 0) / arr.length : NaN;
}

function lastN(arr, n) {
  return arr.slice(-n);
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function weight(x, w) {
  return x * w;
}

function zeroPillars() {
  return { recovery: 0, stability: 0, consistency: 0, tolerance: 0 };
}

function mergeByDay(arrA, arrB, pick) {
  const map = new Map();
  
  arrA.forEach(p => {
    const existing = map.get(p.day) || {};
    map.set(p.day, { ...existing, a: p.v });
  });
  
  arrB.forEach(p => {
    const existing = map.get(p.day) || {};
    map.set(p.day, { ...existing, b: p.v });
  });
  
  return Array.from(map.entries())
    .sort((x, y) => x[0] < y[0] ? -1 : 1)
    .map(([_, v]) => pick(v.a, v.b))
    .filter(v => v != null);
}