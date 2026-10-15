import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LotusMark } from "@/components/brand/Logo";
import { PageHeader, SampleBadge } from "@/components/common/ui";
import { Button } from "@/components/ui/button";
import { quotes } from "@/lib/content";

export const Route = createFileRoute("/_main/wisdom")({
  head: () => ({
    meta: [
      { title: "Daily Wisdom — Jitendriya" },
      { name: "description", content: "A short reflection for each day to carry with you." },
      { property: "og:title", content: "Daily Wisdom — Jitendriya" },
      { property: "og:description", content: "A short reflection for each day." },
    ],
  }),
  component: Wisdom,
});

function Wisdom() {
  const [i, setI] = useState(() => Math.floor(Date.now() / 86_400_000) % quotes.length);
  const q = quotes[i]!;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`“${q.text}”`);
      toast.success("Quote copied");
    } catch {
      toast.error("Couldn't copy — your browser blocked clipboard access.");
    }
  };
  return (
    <div>
      <PageHeader eyebrow="Daily wisdom" title="Words to carry with you" action={<SampleBadge>Sample quotes</SampleBadge>} />
      <figure className="surface-card mx-auto max-w-3xl px-6 py-14 text-center sm:px-14">
        <LotusMark className="mx-auto h-10 w-12 text-gold" />
        <blockquote className="mt-6 font-serif text-3xl leading-snug sm:text-4xl" aria-live="polite">“{q.text}”</blockquote>
        <figcaption className="mt-4 text-sm text-muted-foreground">{q.source} · {i + 1} of {quotes.length}</figcaption>
        <div className="mt-8 flex justify-center gap-3">
          <Button variant="outline" size="icon" aria-label="Previous quote" onClick={() => setI((n) => (n - 1 + quotes.length) % quotes.length)}><ChevronLeft /></Button>
          <Button variant="secondary" onClick={copy}><Copy /> Copy</Button>
          <Button variant="outline" size="icon" aria-label="Next quote" onClick={() => setI((n) => (n + 1) % quotes.length)}><ChevronRight /></Button>
        </div>
      </figure>
    </div>
  );
}
