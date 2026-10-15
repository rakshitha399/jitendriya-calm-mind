import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteChanting, getProgress, getShowDemo, setShowDemo, type Progress } from "@/api";
import { ConfirmAction } from "@/components/chanting/ConfirmAction";
import { PageHeader, SampleBadge } from "@/components/common/ui";
import { Button } from "@/components/ui/button";
import { dateKey, intensity, monthGrid, parseKey } from "@/lib/chanting";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_main/chanting/record")({
  head: () => ({
    meta: [
      { title: "My Chanting Record — Jitendriya" },
      { name: "description", content: "Your chanting totals, streaks, monthly calendar and mantra history." },
      { property: "og:title", content: "My Chanting Record — Jitendriya" },
      { property: "og:description", content: "See your japa practice over days, months and years." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RecordPage,
});

const levelCls = ["bg-card", "bg-primary/15", "bg-primary/35", "bg-primary/60", "bg-primary text-primary-foreground"];
const fmtDur = (s: number) => (s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`);
const longDate = (k: string) => parseKey(k).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

function RecordPage() {
  const [data, setData] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDemo, setDemo] = useState(true);
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState(dateKey(now));

  const load = useCallback(() => {
    getProgress().then(setData).catch(() => setError("Could not load your record."));
  }, []);
  useEffect(() => { setDemo(getShowDemo()); load(); }, [load]);

  const todayK = dateKey(now);
  const atCurrentMonth = view.y === now.getFullYear() && view.m === now.getMonth();
  const grid = useMemo(() => monthGrid(view.y, view.m), [view]);
  const shift = (d: number) => setView(({ y, m }) => {
    const t = new Date(y, m + d, 1);
    return t > new Date(now.getFullYear(), now.getMonth(), 1) ? { y, m } : { y: t.getFullYear(), m: t.getMonth() };
  });

  if (error) return <p role="alert" className="text-destructive">{error}</p>;
  if (!data) return <p className="text-muted-foreground" role="status">Loading your record…</p>;
  const { stats, sessions } = data;
  const daySessions = sessions.filter((s) => s.date === selected);
  const hasDemo = sessions.some((s) => s.isDemo);

  const cards: [string, string][] = [
    ["Today", stats.today.toLocaleString()],
    ["This month", stats.month.toLocaleString()],
    ["This year", stats.year.toLocaleString()],
    ["All time", stats.allTime.toLocaleString()],
    ["Current streak", `${stats.streak} day${stats.streak === 1 ? "" : "s"}`],
    ["Days chanted", stats.daysChanted.toLocaleString()],
    ["Best day", stats.bestDay ? `${stats.bestDay.total.toLocaleString()}` : "—"],
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Chanting"
        title="My chanting record"
        description="A gentle look at your practice over time."
        action={<Button asChild><Link to="/chanting">Chant now</Link></Button>}
      />

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gold/40 bg-gold-soft/60 px-4 py-3 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4 accent-[var(--primary)]" checked={showDemo} onChange={(e) => { setDemo(e.target.checked); setShowDemo(e.target.checked); load(); }} />
          Include demo records
        </label>
        <span className="text-muted-foreground">Demo records are sample data, marked <SampleBadge>Demo</SampleBadge>, and are kept separate from your own saved chanting.</span>
      </div>

      <section aria-label="Totals" className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {cards.map(([label, value]) => (
          <div key={label} className="surface-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
            {label === "Best day" && stats.bestDay && <p className="text-xs text-muted-foreground">{parseKey(stats.bestDay.date).toLocaleDateString()}</p>}
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className="surface-card p-4 sm:p-6" aria-labelledby="cal-title">
          <div className="mb-4 flex items-center justify-between gap-2">
            <Button variant="outline" size="icon" aria-label="Previous month" onClick={() => shift(-1)}><ChevronLeft /></Button>
            <h2 id="cal-title" className="text-2xl" aria-live="polite">{new Date(view.y, view.m, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h2>
            <Button variant="outline" size="icon" aria-label="Next month" onClick={() => shift(1)} disabled={atCurrentMonth}><ChevronRight /></Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground" aria-hidden>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <span key={d}>{d}</span>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {grid.map((d, i) => {
              if (!d) return <span key={`e${i}`} />;
              const k = dateKey(d);
              const total = stats.dailyTotals[k] ?? 0;
              const future = k > todayK;
              return (
                <button key={k} type="button" disabled={future} onClick={() => setSelected(k)}
                  aria-label={`${longDate(k)}: ${total} chants`} aria-pressed={selected === k}
                  className={cn("flex aspect-square min-w-0 flex-col items-center justify-center rounded-lg border text-[10px] leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-xs",
                    levelCls[intensity(total)], k === todayK && "ring-2 ring-gold ring-offset-1", selected === k && "border-foreground", future && "opacity-40")}>
                  <span className="opacity-70">{d.getDate()}</span>
                  <span className="font-semibold tabular-nums">{total}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            Less {levelCls.map((c, i) => <span key={i} className={cn("h-3 w-3 rounded border", c)} />)} More
          </div>
        </section>

        <section className="surface-card p-4 sm:p-6" aria-labelledby="day-title">
          <h2 id="day-title" className="text-2xl">{longDate(selected)}</h2>
          {daySessions.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No chanting saved on this day.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {daySessions.map((s) => (
                <li key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border p-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold">{s.mantraName} {s.isDemo && <SampleBadge>Demo</SampleBadge>}</p>
                    <p className="text-muted-foreground">
                      {new Date(s.savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {s.chants.toLocaleString()} chants · target {s.target} · {fmtDur(s.durationSec)}
                    </p>
                  </div>
                  <ConfirmAction
                    trigger={<Button variant="ghost" size="icon" aria-label={`Delete ${s.mantraName} session`}><Trash2 /></Button>}
                    title="Delete this session?" description={`${s.chants} chants of ${s.mantraName} will be removed from your record.`}
                    confirmLabel="Delete" onConfirm={() => deleteChanting(s.id).then(load)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="surface-card overflow-x-auto p-4 sm:p-6" aria-labelledby="mantra-title">
        <h2 id="mantra-title" className="mb-3 text-2xl">By mantra</h2>
        {stats.byMantra.length === 0 ? (
          <p className="text-sm text-muted-foreground">No chanting saved yet{hasDemo ? "" : " — your first session will appear here"}.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-muted-foreground"><tr><th className="py-2 pr-3 font-semibold">Mantra</th><th className="py-2 pr-3 text-right font-semibold">This month</th><th className="py-2 text-right font-semibold">All time</th></tr></thead>
            <tbody>
              {stats.byMantra.map((m) => (
                <tr key={m.mantraId} className="border-t"><td className="py-2 pr-3">{m.mantraName}</td><td className="py-2 pr-3 text-right tabular-nums">{m.month.toLocaleString()}</td><td className="py-2 text-right tabular-nums">{m.allTime.toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
