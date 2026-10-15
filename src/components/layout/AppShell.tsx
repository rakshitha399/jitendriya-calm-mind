import { Link } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { navItems } from "./nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-card focus:px-4 focus:py-2">
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col bg-sidebar px-5 py-8 text-sidebar-foreground lg:flex">
        <Link to="/home" className="rounded-xl px-2" aria-label="Jitendriya home">
          <Logo showTagline />
        </Link>
        <nav aria-label="Main" className="mt-10 flex flex-1 flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors hover:bg-sidebar-accent/60 data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground"
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
        <p className="px-2 text-xs opacity-70">Small steps. Big inner changes.</p>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Mobile / tablet header */}
        <header className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center border-b bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
          <Link to="/home" aria-label="Jitendriya home" className="min-w-0 text-foreground">
            <Logo />
          </Link>
          <Link to="/settings" aria-label="Settings" className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-accent data-[status=active]:text-primary">
            <Settings className="h-5 w-5" />
          </Link>
        </header>

        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
          <ul className="mx-auto grid max-w-lg grid-cols-5">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-primary"
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                    {"short" in item ? item.short : item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
