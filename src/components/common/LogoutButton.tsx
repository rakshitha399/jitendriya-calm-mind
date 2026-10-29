import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export function LogoutButton({ className }: { className?: string }) {
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return <Button variant="ghost" className={className} disabled={busy} onClick={async () => {
    if (!supabase) return;
    setBusy(true);
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      await navigate({ to: "/login", search: { redirect: "/home" }, replace: true });
    } catch { toast.error("Could not log out. Please try again."); }
    finally { setBusy(false); }
  }}>{busy ? <Loader2 className="animate-spin" /> : <LogOut />} {busy ? "Logging out…" : "Log out"}</Button>;
}