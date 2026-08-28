"use client";

import * as React from "react";

/**
 * Registers the service worker (production only) so the app is installable and
 * works offline. Renders nothing.
 */
export function PwaRegister() {
  React.useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      typeof navigator === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          // Pick up a new SW as soon as it's installed.
          reg.addEventListener("updatefound", () => {
            const sw = reg.installing;
            sw?.addEventListener("statechange", () => {
              if (
                sw.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                sw.postMessage?.("SKIP_WAITING");
              }
            });
          });
        })
        .catch(() => {
          /* SW registration is best-effort */
        });
    };

    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
