import { describe, expect, it } from "vitest";
import { buildDemoSessions } from "@/api";
import { addDays, computeStats, counterReducer, dateKey, initialCounter, monthGrid, validateTarget, type ChantingSession } from "./chanting";

const now = new Date(2026, 9, 15, 12);
const sess = (date: Date, chants: number): ChantingSession => ({
  id: Math.random().toString(), mantraId: "om", mantraName: "Om Chanting", target: 21, chants, durationSec: 60,
  savedAt: date.toISOString(), date: dateKey(date), isDemo: false,
});

describe("counter", () => {
  it("Add 10 stops exactly at the target", () => {
    let s = initialCounter("om", 21);
    s = counterReducer(s, { type: "add10", now: 1 });
    s = counterReducer(s, { type: "add10", now: 1 });
    s = counterReducer(s, { type: "add10", now: 1 });
    expect(s.count).toBe(21);
    expect(s.rounds).toBe(1);
  });
  it("Undo reverses the last Add 10 and the completed round", () => {
    let s = counterReducer(initialCounter("om", 11), { type: "tap", now: 1 });
    s = counterReducer(s, { type: "add10", now: 1 });
    s = counterReducer(s, { type: "undo" });
    expect([s.count, s.total, s.rounds]).toEqual([1, 1, 0]);
  });
  it("target is locked once counting starts", () => {
    const s = counterReducer(initialCounter("om", 21), { type: "tap", now: 1 });
    expect(counterReducer(s, { type: "setTarget", target: 108 }).target).toBe(21);
  });
});

describe("custom target", () => {
  it("accepts 1 and 1,000,000 and rejects 0, 1,000,001 and decimals", () => {
    expect(validateTarget("1").ok).toBe(true);
    expect(validateTarget("1000000").ok).toBe(true);
    expect(validateTarget("0").ok).toBe(false);
    expect(validateTarget("1000001").ok).toBe(false);
    expect(validateTarget("2.5").ok).toBe(false);
  });
});

describe("stats", () => {
  it("streak may begin yesterday when today is empty", () => {
    const s = computeStats([sess(addDays(now, -1), 21), sess(addDays(now, -2), 21), sess(addDays(now, -4), 21)], now);
    expect(s.streak).toBe(2);
    expect(s.today).toBe(0);
  });
  it("demo data has a 4-day streak ending today and a 1,000-chant best day", () => {
    const s = computeStats(buildDemoSessions(now), now);
    expect(s.streak).toBe(4);
    expect(s.bestDay?.total).toBe(1000);
  });
  it("calendar is Monday-first", () => {
    // 1 Oct 2026 is a Thursday → 3 leading blanks
    expect(monthGrid(2026, 9).slice(0, 4).map((d) => d?.getDate() ?? null)).toEqual([null, null, null, 1]);
  });
});
