import { useState } from "react";

export default function SliderTest() {
  const [v, setV] = useState(5);

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', padding: 16 }}>
      <style>{`
        /* 1) Make sure nothing blocks pointer input over sliders */
        input[type="range"] { 
          touch-action: pan-x; 
          pointer-events: auto !important; 
          position: relative; 
          z-index: 10; 
        }
        
        /* 2) If any ancestor has our ripple, nuke the overlay ONLY when it contains a range */
        .ripple:has(input[type="range"])::after { 
          display: none !important; 
        }
        
        /* 3) Keep bottom bar UNDER content */
        .bottom-bar { 
          z-index: 0 !important; 
        }
        
        /* 4) Safety: never apply .ripple directly to input[type=range] */
        input[type="range"].ripple { 
          pointer-events: auto !important; 
        }
        
        /* 5) Visual thumb/track */
        .test-range {
          width: 100%; 
          height: 32px; 
          -webkit-appearance: none; 
          background: transparent;
          cursor: pointer;
        }
        
        .test-range::-webkit-slider-runnable-track {
          height: 8px; 
          background: #374151; 
          border-radius: 999px;
        }
        
        .test-range::-webkit-slider-thumb {
          -webkit-appearance: none; 
          width: 28px; 
          height: 28px; 
          border-radius: 50%;
          background: #2DD4BF; 
          margin-top: -10px; 
          border: 2px solid #fff; 
          box-shadow: 0 1px 3px rgba(0,0,0,.4);
          cursor: grab;
        }
        
        .test-range::-webkit-slider-thumb:active {
          cursor: grabbing;
        }
        
        .test-range::-moz-range-track {
          height: 8px; 
          background: #374151; 
          border-radius: 999px;
        }
        
        .test-range::-moz-range-thumb {
          width: 28px; 
          height: 28px; 
          border-radius: 50%; 
          background: #2DD4BF; 
          border: 2px solid #fff; 
          box-shadow: 0 1px 3px rgba(0,0,0,.4);
          cursor: grab;
        }
        
        .test-range::-moz-range-thumb:active {
          cursor: grabbing;
        }
      `}</style>

      <div style={{ maxWidth: 600, margin: '0 auto', color: '#fff' }}>
        <h2 style={{ marginBottom: 16 }}>Safe Slider Test</h2>
        <p style={{ color: '#9CA3AF', marginBottom: 24 }}>
          If this slider works, the issue is in ResonifiSlider. If not, it's a layout/z-index issue.
        </p>

        {/* Test 1: Completely isolated */}
        <div style={{
          marginBottom: 24, 
          padding: 16, 
          border: '1px solid #374151',
          borderRadius: 12, 
          background: '#1A2035', 
          position: 'relative', 
          zIndex: 10
        }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
            Test 1 (Isolated): <span style={{ color: '#2DD4BF' }}>{v}</span>
          </label>
          <input
            type="range"
            className="test-range"
            min={0}
            max={10}
            step={1}
            value={v}
            onChange={(e) => setV(Number(e.target.value))}
          />
          <p style={{ fontSize: 12, color: '#6B7280', marginTop: 8 }}>
            ✓ No ripple wrapper<br/>
            ✓ High z-index<br/>
            ✓ pointer-events: auto
          </p>
        </div>

        {/* Test 2: With potential ripple interference */}
        <div className="ripple" style={{
          marginBottom: 24, 
          padding: 16, 
          border: '1px solid #374151',
          borderRadius: 12, 
          background: '#1A2035'
        }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
            Test 2 (In ripple container): <span style={{ color: '#2DD4BF' }}>{v}</span>
          </label>
          <input
            type="range"
            className="test-range"
            min={0}
            max={10}
            step={1}
            value={v}
            onChange={(e) => setV(Number(e.target.value))}
          />
          <p style={{ fontSize: 12, color: '#6B7280', marginTop: 8 }}>
            ⚠️ Parent has .ripple class<br/>
            → CSS should disable ripple::after
          </p>
        </div>

        {/* Diagnostic info */}
        <div style={{
          padding: 16,
          background: '#1A2035',
          borderRadius: 12,
          border: '1px solid #374151'
        }}>
          <h3 style={{ marginBottom: 8, fontSize: 16 }}>Diagnostic Results:</h3>
          <ul style={{ fontSize: 14, color: '#9CA3AF', paddingLeft: 20 }}>
            <li>Current value: <strong style={{ color: '#2DD4BF' }}>{v}</strong></li>
            <li>If slider moves: Layout is OK ✓</li>
            <li>If slider stuck: Check console for errors</li>
            <li>Try both mouse and touch if on mobile</li>
          </ul>
        </div>
      </div>
    </div>
  );
}