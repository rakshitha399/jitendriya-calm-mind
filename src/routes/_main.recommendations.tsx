import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Info, Play, RotateCcw, SearchX } from "lucide-react";
import { useMemo } from "react";
import { Chip, EmptyState, Meta, PageHeader, SectionHeading, SessionCard } from "@/components/common/ui";
import { Button } from "@/components/ui/button";
import { categoryLabels, goalOptions, moodOptions, sessions, type Category, type Goal, type Mood } from "@/lib/content";
import { durationLabels, recommend, type DurationPref, type Preferences } from "@/lib/recommend";
import { journeyStore, useStore } from "@/lib/store";

const filters = ["all", "meditation", "mantras", "breathing", "relaxation"] as const;
type Filter = (typeof filters)[number];

export const Route = createFileRoute("/_main/recommendations")({
  validateSearch: (s: Record<string, unknown>): { filter?: Filter | undefined } => ({
    filter: filters.includes(s["filter"] as Filter) ? (s["filter"] as Filter) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Your Wellbeing Journey — Jitendriya" },
      { name: "description", content: "Check in with your mood, choose a goal and time, and get three ranked practices using simple, transparent demo rules." },
      { property: "og:title", content: "Your Wellbeing Journey — Jitendriya" },
      { property: "og:description", content: "Three practices ranked for your mood, goal and time." },
    ],
  }),
  component: Recommendations,
});

function Recommendations() {
  const { filter = "all" } = Route.useSearch();
  const navigate = useNavigate({ from: "/recommendations" });
  const journey = useStore(journeyStore);

  const prefs: Preferences = useMemo(
    () => ({ mood: journey.mood, goals: journey.goal ? [journey.goal] : [], duration: journey.duration, categories: [] }),
    [journey],
  );
  const active = journey.mood !== null || journey.goal !== null || journey.duration !== "any";
  const results = useMemo(() => recommend(sessions, prefs, filter), [prefs, filter]);
  const top3 = useMemo(() => recommend(sessions, prefs, "all").slice(0, 3), [prefs]);

  const set = (patch: Partial<typeof journey>) => journeyStore.set((j) => ({ ...j, ...patch }));

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="For you"
        title="Your wellbeing journey"
        description="Check in with how you feel, choose a goal and the time you have — we'll rank three practices for you using simple, transparent demo rules."
      />

      <section className="surface-card space-y-6 p-6" aria-label="Your check-in">
        <div className="flex items-start gap-3 rounded-xl bg-gold-soft p-3 text-sm">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
          <p>Demo rules, not AI: mood match +2, goal match +2, duration fit +1. Nothing leaves your browser.</p>
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">How do you feel right now?</legend>
          <div className="flex flex-wrap gap-2">
            {moodOptions.map((m) => (
              <Chip key={m.id} active={journey.mood === m.id} onClick={() => set({ mood: journey.mood === m.id ? null : (m.id as Mood) })}>{m.label}</Chip>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Your wellbeing goal</legend>
          <div className="flex flex-wrap gap-2">
            {goalOptions.map((g) => (
              <Chip key={g.id} active={journey.goal === g.id} onClick={() => set({ goal: journey.goal === g.id ? null : (g.id as Goal) })}>{g.label}</Chip>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Time available</legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(durationLabels) as DurationPref[]).map((d) => (
              <Chip key={d} active={journey.duration === d} onClick={() => set({ duration: d })}>{durationLabels[d]}</Chip>
            ))}
          </div>
        </fieldset>
        <Button variant="ghost" size="sm" disabled={!active} onClick={() => set({ mood: null, goal: null, duration: "any" })}>
          <RotateCcw /> Reset
        </Button>
      </section>

      <section aria-labelledby="top3">
        <SectionHeading title={active ? "Your top 3 practices" : "Top 3 to begin with"} />
        {!active && <p className="mb-4 text-sm text-muted-foreground">Select a mood, goal or time above to personalise this ranking.</p>}
        <div className="grid gap-4 lg:grid-cols-3">
          {top3.map((r, i) => (
            <article key={r.session.id} className="surface-card lift relative flex flex-col overflow-hidden">
              <span className="absolute left-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-primary font-serif text-sm font-semibold text-primary-foreground shadow-lift" aria-label={`Rank ${i + 1}`}>
                {i + 1}
              </span>
              <img src={r.session.image} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover" />
              <div className="flex flex-1 flex-col gap-2 p-5">
                <h3 className="text-2xl">{r.session.title}</h3>
                <Meta session={r.session} />
                <p className="text-sm text-muted-foreground">
                  {active && r.reasons.length > 0 ? `Why this: ${r.reasons.join(" · ").toLowerCase()}. ` : ""}
                  {r.session.description}
                </p>
                <div className="mt-auto pt-3">
                  <Button asChild className="w-full">
                    <Link to="/play/$id" params={{ id: r.session.id }}><Play /> Start practice</Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="browse">
        <SectionHeading title="Browse all practices" />
        <div className="mb-4 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
          {filters.map((f) => (
            <Chip key={f} active={filter === f} onClick={() => navigate({ search: { filter: f === "all" ? undefined : f }, replace: true })}>
              {f === "all" ? "All" : categoryLabels[f as Category]}
            </Chip>
          ))}
        </div>
        <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
          {results.length} practice{results.length === 1 ? "" : "s"}. Sample content.
        </p>
        {results.length === 0 ? (
          <EmptyState icon={<SearchX />} title="Nothing here yet" description="No sample practices in this category. Try another filter." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {results.map((r) => <SessionCard key={r.session.id} session={r.session} reasons={active ? r.reasons : undefined} />)}
          </div>
        )}
      </section>
    </div>
  );
}
