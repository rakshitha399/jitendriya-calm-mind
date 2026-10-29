import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authenticatedUser } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/_main")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    if (!await authenticatedUser()) throw redirect({ to: "/login", search: { redirect: location.href }, replace: true });
  },
  pendingMs: 0,
  pendingComponent: () => <div role="status" className="flex min-h-svh items-center justify-center gap-3 bg-background text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Checking your account…</div>,
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
