
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Activity, Info } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BottomNav from "../components/BottomNav";
import Meta from "../components/Meta";
import { feedback } from "../components/lib/feedback";
import CheckinReminderModal from "../components/CheckinReminderModal";

// Resonifi Brand Colors
const COLOR_PRIMARY = "#2E6AFF";
const COLOR_HOVER = "#5083FF";
const COLOR_NAVY_BG = "#0A1A2F";

// Phase computation logic
function estimateOvulationDay(cycleLen, lutealDays) {
  return Math.max(12, Math.min(cycleLen - 10, cycleLen - lutealDays));
}

function computePhase(day, cycleLen = 28, lutealDays = 14, bleedDays = 5) {
  const ovu = estimateOvulationDay(cycleLen, lutealDays);
  if (day <= bleedDays) return "menstrual";
  if (day < ovu - 1) return "follicular";
  if (day <= ovu + 1) return "ovulatory";
  return "luteal";
}

function predictNextPeriod(startISO, cycleLen) {
  const d = new Date(startISO);
  d.setDate(d.getDate() + cycleLen);
  return d.toISOString();
}

function confidenceScore(completedCycles, hasSignals) {
  const base = Math.min(1, (completedCycles / 3) * 0.6);
  const signal = (hasSignals.bbt ? 0.25 : 0) + (hasSignals.cm ? 0.15 : 0);
  return Math.min(1, base + signal);
}

// Chip row component for intensity ratings
function ChipRow({ label, value, setValue }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="w-24 text-sm text-white/70">{label}</span>
      {[0, 1, 2, 3].map((v) => (
        <button
          key={v}
          onClick={() => {
            setValue(v);
            feedback('tick');
          }}
          className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${
            v <= value 
              ? "bg-[#2E6AFF] text-white border border-transparent" 
              : "border border-white/15 text-white/70 hover:bg-white/10"
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

// Multi-metric row for mood/physical symptoms
function MultiRow({ label, state, setState, keys }) {
  return (
    <div className="flex items-start gap-2 flex-wrap">
      <span className="w-24 text-sm text-white/70 pt-2">{label}</span>
      <div className="flex-1 flex flex-wrap gap-2">
        {keys.map((k) => {
          const val = state[k] ?? 0;
          return (
            <button
              key={k}
              onClick={() => {
                setState({ ...state, [k]: (val + 1) % 4 });
                feedback('tick');
              }}
              className={`px-3 py-2 rounded-2xl text-sm font-medium transition-all ${
                val 
                  ? "bg-[#2E6AFF] text-white border border-transparent" 
                  : "text-white/80 border border-white/15 hover:bg-white/10"
              }`}
            >
              {k}
              {val ? ` · ${val}` : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Daily log sheet component
function LogSheet({ onSave, existingLog }) {
  const [energy, setEnergy] = useState(existingLog?.energy || 0);
  const [sleep, setSleep] = useState(existingLog?.sleep_quality || 0);
  const [libido, setLibido] = useState(existingLog?.libido || 0);
  const [mood, setMood] = useState(existingLog?.mood || {});
  const [physical, setPhysical] = useState(existingLog?.physical || {});
  const [bbt, setBBT] = useState(existingLog?.bbt ? String(existingLog.bbt) : "");
  const [cm, setCM] = useState(existingLog?.cervical_mucus || "");
  const [notes, setNotes] = useState(existingLog?.notes || "");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const logData = {
        energy,
        sleep_quality: sleep,
        libido,
        mood,
        physical,
        bbt: bbt ? parseFloat(bbt) : null,
        cervical_mucus: cm || null,
        notes: notes || null
      };

      await onSave(logData);
      feedback('success');
      
    } catch (error) {
      console.error('[CycleTracking] Save failed:', error);
      feedback('error');
      alert('Failed to save log. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <ChipRow label="Energy" value={energy} setValue={setEnergy} />
      <ChipRow label="Sleep" value={sleep} setValue={setSleep} />
      <ChipRow label="Libido" value={libido} setValue={setLibido} />
      
      <MultiRow
        label="Mood"
        state={mood}
        setState={setMood}
        keys={["calm", "creative", "confident", "irritable", "low"]}
      />
      
      <MultiRow
        label="Physical"
        state={physical}
        setState={setPhysical}
        keys={["cramps", "tender", "headache"]}
      />

      <div className="pt-4 border-t border-white/10">
        <button
          onClick={() => {
            setShowAdvanced(!showAdvanced);
            feedback('click');
          }}
          className="text-sm text-white/70 hover:text-white flex items-center gap-2 transition-colors"
        >
          <Info className="w-4 h-4" />
          {showAdvanced ? "Hide" : "Show"} advanced tracking (BBT / Cervical fluid / Notes)
        </button>
        
        {showAdvanced && (
          <div className="grid gap-4 mt-4">
            <div>
              <label className="text-sm text-white/70 mb-2 block">Basal Body Temperature (°C)</label>
              <Input
                type="number"
                step="0.1"
                placeholder="36.5"
                value={bbt}
                onChange={(e) => setBBT(e.target.value)}
                className="bg-white/5 border-white/15 text-white placeholder:text-white/40"
              />
            </div>
            
            <div>
              <label className="text-sm text-white/70 mb-2 block">Cervical Mucus</label>
              <Select value={cm} onValueChange={setCM}>
                <SelectTrigger className="bg-white/5 border-white/15 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dry">Dry</SelectItem>
                  <SelectItem value="sticky">Sticky</SelectItem>
                  <SelectItem value="creamy">Creamy</SelectItem>
                  <SelectItem value="eggwhite">Egg white (fertile)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-white/70 mb-2 block">Notes (optional)</label>
              <Textarea
                placeholder="Any additional observations..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-white/5 border-white/15 text-white placeholder:text-white/40"
                rows={3}
              />
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full px-4 py-2 rounded-2xl text-white font-medium bg-[#2E6AFF] hover:bg-[#5083FF] shadow-sm focus:ring-2 focus:ring-white/30 disabled:opacity-50 transition-all"
      >
        {isSaving ? "Saving..." : existingLog ? "Update Today's Log" : "Save Today's Log"}
      </button>
      
      <p className="text-xs text-white/50 text-center">
        🔒 Private to your account • Export/Delete anytime
      </p>
    </div>
  );
}

// Overview component
function Overview({ onNavigate, cycleData, recentLogs }) {
  const phase = computePhase(cycleData.day, cycleData.cycleLen, cycleData.lutealDays, cycleData.bleedDays);
  const nextPeriod = predictNextPeriod(cycleData.lastPeriodStart, cycleData.cycleLen);
  const conf = confidenceScore(cycleData.completedCycles || 0, { 
    bbt: recentLogs.some(l => l.bbt), 
    cm: recentLogs.some(l => l.cervical_mucus) 
  });

  const phaseColors = {
    menstrual: "text-red-400",
    follicular: "text-green-400",
    ovulatory: "text-purple-400",
    luteal: "text-yellow-400"
  };

  const phaseEmojis = {
    menstrual: "🌙",
    follicular: "🌱",
    ovulatory: "✨",
    luteal: "🍂"
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">{phaseEmojis[phase]}</div>
        <h2 className={`text-2xl font-bold ${phaseColors[phase]} capitalize`}>
          {phase} Phase
        </h2>
        <p className="text-white/70 mt-2">
          Day {cycleData.day} of ~{cycleData.cycleLen}
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-sm p-6 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-white/70">Next period:</span>
          <span className="text-white font-medium">
            {new Date(nextPeriod).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-white/70">Prediction confidence:</span>
          <span className={`font-medium ${
            conf < 0.4 ? "text-yellow-400" : 
            conf < 0.7 ? "text-green-400" : "text-[#2E6AFF]"
          }`}>
            {conf < 0.4 ? "Low" : conf < 0.7 ? "Medium" : "High"}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-[#2E6AFF]/30 bg-[#2E6AFF]/10 p-6">
        <p className="text-sm text-[#2E6AFF]">
          ✨ Your resonance patterns will overlay here as you log more cycles
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onNavigate("log")}
          className="flex-1 px-4 py-2 rounded-2xl text-white font-medium bg-[#2E6AFF] hover:bg-[#5083FF] shadow-sm focus:ring-2 focus:ring-white/30 flex items-center justify-center gap-2 transition-all"
        >
          <Activity className="w-4 h-4" />
          Log Today
        </button>
        <button
          onClick={() => onNavigate("insights")}
          className="flex-1 px-4 py-2 rounded-2xl text-white font-medium border border-white/15 hover:bg-white/10 flex items-center justify-center gap-2 transition-all"
        >
          <TrendingUp className="w-4 h-4" />
          Insights
        </button>
      </div>

      {recentLogs.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-sm">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-white text-sm font-medium">Recent Logs</h3>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {recentLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex justify-between items-center text-sm">
                  <span className="text-white/70">
                    {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex gap-2">
                    {log.energy > 0 && <span className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/15 text-xs text-white/70">⚡ {log.energy}</span>}
                    {log.sleep_quality > 0 && <span className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/15 text-xs text-white/70">😴 {log.sleep_quality}</span>}
                    {log.libido > 0 && <span className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/15 text-xs text-white/70">💕 {log.libido}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-white/50 text-center italic">
        Feel your frequency through your cycle™
      </p>
    </div>
  );
}

// Insights component
function Insights({ logs }) {
  if (logs.length < 7) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-sm p-8 text-center">
        <TrendingUp className="w-12 h-12 mx-auto text-white/50 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Not enough data yet</h3>
        <p className="text-white/70">
          Log at least 7 days to see patterns and insights about your cycle.
        </p>
      </div>
    );
  }

  // Calculate basic insights
  const avgEnergy = logs.reduce((sum, l) => sum + (l.energy || 0), 0) / logs.length;
  const avgSleep = logs.reduce((sum, l) => sum + (l.sleep_quality || 0), 0) / logs.length;
  
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-sm">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-white font-medium">Cycle Insights</h3>
        </div>
        <div className="p-4">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-green-400">📊</span>
              <p className="text-white/80">
                <strong className="text-white">Average energy:</strong> {avgEnergy.toFixed(1)}/3
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-400">😴</span>
              <p className="text-white/80">
                <strong className="text-white">Average sleep:</strong> {avgSleep.toFixed(1)}/3
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-400">💡</span>
              <p className="text-white/80">
                <strong className="text-white">Total logs:</strong> {logs.length} days tracked
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#2E6AFF]/30 bg-[#2E6AFF]/10 p-6">
        <p className="text-[#2E6AFF]">
          🌊 Keep logging to unlock deeper insights about your patterns and resonance shifts
        </p>
      </div>
    </div>
  );
}

// Main cycle tracking page
export default function CycleTracking() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [todayLog, setTodayLog] = useState(null);
  const [cycleData, setCycleData] = useState({
    day: 1,
    cycleLen: 29,
    lutealDays: 14,
    bleedDays: 5,
    lastPeriodStart: new Date().toISOString().split('T')[0],
    completedCycles: 0
  });
  const [showReminderModal, setShowReminderModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // Load cycle logs
      const cycleLogs = await base44.entities.CycleLog.filter(
        { created_by: userData.email },
        "-date",
        90
      );
      setLogs(cycleLogs);

      // Check if there's a log for today
      const today = new Date().toISOString().split('T')[0];
      const todaysLog = cycleLogs.find(l => l.date === today);
      setTodayLog(todaysLog);

      // Calculate cycle day (this is simplified - you'd want to get this from user's cycle start date)
      const daysSinceStart = cycleLogs.length > 0 ? cycleLogs.length % 29 : 1;
      setCycleData(prev => ({
        ...prev,
        day: daysSinceStart || 1,
        completedCycles: Math.floor(cycleLogs.length / 29)
      }));

    } catch (error) {
      console.error('[CycleTracking] Load failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLog = async (logData) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const phase = computePhase(cycleData.day, cycleData.cycleLen, cycleData.lutealDays, cycleData.bleedDays);

      const fullLogData = {
        date: today,
        cycle_day: cycleData.day,
        phase,
        ...logData
      };

      if (todayLog) {
        // Update existing log
        await base44.entities.CycleLog.update(todayLog.id, fullLogData);
      } else {
        // Create new log
        await base44.entities.CycleLog.create(fullLogData);
      }

      // Track analytics
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible('Cycle Log Saved');
      }

      // Reload data
      await loadData();
      
      // Switch to overview to see the updated data
      setTab("overview");

      // Show reminder modal after successful save
      setShowReminderModal(true);

    } catch (error) {
      console.error('[CycleTracking] Save failed:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A1A2F] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E6AFF] mx-auto mb-4"></div>
          <p className="text-white/70">Loading cycle tracking...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Meta
        title="Resonifi™ — Cycle Tracking"
        description="Track your menstrual cycle and discover your patterns"
        url="https://resonifiapp.com/cycle-tracking"
      />
      
      <div className="page-has-bottom-nav min-h-screen bg-[#0A1A2F] px-6 pt-6 pb-20 md:pb-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Cycle Tracking</h1>
            <Calendar className="w-8 h-8 text-[#2E6AFF]" />
          </div>

          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                setTab("overview");
                feedback('nav');
              }}
              className={`px-4 py-2 rounded-2xl font-medium transition-all ${
                tab === "overview"
                  ? "bg-[#2E6AFF] text-white hover:bg-[#5083FF] shadow-sm"
                  : "text-white border border-white/15 hover:bg-white/10"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => {
                setTab("log");
                feedback('nav');
              }}
              className={`px-4 py-2 rounded-2xl font-medium transition-all ${
                tab === "log"
                  ? "bg-[#2E6AFF] text-white hover:bg-[#5083FF] shadow-sm"
                  : "text-white border border-white/15 hover:bg-white/10"
              }`}
            >
              Log
            </button>
            <button
              onClick={() => {
                setTab("insights");
                feedback('nav');
              }}
              className={`px-4 py-2 rounded-2xl font-medium transition-all ${
                tab === "insights"
                  ? "bg-[#2E6AFF] text-white hover:bg-[#5083FF] shadow-sm"
                  : "text-white border border-white/15 hover:bg-white/10"
              }`}
            >
              Insights
            </button>
          </div>
          
          <div className="mt-6">
            {tab === "overview" && (
              <Overview 
                onNavigate={setTab} 
                cycleData={cycleData}
                recentLogs={logs}
              />
            )}
            {tab === "log" && (
              <LogSheet 
                onSave={handleSaveLog}
                existingLog={todayLog}
              />
            )}
            {tab === "insights" && <Insights logs={logs} />}
          </div>
        </div>

        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>

      <CheckinReminderModal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        type="cycle"
      />
    </>
  );
}
