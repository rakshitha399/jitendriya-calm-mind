import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Info, RotateCcw, SearchX, SlidersHorizontal } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Chip, EmptyState, PageHeader, SessionCard } from "@/components/common/ui";
import { Button } from "@/components/ui/button";
import { categoryLabels, goalOptions, moodOptions, sessions, type Category } from "@/lib/content";
import { durationLabels, emptyPreferences, hasPreferences, recommend, type DurationPref, type Preferences } from "@/lib/recommend";
import { cn } from "@/lib/utils";

const filters = ["all", "meditation", "mantras", "breathing", "relaxation"] as const;
type Filter = (typeof filters)[number];

export const Route = createFileRoute("/_main/recommendations")({
  validateSearch: (s: Record<string, unknown>): { filter?: Filter } => ({
    filter: filters.includes(s.filter as Filter) ? (s.filter as Filter) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Personalized Recommendations — Jitendriya" },
      { name: "description", content: "Practices suggested from your mood, goals and preferred duration using simple, transparent demo rules." },
      { property: "og:title", content: "Personalized Recommendations — Jitendriya" },
      { property: "og:description", content: "Practices suggested from your mood and goals." },
    ],
  }),
  component: Recommendations,
});

function Recommendations() {
  const { filter = "all" } = Route.useSearch();
  const navigate = useNavigate({ from: "/recommendations" });
  const [prefs, setPrefs] = useState<Preferences>(emptyPreferences);
  const [open, setOpen] = useState(false);
  const results = useMemo(() => recommend(sessions, prefs, filter), [prefs, filter]);
  const active = hasPreferences(prefs);

  const toggle = <K extends "goals" | "categories">(key: K, v: Preferences[K][number]) =>
    setPrefs((p) => {
      const list = p[key] as string[];
      return { ...p, [key]: list.includes(v) ? list.filter((x) => x !== v) : [...list, v] };
    });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="For you"
        title="Personalized Recommendations"
        description="Tell us how you feel and what you're working towards, and we'll gently reorder practices to suit you."
      />

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
        {filters.map((f) => (
          <Chip key={f} active={filter === f} onClick={() => navigate({ search: { filter: f === "all" ? undefined : f }, replace: true })}>
            {f === "all" ? "All" : categoryLabels[f as Category]}
          </Chip>
        ))}
        <Button variant="outline" size="sm" className="ml-auto" aria-expanded={open} aria-controls="prefs" onClick={() => setOpen((o) => !o)}>
          <SlidersHorizontal /> Preferences{active ? " • on" : ""}
        </Button>
      </div>

      {open && (
        <section id="prefs" className="surface-card space-y-6 p-6 fade-up" aria-label="Your preferences">
          <div className="flex items-start gap-3 rounded-xl bg-gold-soft p-3 text-sm">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
            <p>Demo rules, not AI: mood match +2, each goal +2, duration fit +1, preferred category +1. Nothing is sent anywhere.</p>
          </div>
          <PrefGroup label="Current mood">
            {moodOptions.map((m) => (
              <Chip key={m.id} active={prefs.mood === m.id} onClick={() => setPrefs((p) => ({ ...p, mood: p.mood === m.id ? null : m.id }))}>{m.label}</Chip>
            ))}
          </PrefGroup>
          <PrefGroup label="Wellbeing goals">
            {goalOptions.map((g) => <Chip key={g.id} active={prefs.goals.includes(g.id)} onClick={() => toggle("goals", g.id)}>{g.label}</Chip>)}
          </PrefGroup>
          <PrefGroup label="Preferred duration">
            {(Object.keys(durationLabels) as DurationPref[]).map((d) => (
              <Chip key={d} active={prefs.duration === d} onClick={() => setPrefs((p) => ({ ...p, duration: d }))}>{durationLabels[d]}</Chip>
            ))}
          </PrefGroup>
          <PrefGroup label="Preferred categories">
            {(Object.keys(categoryLabels) as Category[]).map((c) => <Chip key={c} active={prefs.categories.includes(c)} onClick={() => toggle("categories", c)}>{categoryLabels[c]}</Chip>)}
          </PrefGroup>
          <Button variant="ghost" size="sm" disabled={!active} onClick={() => setPrefs(emptyPreferences)}><RotateCcw /> Reset preferences</Button>
        </section>
      )}

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {results.length} practice{results.length === 1 ? "" : "s"}{active ? ", ordered by your preferences" : ""}. Sample content.
      </p>

      {results.length === 0 ? (
        <EmptyState icon={<SearchX />} title="Nothing here yet" description="No sample practices in this category. Try another filter." />
      ) : (
        <div className={cn("grid gap-4 lg:grid-cols-2")}>
          {results.map((r) => <SessionCard key={r.session.id} session={r.session} reasons={active ? r.reasons : undefined} />)}
        </div>
      )}
    </div>
  );
}

function PrefGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}
