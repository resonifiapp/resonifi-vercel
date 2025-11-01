import { useState, useEffect, useRef } from "react";
import { getScale } from "./lib/scales";
import { loadCheckinDraft, saveCheckinDraft } from "./lib/checkin";
import { feedback } from "./lib/feedback";

export default function ResonifiSlider({ 
  category, 
  label, 
  value: externalValue, 
  onChange,
  min = 0,
  max = 10,
  step = 1,
  labels,
  autoSave = false 
}) {
  const sliderRef = useRef(null);
  
  const getInitialValue = () => {
    if (externalValue !== undefined) return externalValue;
    if (autoSave && category) {
      const draft = loadCheckinDraft();
      if (draft && draft[category] !== undefined) return draft[category];
    }
    return (min + max) / 2;
  };
  
  const [internalValue, setInternalValue] = useState(getInitialValue);

  const value = externalValue !== undefined ? externalValue : internalValue;

  useEffect(() => {
    if (autoSave && externalValue === undefined && category) {
      const draft = loadCheckinDraft() || {};
      saveCheckinDraft({ ...draft, [category]: internalValue });
    }
  }, [internalValue, autoSave, category, externalValue]);

  function handleChange(e) {
    const newValue = Number(e.target.value);
    
    const el = sliderRef.current;
    if (el && el.dataset.last !== String(newValue)) {
      el.dataset.last = String(newValue);
      if (typeof feedback === 'function') {
        feedback('tick');
      }
    }
    
    if (onChange) {
      onChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  }

  const progressPercent = ((value - min) / (max - min)) * 100;

  return (
    <div
      style={{
        margin: "16px 0",
        padding: "12px",
        border: "1px solid #374151",
        borderRadius: "12px",
        background: "#1A2035",
        boxShadow: "0 2px 6px rgba(0,0,0,.05)",
        position: "relative",
        zIndex: 2,
      }}
    >
      <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#FFFFFF" }}>
        {label}: <span style={{ color: "#2DD4BF", fontWeight: 600 }}>{value}/{max}</span>
      </label>

      {labels && labels.length === 2 && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: "12px", color: "#9CA3AF" }}>
          <span>{labels[0]}</span>
          <span>{labels[1]}</span>
        </div>
      )}

      <input
        ref={sliderRef}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        onPointerDown={(e) => { if (typeof feedback === 'function') feedback('tap', e.currentTarget); }}
        onPointerUp={(e) => { if (typeof feedback === 'function') feedback('heavy', e.currentTarget); }}
        style={{
          width: "100%",
          height: 32,
          WebkitAppearance: "none",
          background: "transparent",
          touchAction: "pan-x",
          pointerEvents: "auto",
          position: "relative",
          zIndex: 2,
          cursor: "pointer",
        }}
      />

      <style>{`
        input[type="range"]::-webkit-slider-runnable-track {
          height: 8px;
          background: linear-gradient(to right, #2DD4BF 0%, #2DD4BF ${progressPercent}%, #374151 ${progressPercent}%, #374151 100%);
          border-radius: 999px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #FFFFFF;
          margin-top: -10px;
          border: 2px solid #2DD4BF;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: grab;
        }
        input[type="range"]::-webkit-slider-thumb:active {
          cursor: grabbing;
        }
        input[type="range"]::-moz-range-track {
          height: 8px;
          background: linear-gradient(to right, #2DD4BF 0%, #2DD4BF ${progressPercent}%, #374151 ${progressPercent}%, #374151 100%);
          border-radius: 999px;
        }
        input[type="range"]::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 2px solid #2DD4BF;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: grab;
        }
        input[type="range"]::-moz-range-thumb:active {
          cursor: grabbing;
        }
      `}</style>
    </div>
  );
}