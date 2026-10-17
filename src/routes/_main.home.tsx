import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ChevronRight, Compass, Flower2, Play, ScrollText, Sparkles, Sprout } from "lucide-react";
import { useState } from "react";
import { ProgressRing, SampleBadge, SectionHeading } from "@/components/common/ui";
import { Button } from "@/components/ui/button";
import { getSession, moodOptions, quoteForDate, reflectionPrompts, sampleUser } from "@/lib/content";
import { journeyStore, profileStore, settingsStore, todayKey, useStore } from "@/lib/store";

export const Route = createFileRoute("/_main/home")({
  head: () => ({
    meta: [
      { title: "Home — Jitendriya" },
      { name: "description", content: "Your calm daily dashboard: a quote, today's practice and a moment of reflection." },
      { property: "og:title", content: "Home — Jitendriya" },
      { property: "og:description", content: "Your calm daily dashboard on Jitendriya." },
    ],
  }),
  component: Home,
});

const quick = [
  { to: "/meditation", label: "Meditate", icon: Flower2 },
  { to: "/wisdom", label: "Daily Wisdom", icon: ScrollText },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/journal", label: "Journal", icon: BookOpen },
] as const;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function Home() {
  const profile = useStore(profileStore);
  const { dailyQuote } = useStore(settingsStore);
  const journey = useStore(journeyStore);
  const checkedInToday = journey.checkInDate === todayKey();
  const quote = quoteForDate(new Date());
  const rec = getSession("mindful-breathing")!;
  const [promptIdx, setPromptIdx] = useState(0);

  return (
    <div className="space-y-10">
      <section className="fade-up">
        <p className="text-muted-foreground" suppressHydrationWarning>{greeting()},</p>
        <h1 className="mt-1 flex items-center gap-2 text-5xl">
          {profile.name} <Sprout className="h-7 w-7 text-sage" aria-hidden />
        </h1>
        {dailyQuote && (<blockquote className="mt-4 max-w-xl font-serif text-xl italic text-muted-foreground">
          “{quote.text}”
        </blockquote>)}
      </section>

      <section className="surface-card p-6" aria-labelledby="checkin">
        <div className="flex items-center justify-between gap-3">
          <h2 id="checkin" className="text-2xl">How do you feel today?</h2>
          {checkedInToday && <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">Checked in</span>}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6" role="group" aria-label="Select your mood">
          {moodOptions.map((m) => {
            const active = checkedInToday && journey.mood === m.id;
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={active}
                onClick={() => journeyStore.set((j) => ({ ...j, checkInDate: todayKey(), mood: m.id }))}
                className={`rounded-2xl border px-3 py-3 text-sm font-medium transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-accent"}`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/recommendations"><Sparkles /> See practices for your mood</Link>
        </Button>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <section className="surface-card p-6" aria-labelledby="wellness">
          <div className="flex items-center justify-between gap-3">
            <h2 id="wellness" className="text-2xl">Your Spiritual Wellness</h2>
            <SampleBadge />
          </div>
          <div className="mt-5 flex items-center gap-6">
            <ProgressRing value={sampleUser.sampleWellnessPercent} label={`Sample wellness progress ${sampleUser.sampleWellnessPercent}%`} />
            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">On track</span>
              <p className="mt-2 text-sm text-muted-foreground">
                This is an illustrative indicator only — Jitendriya does not measure your wellbeing yet.
              </p>
              <Link to="/profile" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                View your journey <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <nav aria-label="Quick access" className="grid grid-cols-2 gap-4">
          {quick.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="surface-card lift flex flex-col items-center justify-center gap-3 p-5 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary"><Icon className="h-6 w-6" /></span>
              <span className="text-sm font-semibold">{label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <section>
        <SectionHeading title="Today's Recommendation" action={<SampleBadge>Sample pick</SampleBadge>} />
        <Link to="/meditation/$id" params={{ id: rec.id }} className="group surface-card lift grid overflow-hidden sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <img src={rec.image} alt="" loading="lazy" className="aspect-[16/10] h-full w-full object-cover sm:aspect-auto" />
          <div className="flex flex-col justify-center gap-3 p-6">
            <h3 className="text-3xl">{rec.title}</h3>
            <p className="text-muted-foreground">{rec.subtitle}. {rec.durationMin} minutes · {rec.difficulty}.</p>
            <span className="mt-2 inline-flex items-center gap-2 font-semibold text-primary">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-105"><Play className="h-4 w-4 fill-current" /></span>
              View session
            </span>
          </div>
        </Link>
      </section>

      <section className="surface-card relative overflow-hidden bg-secondary/60 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Daily reflection</p>
        <p className="mt-3 max-w-2xl font-serif text-2xl">{reflectionPrompts[promptIdx]}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild><Link to="/journal" search={{ new: true }}>Write a reflection</Link></Button>
          <Button variant="outline" onClick={() => setPromptIdx((i) => (i + 1) % reflectionPrompts.length)}>Another prompt</Button>
        </div>
      </section>
    </div>
  );
}
