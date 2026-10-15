import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BookOpen, Lock, Pencil, Plus, Search, SearchX, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Chip, EmptyState, PageHeader } from "@/components/common/ui";
import { blankDraft, JournalEditor, moods, type Draft } from "@/components/journal/JournalEditor";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { journalCategories, journalRepo, journalStore, useStore, type JournalEntry } from "@/lib/store";

export const Route = createFileRoute("/_main/journal")({
  validateSearch: (s: Record<string, unknown>): { new?: boolean | undefined } => ({ new: s["new"] === true || s["new"] === "true" ? true : undefined }),
  head: () => ({
    meta: [
      { title: "My Journal — Jitendriya" },
      { name: "description", content: "A quiet, private-feeling space for daily reflection." },
      { property: "og:title", content: "My Journal — Jitendriya" },
      { property: "og:description", content: "A quiet space for daily reflection." },
    ],
  }),
  component: Journal,
});

const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });

function Journal() {
  const entries = useStore(journalStore);
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/journal" });
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [editing, setEditing] = useState<Draft | null>(null);
  const [toDelete, setToDelete] = useState<JournalEntry | null>(null);

  useEffect(() => {
    if (search.new) {
      setEditing(blankDraft());
      navigate({ search: {}, replace: true });
    }
  }, [search.new, navigate]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return [...entries]
      .filter((e) => (cat === "All" || e.category === cat) && (!term || (e.title + " " + e.body).toLowerCase().includes(term)))
      .sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt - a.updatedAt);
  }, [entries, q, cat]);

  const save = (d: Draft) => {
    journalRepo.upsert(d);
    toast.success(d.id ? "Entry updated" : "Entry saved");
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My journal"
        title="Your reflections"
        description="A quiet space to notice, name and let go."
        action={<Button onClick={() => setEditing(blankDraft())}><Plus /> <span className="hidden sm:inline">New entry</span><span className="sr-only sm:hidden">New entry</span></Button>}
      />

      <p className="flex items-start gap-2 rounded-xl bg-gold-soft p-3 text-xs">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
        Prototype: entries are stored unencrypted in this browser's local storage and never sent anywhere. Avoid writing highly sensitive information.
      </p>

      {entries.length > 0 && (
        <div className="space-y-3">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input aria-label="Search entries" placeholder="Search entries" value={q} onChange={(e) => setQ(e.target.value)} className="h-11 rounded-full bg-card pl-10" />
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {["All", ...journalCategories].map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <EmptyState icon={<BookOpen />} title="Your journal is waiting" description="Write your first reflection — a sentence is enough." action={<Button onClick={() => setEditing(blankDraft())}><Plus /> Write first entry</Button>} />
      ) : list.length === 0 ? (
        <EmptyState icon={<SearchX />} title="No matching entries" description="Try a different word or category." action={<Button variant="outline" onClick={() => { setQ(""); setCat("All"); }}>Clear filters</Button>} />
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {list.map((e) => {
            const m = moods.find((x) => x.id === e.mood) ?? moods[2]!;
            const Icon = m.icon;
            return (
              <li key={e.id} className="surface-card grid grid-cols-[auto_minmax(0,1fr)] gap-4 p-5">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold-soft text-gold" title={m.label}>
                  <Icon className="h-5 w-5" aria-label={`Mood: ${m.label}`} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-xl">{e.title}</h3>
                      <p className="text-xs text-muted-foreground">{fmtDate(e.date)} · {e.category}</p>
                    </div>
                    <div className="flex shrink-0">
                      <Button variant="ghost" size="icon" aria-label={`Edit ${e.title}`} onClick={() => setEditing({ ...e })}><Pencil /></Button>
                      <Button variant="ghost" size="icon" aria-label={`Delete ${e.title}`} onClick={() => setToDelete(e)}><Trash2 /></Button>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">{e.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <JournalEditor open={!!editing} onOpenChange={(o) => !o && setEditing(null)} initial={editing ?? blankDraft()} onSave={save} />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-2xl">Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>“{toDelete?.title}” will be permanently removed from this browser.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Keep it</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (toDelete) journalRepo.remove(toDelete.id);
                toast.success("Entry deleted");
                setToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
