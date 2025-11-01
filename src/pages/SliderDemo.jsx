import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function SimpleSlider({ label, min = 0, max = 10, step = 1 }) {
  const [value, setValue] = useState(5);
  const progressPercent = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ margin: "16px 0", padding: "12px", border: "1px solid #374151", borderRadius: "12px", background: "#1A2035" }}>
      <style>{`
        .test-slider {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          outline: none;
          -webkit-appearance: none;
          appearance: none;
          cursor: pointer;
          background: transparent;
        }
        
        .test-slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(to right, #2DD4BF 0%, #2DD4BF ${progressPercent}%, #374151 ${progressPercent}%, #374151 100%);
        }
        
        .test-slider::-moz-range-track {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(to right, #2DD4BF 0%, #2DD4BF ${progressPercent}%, #374151 ${progressPercent}%, #374151 100%);
        }
        
        .test-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          border: 2px solid #2DD4BF;
        }
        
        .test-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          border: 2px solid #2DD4BF;
        }
      `}</style>
      
      <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#FFFFFF" }}>
        {label}: <span style={{ color: "#2DD4BF", fontWeight: 600 }}>{value}/{max}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="test-slider"
      />
      <div style={{ fontSize: "10px", color: "#666", marginTop: 4 }}>
        Value: {value} | Progress: {progressPercent.toFixed(1)}%
      </div>
    </div>
  );
}

export default function SliderDemo() {
  return (
    <div className="min-h-screen p-6 bg-[#0F172A] text-white">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-[#1A2035]/80 border border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Slider Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">
              Simple test sliders - if these don't work, it's a browser/CSS issue.
            </p>
            <SimpleSlider label="Test 1" />
            <SimpleSlider label="Test 2" />
            <SimpleSlider label="Test 3" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}