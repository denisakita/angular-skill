# Rendering strategies (CSR / SSR / SSG / prerender)

Angular supports a spectrum of rendering strategies, chosen **per route** via
`RenderMode` in `app.routes.server.ts` (see `hybrid-rendering.md` for the config
mechanics). This file is about *choosing* the right one.

## The strategies

### Client-Side Rendering (CSR) — `RenderMode.Client`

Angular's default. The browser downloads JS, then renders content. Best for highly
interactive, authenticated areas (dashboards, admin panels) where SEO and first
paint don't matter. Downside: content is not visible to crawlers until JS executes,
and initial load is slower.

### Static Site Generation (SSG / prerendering) — `RenderMode.Prerender`

Pages are pre-rendered into static HTML **at build time**. Best for stable,
non-personalized content (marketing pages, blogs, docs). Delivers the fastest
initial load (pre-generated HTML) and excellent SEO, but content only changes when
you rebuild and redeploy. Dynamic routes need `getPrerenderParams` to enumerate the
pages to generate.

### Server-Side Rendering (SSR) — `RenderMode.Server`

HTML is generated on the server **for each request**. Best for dynamic or
personalized content that changes frequently (e-commerce, news, logged-in pages).
Gives good SEO and fast first contentful paint, at the cost of running a server per
request (higher server cost than static hosting).

## Trade-offs

| Aspect | CSR (`Client`) | SSG (`Prerender`) | SSR (`Server`) |
| --- | --- | --- | --- |
| SEO | Poor | Excellent | Excellent |
| Initial load | Slower | Fastest | Fast |
| Interactivity | Immediate (after JS) | After hydration | After hydration |
| Content freshness | Live (client fetch) | Build-time only | Per request |
| Infra | Static host | Static host | Node/edge server |
| Personalization | Yes (client) | No | Yes |

## Hydration applies to SSR and SSG

After SSR or SSG delivers HTML, Angular **hydrates** it to make it interactive —
reusing the DOM rather than re-rendering. Always enable `provideClientHydration()`
for these modes, and consider incremental hydration (`@defer (hydrate ...)`) for
heavy sections. See `hydration.md` and `incremental-hydration.md`.

## Decision guidance

1. Public, stable content (marketing, blog, docs) → **Prerender (SSG)**.
2. Public but dynamic/frequently-changing or personalized content (product pages,
   news, search results) → **Server (SSR)**.
3. Private, highly-interactive views behind auth where SEO/first paint are
   irrelevant → **Client (CSR)**.
4. Mix freely per route — that's hybrid rendering. Use a `**` catch-all route to
   set the default mode.
5. For dynamic prerendered routes, provide `getPrerenderParams` and pick a
   `PrerenderFallback` (`Server` default / `Client` / `None`).

## Best practices

- Default the bulk of public routes to `Prerender`, escalate to `Server` only when
  content must be per-request or personalized.
- Reserve `Client` for routes where server HTML adds no value (e.g. authenticated
  app shells).
- Keep prerender parameter lists bounded; large lists inflate build time/output.
- Pair every server/prerender route with hydration; use incremental hydration to
  trim the initial bundle.

## Common mistakes

- Using CSR for SEO-critical public pages → content invisible to crawlers until JS
  runs.
- Choosing Prerender for content that changes between deploys → users see stale
  HTML until the next build.
- Choosing SSR where SSG would do → unnecessary per-request server cost.
- Forgetting that SSR/SSG still require hydration to become interactive.
