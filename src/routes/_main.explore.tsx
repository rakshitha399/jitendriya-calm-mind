import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { PageHeader, SectionHeading, SessionCard } from "@/components/common/ui";
import { Button } from "@/components/ui/button";
import { exploreCategories, sessions, type ExploreCategory } from "@/lib/content";

export const Route = createFileRoute("/_main/explore")({
  head: () => ({
    meta: [
      { title: "Explore — Jitendriya" },
      { name: "description", content: "Discover meditation, breathing, yoga, mantras, daily wisdom and guided mindfulness." },
      { property: "og:title", content: "Explore — Jitendriya" },
      { property: "og:description", content: "Discover practices for a calmer mind." },
    ],
  }),
  component: Explore,
});

function CategoryLink({ c }: { c: ExploreCategory }) {
  const inner = (
    <>
      <img src={c.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 hero-overlay" />
      <div className="relative mt-auto p-5 text-forest-foreground">
        <h3 className="text-2xl">{c.title}</h3>
        <p className="mt-1 text-sm opacity-90">{c.description}</p>
      </div>
    </>
  );
  const cls = "group surface-card lift relative flex aspect-[4/3] overflow-hidden";
  if (c.to.kind === "wisdom") return <Link to="/wisdom" className={cls}>{inner}</Link>;
  if (c.to.kind === "meditation") return <Link to="/meditation" className={cls}>{inner}</Link>;
  return <Link to="/recommendations" search={{ filter: c.to.filter }} className={cls}>{inner}</Link>;
}

function Explore() {
  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Explore"
        title="Find your practice"
        description="Wander through gentle practices. Choose what feels right today — there is no wrong place to begin."
        action={
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link to="/recommendations"><Sparkles /> For you</Link>
          </Button>
        }
      />
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {exploreCategories.map((c) => <CategoryLink key={c.id} c={c} />)}
      </section>
      <section>
        <SectionHeading title="Popular sessions" action={<Link to="/recommendations" className="text-sm font-semibold text-primary hover:underline">See all</Link>} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {sessions.slice(0, 4).map((s) => <SessionCard key={s.id} session={s} layout="tile" />)}
        </div>
      </section>
      <Button asChild className="w-full sm:hidden"><Link to="/recommendations"><Sparkles /> Personalized recommendations</Link></Button>
    </div>
  );
}
