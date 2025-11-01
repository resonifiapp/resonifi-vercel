
/** -------- Numbers: score & delta -------- **/
export function formatScore(value) {
  if (value === null || value === undefined || isNaN(value)) return "0";
  return Math.round(Number(value)).toString(); // e.g., 72 (no decimals)
}

export function formatDelta(value) {
  if (value === null || value === undefined || isNaN(value)) return "+0";
  const n = Number(value);
  const rounded = Math.round(n); // Round to whole number
  return (n >= 0 ? "+" : "") + rounded;
}

/** -------- Percentages -------- **/
// 0..1 (ratio)  -> "76%" (no decimals)
// 0..100 (pct)  -> "76%" (auto-detect if >1)
export function formatPercent(v) {
  if (v === null || v === undefined || isNaN(v)) return "0%";
  const n = Number(v);
  const pct = n > 1 ? n : n * 100;
  return `${Math.round(pct)}%`;
}

// 0..1 (ratio) -> "76.3%" (1 decimal)
// 0..100       -> "76.3%"
export function formatPercent1(v) {
  if (v === null || v === undefined || isNaN(v)) return "0.0%";
  const n = Number(v);
  const pct = n > 1 ? n : n * 100;
  return `${pct.toFixed(1)}%`;
}

/** -------- Time & durations -------- **/

// Hours (number) -> "7.5 h"  (one decimal, trims .0)
export function formatHours(hours) {
  if (hours === null || hours === undefined || isNaN(hours)) return "0 h";
  const n = Number(hours);
  const s = n.toFixed(1);
  return `${s.endsWith(".0") ? Math.round(n) : s} h`;
}

// Minutes (integer) -> "45 min"
export function formatMinutes(mins) {
  if (mins === null || mins === undefined || isNaN(mins)) return "0 min";
  return `${Math.round(Number(mins))} min`;
}

// Generic compact duration in minutes -> "1h 05m", "45m", "2h"
export function formatDuration(mins) {
  if (mins === null || mins === undefined || isNaN(mins)) return "0m";
  const total = Math.max(0, Math.round(Number(mins)));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (!h) return `${m}m`;
  if (!m) return `${h}h`;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

/** -------- Safe number fallback (for tooltips, etc.) -------- **/
export function formatNumber1(v) {
  if (v === null || v === undefined || isNaN(v)) return "0.0";
  return Number(v).toFixed(1);
}
