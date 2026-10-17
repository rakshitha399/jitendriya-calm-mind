/**
 * Tiny browser-only persistence layer (localStorage). DEMO ONLY: localStorage
 * is not encrypted or secure for sensitive data. Swap these repositories for a
 * backend API later — UI talks only to the exported functions/hooks.
 */
import { useSyncExternalStore } from "react";
import type { Category, Goal } from "./content";

type Listener = () => void;

export function createStore<T>(key: string, initial: T) {
  let cache: T | undefined;
  const listeners = new Set<Listener>();
  const read = (): T => {
    if (cache !== undefined) return cache;
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      cache = raw ? ({ ...(Array.isArray(initial) ? {} : initial), ...JSON.parse(raw) } as T) : initial;
      if (Array.isArray(initial) && raw) cache = JSON.parse(raw) as T;
    } catch {
      cache = initial;
    }
    return cache as T;
  };
  return {
    get: read,
    set(next: T | ((prev: T) => T)) {
      const value = typeof next === "function" ? (next as (p: T) => T)(read()) : next;
      cache = value;
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* storage full or blocked — keep in-memory value */
      }
      listeners.forEach((l) => l());
    },
    subscribe(l: Listener) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    initial,
  };
}

export type Store<T> = ReturnType<typeof createStore<T>>;

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, () => store.initial);
}

/* ---------- Journal ---------- */
export type JournalMood = "joyful" | "calm" | "neutral" | "anxious" | "sad";
export interface JournalEntry {
  id: string;
  title: string;
  date: string; // yyyy-mm-dd
  mood: JournalMood;
  category: string;
  body: string;
  updatedAt: number;
}
export const journalCategories = ["Gratitude", "Emotions", "Growth", "Reflection", "Dreams"];
export const journalStore = createStore<JournalEntry[]>("jitendriya.journal.v1", []);

export const journalRepo = {
  upsert(entry: Omit<JournalEntry, "id" | "updatedAt"> & { id?: string }) {
    const id = entry.id ?? crypto.randomUUID();
    journalStore.set((list) => {
      const next: JournalEntry = { ...entry, id, updatedAt: Date.now() };
      const exists = list.some((e) => e.id === id);
      return exists ? list.map((e) => (e.id === id ? next : e)) : [next, ...list];
    });
    return id;
  },
  remove(id: string) {
    journalStore.set((list) => list.filter((e) => e.id !== id));
  },
};

/* ---------- Profile & goals ---------- */
export interface Profile {
  name: string;
  tagline: string;
  bio: string;
  focusGoals: Goal[];
}
export const profileStore = createStore<Profile>("jitendriya.profile.v1", {
  name: "Shikku",
  tagline: "Student • Dreamer • Seeker",
  bio: "Learning to be kinder to myself, one breath at a time.",
  focusGoals: ["stress", "focus"],
});

export interface PracticeGoal {
  id: string;
  title: string;
  target: number;
  progress: number;
}
export const goalsStore = createStore<PracticeGoal[]>("jitendriya.goals.v1", [
  { id: "g1", title: "Meditate 5 times this week", target: 5, progress: 2 },
  { id: "g2", title: "Write 3 journal reflections", target: 3, progress: 1 },
]);
export const goalsRepo = {
  add(title: string, target: number) {
    goalsStore.set((l) => [...l, { id: crypto.randomUUID(), title, target, progress: 0 }]);
  },
  update(id: string, patch: Partial<PracticeGoal>) {
    goalsStore.set((l) => l.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  },
  remove(id: string) {
    goalsStore.set((l) => l.filter((g) => g.id !== id));
  },
};

/* ---------- Activity (real, local counts) ---------- */
export interface Activity {
  sessionsCompleted: number;
  minutesPracticed: number;
}
export const activityStore = createStore<Activity>("jitendriya.activity.v1", {
  sessionsCompleted: 0,
  minutesPracticed: 0,
});
export const recordSession = (minutes: number) =>
  activityStore.set((a) => ({
    sessionsCompleted: a.sessionsCompleted + 1,
    minutesPracticed: a.minutesPracticed + Math.round(minutes),
  }));

/* ---------- Wellbeing journey (check-in, completions) ---------- */
import type { Mood } from "./content";
import type { DurationPref } from "./recommend";

export interface JourneyPrefs {
  /** yyyy-mm-dd of the last daily check-in. */
  checkInDate: string | null;
  mood: Mood | null;
  goal: Goal | null;
  duration: DurationPref;
}
export const journeyStore = createStore<JourneyPrefs>("jitendriya.journey.v1", {
  checkInDate: null,
  mood: null,
  goal: null,
  duration: "any",
});

export const todayKey = () => new Date().toISOString().slice(0, 10);

export interface Completion {
  id: string;
  sessionId: string;
  title: string;
  durationMin: number;
  completedAt: number;
  moodAfter: Mood | null;
}
export const completionsStore = createStore<Completion[]>("jitendriya.completions.v1", []);
export const recordCompletion = (c: Omit<Completion, "id" | "completedAt">) =>
  completionsStore.set((l) => [{ ...c, id: crypto.randomUUID(), completedAt: Date.now() }, ...l]);

/* ---------- Settings ---------- */
export interface Settings {
  theme: "light" | "dark" | "system";
  meditationReminders: boolean;
  reminderTime: string;
  dailyQuote: boolean;
  sound: boolean;
  preferredCategories: Category[];
}
export const settingsStore = createStore<Settings>("jitendriya.settings.v1", {
  theme: "light",
  meditationReminders: true,
  reminderTime: "07:00",
  dailyQuote: true,
  sound: true,
  preferredCategories: [],
});
