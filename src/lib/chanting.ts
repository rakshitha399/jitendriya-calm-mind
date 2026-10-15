/**
 * Pure chanting logic (no storage, no UI): mantras, local-date helpers,
 * progress statistics and the counter reducer. Fully unit-testable.
 */

export interface Mantra {
  id: string;
  name: string;
  meaning: string;
  defaultTarget: number;
  suggestedTargets: number[];
}

export const mantras: Mantra[] = [
  { id: "om", name: "Om Chanting", meaning: "The primordial sound, a gentle way to gather attention into stillness.", defaultTarget: 21, suggestedTargets: [21] },
  { id: "om-namah-shivaya", name: "Om Namah Shivaya", meaning: "“I bow to Shiva” — a salutation to the inner self and to auspiciousness.", defaultTarget: 21, suggestedTargets: [21] },
  { id: "om-shri-hanumate-namah", name: "Om Shri Hanumate Namah", meaning: "“Salutations to revered Hanuman” — honouring devotion, courage and steadiness.", defaultTarget: 21, suggestedTargets: [21, 108] },
  { id: "shri-ram-jai-ram", name: "Shri Ram Jai Ram Jai Jai Ram", meaning: "A joyful praise of Shri Ram, chanted with devotion and remembrance.", defaultTarget: 21, suggestedTargets: [21] },
];
export const getMantra = (id: string) => mantras.find((m) => m.id === id);

export const TARGET_PRESETS = [3, 11, 21, 54, 108] as const;
export const MAX_TARGET = 1_000_000;

/** Returns the parsed target or an error message. */
export function validateTarget(raw: string): { ok: true; value: number } | { ok: false; error: string } {
  const t = raw.trim();
  if (!/^\d+$/.test(t)) return { ok: false, error: "Enter a whole number." };
  const n = Number(t);
  if (n < 1 || n > MAX_TARGET) return { ok: false, error: "Choose a number from 1 to 1,000,000." };
  return { ok: true, value: n };
}

/* ---------- Data models ---------- */
export interface ChantingSession {
  id: string;
  mantraId: string;
  mantraName: string;
  target: number;
  chants: number;
  durationSec: number;
  /** ISO timestamp the session was saved. */
  savedAt: string;
  /** Local calendar day, yyyy-mm-dd. */
  date: string;
  isDemo: boolean;
}
export type NewChanting = Omit<ChantingSession, "id" | "savedAt" | "date" | "isDemo"> & { savedAt?: Date };

/* ---------- Local dates ---------- */
const pad = (n: number) => String(n).padStart(2, "0");
export const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseKey = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
};
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/* ---------- Stats ---------- */
export interface ChantingStats {
  today: number;
  month: number;
  year: number;
  allTime: number;
  streak: number;
  daysChanted: number;
  bestDay: { date: string; total: number } | null;
  dailyTotals: Record<string, number>;
  byMantra: { mantraId: string; mantraName: string; month: number; allTime: number }[];
}

export function computeStats(sessions: ChantingSession[], now: Date = new Date()): ChantingStats {
  const todayK = dateKey(now);
  const monthP = todayK.slice(0, 7);
  const yearP = todayK.slice(0, 4);
  const daily: Record<string, number> = {};
  const mantraMap = new Map<string, { mantraId: string; mantraName: string; month: number; allTime: number }>();
  let month = 0, year = 0, allTime = 0;
  for (const s of sessions) {
    daily[s.date] = (daily[s.date] ?? 0) + s.chants;
    allTime += s.chants;
    if (s.date.startsWith(yearP)) year += s.chants;
    const inMonth = s.date.startsWith(monthP);
    if (inMonth) month += s.chants;
    const m = mantraMap.get(s.mantraId) ?? { mantraId: s.mantraId, mantraName: s.mantraName, month: 0, allTime: 0 };
    m.allTime += s.chants;
    if (inMonth) m.month += s.chants;
    mantraMap.set(s.mantraId, m);
  }
  let bestDay: ChantingStats["bestDay"] = null;
  for (const [date, total] of Object.entries(daily)) {
    if (total > 0 && (!bestDay || total > bestDay.total)) bestDay = { date, total };
  }
  // Streak: consecutive local days; may begin yesterday if today is empty.
  let cursor = (daily[todayK] ?? 0) > 0 ? now : addDays(now, -1);
  let streak = 0;
  while ((daily[dateKey(cursor)] ?? 0) > 0) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return {
    today: daily[todayK] ?? 0,
    month, year, allTime, streak,
    daysChanted: Object.values(daily).filter((v) => v > 0).length,
    bestDay,
    dailyTotals: daily,
    byMantra: [...mantraMap.values()].sort((a, b) => b.allTime - a.allTime),
  };
}

/** Four green intensity levels (0 = none). */
export const intensity = (total: number): 0 | 1 | 2 | 3 | 4 =>
  total <= 0 ? 0 : total < 30 ? 1 : total < 109 ? 2 : total < 325 ? 3 : 4;

/** Monday-first month grid; null cells pad the first week. */
export function monthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  return [...Array<null>(lead).fill(null), ...Array.from({ length: days }, (_, i) => new Date(year, month, i + 1))];
}

/* ---------- Counter reducer ---------- */
export interface CounterState {
  mantraId: string;
  target: number;
  count: number;
  rounds: number;
  total: number;
  /** Stack of applied increments, for Undo. */
  history: number[];
  startedAt: number | null;
}

export type CounterAction =
  | { type: "tap"; now: number }
  | { type: "add10"; now: number }
  | { type: "undo" }
  | { type: "nextRound" }
  | { type: "reset" }
  | { type: "setTarget"; target: number }
  | { type: "setMantra"; mantraId: string; target: number };

export const initialCounter = (mantraId: string, target: number): CounterState => ({
  mantraId, target, count: 0, rounds: 0, total: 0, history: [], startedAt: null,
});

export const isComplete = (s: CounterState) => s.count >= s.target;
export const isLocked = (s: CounterState) => s.total > 0;

export function counterReducer(s: CounterState, a: CounterAction): CounterState {
  switch (a.type) {
    case "tap":
    case "add10": {
      if (isComplete(s)) return s;
      const step = Math.min(a.type === "tap" ? 1 : 10, s.target - s.count);
      const count = s.count + step;
      return {
        ...s, count, total: s.total + step,
        rounds: count >= s.target ? s.rounds + 1 : s.rounds,
        history: [...s.history, step],
        startedAt: s.startedAt ?? a.now,
      };
    }
    case "undo": {
      if (!s.history.length || s.count === 0) return s;
      const step = s.history[s.history.length - 1]!;
      const wasComplete = isComplete(s);
      const total = s.total - step;
      return {
        ...s, count: s.count - step, total,
        rounds: wasComplete ? s.rounds - 1 : s.rounds,
        history: s.history.slice(0, -1),
        startedAt: total === 0 ? null : s.startedAt,
      };
    }
    case "nextRound":
      return isComplete(s) ? { ...s, count: 0, history: [] } : s;
    case "reset":
      return initialCounter(s.mantraId, s.target);
    case "setTarget":
      return isLocked(s) ? s : { ...s, target: a.target };
    case "setMantra":
      return isLocked(s) ? s : initialCounter(a.mantraId, a.target);
  }
}
