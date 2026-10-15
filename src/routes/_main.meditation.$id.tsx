import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Clock, Play, Signal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categoryLabels, getSession } from "@/lib/content";

export const Route = createFileRoute("/_main/meditation/$id")({
  loader: ({ params }) => {
    const session = getSession(params.id);
    if (!session) throw notFound();
    return { session };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.session.title} — Jitendriya` },
          { name: "description", content: loaderData.session.description },
          { property: "og:title", content: `${loaderData.session.title} — Jitendriya` },
          { property: "og:description", content: loaderData.session.description },
        ]
      : [{ title: "Session not found — Jitendriya" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="surface-card p-10 text-center">
      <h1 className="text-3xl">Session not found</h1>
      <p className="mt-2 text-muted-foreground">This practice may have been moved.</p>
      <Button asChild className="mt-6"><Link to="/meditation">Browse sessions</Link></Button>
    </div>
  ),
  component: Detail,
});

function Detail() {
  const { session } = Route.useLoaderData();
  const router = useRouter();
  return (
    <article className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl shadow-lift">
        <img src={session.image} alt="" className="aspect-[16/10] w-full object-cover sm:aspect-[21/9]" />
        <Button variant="secondary" size="icon" className="absolute left-4 top-4 bg-card/85 backdrop-blur" aria-label="Go back" onClick={() => router.history.back()}>
          <ArrowLeft />
        </Button>
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="fade-up">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">{categoryLabels[session.category]}</p>
          <h1 className="mt-2 text-5xl">{session.title}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{session.subtitle}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1"><Clock className="h-4 w-4" />{session.durationMin} mins</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1"><Signal className="h-4 w-4" />{session.difficulty}</span>
          </div>
          <p className="mt-6 leading-relaxed">{session.intro}</p>
          <Button asChild size="lg" className="mt-8">
            <Link to="/play/$id" params={{ id: session.id }}><Play className="fill-current" /> Start Meditation</Link>
          </Button>
        </div>
        <aside className="surface-card h-fit p-6">
          <h2 className="text-2xl">What to expect</h2>
          <ol className="mt-4 space-y-3">
            {session.steps.map((s, i) => (
              <li key={s} className="flex items-center gap-3 text-sm">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-primary">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
          <p className="mt-5 text-xs text-muted-foreground">Sample session content. {session.audioUrl ? "Includes audio guidance." : "No audio yet — a silent, timed practice."}</p>
        </aside>
      </div>
    </article>
  );
}
