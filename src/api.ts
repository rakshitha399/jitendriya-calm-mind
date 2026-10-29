/**
 * Chanting data access — the ONLY place the UI gets chanting data from.
 *
 * If VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set in .env,
 * data is stored in Supabase (table: chanting_sessions).
 * Otherwise it falls back to the local browser mock.
 */
import { createClient } from "@supabase/supabase-js";
import {
  addDays, computeStats, dateKey, mantras,
  type ChantingSession, type ChantingStats, type CounterState, type NewChanting,
} from "@/lib/chanting";

// Kept so any other file importing it still works. Not used anymore.
export const API_BASE_URL = "";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Convert a database row (snake_case) into the app's ChantingSession shape
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fromRow = (r: any): ChantingSession => ({
  id: r.id,
  mantraId: r.mantra_id,
  mantraName: r.mantra_name,
  target: r.target,
  chants: r.chants,
  durationSec: r.duration_sec,
  savedAt: new Date(r.saved_at).toISOString(),
  date: r.date,
  isDemo: false,
});

export interface Progress {
  sessions: ChantingSession[];
  stats: ChantingStats;
}

/* ---------- safe localStorage ---------- */
function readLS<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeLS(key: string, value: unknown) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage blocked — ignore */
  }
}

const K = {
  sessions: "jitendriya.chanting.sessions.v1",
  hiddenDemo: "jitendriya.chanting.hiddenDemo.v1",
  showDemo: "jitendriya.chanting.showDemo.v1",
  draft: "jitendriya.chanting.draft.v1",
  silent: "jitendriya.chanting.silent.v1",
};

/* ---------- Demo records (generated relative to today, flagged isDemo) ---------- */
export function buildDemoSessions(now: Date = new Date()): ChantingSession[] {
  const out: ChantingSession[] = [];
  // offsets in days before today: 0-3 form the 4-day streak, 4 is a gap.
  const plan: [number, string, number, number][] = [
    [0, "om", 21, 42], [1, "om-namah-shivaya", 21, 63], [2, "shri-ram-jai-ram", 21, 21], [3, "om-shri-hanumate-namah", 108, 108],
    [6, "om", 21, 21], [7, "om-namah-shivaya", 21, 42], [9, "om-shri-hanumate-namah", 108, 216],
    [12, "om-shri-hanumate-namah", 108, 1000], [13, "om", 21, 21], [15, "shri-ram-jai-ram", 21, 63],
    [18, "om-namah-shivaya", 21, 21], [19, "om", 21, 42], [20, "om-namah-shivaya", 54, 54], [24, "shri-ram-jai-ram", 21, 21],
    [27, "om-shri-hanumate-namah", 21, 84], [30, "om", 11, 22], [33, "om-namah-shivaya", 21, 21], [34, "om-namah-shivaya", 108, 108],
    [38, "shri-ram-jai-ram", 54, 54], [41, "om", 21, 63], [44, "om-shri-hanumate-namah", 108, 108], [47, "om", 21, 21],
    [50, "shri-ram-jai-ram", 21, 42], [53, "om-namah-shivaya", 21, 21], [57, "om", 21, 21], [59, "om-shri-hanumate-namah", 21, 21],
  ];
  // The 1,000-chant day is split across two sittings.
  plan.forEach(([off, id, target, chants], i) => {
    const day = addDays(now, -off);
    const m = mantras.find((x) => x.id === id)!;
    const parts = chants === 1000 ? [540, 460] : [chants];
    parts.forEach((c, j) => {
      const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 6 + j * 12, (i * 7) % 60);
      out.push({
        id: `demo-${off}-${j}`, mantraId: id, mantraName: m.name, target, chants: c,
        durationSec: Math.round(c * 3.2), savedAt: at.toISOString(), date: dateKey(day), isDemo: true,
      });
    });
  });
  return out;
}

/* ---------- Mock implementation (used when Supabase is not configured) ---------- */
const mock = {
  save(input: NewChanting): ChantingSession {
    const at = input.savedAt ?? new Date();
    const session: ChantingSession = {
      id: crypto.randomUUID(), mantraId: input.mantraId, mantraName: input.mantraName,
      target: input.target, chants: input.chants, durationSec: input.durationSec,
      savedAt: at.toISOString(), date: dateKey(at), isDemo: false,
    };
    writeLS(K.sessions, [session, ...readLS<ChantingSession[]>(K.sessions, [])]);
    return session;
  },
  progress(): Progress {
    const real = readLS<ChantingSession[]>(K.sessions, []);
    const hidden = new Set(readLS<string[]>(K.hiddenDemo, []));
    const demo = getShowDemo() ? buildDemoSessions().filter((s) => !hidden.has(s.id)) : [];
    const sessions = [...real, ...demo].sort((a, b) => b.savedAt.localeCompare(a.savedAt));
    return { sessions, stats: computeStats(sessions) };
  },
  remove(id: string) {
    if (id.startsWith("demo-")) writeLS(K.hiddenDemo, [...readLS<string[]>(K.hiddenDemo, []), id]);
    else writeLS(K.sessions, readLS<ChantingSession[]>(K.sessions, []).filter((s) => s.id !== id));
  },
};

/* ---------- Public API ---------- */
export async function saveChanting(input: NewChanting): Promise<ChantingSession> {
  if (!Number.isInteger(input.chants) || input.chants <= 0) throw new Error("Cannot save zero chants.");
  if (!supabase) return mock.save(input);
  const at = input.savedAt ?? new Date();
  const { data, error } = await supabase
    .from("chanting_sessions")
    .insert({
      mantra_id: input.mantraId,
      mantra_name: input.mantraName,
      target: input.target,
      chants: input.chants,
      duration_sec: input.durationSec,
      saved_at: at.toISOString(),
      date: dateKey(at),
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return fromRow(data);
}

export async function getProgress(): Promise<Progress> {
  if (!supabase) return mock.progress();
  const { data, error } = await supabase
    .from("chanting_sessions")
    .select("*")
    .order("saved_at", { ascending: false });
  if (error) throw new Error(error.message);
  const sessions = (data ?? []).map(fromRow);
  return { sessions, stats: computeStats(sessions) };
}

export async function deleteChanting(id: string): Promise<void> {
  if (!supabase) return mock.remove(id);
  const { error } = await supabase.from("chanting_sessions").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* ---------- Local device preferences & unfinished draft ---------- */
export const getShowDemo = () => readLS<boolean>(K.showDemo, true);
export const setShowDemo = (v: boolean) => writeLS(K.showDemo, v);
export const getSilentMode = () => readLS<boolean>(K.silent, false);
export const setSilentMode = (v: boolean) => writeLS(K.silent, v);
export const loadDraft = () => readLS<CounterState | null>(K.draft, null);
export const saveDraft = (s: CounterState | null) => writeLS(K.draft, s);