export function initSafeAnalytics() {
  try {
    // No-ops so nothing blocks if Mixpanel/FB are unreachable
    if (!window.mixpanel) window.mixpanel = { init(){}, track(){}, identify(){}, people:{ set(){} } };
    if (!window.fbq) { window.fbq = function(){}; window._fbq = window.fbq; }

    // If you *do* want real analytics later, lazy-load after first paint:
    const lazy = () => {
      try {
        // Example: dynamic import or script injection here
        // import('./realAnalytics').then(m => m.initRealAnalytics());
      } catch {}
    };
    (window.requestIdleCallback || setTimeout)(lazy, 1500);
  } catch {}
}