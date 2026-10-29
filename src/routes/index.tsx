import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { LotusMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { images } from "@/lib/content";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jitendriya — Your mindfulness companion" },
      { name: "description", content: "Calm Mind • Balanced Life • Higher You. Meditation, reflection and gentle daily practice." },
      { property: "og:title", content: "Jitendriya — Your mindfulness companion" },
      { property: "og:description", content: "Meditation, reflection and gentle daily practice." },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const { user, loading } = useAuth();
  return (
    <div className="relative grid min-h-[100svh] place-items-center overflow-hidden bg-forest text-forest-foreground">
      <img src={images.heroSunrise} alt="A person meditating on a rock above misty mountains at sunrise" width={1024} height={1536} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 hero-overlay" />
      <div className="relative z-10 flex min-h-[100svh] w-full max-w-xl flex-col items-center justify-between px-6 py-16 text-center">
        <div className="fade-up">
          <LotusMark className="mx-auto h-16 w-20 text-gold" />
          <h1 className="mt-4 text-6xl sm:text-7xl">Jitendriya</h1>
          <p className="mt-3 text-sm tracking-[0.2em] uppercase opacity-90">Calm Mind • Balanced Life • Higher You</p>
        </div>
        <div className="fade-up">
          <p className="font-serif text-2xl leading-snug sm:text-3xl">Your personal spiritual wellbeing & mindfulness companion</p>
          <p className="mx-auto mt-3 max-w-sm text-sm opacity-85">Gentle meditations, quiet reflection and small daily practices — at your own pace.</p>
          <Button asChild variant="hero" size="lg" className="mt-8" disabled={loading}>
            <Link to={user ? "/home" : "/login"} search={user ? {} : { redirect: "/home" }} aria-disabled={loading} onClick={e => { if (loading) e.preventDefault(); }}>{loading ? "Please wait…" : "Get Started"} <ArrowRight /></Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
