import { Annoyed, Frown, Laugh, Meh, Smile, type LucideIcon } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { journalCategories, type JournalEntry, type JournalMood } from "@/lib/store";
import { cn } from "@/lib/utils";

export const moods: { id: JournalMood; label: string; icon: LucideIcon }[] = [
  { id: "joyful", label: "Joyful", icon: Laugh },
  { id: "calm", label: "Calm", icon: Smile },
  { id: "neutral", label: "Neutral", icon: Meh },
  { id: "anxious", label: "Anxious", icon: Annoyed },
  { id: "sad", label: "Sad", icon: Frown },
];

export type Draft = Omit<JournalEntry, "id" | "updatedAt"> & { id?: string };
const today = () => new Date().toISOString().slice(0, 10);
export const blankDraft = (): Draft => ({ title: "", date: today(), mood: "calm", category: "Reflection", body: "" });

export function JournalEditor({ open, onOpenChange, initial, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; initial: Draft; onSave: (d: Draft) => void }) {
  const [d, setD] = useState<Draft>(initial);
  const [errors, setErrors] = useState<Partial<Record<"title" | "body" | "date", string>>>({});
  useEffect(() => {
    if (open) {
      setD(initial);
      setErrors({});
    }
  }, [open, initial]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    if (!d.title.trim()) err.title = "Please add a title.";
    else if (d.title.length > 120) err.title = "Keep the title under 120 characters.";
    if (!d.body.trim()) err.body = "Write a few words of reflection.";
    if (!d.date) err.date = "Choose a date.";
    setErrors(err);
    if (Object.keys(err).length) return;
    onSave({ ...d, title: d.title.trim(), body: d.body.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] overflow-y-auto rounded-3xl sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl">{initial.id ? "Edit entry" : "New entry"}</DialogTitle>
          <DialogDescription>Saved only in this browser.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="j-title">Title</Label>
            <Input id="j-title" value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} aria-invalid={!!errors.title} aria-describedby={errors.title ? "j-title-err" : undefined} placeholder="Today I noticed…" />
            {errors.title && <p id="j-title-err" className="text-sm text-destructive">{errors.title}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="j-date">Date</Label>
              <Input id="j-date" type="date" value={d.date} max={today()} onChange={(e) => setD({ ...d, date: e.target.value })} aria-invalid={!!errors.date} />
              {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="j-cat">Category</Label>
              <Select value={d.category} onValueChange={(v) => setD({ ...d, category: v })}>
                <SelectTrigger id="j-cat"><SelectValue /></SelectTrigger>
                <SelectContent>{journalCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Mood</legend>
            <div role="radiogroup" aria-label="Mood" className="grid grid-cols-5 gap-2">
              {moods.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={d.mood === id}
                  onClick={() => setD({ ...d, mood: id })}
                  className={cn("flex flex-col items-center gap-1 rounded-xl border p-2 text-[11px] font-medium transition-colors", d.mood === id ? "border-primary bg-secondary text-primary" : "hover:bg-accent")}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="space-y-1.5">
            <Label htmlFor="j-body">Reflection</Label>
            <Textarea id="j-body" rows={6} value={d.body} onChange={(e) => setD({ ...d, body: e.target.value })} aria-invalid={!!errors.body} placeholder="Write freely…" />
            {errors.body && <p className="text-sm text-destructive">{errors.body}</p>}
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save entry</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
