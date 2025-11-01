
import React, { useEffect, useState, useMemo } from "react";

// ======= LOCAL STORAGE KEYS =======
const LS_USER = "cycle:user";
const LS_HISTORY = "cycle:history";

// ======= DEFAULT USER DATA =======
function loadUser() {
  try {
    const x = localStorage.getItem(LS_USER);
    if (x) return JSON.parse(x);
  } catch {}
  // Safe defaults prevent "undefined" hiding bug
  return {
    gender: "unspecified",
    enableCycleResonance: false,
    lifeStage: null,
    lastCycleUpdate: null,
    avgCycleLength: null,
  };
}

function saveUser(u) {
  localStorage.setItem(LS_USER, JSON.stringify(u));
}

// ======= DATA MODEL =======
function loadHistory() {
  try {
    const x = localStorage.getItem(LS_HISTORY);
    return x ? JSON.parse(x) : [];
  } catch {
    return [];
  }
}

function appendEntry(e) {
  const list = loadHistory();
  list.push(e);
  localStorage.setItem(LS_HISTORY, JSON.stringify(list));
}

// ======= COMPONENT =======
export default function CycleResonance({ baseScore, onChange }) {
  const [user, setUser] = useState(() => loadUser());
  const [history, setHistory] = useState(() => loadHistory());
  const [showCheckin, setShowCheckin] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const visible = useMemo(() => {
    // STRICT: Only show if explicitly enabled
    return user.enableCycleResonance === true;
  }, [user.enableCycleResonance]);

  // ====== HELPERS ======
  function toggleEnable(flag) {
    const next = { ...user, enableCycleResonance: flag };
    setUser(next);
    saveUser(next);
  }

  function saveEntry(e) {
    appendEntry(e);
    setHistory((h) => [...h, e]);
    setShowCheckin(false);
    
    // Emit event for dashboard tracking
    if (onChange && typeof onChange === 'function') {
      onChange({ energy: e.energy, mood: e.mood });
    }
  }

  const last = history.length ? history[history.length - 1] : null;

  // Don't render at all if not explicitly enabled
  if (!visible) return null;

  return (
    <div style={S.card}>
      <div style={S.headerRow}>
        <div style={S.title}>Cycle Resonance</div>
        <div style={{ position: "relative" }}>
          <button style={S.infoDot} onClick={() => setInfoOpen((v) => !v)} aria-label="Info">i</button>
          {infoOpen && (
            <div style={S.tooltip}>
              Cycle Resonance helps track energy, mood, and patterns related to biological cycles.  
              Data is private and optional.
            </div>
          )}
        </div>
      </div>

      {!user.enableCycleResonance ? (
        <div style={S.mutedBox}>
          <p style={S.sub}>Track energy and mood through natural rhythm awareness.</p>
          <div style={S.rowGap}>
            <button style={S.btnPrimary} onClick={() => toggleEnable(true)}>
              Enable
            </button>
            <button style={S.btnGhost} onClick={() => toggleEnable(false)}>
              Maybe later
            </button>
          </div>
        </div>
      ) : (
        <>
          {last ? (
            <div style={S.lastEntry}>
              <div style={S.pillLabel}>Last Recorded:</div>
              <div style={S.pillScore}>
                Energy {last.energy}/5 · Mood {last.mood}/5
              </div>
              <div style={S.pillText}>{new Date(last.ts).toLocaleDateString()}</div>
            </div>
          ) : (
            <div style={S.sub}>No entries yet — takes 10 seconds to log.</div>
          )}

          <div style={S.rowGap}>
            <button style={S.btnPrimary} onClick={() => setShowCheckin(true)}>
              Log Today's Cycle Resonance
            </button>
            <label style={S.toggle}>
              <input
                type="checkbox"
                checked={user.enableCycleResonance}
                onChange={(e) => toggleEnable(e.target.checked)}
              />
              Keep enabled
            </label>
          </div>
        </>
      )}

      {showCheckin && (
        <CheckinModal
          onClose={() => setShowCheckin(false)}
          onSave={saveEntry}
        />
      )}
    </div>
  );
}

// ====== SUBCOMPONENTS ======
function CheckinModal({ onClose, onSave }) {
  const [energy, setEnergy] = useState(3);
  const [mood, setMood] = useState(3);
  const [notes, setNotes] = useState("");

  function save() {
    onSave({
      ts: new Date().toISOString(),
      energy,
      mood,
      notes: notes.trim(),
    });
  }

  return (
    <div style={S.backdrop}>
      <div style={S.modal}>
        <button style={S.modalClose} onClick={onClose} aria-label="Close">
          ×
        </button>
        <h3 style={{ marginTop: 0 }}>Log Cycle Resonance</h3>
        <p style={S.sub}>
          Quick reflection: rate your current <b>energy</b> and <b>mood</b>.
        </p>

        <Slider label="Energy level" value={energy} set={setEnergy} />
        <Slider label="Mood" value={mood} set={setMood} />

        <textarea
          placeholder="Optional notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={S.textarea}
        />

        <div style={S.rowGap}>
          <button style={S.btnPrimary} onClick={save}>
            Save
          </button>
          <button style={S.btnGhost} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, set }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={S.label}>{label}</div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => set(parseInt(e.target.value))}
        style={S.slider}
        aria-label={label}
      />
      <div style={S.anchors}>
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );
}

// ====== STYLES ======
const S = {
  card: {
    background: "#121829",
    color: "#E7E9ED",
    border: "1px solid #24304a",
    borderRadius: 16,
    padding: 16,
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontWeight: 700, fontSize: 18 },
  infoDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    background: "#24304a",
    color: "#E7E9ED",
    border: "none",
    cursor: "pointer",
  },
  tooltip: {
    position: "absolute",
    right: 0,
    top: 30,
    background: "#121829",
    border: "1px solid #24304a",
    borderRadius: 12,
    padding: 10,
    width: 260,
    color: "#c9cede",
    fontSize: 12,
    zIndex: 50,
  },
  sub: { color: "#8A8FA2", marginTop: 6, marginBottom: 10 },
  rowGap: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
  btnPrimary: {
    background: "#19E0D3",
    color: "#0D1220",
    border: "none",
    padding: "10px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
  },
  btnGhost: {
    background: "transparent",
    color: "#E7E9ED",
    border: "1px solid #2a395a",
    padding: "10px 12px",
    borderRadius: 10,
    cursor: "pointer",
  },
  toggle: { display: "flex", gap: 8, alignItems: "center", color: "#c9cede", fontSize: 14 },
  mutedBox: {
    background: "#0E1426",
    border: "1px dashed #2a395a",
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
  },
  label: { marginBottom: 6, fontWeight: 600, color: "#E7E9ED" },
  slider: { width: "100%" },
  anchors: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12,
    color: "#8A8FA2",
    marginTop: 4,
  },
  lastEntry: {
    background: "linear-gradient(135deg,#1A3AFF22,#6B00FF22)",
    border: "1px solid #2a395a",
    borderRadius: 12,
    padding: 10,
    margin: "8px 0 12px",
  },
  pillLabel: { fontSize: 12, color: "#8A8FA2" },
  pillScore: { fontSize: 16, fontWeight: 700, margin: "4px 0" },
  pillText: { fontSize: 12, color: "#8A8FA2" },
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    background: "#121829",
    color: "#E7E9ED",
    border: "1px solid #24304a",
    borderRadius: 16,
    padding: "18px 16px",
    width: "min(560px,92vw)",
    position: "relative",
    maxHeight: "90vh",
    overflowY: "auto"
  },
  modalClose: {
    position: "absolute",
    right: 14,
    top: 8,
    background: "transparent",
    color: "#E7E9ED",
    border: "none",
    fontSize: 24,
    cursor: "pointer",
  },
  textarea: {
    width: "100%",
    background: "#0E1426",
    color: "#E7E9ED",
    border: "1px solid #2a395a",
    borderRadius: 10,
    padding: 8,
    minHeight: 60,
    marginTop: 6,
    marginBottom: 12,
    fontFamily: "inherit",
  },
};
