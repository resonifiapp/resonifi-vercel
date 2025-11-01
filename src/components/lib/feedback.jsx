// ===== Asset-free feedback with flags from feedbackPrefs.js =====

import { FEEDBACK } from "./feedbackPrefs";

/* ---------- HAPTICS (native if available; gated by FEEDBACK.haptic) ---------- */
const CAP = (globalThis)?.Capacitor;
const HAPTICS = CAP?.Plugins?.Haptics || (globalThis).TapticEngine || null;

function haptic(kind) {
  if (!FEEDBACK.haptic) return;

  // Capacitor/Ionic
  if (HAPTICS?.impact) {
    const style =
      kind === "heavy" || kind === "error" ? "HEAVY" :
      kind === "success" || kind === "save" ? "MEDIUM" : "LIGHT";
    HAPTICS.impact({ style });
    return;
  }
  // Expo/React Native (optional if you expose ExpoHaptics on globalThis)
  const Expo = (globalThis).ExpoHaptics;
  if (Expo?.impactAsync) {
    const S = Expo.ImpactFeedbackStyle;
    const style =
      kind === "heavy" || kind === "error" ? S.Heavy :
      kind === "success" || kind === "save" ? S.Medium : S.Light;
    Expo.impactAsync(style);
  }
}

/* ---------- AUDIO (WebAudio synth; gated by FEEDBACK.sound) ---------- */
let ctx = null;
let _master = null;
const VOLUME = 0.18;

function ensureCtx() {
  if (!FEEDBACK.sound) return null;
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume?.();
  return ctx;
}

function master() {
  const c = ensureCtx();
  if (!c) return null;
  if (!_master) {
    _master = c.createGain();
    _master.gain.value = VOLUME;
    _master.connect(c.destination);
  }
  return _master;
}

function envGain(c, t0, a = 0.002, d = 0.12, peak = 1.0, floor = 0.0005) {
  const g = c.createGain();
  g.gain.setValueAtTime(floor, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(floor, t0 + a + d);
  return g;
}

function tone(type, f, t, dur, a, d, peak, floor) {
  const c = ensureCtx();
  const bus = master();
  if (!c || !bus) return;
  const o = c.createOscillator();
  o.type = type; 
  o.frequency.setValueAtTime(f, t);
  const g = envGain(c, t, a, d, peak, floor);
  o.connect(g); 
  g.connect(bus);
  o.start(t); 
  o.stop(t + dur);
}

function noise(t, dur = 0.02, level = 0.16) {
  const c = ensureCtx();
  const bus = master();
  if (!c || !bus) return;
  const src = c.createBufferSource();
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
  src.buffer = buf;
  const g = envGain(c, t, 0.001, dur * 0.9, level, 0.0001);
  src.connect(g); 
  g.connect(bus);
  src.start(t);
}

function glideSaw(t, f0, f1, dur = 0.2) {
  const c = ensureCtx();
  const bus = master();
  if (!c || !bus) return;
  const o = c.createOscillator(); 
  o.type = "sawtooth";
  const g = envGain(c, t, 0.005, dur * 0.9, 0.6, 0.0002);
  o.connect(g); 
  g.connect(bus);
  o.frequency.setValueAtTime(f0, t);
  o.frequency.linearRampToValueAtTime(f1, t + dur * 0.9);
  o.start(t); 
  o.stop(t + dur);
}

function playSynth(kind) {
  if (!FEEDBACK.sound) return;
  const c = ensureCtx(); 
  if (!c) return;
  const t0 = c.currentTime + 0.001;

  switch (kind) {
    case "tap":    
      noise(t0, 0.018, 0.14); 
      tone("sine", 520, t0 + 0.002, 0.03); 
      break;
    case "tick":   
      tone("sine", 1200, t0, 0.03); 
      break;
    case "heavy":  
      tone("sine", 110, t0, 0.11); 
      break;
    case "success": 
      tone("triangle", 659.25, t0, 0.08); 
      tone("triangle", 880, t0 + 0.06, 0.10); 
      break;
    case "warning": 
      tone("sine", 660, t0, 0.06); 
      tone("sine", 660, t0 + 0.12, 0.06); 
      break;
    case "error":  
      glideSaw(t0, 240, 190, 0.2); 
      break;
    case "save":   
      noise(t0, 0.02, 0.16); 
      tone("square", 700, t0 + 0.005, 0.05); 
      break;
    case "delete": 
      tone("sine", 90, t0, 0.11); 
      break;
    case "nav":    
      noise(t0, 0.018, 0.16); 
      tone("sine", 520, t0 + 0.002, 0.035); 
      break;
    case "toggle": 
      tone("square", 650, t0, 0.03); 
      tone("square", 540, t0 + 0.05, 0.03); 
      break;
    case "nudge":
      tone("sine", 900, t0, 0.04);
      break;
    case "pulse":
      tone("sine", 880, t0, 0.06, 0.003, 0.08, 0.8, 0.0005);
      break;
  }
}

/* ---------- INIT, RATE LIMIT, PUBLIC API ---------- */
export function initFeedback() {
  if (FEEDBACK.sound) ensureCtx();
}

let lastTime = 0;
const MIN_GAP = 60; // ms

export function feedback(kind, el) {
  const now = performance.now?.() ?? Date.now();
  if (now - lastTime < MIN_GAP) return;
  lastTime = now;
  
  try { playSynth(kind); } catch {}
  haptic(kind);
}