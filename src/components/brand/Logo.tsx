import { cn } from "@/lib/utils";

export function LotusMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" className={cn("h-8 w-10", className)} aria-hidden="true">
      <path d="M32 6c-6 8-6 22 0 32 6-10 6-24 0-32Z" />
      <path d="M32 38c-4-10-12-17-20-18 0 9 8 17 20 18Z" />
      <path d="M32 38c4-10 12-17 20-18 0 9-8 17-20 18Z" />
      <path d="M32 38C24 34 12 32 4 34c6 5 17 7 28 4Z" />
      <path d="M32 38c8-4 20-6 28-4-6 5-17 7-28 4Z" />
      <path d="M14 43h36" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, showTagline = false }: { className?: string; showTagline?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LotusMark className="shrink-0 text-gold" />
      <div className="min-w-0 leading-none">
        <span className="font-serif text-2xl font-semibold tracking-tight">Jitendriya</span>
        {showTagline && <p className="mt-1 text-[11px] tracking-wide opacity-80">Calm Mind • Balanced Life • Higher You</p>}
      </div>
    </div>
  );
}
