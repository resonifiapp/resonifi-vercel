import React, { useEffect, useMemo, useState } from "react";

// ---------- LocalStorage keys (must match your cards) ----------
const LS = {
  SR_USER: "sr:user",
  SR_HISTORY: "sr:history",
  CYCLE_USER: "cycle:user",
  CYCLE_HISTORY: "cycle:history",
  // OPTIONAL: if you cache your base wellness index history locally, set here:
  WELLNESS_HISTORY: "wi:history" // format: [{ts:<iso>, score:<0-100>}]
};

// ---------- Safe loaders ----------
function loadJSON(key, fallback) {
  try { 
    const raw = localStorage.getItem(key); 
    if (raw) return JSON.parse(raw); 
  } catch {}
  return fallback;
}

const DAY_MS = 24 * 3600 * 1000;
const withinDays = (iso, days) => (Date.now() - new Date(iso).getTime()) <= days * DAY_MS;
const formatDate = (iso) => new Date(iso).toLocaleDateString();
const formatDT = (iso) => new Date(iso).toLocaleString();

function avg(nums) { 
  return nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length) : 0; 
}

function round(n) { 
  return Math.round(n); 
}

function clamp(n, lo = 0, hi = 100) { 
  return Math.max(lo, Math.min(hi, n)); 
}

// ---------- Sparkline (inline SVG) ----------
function Sparkline({ values, width = 160, height = 40 }) {
  if (!values.length) return <div style={{ height }} />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = 4;
  const W = width; 
  const H = height;
  const span = Math.max(1, values.length - 1);
  const x = (i) => pad + (i * (W - pad * 2) / span);
  const y = (v) => {
    if (max === min) return H / 2;
    const t = (v - min) / (max - min);
    return H - pad - t * (H - pad * 2);
  };
  let d = `M ${x(0)} ${y(values[0])}`;
  for (let i = 1; i < values.length; i++) { 
    d += ` L ${x(i)} ${y(values[i])}`; 
  }
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="trend">
      <path d={d} fill="none" stroke="#19E0D3" strokeWidth={2} />
    </svg>
  );
}

// ---------- Export CSV ----------
function downloadCSV(filename, rows) {
  const csv = rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; 
  a.download = filename; 
  a.click();
  URL.revokeObjectURL(url);
}

// ---------- Main Component ----------
export default function WeeklyDigest() {
  // Load everything once and allow manual refresh
  const [srUser, setSrUser] = useState(() => loadJSON(LS.SR_USER, { optedIn: false, weeklyReminder: true, lastCheckinAt: null }));
  const [srHistory, setSrHistory] = useState(() => loadJSON(LS.SR_HISTORY, []));
  const [cyUser, setCyUser] = useState(() => loadJSON(LS.CYCLE_USER, { gender: "unspecified", enableCycleResonance: false, lifeStage: null, lastCycleUpdate: null, avgCycleLength: null }));
  const [cyHistory, setCyHistory] = useState(() => loadJSON(LS.CYCLE_HISTORY, []));
  const [wiHistory, setWiHistory] = useState(() => loadJSON(LS.WELLNESS_HISTORY, []));
  const [refreshedAt, setRefreshedAt] = useState(new Date());

  function refreshAll() {
    setSrUser(loadJSON(LS.SR_USER, { optedIn: false, weeklyReminder: true, lastCheckinAt: null }));
    setSrHistory(loadJSON(LS.SR_HISTORY, []));
    setCyUser(loadJSON(LS.CYCLE_USER, { gender: "unspecified", enableCycleResonance: false, lifeStage: null, lastCycleUpdate: null, avgCycleLength: null }));
    setCyHistory(loadJSON(LS.CYCLE_HISTORY, []));
    setWiHistory(loadJSON(LS.WELLNESS_HISTORY, []));
    setRefreshedAt(new Date());
  }

  // ----- Last 7 days windows -----
  const sr7 = useMemo(() => srHistory.filter(r => withinDays(r.ts, 7)), [srHistory]);
  const cy7 = useMemo(() => cyHistory.filter(r => withinDays(r.ts, 7)), [cyHistory]);
  const wi7 = useMemo(() => wiHistory.filter(r => withinDays(r.ts, 7)), [wiHistory]);

  // ----- Aggregates -----
  const srAvg = round(avg(sr7.map(r => r.score)));
  const srLast = srHistory.length ? srHistory[srHistory.length - 1] : null;
  const srTrend = srHistory.slice(-8).map(r => r.score); // up to last 8 points
  const srHigh = sr7.length ? Math.max(...sr7.map(r => r.score)) : 0;
  const srLow = sr7.length ? Math.min(...sr7.map(r => r.score)) : 0;

  const cyAvgEnergy = round(avg(cy7.map(r => r.energy)));
  const cyAvgMood = round(avg(cy7.map(r => r.mood)));
  const cyLast = cyHistory.length ? cyHistory[cyHistory.length - 1] : null;
  const cyTrendEnergy = cyHistory.slice(-10).map(r => r.energy);
  const cyTrendMood = cyHistory.slice(-10).map(r => r.mood);

  const wiAvg = round(avg(wi7.map(r => r.score)));
  const wiLast = wiHistory.length ? wiHistory[wiHistory.length - 1] : null;
  const wiTrend = wiHistory.slice(-10).map(r => r.score);

  // ----- Insights (plain language rules) -----
  const insights = [];
  if (srUser.optedIn && sr7.length >= 1) {
    if (srAvg >= 75) insights.push("Strong inner alignment this week — keep doing what works.");
    else if (srAvg >= 60) insights.push("Moderate inner alignment — a few mindful moments could lift your resonance.");
    else insights.push("Inner alignment felt low — try one gentle act of connection or wonder.");
  } else if (srUser.optedIn && sr7.length === 0) {
    insights.push("No Spiritual Resonance check-in this week — a 15-second reflection awaits.");
  }

  if (cyUser.enableCycleResonance && cy7.length >= 1) {
    if (cyAvgEnergy >= 4) insights.push("Energy tracked high — consider anchoring a new habit on high-energy days.");
    else if (cyAvgEnergy <= 2) insights.push("Energy ran low — prioritize rest, hydration, and light movement.");
    if (cyAvgMood >= 4) insights.push("Mood was consistently positive — note what supported it.");
    else if (cyAvgMood <= 2) insights.push("Mood dipped — jot a quick note about triggers and supports.");
  } else if (cyUser.enableCycleResonance && cy7.length === 0) {
    insights.push("No cycle logs this week — a 10-second energy/mood check can reveal patterns.");
  }

  if (wi7.length >= 1) {
    if (wiAvg >= 75) insights.push("Wellness Index averaged high — your routines are working.");
    else if (wiAvg <= 50) insights.push("Wellness Index is lower — sleep and hydration often move it fastest.");
  }

  // ----- Export digest as CSV -----
  function exportDigestCSV() {
    const rows = [
      ["Generated At", refreshedAt.toISOString()],
      [],
      ["SECTION", "METRIC", "VALUE"],
      ["Spiritual Resonance", "Avg (7d)", String(srAvg)],
      ["Spiritual Resonance", "High (7d)", String(srHigh)],
      ["Spiritual Resonance", "Low (7d)", String(srLow)],
      ["Spiritual Resonance", "Entries (7d)", String(sr7.length)],
      ["Cycle Resonance", "Avg Energy (7d)", String(cyAvgEnergy)],
      ["Cycle Resonance", "Avg Mood (7d)", String(cyAvgMood)],
      ["Cycle Resonance", "Entries (7d)", String(cy7.length)],
      ["Wellness Index", "Avg (7d)", String(wiAvg)],
      ["Wellness Index", "Entries (7d)", String(wi7.length)],
      [],
      ["Spiritual Resonance — Recent"],
      ["ts", "score", "peace", "transc", "conn", "meaning", "compassion"],
    ];
    srHistory.slice(-10).forEach(r => rows.push([
      r.ts, String(r.score),
      String(r.domains?.peace ?? ""),
      String(r.domains?.transcendence ?? ""),
      String(r.domains?.connection ?? ""),
      String(r.domains?.meaning ?? ""),
      String(r.domains?.compassion ?? "")
    ]));
    rows.push([]);
    rows.push(["Cycle Resonance — Recent"]);
    rows.push(["ts", "energy", "mood", "notes"]);
    cyHistory.slice(-10).forEach(r => rows.push([r.ts, String(r.energy), String(r.mood), r.notes ?? ""]));
    rows.push([]);
    rows.push(["Wellness Index — Recent"]);
    rows.push(["ts", "score"]);
    wiHistory.slice(-10).forEach(r => rows.push([r.ts, String(r.score)]));

    downloadCSV("resonifi_weekly_digest.csv", rows);
  }

  // ----- Share via email (mailto prefill) -----
  function shareEmail() {
    const subject = encodeURIComponent("My Resonifi Weekly Digest");
    const lines = [
      `Spiritual Resonance (7d avg): ${srAvg}${srUser.optedIn ? "" : " (not enabled)"}`,
      `Cycle — Energy/Mood (7d avg): ${cyAvgEnergy}/${cyAvgMood}${cyUser.enableCycleResonance ? "" : " (not enabled)"}`,
      `Wellness Index (7d avg): ${wiAvg}`,
      "",
      "Highlights:",
      ...insights.map(i => `• ${i}`)
    ];
    const body = encodeURIComponent(lines.join("\n"));
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  // ----- Print digest -----
  function printDigest() { 
    window.print(); 
  }

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <div>
          <div style={S.title}>Weekly Digest</div>
          <div style={S.sub}>Summary for the last 7 days · Refreshed {refreshedAt.toLocaleTimeString()}</div>
        </div>
        <div style={S.row}>
          <button style={S.btnGhost} onClick={refreshAll}>Refresh</button>
          <button style={S.btnGhost} onClick={exportDigestCSV}>Export CSV</button>
          <button style={S.btnGhost} onClick={shareEmail}>Share via email</button>
          <button style={S.btnPrimary} onClick={printDigest}>Print</button>
        </div>
      </div>

      <div style={S.grid}>
        {/* Spiritual Resonance */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <div style={S.cardTitle}>Spiritual Resonance</div>
            <span style={srUser.optedIn ? S.badgeOn : S.badgeOff}>{srUser.optedIn ? "Enabled" : "Off"}</span>
          </div>
          <div style={S.kpiRow}>
            <KPI label="7d Avg" value={srUser.optedIn ? String(srAvg) : "—"} />
            <KPI label="7d High" value={srUser.optedIn ? String(srHigh) : "—"} />
            <KPI label="7d Low" value={srUser.optedIn ? String(srLow) : "—"} />
            <KPI label="Entries" value={srUser.optedIn ? String(sr7.length) : "0"} />
          </div>
          <div style={S.sparkRow}>
            <Sparkline values={srUser.optedIn ? srTrend : []} />
            <div style={S.lastText}>
              {srUser.optedIn && srLast ? <>Last: <b>{srLast.score}</b> on {formatDate(srLast.ts)}</> : "No data yet"}
            </div>
          </div>
        </div>

        {/* Cycle Resonance */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <div style={S.cardTitle}>Cycle Resonance</div>
            <span style={cyUser.enableCycleResonance ? S.badgeOn : S.badgeOff}>{cyUser.enableCycleResonance ? "Enabled" : "Off"}</span>
          </div>
          <div style={S.kpiRow}>
            <KPI label="Energy (7d)" value={cyUser.enableCycleResonance ? String(cyAvgEnergy) : "—"} />
            <KPI label="Mood (7d)" value={cyUser.enableCycleResonance ? String(cyAvgMood) : "—"} />
            <KPI label="Entries" value={cyUser.enableCycleResonance ? String(cy7.length) : "0"} />
            <KPI label="Gender" value={cyUser.gender} />
          </div>
          <div style={S.sparkRow}>
            <div>
              <div style={S.small}>Energy</div>
              <Sparkline values={cyUser.enableCycleResonance ? cyTrendEnergy : []} />
            </div>
            <div>
              <div style={S.small}>Mood</div>
              <Sparkline values={cyUser.enableCycleResonance ? cyTrendMood : []} />
            </div>
            <div style={S.lastText}>
              {cyUser.enableCycleResonance && cyLast ? <>Last: Energy {cyLast.energy}/5 · Mood {cyLast.mood}/5 ({formatDT(cyLast.ts)})</> : "No data yet"}
            </div>
          </div>
        </div>

        {/* Wellness Index */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <div style={S.cardTitle}>Wellness Index</div>
            <span style={wi7.length ? S.badgeOn : S.badgeOff}>{wi7.length ? "Active" : "No Data"}</span>
          </div>
          <div style={S.kpiRow}>
            <KPI label="7d Avg" value={String(wiAvg)} />
            <KPI label="Entries" value={String(wi7.length)} />
            <KPI label="Last" value={wiLast ? String(wiLast.score) : "—"} />
          </div>
          <div style={S.sparkRow}>
            <Sparkline values={wiTrend} />
            <div style={S.lastText}>
              {wiLast ? <>Last: <b>{wiLast.score}</b> on {formatDate(wiLast.ts)}</> : "No data yet"}
            </div>
          </div>
        </div>
      </div>

      {/* Insights Box */}
      <div style={S.insights}>
        <div style={S.cardTitle}>Highlights</div>
        {insights.length ? (
          <ul style={S.ul}>
            {insights.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        ) : (
          <div style={S.muted}>No highlights yet — add a check-in to get guidance.</div>
        )}
      </div>

      {/* Print footer */}
      <div style={S.footerPrint}>
        Generated by Resonifi — {new Date().toLocaleString()}
      </div>
    </div>
  );
}

// ---------- Small components ----------
function KPI({ label, value }) {
  return (
    <div style={St.kpi}>
      <div style={St.kLabel}>{label}</div>
      <div style={St.kValue}>{value}</div>
    </div>
  );
}

// ---------- Styles ----------
const S = {
  wrap: { background: "#121829", color: "#E7E9ED", border: "1px solid #24304a", borderRadius: 16, padding: 16, marginTop: 16 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 },
  row: { display: "flex", gap: 8, flexWrap: "wrap" },
  title: { fontWeight: 900, fontSize: 20 },
  sub: { color: "#8A8FA2", fontSize: 12 },
  btnGhost: { background: "transparent", color: "#E7E9ED", border: "1px solid #2a395a", padding: "8px 12px", borderRadius: 10, cursor: "pointer" },
  btnPrimary: { background: "#19E0D3", color: "#0D1220", border: "none", padding: "8px 12px", borderRadius: 10, cursor: "pointer", fontWeight: 800 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 },
  card: { background: "#0E1426", border: "1px solid #24304a", borderRadius: 12, padding: 12 },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  cardTitle: { fontWeight: 800 },
  badgeOn: { background: "#19E0D3", color: "#0D1220", borderRadius: 8, padding: "2px 8px", fontSize: 12, fontWeight: 800 },
  badgeOff: { background: "#24304a", color: "#c9cede", borderRadius: 8, padding: "2px 8px", fontSize: 12 },
  kpiRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, margin: "6px 0 10px" },
  sparkRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, alignItems: "center" },
  small: { fontSize: 12, color: "#8A8FA2", marginBottom: 4 },
  lastText: { fontSize: 12, color: "#c9cede" },
  insights: { background: "#0E1426", border: "1px solid #24304a", borderRadius: 12, padding: 12, marginTop: 12 },
  ul: { margin: "6px 0 0 16px" },
  muted: { color: "#8A8FA2" },
  footerPrint: { color: "#8A8FA2", marginTop: 12, fontSize: 12, textAlign: "right" }
};

const St = {
  kpi: { background: "#121829", border: "1px solid #24304a", borderRadius: 10, padding: "8px 10px" },
  kLabel: { color: "#8A8FA2", fontSize: 11 },
  kValue: { fontWeight: 800, fontSize: 16 }
};