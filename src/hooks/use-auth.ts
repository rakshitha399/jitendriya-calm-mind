import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";

interface AuthState { user: User | null; session: Session | null; loading: boolean }
const AuthContext = createContext<AuthState>({ user: null, session: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, session: null, loading: true });
  const router = useRouter();
  const queryClient = useQueryClient();
  useEffect(() => {
    const client = supabase;
    if (!client) { setState({ user: null, session: null, loading: false }); return; }
    let active = true;
    let version = 0;
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      version += 1;
      if (!active) return;
      setState({ user: session?.user ?? null, session, loading: false });
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        if (event === "SIGNED_OUT") { void queryClient.cancelQueries(); queryClient.clear(); }
        // Leave the auth callback before router checks call back into Auth.
        queueMicrotask(() => { if (active) void router.invalidate(); });
      }
    });
    const initialVersion = version;
    void (async () => {
      try {
        const { data, error } = await client.auth.getUser();
        const { data: sessionData } = await client.auth.getSession();
        if (active && version === initialVersion) setState({ user: error ? null : data.user, session: error ? null : sessionData.session, loading: false });
      } catch {
        if (active && version === initialVersion) setState({ user: null, session: null, loading: false });
      }
    })();
    return () => { active = false; subscription.unsubscribe(); };
  }, [queryClient, router]);
  return createElement(AuthContext.Provider, { value: state }, children);
}

export function useAuth(): AuthState { return useContext(AuthContext); }