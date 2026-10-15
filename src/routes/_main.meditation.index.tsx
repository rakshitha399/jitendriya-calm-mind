import { createFileRoute } from "@tanstack/react-router";
import { Search, SearchX } from "lucide-react";
import { useState } from "react";
import { Chip, EmptyState, PageHeader, SessionCard } from "@/components/common/ui";
import { Input } from "@/components/ui/input";
import { categoryLabels, sessions, type Category } from "@/lib/content";
import { activityStore, useStore } from "@/lib/store";

export const Route = createFileRoute("/_main/meditation/")({
  head: () => ({
    meta: [
      { title: "Meditation — Jitendriya" },
      { name: "description", content: "Guided meditation, breathing, mantra and relaxation sessions." },
      { property: "og:title", content: "Meditation — Jitendriya" },
      { property: "og:description", content: "Guided sessions for a calmer mind." },
    ],
  }),
  component: MeditationLibrary,
});

function MeditationLibrary() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");
  const activity = useStore(activityStore);
  const list = sessions.filter(
    (s) => (cat === "all" || s.category === cat) && (s.title + s.description).toLowerCase().includes(q.trim().toLowerCase()),
  );
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Meditation"
        title="Guided sessions"
        description={`Choose a session and begin when you're ready. You've completed ${activity.sessionsCompleted} session${activity.sessionsCompleted === 1 ? "" : "s"} in this browser.`}
      />
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input aria-label="Search sessions" placeholder="Search sessions" value={q} onChange={(e) => setQ(e.target.value)} className="h-11 rounded-full bg-card pl-10" />
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <Chip active={cat === "all"} onClick={() => setCat("all")}>All</Chip>
        {(Object.keys(categoryLabels) as Category[]).map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{categoryLabels[c]}</Chip>)}
      </div>
      {list.length === 0 ? (
        <EmptyState icon={<SearchX />} title="No sessions found" description="Try a different search or category." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => <SessionCard key={s.id} session={s} layout="tile" />)}
        </div>
      )}
    </div>
  );
}
