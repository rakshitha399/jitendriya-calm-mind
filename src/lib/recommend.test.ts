import { describe, expect, it } from "vitest";
import { sessions } from "./content";
import { emptyPreferences, matchesDuration, recommend } from "./recommend";

describe("demo recommendation rules", () => {
  it("filters by category tab", () => {
    const r = recommend(sessions, emptyPreferences, "mantras");
    expect(r.every((x) => x.session.category === "mantras")).toBe(true);
  });

  it("scores mood match +2 and each goal +2", () => {
    const r = recommend(sessions, { ...emptyPreferences, mood: "anxious", goals: ["focus", "stress"] }, "all");
    const breathing = r.find((x) => x.session.id === "mindful-breathing")!;
    expect(breathing.score).toBe(6);
  });

  it("duration buckets", () => {
    expect(matchesDuration(5, "short")).toBe(true);
    expect(matchesDuration(15, "medium")).toBe(true);
    expect(matchesDuration(20, "long")).toBe(true);
    expect(matchesDuration(8, "short")).toBe(false);
  });
});
