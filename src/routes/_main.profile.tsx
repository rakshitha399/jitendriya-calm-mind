import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Check, Flame, Flower2, Minus, Pencil, Plus, Target, Trash2 } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Chip, SampleBadge, SectionHeading } from "@/components/common/ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { goalOptions, images, sampleUser } from "@/lib/content";
import { activityStore, goalsRepo, goalsStore, journalStore, profileStore, useStore, type PracticeGoal, type Profile } from "@/lib/store";

export const Route = createFileRoute("/_main/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Jitendriya" },
      { name: "description", content: "Your details, wellbeing goals and practice journey." },
      { property: "og:title", content: "My Profile — Jitendriya" },
      { property: "og:description", content: "Your wellbeing goals and practice journey." },
    ],
  }),
  component: ProfilePage,
});

function Stat({ icon, value, label, sample }: { icon: ReactNode; value: ReactNode; label: string; sample?: boolean }) {
  return (
    <div className="surface-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-gold">{icon}</span>
        {sample && <SampleBadge>Sample</SampleBadge>}
      </div>
      <p className="mt-3 font-serif text-3xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ProfilePage() {
  const profile = useStore(profileStore);
  const goals = useStore(goalsStore);
  const activity = useStore(activityStore);
  const journal = useStore(journalStore);
  const [editOpen, setEditOpen] = useState(false);
  const [goalDraft, setGoalDraft] = useState<{ id?: string; title: string; target: string } | null>(null);
  const [goalErr, setGoalErr] = useState<string | null>(null);
  const initials = profile.name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "J";

  const saveGoal = (e: FormEvent) => {
    e.preventDefault();
    if (!goalDraft) return;
    const target = Number(goalDraft.target);
    if (!goalDraft.title.trim()) return setGoalErr("Give your goal a name.");
    if (!Number.isInteger(target) || target < 1 || target > 365) return setGoalErr("Target must be a whole number from 1 to 365.");
    if (goalDraft.id) {
      const g = goals.find((x) => x.id === goalDraft.id);
      goalsRepo.update(goalDraft.id, { title: goalDraft.title.trim(), target, progress: Math.min(g?.progress ?? 0, target) });
      toast.success("Goal updated");
    } else {
      goalsRepo.add(goalDraft.title.trim(), target);
      toast.success("Goal added");
    }
    setGoalDraft(null);
  };

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl bg-secondary/70 p-6 text-center sm:p-10">
        <img src={images.forest} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="relative">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border-4 border-card bg-gold-soft font-serif text-4xl font-semibold text-foreground shadow-lift" aria-hidden>{initials}</div>
          <h1 className="mt-4 text-4xl">{profile.name}</h1>
          <p className="text-sm text-muted-foreground">{profile.tagline}</p>
          <p className="mx-auto mt-3 max-w-md text-sm">{profile.bio}</p>
          <Button variant="outline" size="sm" className="mt-5" onClick={() => setEditOpen(true)}><Pencil /> Edit profile</Button>
        </div>
      </section>

      <section>
        <SectionHeading title="Your journey" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat icon={<Flame />} value={sampleUser.sampleStreakDays} label="Day streak (illustrative)" sample />
          <Stat icon={<Flower2 />} value={activity.sessionsCompleted} label="Sessions completed here" />
          <Stat icon={<BookOpen />} value={journal.length} label="Journal entries" />
          <Stat icon={<Target />} value={goals.filter((g) => g.progress >= g.target).length + "/" + goals.length} label="Goals completed" />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Session and journal counts reflect activity in this browser only. Streak is placeholder data.</p>
      </section>

      <section>
        <SectionHeading title="Wellbeing focus" />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Wellbeing focus">
          {goalOptions.map((g) => (
            <Chip key={g.id} active={profile.focusGoals.includes(g.id)} onClick={() => profileStore.set((p) => ({ ...p, focusGoals: p.focusGoals.includes(g.id) ? p.focusGoals.filter((x) => x !== g.id) : [...p.focusGoals, g.id] }))}>
              {g.label}
            </Chip>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading title="Practice goals" action={<Button size="sm" onClick={() => { setGoalErr(null); setGoalDraft({ title: "", target: "5" }); }}><Plus /> New goal</Button>} />
        {goals.length === 0 ? (
          <p className="surface-card p-6 text-sm text-muted-foreground">No goals yet. Add a small, kind one — like “Meditate 3 times this week”.</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {goals.map((g) => <GoalRow key={g.id} g={g} onEdit={() => { setGoalErr(null); setGoalDraft({ id: g.id, title: g.title, target: String(g.target) }); }} />)}
          </ul>
        )}
        <Link to="/meditation" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">Start a session →</Link>
      </section>

      <EditProfile open={editOpen} onOpenChange={setEditOpen} profile={profile} />

      <Dialog open={!!goalDraft} onOpenChange={(o) => !o && setGoalDraft(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">{goalDraft?.id ? "Edit goal" : "New goal"}</DialogTitle>
            <DialogDescription>Track progress by tapping + each time you practise.</DialogDescription>
          </DialogHeader>
          {goalDraft && (
            <form onSubmit={saveGoal} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="g-title">Goal</Label>
                <Input id="g-title" value={goalDraft.title} onChange={(e) => setGoalDraft({ ...goalDraft, title: e.target.value })} placeholder="Meditate 5 times this week" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="g-target">Target (times)</Label>
                <Input id="g-target" type="number" min={1} max={365} value={goalDraft.target} onChange={(e) => setGoalDraft({ ...goalDraft, target: e.target.value })} />
              </div>
              {goalErr && <p role="alert" className="text-sm text-destructive">{goalErr}</p>}
              <DialogFooter className="gap-2">
                {goalDraft.id && (
                  <Button type="button" variant="ghost" className="mr-auto text-destructive" onClick={() => { goalsRepo.remove(goalDraft.id!); toast.success("Goal removed"); setGoalDraft(null); }}>
                    <Trash2 /> Remove
                  </Button>
                )}
                <Button type="submit">Save goal</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GoalRow({ g, onEdit }: { g: PracticeGoal; onEdit: () => void }) {
  const done = g.progress >= g.target;
  return (
    <li className="surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg">{g.title}</h3>
          <p className="text-xs text-muted-foreground">{done ? "Completed — well done" : `${g.progress} of ${g.target}`}</p>
        </div>
        <Button variant="ghost" size="icon" aria-label={`Edit goal ${g.title}`} onClick={onEdit}><Pencil /></Button>
      </div>
      <Progress value={(g.progress / g.target) * 100} className="mt-3 h-2 bg-secondary" aria-label={`${g.title} progress`} />
      <div className="mt-4 flex items-center gap-2">
        <Button variant="outline" size="icon" aria-label="Decrease progress" disabled={g.progress === 0} onClick={() => goalsRepo.update(g.id, { progress: g.progress - 1 })}><Minus /></Button>
        <Button variant="outline" size="icon" aria-label="Increase progress" disabled={done} onClick={() => goalsRepo.update(g.id, { progress: g.progress + 1 })}><Plus /></Button>
        <Button variant={done ? "secondary" : "ghost"} size="sm" className="ml-auto" onClick={() => { goalsRepo.update(g.id, { progress: done ? 0 : g.target }); if (!done) toast.success("Goal marked complete"); }}>
          <Check /> {done ? "Reopen" : "Mark complete"}
        </Button>
      </div>
    </li>
  );
}

function EditProfile({ open, onOpenChange, profile }: { open: boolean; onOpenChange: (o: boolean) => void; profile: Profile }) {
  const [d, setD] = useState(profile);
  const [err, setErr] = useState<string | null>(null);
  return (
    <Dialog open={open} onOpenChange={(o) => { if (o) { setD(profile); setErr(null); } onOpenChange(o); }}>
      <DialogContent className="rounded-3xl" onOpenAutoFocus={() => { setD(profile); setErr(null); }}>
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Edit profile</DialogTitle>
          <DialogDescription>Stored only in this browser.</DialogDescription>
        </DialogHeader>
        <form
          noValidate
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!d.name.trim()) return setErr("Display name is required.");
            if (d.name.length > 40) return setErr("Keep your name under 40 characters.");
            profileStore.set({ ...d, name: d.name.trim() });
            toast.success("Profile saved");
            onOpenChange(false);
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="p-name">Display name</Label>
            <Input id="p-name" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} aria-invalid={!!err} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-tag">Short description</Label>
            <Input id="p-tag" value={d.tagline} onChange={(e) => setD({ ...d, tagline: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-bio">About you</Label>
            <Textarea id="p-bio" rows={3} value={d.bio} onChange={(e) => setD({ ...d, bio: e.target.value })} />
          </div>
          {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
          <DialogFooter><Button type="submit">Save</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
