import React, { useEffect, useMemo, useState } from "react";

// ---------- LocalStorage keys (must match the cards) ----------
const LS = {
  SR_USER: "sr:user",
  SR_HISTORY: "sr:history",
  CYCLE_USER: "cycle:user",
  CYCLE_HISTORY: "cycle:history",
};

// ---------- Safe loaders ----------
function loadJSON(key, fallback) {
  try { 
    const raw = localStorage.getItem(key); 
    if (raw) return JSON.parse(raw); 
  } catch {}
  return fallback;
}

function weeksBetween(aISO, bISO) {
  const a = new Date(aISO).getTime(); 
  const b = new Date(bISO).getTime();
  return Math.max(1, Math.round((Math.abs(b - a)) / (7 * 24 * 3600 * 1000)));
}

function median(nums) {
  if (!nums.length) return 0;
  const s = [...nums].sort((x, y) => x - y);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

function withinDays(iso, days) {
  const t = new Date(iso).getTime();
  return (Date.now() - t) <= days * 24 * 3600 * 1000;
}

function downloadCSV(filename, rows) {
  const csv = rows.map(r =>
    r.map(cell => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
  ).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; 
  a.download = filename; 
  a.click();
  URL.revokeObjectURL(url);
}

// ---------- Main component ----------
export default function AnalyticsPanel() {
  // pull data on mount and keep it fresh (polling every 10s is enough for dev)
  const [srUser, setSrUser] = useState(() => loadJSON(LS.SR_USER, { optedIn: false, weeklyReminder: true, lastCheckinAt: null }));
  const [srHistory, setSrHistory] = useState(() => loadJSON(LS.SR_HISTORY, []));
  const [cyUser, setCyUser] = useState(() => loadJSON(LS.CYCLE_USER, { gender: "unspecified", enableCycleResonance: false, lifeStage: null, lastCycleUpdate: null, avgCycleLength: null }));
  const [cyHistory, setCyHistory] = useState(() => loadJSON(LS.CYCLE_HISTORY, []));
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    const id = window.setInterval(() => {
      setSrUser(loadJSON(LS.SR_USER, { optedIn: false, weeklyReminder: true, lastCheckinAt: null }));
      setSrHistory(loadJSON(LS.SR_HISTORY, []));
      setCyUser(loadJSON(LS.CYCLE_USER, { gender: "unspecified", enableCycleResonance: false, lifeStage: null, lastCycleUpdate: null, avgCycleLength: null }));
      setCyHistory(loadJSON(LS.CYCLE_HISTORY, []));
      setLastRefresh(new Date());
    }, 10_000);
    return () => window.clearInterval(id);
  }, []);

  // ---------- Spiritual Resonance metrics ----------
  const srMetrics = useMemo(() => {
    const total = srHistory.length;
    const scores = srHistory.map(r => r.score);
    const avg = total ? Math.round(scores.reduce((a, b) => a + b, 0) / total) : 0;
    const med = median(scores);
    const last = total ? srHistory[total - 1] : null;

    // completion "rate" approximation: weeks with at least one check-in divided by weeks since first check-in
    let completionRate = 0;
    if (total >= 1) {
      const firstISO = srHistory[0].ts;
      const weeks = Math.max(1, weeksBetween(firstISO, new Date().toISOString()));
      // Count distinct ISO-week buckets
      const buckets = new Set();
      srHistory.forEach(r => {
        const d = new Date(r.ts);
        const y = d.getUTCFullYear();
        const onejan = new Date(Date.UTC(y, 0, 1));
        const week = Math.ceil((((d.getTime() - onejan.getTime()) / 86400000) + onejan.getUTCDay() + 1) / 7);
        buckets.add(`${y}-W${week}`);
      });
      completionRate = Math.round((buckets.size / weeks) * 100);
    }

    const in7d = srHistory.filter(r => withinDays(r.ts, 7)).length;
    const in30d = srHistory.filter(r => withinDays(r.ts, 30)).length;

    return { total, avg, med, last, completionRate, in7d, in30d };
  }, [srHistory]);

  // ---------- Cycle Resonance metrics ----------
  const cyMetrics = useMemo(() => {
    const total = cyHistory.length;
    const last = total ? cyHistory[total - 1] : null;
    const avgEnergy = total ? Math.round(cyHistory.reduce((a, b) => a + b.energy, 0) / total) : 0;
    const avgMood = total ? Math.round(cyHistory.reduce((a, b) => a + b.mood, 0) / total) : 0;
    const in7d = cyHistory.filter(r => withinDays(r.ts, 7)).length;
    const in30d = cyHistory.filter(r => withinDays(r.ts, 30)).length;
    return { total, last, avgEnergy, avgMood, in7d, in30d };
  }, [cyHistory]);

  // ---------- Actions ----------
  function exportSR() {
    const rows = [
      ["ts", "q1", "q2", "q3", "q4", "q5", "score", "peace", "transcendence", "connection", "meaning", "compassion"]
    ];
    srHistory.forEach(r => rows.push([
      r.ts, String(r.q1), String(r.q2), String(r.q3), String(r.q4), String(r.q5),
      String(r.score),
      String(r.domains?.peace ?? ""),
      String(r.domains?.transcendence ?? ""),
      String(r.domains?.connection ?? ""),
      String(r.domains?.meaning ?? ""),
      String(r.domains?.compassion ?? "")
    ]));
    downloadCSV("spiritual_resonance_history.csv", rows);
  }

  function exportCycle() {
    const rows = [["ts", "energy", "mood", "notes"]];
    cyHistory.forEach(r => rows.push([r.ts, String(r.energy), String(r.mood), r.notes ?? ""]));
    downloadCSV("cycle_resonance_history.csv", rows);
  }

  function resetDev() {
    if (!confirm("Reset local analytics (SR + Cycle) for this device?")) return;
    localStorage.removeItem(LS.SR_USER);
    localStorage.removeItem(LS.SR_HISTORY);
    localStorage.removeItem(LS.CYCLE_USER);
    localStorage.removeItem(LS.CYCLE_HISTORY);
    setSrUser({ optedIn: false, weeklyReminder: true, lastCheckinAt: null });
    setSrHistory([]);
    setCyUser({ gender: "unspecified", enableCycleResonance: false, lifeStage: null, lastCycleUpdate: null, avgCycleLength: null });
    setCyHistory([]);
  }

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <div style={S.hTitle}>Analytics Snapshot</div>
        <div style={S.hMeta}>Last refresh: {lastRefresh.toLocaleTimeString()}</div>
      </div>

      <div style={S.grid}>
        {/* Spiritual Resonance Card */}
        <div style={S.card}>
          <div style={S.cardTitle}>Spiritual Resonance</div>
          <div style={S.kpis}>
            <KPI label="Opted In" value={srUser.optedIn ? "Yes" : "No"} />
            <KPI label="Check-ins (total)" value={String(srMetrics.total)} />
            <KPI label="Avg Score" value={String(srMetrics.avg)} />
            <KPI label="Median" value={String(srMetrics.med)} />
            <KPI label="7d Count" value={String(srMetrics.in7d)} />
            <KPI label="30d Count" value={String(srMetrics.in30d)} />
            <KPI label="Completion Rate" value={`${srMetrics.completionRate}%`} />
          </div>
          {srMetrics.last ? (
            <div style={S.lastBox}>
              <div>Last: <b>{srMetrics.last.score}</b> on {new Date(srMetrics.last.ts).toLocaleDateString()}</div>
              <div style={S.lastSub}>
                Peace {srMetrics.last.domains.peace} · Transc {srMetrics.last.domains.transcendence} · Conn {srMetrics.last.domains.connection} · Meaning {srMetrics.last.domains.meaning} · Comp {srMetrics.last.domains.compassion}
              </div>
            </div>
          ) : (
            <div style={S.lastBoxMuted}>No SR check-ins yet.</div>
          )}
          <div style={S.row}>
            <button style={S.btnPrimary} onClick={exportSR}>Export CSV</button>
          </div>
        </div>

        {/* Cycle Resonance Card */}
        <div style={S.card}>
          <div style={S.cardTitle}>Cycle Resonance</div>
          <div style={S.kpis}>
            <KPI label="Enabled" value={cyUser.enableCycleResonance ? "Yes" : "No"} />
            <KPI label="Entries (total)" value={String(cyMetrics.total)} />
            <KPI label="Avg Energy" value={String(cyMetrics.avgEnergy)} />
            <KPI label="Avg Mood" value={String(cyMetrics.avgMood)} />
            <KPI label="7d Count" value={String(cyMetrics.in7d)} />
            <KPI label="30d Count" value={String(cyMetrics.in30d)} />
            <KPI label="Gender" value={cyUser.gender} />
          </div>
          {cyMetrics.last ? (
            <div style={S.lastBox}>
              <div>Last: Energy {cyMetrics.last.energy}/5 · Mood {cyMetrics.last.mood}/5</div>
              <div style={S.lastSub}>{new Date(cyMetrics.last.ts).toLocaleString()}</div>
            </div>
          ) : (
            <div style={S.lastBoxMuted}>No cycle entries yet.</div>
          )}
          <div style={S.row}>
            <button style={S.btnGhost} onClick={exportCycle}>Export CSV</button>
          </div>
        </div>
      </div>

      <div style={S.devRow}>
        <button style={S.btnDanger} onClick={resetDev}>Reset Local Analytics (Dev)</button>
        <div style={S.hint}>Dev-only: clears localStorage for SR and Cycle data on this device.</div>
      </div>
    </div>
  );
}

// ---------- Small subcomponents ----------
function KPI({ label, value }) {
  return (
    <div style={S.kpi}>
      <div style={S.kpiLabel}>{label}</div>
      <div style={S.kpiValue}>{value}</div>
    </div>
  );
}

// ---------- Styles (dark, Resonifi) ----------
const S = {
  wrap: { background: "#121829", color: "#E7E9ED", border: "1px solid #24304a", borderRadius: 16, padding: 16, marginTop: 16 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 },
  hTitle: { fontWeight: 800, fontSize: 18 },
  hMeta: { color: "#8A8FA2", fontSize: 12 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 },
  card: { background: "#0E1426", border: "1px solid #24304a", borderRadius: 12, padding: 12 },
  cardTitle: { fontWeight: 700, marginBottom: 8 },
  kpis: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 },
  kpi: { background: "#121829", border: "1px solid #24304a", borderRadius: 10, padding: "8px 10px" },
  kpiLabel: { color: "#8A8FA2", fontSize: 11 },
  kpiValue: { fontWeight: 700, fontSize: 14 },
  lastBox: { background: "linear-gradient(135deg,#1A3AFF22,#6B00FF22)", border: "1px solid #2a395a", borderRadius: 10, padding: 10, marginTop: 10, fontSize: 13 },
  lastBoxMuted: { background: "#121829", border: "1px dashed #2a395a", borderRadius: 10, padding: 10, marginTop: 10, color: "#8A8FA2", fontSize: 13 },
  lastSub: { color: "#c9cede", marginTop: 4, fontSize: 12 },
  row: { display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" },
  btnPrimary: { background: "#19E0D3", color: "#0D1220", border: "none", padding: "8px 12px", borderRadius: 10, cursor: "pointer", fontWeight: 700 },
  btnGhost: { background: "transparent", color: "#E7E9ED", border: "1px solid #2a395a", padding: "8px 12px", borderRadius: 10, cursor: "pointer" },
  btnDanger: { background: "#A83B3B", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 10, cursor: "pointer", fontWeight: 700 },
  devRow: { display: "flex", alignItems: "center", gap: 12, marginTop: 12, flexWrap: "wrap" },
  hint: { color: "#8A8FA2", fontSize: 12 }
};