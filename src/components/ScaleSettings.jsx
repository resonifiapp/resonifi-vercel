import { useState } from "react";
import { getScale, setScale, resetScales } from "./lib/scales";
import { Button } from "@/components/ui/button";

const categories = [
  { key: "mood_rating", label: "Mood" },
  { key: "stress_level", label: "Stress" },
  { key: "focus", label: "Focus" },
  { key: "energy_level", label: "Energy" },
  { key: "connection_rating", label: "Connection" },
  { key: "meditation", label: "Meditation" },
  { key: "exercise", label: "Exercise" },
  { key: "screen_time", label: "Screen Time" },
  { key: "sleep", label: "Sleep" },
  { key: "hydration", label: "Hydration" },
];

export default function ScaleSettings() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleReset = () => {
    if (confirm("Reset all scales to defaults?")) {
      resetScales();
      setRefreshKey(prev => prev + 1);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: "#FFFFFF" }}>Scale Settings</h2>
        <Button onClick={handleReset} variant="outline" size="sm">
          Reset to Defaults
        </Button>
      </div>
      <p style={{ color: "#FFFFFF", opacity: 0.7, marginBottom: 20, fontSize: 14 }}>
        Customize how you track each metric. Choose between subjective ratings (0-10) or quantitative measurements.
      </p>
      {categories.map((cat) => (
        <ScaleRow key={`${cat.key}-${refreshKey}`} category={cat.key} label={cat.label} />
      ))}
    </div>
  );
}

function ScaleRow({ category, label }) {
  const [cfg, setCfg] = useState(getScale(category));

  function update(patch) {
    const next = { ...cfg, ...patch };
    setCfg(next);
    setScale(category, patch);
  }

  return (
    <div style={{ 
      marginBottom: 16, 
      padding: 16, 
      border: "1px solid #374151", 
      borderRadius: 12,
      background: "#1A2035",
      boxShadow: "0 2px 6px rgba(0,0,0,.05)"
    }}>
      <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 16, fontWeight: 600, color: "#FFFFFF" }}>{label}</h3>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500, color: "#FFFFFF" }}>
          Type:
        </label>
        <select 
          value={cfg.type} 
          onChange={(e) => update({ type: e.target.value })}
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "1px solid #374151",
            borderRadius: 8,
            background: "#0F172A",
            color: "#FFFFFF",
            fontSize: 14
          }}
        >
          <option value="subjective">Subjective (0–10 rating)</option>
          <option value="quantitative">Quantitative (with units)</option>
        </select>
      </div>

      {cfg.type === "quantitative" && (
        <>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500, color: "#FFFFFF" }}>
              Unit:
            </label>
            <input
              type="text"
              value={cfg.unit || ""}
              onChange={(e) => update({ unit: e.target.value })}
              placeholder="e.g. h, m, glasses"
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #374151",
                borderRadius: 8,
                background: "#0F172A",
                color: "#FFFFFF",
                fontSize: 14
              }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500, color: "#FFFFFF" }}>
                Max:
              </label>
              <input
                type="number"
                value={cfg.max}
                onChange={(e) => update({ max: Number(e.target.value) })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #374151",
                  borderRadius: 8,
                  background: "#0F172A",
                  color: "#FFFFFF",
                  fontSize: 14
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500, color: "#FFFFFF" }}>
                Step:
              </label>
              <input
                type="number"
                step="0.1"
                value={cfg.step}
                onChange={(e) => update({ step: Number(e.target.value) })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #374151",
                  borderRadius: 8,
                  background: "#0F172A",
                  color: "#FFFFFF",
                  fontSize: 14
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}