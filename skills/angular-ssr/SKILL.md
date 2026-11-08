---
name: angular-ssr
description: Use when building or fixing Angular (v21/v22) apps that need server-side or hybrid rendering, hydration, incremental hydration, or per-route render modes (SSR/SSG/CSR) with provideClientHydration and app.routes.server.ts.
license: MIT
metadata:
  source: https://angular.dev/guide/ssr
  angularVersion: '21-22'
  version: '1.0'
---

# Angular Server-Side & Hybrid Rendering

Authoritative guidance for server-side rendering (SSR), hybrid rendering with
per-route render modes, hydration, and incremental hydration in Angular v21/v22.
All content is grounded strictly in the official Angular documentation
(angular.dev). The modern idioms assumed throughout are: **standalone bootstrap**
(`bootstrapApplication`), `provideServerRendering(withRoutes(...))`,
`provideClientHydration(...)`, `app.routes.server.ts` with `RenderMode`, and
`@defer (hydrate ...)` for incremental hydration.

Angular ships a single rendering engine that supports a *spectrum* of strategies
chosen per route: Client-Side Rendering (CSR), Server-Side Rendering (SSR), and
Static Site Generation (SSG / prerendering). "Hybrid rendering" simply means
mixing these render modes across routes in one application. Hydration is the
process that makes server- or build-rendered HTML interactive on the client.

## Reference files

Read the reference that matches your task:

- `references/ssr-setup.md` — Enable SSR (`ng new --ssr` / `ng add @angular/ssr`),
  the standalone bootstrap file layout (`main.ts`, `main.server.ts`,
  `app.config.ts`, `app.config.server.ts`, `server.ts`), `provideServerRendering`,
  request/response DI tokens, transfer cache, and how to build & run.
- `references/hybrid-rendering.md` — `app.routes.server.ts`, `ServerRoute`,
  `RenderMode` (Server/Client/Prerender), `getPrerenderParams`,
  `PrerenderFallback`, per-route `headers`/`status`, and the app engine APIs.
- `references/hydration.md` — `provideClientHydration()`, its feature functions
  (`withEventReplay`, `withIncrementalHydration`, `withI18nSupport`,
  `withHttpTransferCacheOptions`, `withNoHttpTransferCache`), constraints,
  `ngSkipHydration`, and `afterNextRender`.
- `references/incremental-hydration.md` — `withIncrementalHydration()` and the
  `@defer (hydrate ...)` triggers (`idle`, `viewport`, `interaction`, `hover`,
  `immediate`, `timer`, `when`, `never`).
- `references/rendering-strategies.md` — Choosing between CSR, SSR, SSG, and
  prerender; trade-offs and decision guidance.

## Core rules

1. **Always enable hydration when rendering on the server.** Add
   `provideClientHydration()` to the client (browser) providers whenever you use
   SSR or prerendering. Without it Angular destroys the server-rendered DOM and
   re-renders from scratch, causing a flicker and worse Core Web Vitals. The
   Angular CLI adds this for you when scaffolding with `--ssr` / `ng add`.

2. **Never access browser-only globals directly during rendering.** Do not touch
   `window`, `document`, `localStorage`, `navigator`, `innerHTML`/`outerHTML`,
   `appendChild`, or other DOM APIs in code that runs on the server or during
   hydration — it breaks SSR and causes DOM-mismatch hydration errors. Prefer
   Angular APIs (bindings, `Renderer2`) over native DOM manipulation.

3. **Put browser-only code in `afterNextRender`.** Code that legitimately needs
   the DOM (measuring layout, third-party DOM libraries, focus, charts) belongs
   in `afterNextRender(() => { ... })`, which runs only in the browser and only
   after the DOM is present. Guard platform-specific logic with
   `isPlatformBrowser(inject(PLATFORM_ID))` when needed.

4. **Keep server and client DOM identical.** The generated DOM must match between
   server and client: use valid HTML (e.g. explicit `<tbody>`, no `<div>` inside
   `<p>`, no nested `<a>`), keep `preserveWhitespaces` at its default, and avoid
   conditional template differences across platforms. Last resort for an
   incompatible component: `ngSkipHydration`.

5. **Default to incremental hydration for heavy below-the-fold UI.** Wrap large,
   non-critical components in `@defer (hydrate on viewport)` (or `idle`,
   `interaction`, etc.) so their JavaScript is fetched and hydrated only when
   needed, shrinking the initial bundle. It is on by default with
   `provideClientHydration()` in v22. In v21, enable it with
   `provideClientHydration(withIncrementalHydration())`.
