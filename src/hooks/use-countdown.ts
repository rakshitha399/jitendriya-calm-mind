import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Countdown with a single interval. Only one interval can exist at a time:
 * it's created on play and always cleared before a new one starts / on unmount.
 */
export function useCountdown(totalSec: number, onComplete?: () => void) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const done = useRef(onComplete);
  done.current = onComplete;

  const clear = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  useEffect(() => {
    clear();
    if (!running) return;
    timer.current = setInterval(() => {
      setElapsed((e) => Math.min(e + 1, totalSec));
    }, 1000);
    return clear;
  }, [running, totalSec]);

  useEffect(() => {
    if (running && elapsed >= totalSec) {
      setRunning(false);
      done.current?.();
    }
  }, [elapsed, running, totalSec]);

  const seek = useCallback((delta: number) => setElapsed((e) => Math.max(0, Math.min(totalSec, e + delta))), [totalSec]);
  const restart = useCallback(() => {
    setElapsed(0);
    setRunning(true);
  }, []);

  return {
    elapsed,
    remaining: totalSec - elapsed,
    progress: totalSec ? elapsed / totalSec : 0,
    running,
    toggle: () => setRunning((r) => (elapsed >= totalSec ? false : !r)),
    pause: () => setRunning(false),
    seek,
    restart,
  };
}

export const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
