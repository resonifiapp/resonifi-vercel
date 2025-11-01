import { useState, useEffect } from "react";
import { loadCheckinDraft, saveCheckinDraft } from "./lib/checkin";
import { feedback } from "./lib/feedback";
import { Minus, Plus } from "lucide-react";

function round(n, step) { 
  const f = 1/step; 
  return Math.round(n*f)/f; 
}

function formatValue(v, unitLabel, fixed1) {
  const display = fixed1 ? (Math.round(v * 10) / 10).toFixed(1) : String(v);
  return unitLabel ? `${display} ${unitLabel}` : display;
}

export default function ResonifiStepper({ 
  category, 
  label, 
  value: externalValue, 
  onChange,
  min = 0,
  max = 10,
  step = 1,
  unitLabel = '/10',
  fixed1 = false,
  autoSave = false 
}) {
  const getInitialValue = () => {
    if (externalValue !== undefined) return externalValue;
    if (autoSave) {
      const draft = loadCheckinDraft();
      if (draft && draft[category] !== undefined) return draft[category];
    }
    return (min + max) / 2;
  };
  
  const [internalValue, setInternalValue] = useState(getInitialValue);

  const value = externalValue !== undefined ? externalValue : internalValue;

  useEffect(() => {
    if (autoSave && externalValue === undefined) {
      const draft = loadCheckinDraft() || {};
      saveCheckinDraft({ ...draft, [category]: internalValue });
    }
  }, [internalValue, autoSave, category, externalValue]);

  const handleDecrease = () => {
    const newValue = Math.max(min, round(value - step, step));
    if (newValue !== value) {
      if (typeof feedback === 'function') feedback('tick');
      if (onChange) {
        onChange(newValue);
      } else {
        setInternalValue(newValue);
      }
    }
  };

  const handleIncrease = () => {
    const newValue = Math.min(max, round(value + step, step));
    if (newValue !== value) {
      if (typeof feedback === 'function') feedback('tick');
      if (onChange) {
        onChange(newValue);
      } else {
        setInternalValue(newValue);
      }
    }
  };

  const atMin = value <= min;
  const atMax = value >= max;

  return (
    <div
      style={{
        margin: "16px 0",
        padding: "12px",
        border: "1px solid #374151",
        borderRadius: "12px",
        background: "#1A2035",
        boxShadow: "0 2px 6px rgba(0,0,0,.05)",
      }}
    >
      <label style={{ display: "block", marginBottom: 12, fontWeight: 500, color: "#FFFFFF" }}>
        {label}
      </label>

      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        gap: 12 
      }}>
        <button
          onClick={handleDecrease}
          disabled={atMin}
          aria-label={`decrease ${label}`}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "2px solid #374151",
            background: atMin ? "#1A2035" : "#374151",
            color: atMin ? "#4B5563" : "#FFFFFF",
            cursor: atMin ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            opacity: atMin ? 0.5 : 1,
          }}
        >
          <Minus className="w-5 h-5" />
        </button>

        <div style={{
          flex: 1,
          textAlign: "center",
          padding: "12px 16px",
          background: "#0F172A",
          borderRadius: "8px",
          border: "2px solid #2DD4BF",
        }}>
          <div style={{ 
            fontSize: "24px", 
            fontWeight: "700", 
            color: "#2DD4BF",
            marginBottom: "4px",
            fontVariantNumeric: "tabular-nums"
          }}>
            {formatValue(value, unitLabel, fixed1)}
          </div>
          <div style={{ 
            fontSize: "12px", 
            color: "#9CA3AF",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}>
            {label}
          </div>
        </div>

        <button
          onClick={handleIncrease}
          disabled={atMax}
          aria-label={`increase ${label}`}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "2px solid #2DD4BF",
            background: atMax ? "#1A2035" : "#2DD4BF",
            color: "#FFFFFF",
            cursor: atMax ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            opacity: atMax ? 0.5 : 1,
          }}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}