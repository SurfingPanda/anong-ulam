"use client";

import * as React from "react";

export interface CookingTimer {
  id: string;
  label: string;
  /** Seconds the timer was created with. */
  total: number;
  /** Seconds left. */
  remaining: number;
  running: boolean;
  /** Step (1-based) the timer was started from, for the tray label. */
  step: number;
}

export interface UseCookingTimers {
  timers: CookingTimer[];
  add: (label: string, seconds: number, step: number) => string;
  toggle: (id: string) => void;
  reset: (id: string) => void;
  remove: (id: string) => void;
  clearAll: () => void;
}

/**
 * Manages any number of independent countdowns for Cooking Mode off one
 * interval and wall-clock deadlines (accurate through tab throttling). Timers
 * keep running as the user pages between recipe steps. `onExpire` fires once per
 * timer when it hits zero.
 */
export function useCookingTimers(
  onExpire?: (timer: CookingTimer) => void,
): UseCookingTimers {
  const [timers, setTimers] = React.useState<CookingTimer[]>([]);
  const deadlines = React.useRef<Map<string, number>>(new Map());
  const firedRef = React.useRef<Set<string>>(new Set());
  const timersRef = React.useRef<CookingTimer[]>([]);
  timersRef.current = timers;
  const onExpireRef = React.useRef(onExpire);
  onExpireRef.current = onExpire;

  React.useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const cur = timersRef.current;
      if (cur.length === 0) return;

      const justExpired: CookingTimer[] = [];
      let changed = false;

      const next = cur.map((t) => {
        if (!t.running) return t;
        const dl = deadlines.current.get(t.id);
        if (dl == null) return t;
        const left = Math.max(0, (dl - now) / 1000);
        if (left <= 0) {
          deadlines.current.delete(t.id);
          changed = true;
          const finished = { ...t, remaining: 0, running: false };
          if (!firedRef.current.has(t.id)) {
            firedRef.current.add(t.id);
            justExpired.push(finished);
          }
          return finished;
        }
        if (Math.ceil(left) !== Math.ceil(t.remaining)) changed = true;
        return { ...t, remaining: left };
      });

      if (changed) setTimers(next);
      // fire callbacks outside the state updater
      justExpired.forEach((t) => onExpireRef.current?.(t));
    };

    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, []);

  const add = React.useCallback(
    (label: string, seconds: number, step: number) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `t${Date.now()}${Math.random()}`;
      deadlines.current.set(id, Date.now() + seconds * 1000);
      firedRef.current.delete(id);
      setTimers((prev) => [
        ...prev,
        { id, label, total: seconds, remaining: seconds, running: true, step },
      ]);
      return id;
    },
    [],
  );

  const toggle = React.useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.running) {
          deadlines.current.delete(id);
          return { ...t, running: false };
        }
        if (t.remaining <= 0) return t;
        deadlines.current.set(id, Date.now() + t.remaining * 1000);
        return { ...t, running: true };
      }),
    );
  }, []);

  const reset = React.useCallback((id: string) => {
    deadlines.current.delete(id);
    firedRef.current.delete(id);
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, remaining: t.total, running: false } : t,
      ),
    );
  }, []);

  const remove = React.useCallback((id: string) => {
    deadlines.current.delete(id);
    firedRef.current.delete(id);
    setTimers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = React.useCallback(() => {
    deadlines.current.clear();
    firedRef.current.clear();
    setTimers([]);
  }, []);

  return { timers, add, toggle, reset, remove, clearAll };
}
