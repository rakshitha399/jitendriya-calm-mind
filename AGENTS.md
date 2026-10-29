<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Sample content lives in src/lib/content.ts; pages read from it so copy can be replaced without redesign.
- Persistence goes through repositories in src/lib/store.ts (localStorage now) so a backend can replace it without touching UI.
- Recommendation logic is isolated in src/lib/recommend.ts (transparent demo rules) so a real engine can swap in.
- App screens live under the pathless `_main` layout (AppShell); welcome `/` and player `/play/$id` are full-screen outside it.
- Authentication and chanting share the nullable client in src/lib/supabase.ts; never instantiate another client, so session tokens apply to existing chanting operations.
- The external account service uses a client-only `_main` beforeLoad gate and one root AuthProvider; this preserves existing URLs and avoids SSR localStorage checks. This UI gate does not replace database RLS.
