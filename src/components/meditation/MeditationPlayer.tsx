import { Link } from "@tanstack/react-router";
import { BookOpen, Pause, Play, RotateCcw, RotateCw, Undo2, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LotusMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { fmt, useCountdown } from "@/hooks/use-countdown";
import { moodOptions, type Mood, type Session } from "@/lib/content";
import { recordCompletion, recordSession, setCompletionMood } from "@/lib/store";

const SKIP = 15;

/** Reusable, distraction-free player. Pass any Session; audio is used only if `audioUrl` exists. */
export function MeditationPlayer({ session }: { session: Session }) {
  const total = session.durationMin * 60;
  const [complete, setComplete] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0.7);
  const [audioError, setAudioError] = useState(false);
  const hasAudio = Boolean(session.audioUrl) && !audioError;

  const [moodAfter, setMoodAfter] = useState<Mood | null>(null);
  const completionIdRef = useRef<string | null>(null);

  const t = useCountdown(total, () => {
    setComplete(true);
    recordSession(session.durationMin);
    completionIdRef.current = recordCompletion({ sessionId: session.id, title: session.title, durationMin: session.durationMin, moodAfter: null });
  });

  const saveMood = (mood: Mood) => {
    setMoodAfter(mood);
    if (completionIdRef.current) setCompletionMood(completionIdRef.current, mood);
  };

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !hasAudio) return;
    if (t.running) a.play().catch(() => setAudioError(true));
    else a.pause();
  }, [t.running, hasAudio]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && (e.target as HTMLElement).tagName !== "BUTTON") {
        e.preventDefault();
        t.toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [t]);

  if (complete) {
    return (
      <div className="flex flex-col items-center text-center fade-up">
        <div className="relative grid h-40 w-40 place-items-center">
          <span className="absolute inset-0 rounded-full bg-gold-soft breathe" />
          <LotusMark className="relative h-16 w-20 text-gold" />
        </div>
        <h1 className="mt-8 text-5xl">Well done</h1>
        <p className="mt-3 max-w-sm text-muted-foreground">You gave yourself {session.durationMin} quiet minutes. Notice how you feel right now.</p>
        <div className="mt-6 w-full max-w-sm" aria-label="Post-practice mood check-in">
          <p className="text-sm font-semibold">How do you feel now? <span className="font-normal text-muted-foreground">(optional)</span></p>
          <div className="mt-3 flex flex-wrap justify-center gap-2" role="group">
            {moodOptions.map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={moodAfter === m.id}
                onClick={() => saveMood(m.id)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${moodAfter === m.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-accent"}`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
            {moodAfter ? "Practice and mood saved to your journey." : "Practice saved — add a mood if you like."}
          </p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild><Link to="/journal" search={{ new: true }}><BookOpen /> Reflect in journal</Link></Button>
          <Button variant="outline" onClick={() => { setComplete(false); t.restart(); }}><Undo2 /> Again</Button>
          <Button asChild variant="ghost"><Link to="/home">Back home</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center text-center">
      {session.audioUrl && <audio ref={audioRef} src={session.audioUrl} preload="auto" onError={() => setAudioError(true)} />}
      <div className="relative grid h-56 w-56 place-items-center sm:h-64 sm:w-64">
        <span className={`absolute inset-0 rounded-full bg-secondary ${t.running ? "breathe" : "opacity-60"}`} />
        <span className={`absolute inset-8 rounded-full bg-gold-soft ${t.running ? "breathe" : "opacity-60"}`} style={{ animationDelay: "0.5s" }} />
        <img src={session.image} alt="" className="relative h-36 w-36 rounded-full object-cover shadow-lift sm:h-40 sm:w-40" />
      </div>
      <h1 className="mt-8 text-4xl">{session.title}</h1>
      <p className="mt-1 text-muted-foreground">{session.subtitle}</p>
      <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
        {hasAudio ? (t.running ? "Audio playing" : "Paused") : "Silent timer — no audio for this session yet."}
      </p>

      <div className="mt-8 w-full">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary" role="progressbar" aria-label="Session progress" aria-valuemin={0} aria-valuemax={total} aria-valuenow={t.elapsed} aria-valuetext={`${fmt(t.elapsed)} elapsed`}>
          <div className="h-full rounded-full bg-primary transition-[width] duration-1000 ease-linear" style={{ width: `${t.progress * 100}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-xs tabular-nums text-muted-foreground">
          <span>{fmt(t.elapsed)}</span>
          <span>-{fmt(t.remaining)}</span>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-6">
        <Button variant="ghost" size="icon" aria-label={`Back ${SKIP} seconds`} onClick={() => t.seek(-SKIP)}><RotateCcw className="!size-6" /></Button>
        <Button size="icon" className="h-20 w-20 shadow-lift" aria-label={t.running ? "Pause" : t.elapsed ? "Resume" : "Play"} onClick={t.toggle}>
          {t.running ? <Pause className="!size-8 fill-current" /> : <Play className="!size-8 translate-x-0.5 fill-current" />}
        </Button>
        <Button variant="ghost" size="icon" aria-label={`Forward ${SKIP} seconds`} onClick={() => t.seek(SKIP)}><RotateCw className="!size-6" /></Button>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={t.restart}><Undo2 /> Restart</Button>
        <Button asChild variant="ghost" size="sm"><Link to="/meditation/$id" params={{ id: session.id }}><X /> End</Link></Button>
      </div>

      {hasAudio && (
        <div className="mt-6 flex w-full max-w-xs items-center gap-3">
          <button type="button" aria-label={volume ? "Mute" : "Unmute"} onClick={() => setVolume((v) => (v ? 0 : 0.7))} className="rounded-full p-1">
            {volume ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>
          <Slider aria-label="Volume" value={[volume * 100]} max={100} step={1} onValueChange={([v]) => setVolume((v ?? 0) / 100)} />
        </div>
      )}
    </div>
  );
}
