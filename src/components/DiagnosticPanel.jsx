
import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "resonifi:diag:forceShowCycle";

export default function DiagnosticPanel({
  userProfile,
  cycleVisibleInUI = false,
  appVersion,
  refetchUser,
  setForceShowCycleCard
}) {
  const [swCount, setSwCount] = useState(0);
  const [swScopes, setSwScopes] = useState([]);
  const [forceShow, setForceShow] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [now] = useState(new Date());

  // Normalize flags the way your UI likely needs them
  const flags = useMemo(() => {
    const enable =
      (userProfile?.enableCycleResonance ?? false) ||
      (userProfile?.hasCycleResonance ?? false) ||
      userProfile?.featureFlags?.["cycleResonance"] === true;

    const gender = (userProfile?.gender_identity ?? "unspecified").toLowerCase();
    const hasLifeStage = (userProfile?.life_stage_preferences ?? []).length > 0;

    return {
      enableCycleResonance: enable,
      gender,
      hasLifeStage,
      combinedCondition: gender === "female" || hasLifeStage
    };
  }, [userProfile]);

  // Log once on mount + when profile changes
  useEffect(() => {
    // Safe console logging with fallbacks
    if (typeof console.groupCollapsed === 'function') {
      console.groupCollapsed(
        `%c[Diag] CycleResonance @ ${now.toLocaleTimeString()}`,
        "color:#19E0D3"
      );
      console.log("User profile:", userProfile);
      console.log("Derived flags:", flags);
      console.log("Cycle visible in UI (prop):", cycleVisibleInUI);
      console.groupEnd();
    } else {
      // Fallback for environments without groupCollapsed
      console.log(
        `[Diag] CycleResonance @ ${now.toLocaleTimeString()}`,
        { userProfile, flags, cycleVisibleInUI }
      );
    }
  }, [userProfile, flags, cycleVisibleInUI, now]);

  // Service Worker / cache check
  useEffect(() => {
    (async () => {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        setSwCount(regs.length);
        setSwScopes(regs.map((r) => r.scope));
        if (regs.length > 0) {
          if (typeof console.warn === 'function') {
            console.warn(
              "[Diag] Service workers registered:",
              regs.map((r) => r.scope)
            );
          }
        } else {
          console.log("[Diag] No service workers registered.");
        }
      } else {
        console.log("[Diag] Service workers not supported in this browser.");
      }
    })();
  }, []);

  // Optional: expose force-show to local storage + parent
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, forceShow ? "1" : "0");
    } catch {}
    if (setForceShowCycleCard) setForceShowCycleCard(forceShow);
  }, [forceShow, setForceShowCycleCard]);

  const hardReloadNoCache = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("_v", String(Date.now()));
    window.location.replace(url.toString());
  };

  const unregisterAllSW = async () => {
    if (!("serviceWorker" in navigator)) return;
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
    if (window.caches?.keys) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    alert("Service workers unregistered & caches cleared. Reloading…");
    hardReloadNoCache();
  };

  const pretty = (v) =>
    typeof v === "undefined" ? "undefined" : JSON.stringify(v, null, 2);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 99999,
        maxWidth: 420,
        background: "#0D1220",
        color: "#E7E9ED",
        border: "1px solid #1A3AFF55",
        borderRadius: 12,
        padding: 12,
        fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        boxShadow: "0 8px 28px rgba(0,0,0,.35)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <strong>🔎 Cycle Resonance Diagnostics</strong>
        <span style={{ opacity: 0.8 }}>
          build: {appVersion ?? "dev"} • {now.toLocaleTimeString()}
        </span>
      </div>

      <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.4 }}>
        <div style={{ marginBottom: 8 }}>
          <strong>UI State</strong>
          <div>Cycle card visible (prop)? <code>{String(cycleVisibleInUI)}</code></div>
          <div>
            Derived condition:{" "}
            <code>{String(flags.combinedCondition)}</code>{" "}
            {flags.combinedCondition ? "✅" : "⚠️"}
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <strong>User Profile Snapshot</strong>
          <div>email: <code>{userProfile?.email ?? "—"}</code></div>
          <div>gender_identity: <code>{userProfile?.gender_identity ?? "unspecified"}</code></div>
          <div>life_stage_preferences: <code>{JSON.stringify(userProfile?.life_stage_preferences ?? [])}</code></div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <strong>Service Worker / Cache</strong>
          <div>SW registrations: <code>{swCount}</code></div>
          {swScopes.length > 0 && (
            <div style={{ maxHeight: 80, overflow: "auto" }}>
              {swScopes.map((s) => (
                <div key={s}><code>{s}</code></div>
              ))}
            </div>
          )}
        </div>

        <details style={{ marginBottom: 8 }}>
          <summary style={{ cursor: "pointer" }}>Raw userProfile JSON</summary>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 11 }}>{pretty(userProfile)}</pre>
        </details>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => setForceShow((v) => !v)}
            style={btnStyle(forceShow ? "#19E0D3" : "#1A3AFF")}
            title="Forces the Cycle card to render (use to isolate UI issues)"
          >
            {forceShow ? "Force-show: ON" : "Force-show: OFF"}
          </button>

          {refetchUser && (
            <button onClick={() => refetchUser()} style={btnStyle("#6B00FF")}>
              Refetch user
            </button>
          )}

          <button onClick={hardReloadNoCache} style={btnStyle("#4A5568")}>
            Reload (no cache)
          </button>
          <button onClick={unregisterAllSW} style={btnStyle("#A4572E")}>
            Unregister SW + Clear Cache
          </button>
        </div>

        <div style={{ marginTop: 8, opacity: 0.8, fontSize: 12 }}>
          Tips:
          <ul style={{ margin: "4px 0 0 16px" }}>
            <li>Ensure the visibility check waits for <code>userProfile</code> load.</li>
            <li>Check console logs (collapsed group) for full state.</li>
            <li>Force-show toggle bypasses all conditions for testing UI rendering.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function btnStyle(bg) {
  return {
    background: bg,
    color: "white",
    border: "none",
    padding: "8px 10px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 12
  };
}
