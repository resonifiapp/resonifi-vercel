// Analytics utilities for Resonifi

export function toSeries(rows, key) {
  return { 
    key, 
    points: rows
      .filter(r => r[key] != null)
      .map(r => ({ x: r.date, y: Number(r[key]) })) 
  };
}

export function movingAvg(points, window = 7) {
  const out = [];
  const buf = [];
  for (let i = 0; i < points.length; i++) {
    buf.push(points[i].y);
    if (buf.length > window) buf.shift();
    out.push({ 
      x: points[i].x, 
      y: buf.length === window ? avg(buf) : null 
    });
  }
  return out;
}

function avg(arr) { 
  return arr.reduce((s, n) => s + n, 0) / arr.length; 
}

export function pearson(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return null;
  const x = xs.slice(0, n);
  const y = ys.slice(0, n);
  const mx = avg(x);
  const my = avg(y);
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) { 
    const ax = x[i] - mx;
    const ay = y[i] - my;
    num += ax * ay;
    dx += ax * ax;
    dy += ay * ay;
  }
  const den = Math.sqrt(dx * dy);
  if (!den) return 0;
  return clamp(num / den, -1, 1);
}

export function align(seriesA, seriesB) {
  const mapB = new Map(seriesB.points.map(p => [p.x, p.y]));
  const xs = [];
  const ys = [];
  seriesA.points.forEach(p => {
    const b = mapB.get(p.x);
    if (b != null) { 
      xs.push(p.y);
      ys.push(b);
    }
  });
  return { xs, ys };
}

function clamp(n, lo, hi) { 
  return Math.max(lo, Math.min(hi, n)); 
}

// Last-7 vs prior-7 comparison
export function delta7(points) {
  if (points.length < 14) return null;
  const last7 = points.slice(-7).map(p => p.y);
  const prev7 = points.slice(-14, -7).map(p => p.y);
  return avg(last7) - avg(prev7);
}

export function fmt(key, v) {
  if (key === "sleep") return `${v.toFixed(1)}h`;
  if (key === "exercise") return `${v}m`;
  if (key === "screen_time") return `${v}h`;
  return `${v}/10`;
}