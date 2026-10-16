import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Plus, RotateCcw, Save, Undo2 } from "lucide-react";
import { useEffect, useReducer, useRef, useState } from "react";
import { getProgress, getSilentMode, loadDraft, saveChanting, saveDraft, setSilentMode } from "@/api";
import { ConfirmAction } from "@/components/chanting/ConfirmAction";
import { PageHeader } from "@/components/common/ui";
import { Button } from "@/components/ui/button";
import {
  counterReducer, getMantra, initialCounter, isComplete, isLocked, mantras, TARGET_PRESETS, validateTarget,
  type CounterAction, type CounterState,
} from "@/lib/chanting";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_main/chanting/")({
  head: () => ({
    meta: [
      { title: "Japa Counter — Jitendriya" },
      { name: "description", content: "Count your mantra chanting with targets, rounds, undo and saved sessions." },
      { property: "og:title", content: "Japa Counter — Jitendriya" },
      { property: "og:description", content: "A calm chanting counter for your daily japa practice." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChantingPage,
});

type Action = CounterAction | { type: "load"; state: CounterState };
const reducer = (s: CounterState, a: Action) => (a.type === "load" ? a.state : counterReducer(s, a));

function playBell() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 660;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.2);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 2.3);
  } catch {
    /* audio unavailable */
  }
}

function ChantingPage() {
  const first = mantras[0]!;
  const [s, dispatch] = useReducer(reducer, initialCounter(first.id, first.defaultTarget));
  const [hydrated, setHydrated] = useState(false);
  const [silent, setSilent] = useState(false);
  const [custom, setCustom] = useState("");
  const [customOpen, setCustomOpen] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const [saved, setSaved] = useState<{ session: number; today: number } | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const prevRounds = useRef(0);

  useEffect(() => {
    const d = loadDraft();
    if (d && getMantra(d.mantraId) && d.target >= 1) {
      dispatch({ type: "load", state: d });
      prevRounds.current = d.rounds;
      if (!(TARGET_PRESETS as readonly number[]).includes(d.target)) { setCustomOpen(true); setCustom(String(d.target)); }
    }
    setSilent(getSilentMode());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveDraft(s.total > 0 ? s : null);
  }, [s, hydrated]);

  useEffect(() => {
    if (s.total === 0) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [s.total]);

  useEffect(() => {
    if (s.rounds > prevRounds.current && !silent) {
      playBell();
      try { navigator.vibrate?.([120, 80, 120]); } catch { /* unsupported */ }
    }
    prevRounds.current = s.rounds;
  }, [s.rounds, silent]);

  const mantra = getMantra(s.mantraId) ?? first;
  const locked = isLocked(s);
  const complete = isComplete(s);
  const pct = Math.min(100, (s.count / s.target) * 100);

  const pickMantra = (id: string) => {
    const m = getMantra(id)!;
    dispatch({ type: "setMantra", mantraId: id, target: m.defaultTarget });
    setCustomOpen(false); setCustomError(null);
  };
  const applyCustom = () => {
    const r = validateTarget(custom);
    if (!r.ok) return setCustomError(r.error);
    setCustomError(null);
    dispatch({ type: "setTarget", target: r.value });
  };
  const act = (a: CounterAction) => { setSaved(null); dispatch(a); };

  const finish = async () => {
    setSaveError(null);
    try {
      const durationSec = s.startedAt ? Math.max(0, Math.round((Date.now() - s.startedAt) / 1000)) : 0;
      const session = await saveChanting({ mantraId: mantra.id, mantraName: mantra.name, target: s.target, chants: s.total, durationSec });
      const p = await getProgress();
      setSaved({ session: session.chants, today: p.stats.today });
      dispatch({ type: "reset" });
      prevRounds.current = 0;
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Could not save. Please try again.");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Chanting"
        title="Japa counter"
        description="Choose a mantra, set your count and chant at your own pace."
        action={<Button asChild variant="outline"><Link to="/chanting/record">My record</Link></Button>}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="surface-card space-y-6 p-5 sm:p-6" aria-labelledby="setup">
          <h2 id="setup" className="text-2xl">Practice</h2>
          <fieldset disabled={locked}>
            <legend className="mb-2 text-sm font-semibold">Mantra</legend>
            <div className="grid gap-2">
              {mantras.map((m) => (
                <label key={m.id} className={cn("flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring", m.id === s.mantraId ? "border-primary bg-primary/10" : "hover:bg-accent/50", locked && "cursor-not-allowed opacity-70")}>
                  <input type="radio" name="mantra" className="sr-only" checked={m.id === s.mantraId} onChange={() => pickMantra(m.id)} />
                  <span className="font-medium">{m.name}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <h3 className="text-2xl">{mantra.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{mantra.meaning}</p>
            <p className="mt-2 text-xs text-muted-foreground">Suggested target: {mantra.suggestedTargets.join(" or ")}</p>
          </div>

          <fieldset disabled={locked}>
            <legend className="mb-2 text-sm font-semibold">Target {locked && <span className="font-normal text-muted-foreground">(locked until Reset)</span>}</legend>
            <div className="flex flex-wrap gap-2">
              {TARGET_PRESETS.map((t) => (
                <Button key={t} type="button" size="sm" variant={!customOpen && s.target === t ? "default" : "outline"} aria-pressed={!customOpen && s.target === t}
                  onClick={() => { setCustomOpen(false); setCustomError(null); dispatch({ type: "setTarget", target: t }); }}>
                  {t}
                </Button>
              ))}
              <Button type="button" size="sm" variant={customOpen ? "default" : "outline"} aria-pressed={customOpen} onClick={() => setCustomOpen(true)}>Custom</Button>
            </div>
            {customOpen && (
              <div className="mt-3">
                <label htmlFor="custom-target" className="text-sm">Custom target (1 – 1,000,000)</label>
                <div className="mt-1 flex gap-2">
                  <input id="custom-target" inputMode="numeric" value={custom} onChange={(e) => setCustom(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyCustom()} aria-invalid={!!customError} aria-describedby={customError ? "custom-err" : undefined}
                    className="h-10 w-full min-w-0 rounded-full border bg-card px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  <Button type="button" onClick={applyCustom}>Set</Button>
                </div>
                {customError && <p id="custom-err" role="alert" className="mt-1 text-sm text-destructive">{customError}</p>}
              </div>
            )}
          </fieldset>

          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-[var(--primary)]" checked={silent} onChange={(e) => { setSilent(e.target.checked); setSilentMode(e.target.checked); }} />
            Silent mode (no bell or vibration when a target is reached)
          </label>
        </section>

        <section className="surface-card flex flex-col items-center gap-6 p-5 text-center sm:p-8" aria-labelledby="counter">
          <h2 id="counter" className="sr-only">Counter</h2>
          <button type="button" onClick={() => act({ type: "tap", now: Date.now() })} disabled={complete}
            aria-label={`Count one chant. ${s.count} of ${s.target}`}
            className="grid aspect-square w-full max-w-[280px] place-items-center rounded-full border-4 border-gold/60 bg-primary text-primary-foreground shadow-lg transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-4 disabled:opacity-80 motion-reduce:transition-none">
            <span>
              <span className="block font-serif text-7xl tabular-nums" aria-live="polite">{s.count}</span>
              <span className="mt-1 block text-sm opacity-85">of {s.target.toLocaleString()} · tap to chant</span>
            </span>
          </button>

          <div className="w-full">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={s.target} aria-valuenow={s.count} aria-label="Round progress">
              <div className="h-full rounded-full bg-gold transition-[width] motion-reduce:transition-none" style={{ width: `${pct}%` }} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-muted/60 p-3"><dt className="text-muted-foreground">Rounds completed</dt><dd className="text-2xl font-semibold tabular-nums">{s.rounds}</dd></div>
              <div className="rounded-2xl bg-muted/60 p-3"><dt className="text-muted-foreground">Total chants</dt><dd className="text-2xl font-semibold tabular-nums">{s.total.toLocaleString()}</dd></div>
            </dl>
          </div>

          {complete && (
            <div role="status" className="w-full rounded-2xl border border-gold/50 bg-gold-soft p-4">
              <p className="flex items-center justify-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5 text-primary" aria-hidden /> Target of {s.target.toLocaleString()} completed</p>
              <Button className="mt-3" onClick={() => act({ type: "nextRound" })}>Chant another round</Button>
            </div>
          )}

          <div className="flex w-full flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={() => act({ type: "add10", now: Date.now() })} disabled={complete}><Plus /> Add 10</Button>
            <Button variant="outline" onClick={() => act({ type: "undo" })} disabled={!s.history.length || s.count === 0}><Undo2 /> Undo</Button>
            <ConfirmAction
              trigger={<Button variant="outline" disabled={s.total === 0}><RotateCcw /> Reset</Button>}
              title="Reset counter?" description="Your unsaved chants in this sitting will be cleared." confirmLabel="Reset"
              onConfirm={() => { act({ type: "reset" }); prevRounds.current = 0; }}
            />
          </div>
          <Button size="lg" className="w-full sm:w-auto" onClick={finish} disabled={s.total === 0}><Save /> Finish and save</Button>
          {saveError && <p role="alert" className="text-sm text-destructive">{saveError}</p>}
          {saved && (
            <p role="status" className="rounded-2xl bg-primary/10 px-4 py-3 text-sm">
              Saved {saved.session.toLocaleString()} chants. Today’s total: <strong>{saved.today.toLocaleString()}</strong>.{" "}
              <Link to="/chanting/record" className="font-semibold text-primary underline">View record</Link>
            </p>
          )}
        </section>
      </div>
      <p className="text-xs text-muted-foreground">Chanting is a spiritual and reflective practice offered with respect for every tradition. It is not a medical treatment.</p>
    </div>
  );
}
