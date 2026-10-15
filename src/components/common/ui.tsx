import { Link } from "@tanstack/react-router";
import { ChevronRight, Clock, Signal } from "lucide-react";
import type { ReactNode } from "react";
import { categoryLabels, type Session } from "@/lib/content";
import { cn } from "@/lib/utils";

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 fade-up">
      <div className="min-w-0">
        {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold">{eyebrow}</p>}
        <h1 className="text-4xl sm:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function SectionHeading({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-2xl">{title}</h2>
      {action}
    </div>
  );
}

export function SampleBadge({ children = "Sample data", className }: { children?: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border border-gold/40 bg-gold-soft px-2.5 py-0.5 text-[11px] font-semibold text-foreground", className)}>
      {children}
    </span>
  );
}

export function Meta({ session }: { session: Session }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" aria-hidden />{session.durationMin} min</span>
      <span className="inline-flex items-center gap-1"><Signal className="h-3.5 w-3.5" aria-hidden />{session.difficulty}</span>
      <span>{categoryLabels[session.category]}</span>
    </div>
  );
}

export function SessionCard({ session, reasons, layout = "row" }: { session: Session; reasons?: string[]; layout?: "row" | "tile" }) {
  if (layout === "tile") {
    return (
      <Link to="/meditation/$id" params={{ id: session.id }} className="group surface-card lift block overflow-hidden">
        <div className="aspect-[4/3] overflow-hidden">
          <img src={session.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
        <div className="p-4">
          <h3 className="text-xl">{session.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{session.subtitle}</p>
          <div className="mt-3"><Meta session={session} /></div>
        </div>
      </Link>
    );
  }
  return (
    <Link to="/meditation/$id" params={{ id: session.id }} className="group surface-card lift grid grid-cols-[96px_minmax(0,1fr)_auto] items-center gap-4 p-3 sm:grid-cols-[128px_minmax(0,1fr)_auto]">
      <img src={session.image} alt="" loading="lazy" className="aspect-square w-full rounded-xl object-cover" />
      <div className="min-w-0">
        <h3 className="text-xl">{session.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{session.description}</p>
        <div className="mt-2"><Meta session={session} /></div>
        {reasons && reasons.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {reasons.map((r) => (
              <span key={r} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">{r}</span>
            ))}
          </div>
        )}
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-label="Open" />
    </Link>
  );
}

export function ProgressRing({ value, size = 112, label }: { value: number; size?: number; label: string }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth="8" className="fill-none stroke-secondary" />
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} className="fill-none stroke-primary transition-all duration-700" />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-serif text-3xl font-semibold">{value}%</span>
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="surface-card flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-secondary text-primary">{icon}</div>
      <h3 className="text-2xl">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Chip({ active, onClick, children, ...rest }: { active: boolean; onClick: () => void; children: ReactNode } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick">) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-accent",
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
