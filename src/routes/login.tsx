import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Loader2, Mail } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { authSchema, safeReturnPath } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({ redirect: safeReturnPath(search['redirect']) }),
  head: () => ({ meta: [
    { title: "Sign in — Jitendriya" },
    { name: "description", content: "Sign in or create your Jitendriya account for your daily mindfulness journey." },
    { property: "og:title", content: "Sign in — Jitendriya" },
    { property: "og:description", content: "A quiet place to return to your daily mindfulness practice." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Login,
});

function Login() {
  const { user, loading } = useAuth();
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [signup, setSignup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  useEffect(() => { if (!loading && user) void navigate({ to: redirect, replace: true }); }, [user, loading, redirect, navigate]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(""); setNotice("");
    const parsed = authSchema.safeParse({ email, password, name });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check your details."); return; }
    if (signup && password.length < 8) { setError("Choose a password with at least 8 characters."); return; }
    if (!supabase) { setError("Sign-in is not connected yet. Please connect the existing account service before signing in."); return; }
    setBusy(true);
    try {
      const result = signup
        ? await supabase.auth.signUp({ email: parsed.data.email, password, options: { data: { full_name: parsed.data.name }, emailRedirectTo: `${window.location.origin}/login` } })
        : await supabase.auth.signInWithPassword({ email: parsed.data.email, password });
      if (result.error) { setError(result.error.message); return; }
      if (signup && !result.data.session) { setNotice("Check your email to confirm, then sign in."); setPassword(""); return; }
      await navigate({ to: redirect, replace: true });
    } catch { setError("We couldn’t connect. Please check your connection and try again."); }
    finally { setBusy(false); }
  }

  return <main className="flex min-h-svh flex-col bg-background px-6 py-8 text-foreground sm:py-12">
    <Button asChild variant="ghost" size="sm" className="self-start"><Link to="/"><ArrowLeft /> Back</Link></Button>
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
      <Logo showTagline className="mb-10 text-foreground" />
      <h1 className="text-center text-4xl">{signup ? "Begin your journey" : "Welcome back"}</h1>
      <p className="mt-3 text-center text-sm text-muted-foreground">{signup ? "A little space for your higher self." : "A quiet moment. A fresh beginning."}</p>
      <div className="mt-8 grid grid-cols-2 gap-1 rounded-lg bg-secondary p-1" role="group" aria-label="Account options">
        <Button variant={signup ? "ghost" : "default"} disabled={busy} aria-pressed={!signup} onClick={() => { setSignup(false); setError(""); setNotice(""); }}>Sign in</Button>
        <Button variant={signup ? "default" : "ghost"} disabled={busy} aria-pressed={signup} onClick={() => { setSignup(true); setError(""); setNotice(""); }}>Create an account</Button>
      </div>
      <form onSubmit={submit} noValidate className="mt-6 space-y-5">
        {signup && <div className="space-y-2"><Label htmlFor="auth-name">Your name <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="auth-name" autoComplete="name" maxLength={100} value={name} onChange={e => setName(e.target.value)} disabled={busy} /></div>}
        <div className="space-y-2"><Label htmlFor="auth-email">Email</Label><Input id="auth-email" type="email" autoComplete="email" required maxLength={255} value={email} onChange={e => setEmail(e.target.value)} disabled={busy} /></div>
        <div className="space-y-2"><Label htmlFor="auth-password">Password</Label><Input id="auth-password" type="password" autoComplete={signup ? "new-password" : "current-password"} required maxLength={128} value={password} onChange={e => setPassword(e.target.value)} disabled={busy} /></div>
        {!supabase && <p role="status" className="text-sm text-muted-foreground">Account connection is not configured yet. Signing in and creating an account are unavailable.</p>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {notice && <p role="status" className="flex items-start gap-2 text-sm text-primary"><Mail className="mt-0.5 h-4 w-4 shrink-0" />{notice}</p>}
        <Button type="submit" className="w-full" size="lg" disabled={busy || loading || !supabase}>{busy || loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}{busy ? "Please wait…" : signup ? "Create account" : "Sign in"}</Button>
      </form>
    </div>
    <p className="text-center text-xs text-muted-foreground">Small steps. Big inner changes.</p>
  </main>;
}