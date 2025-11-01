/* =========================================================================
   RESONIFI COMPREHENSION LAYER (JS/.jsx version) — drop-in
   - Rule-based interpreter that turns scores into human sentences
   - One-line summary + "?" help popover
   - After-save insight hook + weekly summary banner
   ========================================================================= */

import React, { useMemo, useState, useEffect } from "react";

/* ---------------------------------- Brand ---------------------------------- */
const CARD   = "rounded-2xl border border-slate-700/50 bg-[#1A2035]/80 shadow-sm";
const LINK   = "text-[#2DD4BF] underline underline-offset-4 hover:text-[#0D9488]";
const POPOVER= `${CARD} p-4 w-[min(92vw,420px)]`;

/* ------------------------------- Utilities --------------------------------- */
const band20 = (v)=> v>=17?"High": v>=14?"Elevated": v>=10?"Balanced":"Low";
const arrow  = (d)=> d>0.9?"↑": d<-0.9?"↓":"→";
const isoToday = () => new Date().toISOString().slice(0,10);
function delta(cur, base){ if (cur==null || base==null) return 0; return Math.round((cur - base) * 10) / 10; }

/* -------------------------- Interpreter (Rule-based) ------------------------ */
/**
 * interpretAfterSave(input, ctx) -> { message, tone, why }
 * input: { dateISO, spiritualTotal20?, sleep10?, resilience10?, cyclePhase? }
 * ctx:   { avg7: {spiritual20?, sleep10?, resilience10?}, prevWeekAvg: {...} }
 */
export function interpretAfterSave(input, ctx){
  const { spiritualTotal20, sleep10, resilience10, cyclePhase } = input;
  const dSp = delta(spiritualTotal20, ctx.avg7.spiritual20);
  const dSl = delta(sleep10,            ctx.avg7.sleep10);
  const dRe = delta(resilience10,       ctx.avg7.resilience10);

  if (spiritualTotal20!=null && Math.abs(dSp) >= 3) {
    const tone = dSp > 0 ? "good" : "warn";
    const msg  = dSp > 0
      ? `Spiritual ${band20(spiritualTotal20)} today (${spiritualTotal20}/20, ${arrow(dSp)} vs your week).`
      : `Spiritual dipped a bit (${spiritualTotal20}/20). Lighter plans and small wins can help.`;
    return { type:"immediate", message: msg, tone, why: `Change vs 7-day avg: ${dSp}` };
  }

  if (sleep10!=null && dSl <= -1) {
    const lateLuteal = cyclePhase === "luteal";
    const msg = lateLuteal
      ? `Sleep was lower today (late-luteal often dips). Earlier wind-down helps.`
      : `Sleep was lower today — try a simpler evening and earlier wind-down.`;
    return { type:"immediate", message: msg, tone:"warn", why: `Sleep delta: ${dSl}` };
  }

  if (resilience10!=null && dRe >= 1) {
    return { type:"immediate", message:`Resilience holding steady (${resilience10}/10). Nice base to build on.`, tone:"steady", why:`Resilience delta: ${dRe}` };
  }

  return { type:"immediate", message:`Logged. Keep noticing, not judging — patterns > perfection.`, tone:"steady", why:`No large deltas` };
}

/**
 * weeklySummaryLine(curAvg, prevWeekAvg) -> string
 * curAvg:      { spiritual20?, sleep10?, resilience10? }
 * prevWeekAvg: { spiritual20?, sleep10?, resilience10? }
 */
export function weeklySummaryLine(curAvg, prevWeekAvg){
  const s  = curAvg.spiritual20, spD = delta(curAvg.spiritual20, prevWeekAvg.spiritual20);
  const sl = curAvg.sleep10,     slD = delta(curAvg.sleep10,     prevWeekAvg.sleep10);
  const re = curAvg.resilience10,reD = delta(curAvg.resilience10,prevWeekAvg.resilience10);

  const parts = [];
  if (s!=null)  parts.push(`Spiritual ${band20(s)} (${s}/20 ${arrow(spD)})`);
  if (sl!=null) parts.push(`Sleep ~${sl}/10 ${arrow(slD)}`);
  if (re!=null) parts.push(`Resilience ~${re}/10 ${arrow(reD)}`);
  return parts.length ? parts.join(" • ") : "No data yet — log a few days to see your pattern.";
}

/* ------------------------------ Minimal Help UI ---------------------------- */
function HelpContent(){
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white">How to read Spiritual (5 questions)</h3>
      <p className="text-sm text-gray-300">Each question is scored <b className="text-white">0–4</b>. Your total is out of <b className="text-white">20</b>.</p>
      <ul className="text-xs text-gray-300 list-disc pl-5 space-y-1">
        <li><b className="text-white">0</b> – Not at all • <b className="text-white">1</b> – Slightly • <b className="text-white">2</b> – Somewhat • <b className="text-white">3</b> – Strongly • <b className="text-white">4</b> – Very strongly</li>
      </ul>
      <div className="mt-2 text-xs text-gray-300 space-y-2">
        <p><b className="text-white">1️⃣ Connection Beyond Yourself</b> — feeling part of something larger.</p>
        <p><b className="text-white">2️⃣ Alignment with Purpose / Values</b> — actions matched what matters.</p>
        <p><b className="text-white">3️⃣ Gratitude or Awe</b> — noticing appreciation or wonder.</p>
        <p><b className="text-white">4️⃣ Inner Calm or Peace</b> — a sense of steadiness within.</p>
        <p><b className="text-white">5️⃣ Compassion (Self or Others)</b> — kindness or patience to yourself or someone else.</p>
      </div>
      <p className="text-xs text-gray-500">Over time, Spiritual relates to Sleep/Resilience — look for gentle trends, not perfection.</p>
    </div>
  );
}

function ExplainModal({ open, onClose }){
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-x-0 top-[10%] mx-auto max-w-md px-4">
        <div className={POPOVER}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-white">About Spiritual</span>
            <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
          </div>
          <HelpContent/>
          <div className="pt-3 text-right">
            <button onClick={onClose} className="px-3 py-2 rounded-2xl border border-slate-700 hover:bg-white/10 text-sm text-white">Got it</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- One-line summary component ---------------------- */
export function SummaryLineCompact(props){
  const [open,setOpen] = useState(false);
  const sentence = useMemo(()=>{
    const p = [];
    const { spiritualAvg20, spiritualDelta=0, sleepAvg10, sleepDelta=0 } = props;
    if (spiritualAvg20!=null) p.push(`Spiritual ${band20(spiritualAvg20)} (${spiritualAvg20}/20 ${arrow(spiritualDelta)})`);
    if (sleepAvg10!=null)     p.push(`Sleep ~${sleepAvg10}/10 ${arrow(sleepDelta)}`);
    return p.length ? p.join(" • ") : "No data yet — log a check-in to start your summary.";
  }, [props]);

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="text-sm text-gray-300">
        <span className="font-semibold text-white">At a glance: </span>
        <span>{sentence}</span>
      </div>
      <button aria-label="Explain this" className="text-gray-400 hover:text-white text-sm" onClick={()=>setOpen(true)}>?</button>
      <ExplainModal open={open} onClose={()=>setOpen(false)} />
    </div>
  );
}

/* ----------------------------- Weekly banner UI --------------------------- */
export function WeeklySummaryBanner({ curAvg7d, prevWeekAvg }){
  const sentence = useMemo(()=>weeklySummaryLine(curAvg7d, prevWeekAvg), [curAvg7d, prevWeekAvg]);
  const [open,setOpen] = useState(false);
  return (
    <div className={`${CARD} p-4 flex items-center justify-between gap-3`}>
      <div className="text-sm">
        <div className="font-semibold text-white">This week at a glance</div>
        <div className="text-gray-300">{sentence}</div>
      </div>
      <button className={LINK} onClick={()=>setOpen(true)}>Explain this</button>
      <ExplainModal open={open} onClose={()=>setOpen(false)} />
    </div>
  );
}

/* --------------------------- After-save insight hook ----------------------- */
/**
 * Use this right after the user saves the Spiritual 5Q.
 * Returns { message, tone, why } you can show in a toast/snackbar.
 */
export function useInsightAfterSave(input, avg7, prevWeekAvg){
  const [insight, setInsight] = useState(null);

  useEffect(()=>{
    if (!input?.dateISO || !avg7 || !prevWeekAvg) return;
    const ii = interpretAfterSave(input, { avg7, prevWeekAvg });
    setInsight(ii);
  }, [input?.dateISO, input?.spiritualTotal20, input?.sleep10, input?.resilience10, input?.cyclePhase, avg7, prevWeekAvg]);

  return insight; // { message, tone, why }
}