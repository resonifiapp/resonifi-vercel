import { useEffect } from "react";

export default function PlausiblePing() {
  useEffect(() => {
    if (window.plausible) window.plausible("pageview");

    const fire = () => window.plausible && window.plausible("pageview");
    const origPush = history.pushState;
    history.pushState = function (...args) {
      const ret = origPush.apply(this, args);
      fire();
      return ret;
    };
    window.addEventListener("popstate", fire);
    window.addEventListener("hashchange", fire);

    return () => {
      history.pushState = origPush;
      window.removeEventListener("popstate", fire);
      window.removeEventListener("hashchange", fire);
    };
  }, []);

  return null;
}
