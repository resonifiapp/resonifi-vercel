import { useEffect } from "react";

export default function PlausibleListener() {
  useEffect(() => {
    // Ensure Plausible is loaded
    if (!window.plausible) return;

    // Function to fire a pageview
    const fire = () => {
      if (window.plausible) window.plausible("pageview");
    };

    // Listen for URL changes via popstate and hashchange
    window.addEventListener("popstate", fire);
    window.addEventListener("hashchange", fire);

    // For single-page navigation using pushState()
    const origPush = history.pushState;
    history.pushState = function (...args) {
      const result = origPush.apply(this, args);
      fire();
      return result;
    };

    // Fire one initial pageview when mounted
    fire();

    // Cleanup on unmount
    return () => {
      history.pushState = origPush;
      window.removeEventListener("popstate", fire);
      window.removeEventListener("hashchange", fire);
    };
  }, []);

  return null;
}
