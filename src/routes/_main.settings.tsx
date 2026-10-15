import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, ChevronRight, Clock, Download, Mail, Moon, Quote, ShieldCheck, Trash2, User, Volume2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/ui";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { settingsStore, useStore, type Settings } from "@/lib/store";

export const Route = createFileRoute("/_main/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Jitendriya" },
      { name: "description", content: "Preferences, reminders, theme, help and privacy." },
      { property: "og:title", content: "Settings — Jitendriya" },
      { property: "og:description", content: "Preferences, reminders, theme, help and privacy." },
    ],
  }),
  component: SettingsPage,
});

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`h-${title}`} className="surface-card overflow-hidden">
      <h2 id={`h-${title}`} className="px-5 pt-5 font-sans text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">{title}</h2>
      <div className="divide-y">{children}</div>
    </section>
  );
}

function Row({ icon, label, hint, htmlFor, children }: { icon: ReactNode; label: string; hint?: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-4">
      <span className="text-primary [&_svg]:h-5 [&_svg]:w-5">{icon}</span>
      <div className="min-w-0">
        <label htmlFor={htmlFor} className="text-sm font-medium">{label}</label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

const faqs = [
  { q: "Is Jitendriya a medical service?", a: "No. It offers general mindfulness practices and is not a substitute for professional care. If you are struggling, please contact a qualified professional or local emergency services." },
  { q: "Are recommendations AI-generated?", a: "Not yet. Recommendations use simple, visible demo rules based on your selected mood, goals and duration." },
  { q: "Why is there no audio?", a: "Sample sessions don't ship audio files yet. The player runs a silent, accurate timer until audio is added." },
];

function SettingsPage() {
  const s = useStore(settingsStore);
  const [savedTime, setSavedTime] = useState(false);
  const set = <K extends keyof Settings>(k: K, v: Settings[K], msg?: string) => {
    settingsStore.set((p) => ({ ...p, [k]: v }));
    if (msg) toast.success(msg);
  };

  const exportData = () => {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if (k.startsWith("jitendriya.")) data[k] = JSON.parse(localStorage.getItem(k) ?? "null");
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "jitendriya-data.json" });
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Your data was downloaded");
  };

  const clearData = () => {
    Object.keys(localStorage).filter((k) => k.startsWith("jitendriya.")).forEach((k) => localStorage.removeItem(k));
    toast.success("Local data cleared — reloading");
    setTimeout(() => window.location.reload(), 600);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader eyebrow="Settings" title="Preferences" description="Changes save automatically in this browser." />

      <Group title="Account">
        <Link to="/profile" className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-muted">
          <User className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">Edit profile</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <p className="px-5 py-3 text-xs text-muted-foreground">Sign-in and account security aren't available in this prototype.</p>
      </Group>

      <Group title="Appearance">
        <Row icon={<Moon />} label="Theme" htmlFor="theme">
          <Select value={s.theme} onValueChange={(v) => set("theme", v as Settings["theme"])}>
            <SelectTrigger id="theme" className="w-32 rounded-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </Row>
      </Group>

      <Group title="Reminders & notifications">
        <Row icon={<Bell />} label="Meditation reminders" hint="Preference only — push notifications aren't connected yet." htmlFor="rem">
          <Switch id="rem" checked={s.meditationReminders} onCheckedChange={(v) => set("meditationReminders", v, v ? "Reminder preference on" : "Reminder preference off")} />
        </Row>
        <Row icon={<Clock />} label="Daily reminder time" htmlFor="rem-time">
          <div className="flex items-center gap-2">
            <Input
              id="rem-time"
              type="time"
              disabled={!s.meditationReminders}
              value={s.reminderTime}
              onChange={(e) => { if (e.target.value) { set("reminderTime", e.target.value); setSavedTime(true); } }}
              onBlur={() => { if (savedTime) { toast.success(`Reminder time set to ${s.reminderTime}`); setSavedTime(false); } }}
              className="w-28 rounded-full"
            />
          </div>
        </Row>
        <Row icon={<Quote />} label="Daily quote on Home" htmlFor="quote">
          <Switch id="quote" checked={s.dailyQuote} onCheckedChange={(v) => set("dailyQuote", v)} />
        </Row>
        <Row icon={<Volume2 />} label="Sound in player" hint="Applies when a session has audio." htmlFor="sound">
          <Switch id="sound" checked={s.sound} onCheckedChange={(v) => set("sound", v)} />
        </Row>
      </Group>

      <Group title="Help & support">
        <Accordion type="single" collapsible className="px-5">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-sm">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <a href="mailto:hello@jitendriya.example" className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-muted">
          <Mail className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">Contact us <span className="text-xs text-muted-foreground">(placeholder address)</span></span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </a>
      </Group>

      <Group title="Privacy">
        <div className="flex gap-3 px-5 py-4 text-sm text-muted-foreground">
          <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
          <p>Everything you enter — journal, goals, profile and preferences — stays in this browser's local storage. It is not encrypted and is not sent to any server.</p>
        </div>
        <div className="flex flex-wrap gap-3 px-5 py-4">
          <Button variant="outline" size="sm" onClick={exportData}><Download /> Download my data</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive"><Trash2 /> Clear all local data</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-serif text-2xl">Clear all local data?</AlertDialogTitle>
                <AlertDialogDescription>Journal entries, goals, profile and preferences will be removed from this browser. This can't be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                <AlertDialogAction className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={clearData}>Clear data</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Group>
    </div>
  );
}
