"use client";

import * as React from "react";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Shows an "Install" chip only when the browser offers the PWA install prompt
 * (Chrome/Edge/Android). Hidden once installed or when unsupported (e.g. iOS).
 */
export function PwaInstallButton() {
  const [deferred, setDeferred] =
    React.useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = React.useState(false);

  React.useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    const iosStandalone = (
      window.navigator as Navigator & { standalone?: boolean }
    ).standalone;
    if (
      window.matchMedia?.("(display-mode: standalone)").matches ||
      iosStandalone
    ) {
      setInstalled(true);
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || !deferred) return null;

  return (
    <button
      type="button"
      onClick={async () => {
        await deferred.prompt();
        await deferred.userChoice;
        setDeferred(null);
      }}
      className="inline-flex items-center gap-1.5 rounded-full border-2 border-primary/30 bg-card px-3 py-1.5 font-display text-sm font-extrabold text-primary shadow-pop-sm transition-transform hover:brightness-105 active:translate-y-0.5"
    >
      <Download className="h-4 w-4" />
      I-install ang app
    </button>
  );
}
