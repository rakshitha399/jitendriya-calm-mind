/**
 * Transparent DEMO recommendation rules (not AI, not scientifically validated).
 * Replace `recommend` with a call to a real engine later; the UI only depends
 * on the returned shape.
 */
import type { Category, Goal, Mood, Session } from "./content";

export type DurationPref = "any" | "short" | "medium" | "long";

export interface Preferences {
  mood: Mood | null;
  goals: Goal[];
  duration: DurationPref;
  categories: Category[];
}

export const emptyPreferences: Preferences = { mood: null, goals: [], duration: "any", categories: [] };

export const durationLabels: Record<DurationPref, string> = {
  any: "Any length",
  short: "Under 8 min",
  medium: "8–15 min",
  long: "Over 15 min",
};

export function matchesDuration(min: number, pref: DurationPref) {
  if (pref === "short") return min < 8;
  if (pref === "medium") return min >= 8 && min <= 15;
  if (pref === "long") return min > 15;
  return true;
}

export interface Scored {
  session: Session;
  score: number;
  reasons: string[];
}

export const hasPreferences = (p: Preferences) =>
  p.mood !== null || p.goals.length > 0 || p.duration !== "any" || p.categories.length > 0;

/** Rules: mood match +2, each goal match +2, duration fit +1, preferred category +1. */
export function recommend(list: Session[], prefs: Preferences, filter: Category | "all"): Scored[] {
  const pool = filter === "all" ? list : list.filter((s) => s.category === filter);
  const scored = pool.map((session) => {
    let score = 0;
    const reasons: string[] = [];
    if (prefs.mood && session.moods.includes(prefs.mood)) {
      score += 2;
      reasons.push("Suits your mood");
    }
    const goalHits = prefs.goals.filter((g) => session.goals.includes(g));
    if (goalHits.length) {
      score += 2 * goalHits.length;
      reasons.push(goalHits.length > 1 ? `Matches ${goalHits.length} goals` : "Matches a goal");
    }
    if (prefs.duration !== "any" && matchesDuration(session.durationMin, prefs.duration)) {
      score += 1;
      reasons.push("Fits your time");
    }
    if (prefs.categories.includes(session.category)) {
      score += 1;
      reasons.push("Preferred category");
    }
    return { session, score, reasons };
  });
  if (!hasPreferences(prefs)) return scored;
  return scored.sort((a, b) => b.score - a.score);
}
