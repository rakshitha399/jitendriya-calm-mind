import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { MeditationPlayer } from "@/components/meditation/MeditationPlayer";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/content";

export const Route = createFileRoute("/play/$id")({
  loader: ({ params }) => {
    const session = getSession(params.id);
    if (!session) throw notFound();
    return { session };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `Playing: ${loaderData.session.title} — Jitendriya` },
          { name: "description", content: loaderData.session.description },
          { property: "og:title", content: `${loaderData.session.title} — Jitendriya` },
          { property: "og:description", content: loaderData.session.description },
        ]
      : [{ title: "Session not found — Jitendriya" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <h1 className="text-3xl">Session not found</h1>
        <Button asChild className="mt-6"><Link to="/meditation">Browse sessions</Link></Button>
      </div>
    </div>
  ),
  component: Play,
});

function Play() {
  const { session } = Route.useLoaderData();
  return (
    <div className="relative flex min-h-[100svh] flex-col bg-background">
      <div className="p-4">
        <Button asChild variant="ghost" size="icon" aria-label="Back to session details">
          <Link to="/meditation/$id" params={{ id: session.id }}><ArrowLeft /></Link>
        </Button>
      </div>
      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        <MeditationPlayer key={session.id} session={session} />
      </main>
    </div>
  );
}
