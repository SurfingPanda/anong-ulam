"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  TimerReset,
  Flame,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { parseDuration, formatClock } from "@/lib/parse-duration";
import {
  useCookingTimers,
  type CookingTimer,
} from "@/hooks/use-cooking-timers";
import type { Dish } from "@/lib/mock-ulam-data";

interface CookingModeModalProps {
  dish: Dish | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function beep() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    const gain = ctx.createGain();
    gain.gain.value = 0.15;
    gain.connect(ctx.destination);
    [0, 0.2].forEach((t) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 880;
      osc.connect(gain);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.15);
    });
    setTimeout(() => ctx.close(), 800);
  } catch {
    /* audio not available */
  }
}

export function CookingModeModal({
  dish,
  open,
  onOpenChange,
}: CookingModeModalProps) {
  const [step, setStep] = React.useState(0);
  const [flash, setFlash] = React.useState<string | null>(null);
  const wakeLockRef = React.useRef<{ release: () => Promise<void> } | null>(null);

  const { timers, add, toggle, reset, remove, clearAll } = useCookingTimers(
    (t) => {
      beep();
      if ("vibrate" in navigator) navigator.vibrate?.([200, 100, 200]);
      setFlash(t.label);
      setTimeout(() => setFlash(null), 4000);
    },
  );

  const steps = dish?.instructions ?? [];
  const current = steps[step] ?? "";
  const parsed = React.useMemo(() => parseDuration(current), [current]);

  // reset when a new recipe opens
  React.useEffect(() => {
    if (open) {
      setStep(0);
      setFlash(null);
      clearAll();
    }
  }, [open, dish?.id, clearAll]);

  // keep the screen awake while cooking
  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const wl = await (
          navigator as unknown as {
            wakeLock?: { request: (t: "screen") => Promise<any> };
          }
        ).wakeLock?.request("screen");
        if (wl && !cancelled) wakeLockRef.current = wl;
      } catch {
        /* wake lock unsupported / denied */
      }
    })();
    return () => {
      cancelled = true;
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
    };
  }, [open]);

  if (!dish) return null;

  const atStart = step === 0;
  const atEnd = step === steps.length - 1;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed inset-0 z-50 flex flex-col bg-background data-[state=open]:animate-in data-[state=open]:fade-in-0"
          aria-describedby={undefined}
        >
          {/* header */}
          <div className="flex items-center justify-between border-b px-5 py-3">
            <div className="flex items-center gap-2 text-primary">
              <Flame className="h-5 w-5" />
              <Dialog.Title className="text-lg font-bold text-foreground">
                {dish.name}
              </Dialog.Title>
            </div>
            <Dialog.Close className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary">
              <X className="h-6 w-6" />
              <span className="sr-only">Isara ang Cooking Mode</span>
            </Dialog.Close>
          </div>

          {/* progress */}
          <div className="flex items-center gap-1.5 px-5 py-3">
            {steps.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  i < step
                    ? "bg-primary/50"
                    : i === step
                      ? "bg-primary"
                      : "bg-border",
                )}
              />
            ))}
          </div>

          {/* step body — extra-large type */}
          <div className="flex flex-1 flex-col items-center justify-center px-6 pb-6 text-center">
            <p className="mb-4 text-lg font-bold uppercase tracking-wide text-muted-foreground">
              Hakbang {step + 1} / {steps.length}
            </p>
            <p className="max-w-3xl text-3xl font-semibold leading-snug text-foreground sm:text-4xl md:text-5xl md:leading-snug">
              {current}
            </p>

            {parsed ? (
              <button
                type="button"
                onClick={() => add(parsed.label, parsed.seconds, step + 1)}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-lg font-bold text-primary-foreground shadow-lg hover:bg-primary/90"
              >
                <Play className="h-5 w-5" />
                Simulan ang Timer ({parsed.label})
              </button>
            ) : null}
          </div>

          {/* timer tray */}
          {timers.length > 0 ? (
            <div className="border-t bg-secondary/40 px-4 py-3">
              <div className="mx-auto flex max-w-3xl flex-wrap gap-2">
                {timers.map((t) => (
                  <TimerChip
                    key={t.id}
                    timer={t}
                    onToggle={() => toggle(t.id)}
                    onReset={() => reset(t.id)}
                    onRemove={() => remove(t.id)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {/* nav */}
          <div className="flex items-center justify-between gap-3 border-t px-5 py-4">
            <button
              type="button"
              disabled={atStart}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="inline-flex items-center gap-1.5 rounded-lg border-2 border-border px-5 py-3 text-base font-bold text-foreground disabled:opacity-40"
            >
              <ChevronLeft className="h-5 w-5" />
              Bumalik
            </button>
            {atEnd ? (
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-6 py-3 text-base font-bold text-white"
              >
                Tapos na! 🎉
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setStep((s) => Math.min(steps.length - 1, s + 1))
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-6 py-3 text-base font-bold text-primary-foreground"
              >
                Susunod
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* expiry flash */}
          {flash ? (
            <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center">
              <div className="animate-in fade-in slide-in-from-top-2 rounded-full bg-primary px-6 py-3 text-lg font-bold text-primary-foreground shadow-xl">
                ⏰ Tapos na ang timer: {flash}
              </div>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function TimerChip({
  timer,
  onToggle,
  onReset,
  onRemove,
}: {
  timer: CookingTimer;
  onToggle: () => void;
  onReset: () => void;
  onRemove: () => void;
}) {
  const done = timer.remaining <= 0;
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-sm font-semibold",
        done
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-foreground",
      )}
    >
      <span className="text-xs text-muted-foreground">H{timer.step}</span>
      <span className="tabular-nums text-base font-bold">
        {formatClock(timer.remaining)}
      </span>
      {!done ? (
        <button type="button" onClick={onToggle} aria-label="Pause/Resume">
          {timer.running ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </button>
      ) : (
        <button type="button" onClick={onReset} aria-label="Reset">
          <RotateCcw className="h-4 w-4" />
        </button>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Alisin ang timer"
        className="text-muted-foreground hover:text-foreground"
      >
        <TimerReset className="h-4 w-4" />
      </button>
    </div>
  );
}
