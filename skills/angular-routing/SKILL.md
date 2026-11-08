---
name: angular-routing
description: Use when defining routes, lazy loading components/children, rendering with outlets, navigating (declarative and programmatic), reading route state, protecting routes with functional guards, prefetching data with resolvers, matching URLs, or adding route transition animations in Angular v21/v22.
license: MIT
metadata:
  source: https://angular.dev/guide/routing
  angularVersion: '21-22'
  version: '1.0'
---

# Angular Routing

Routing changes what the user sees in a single-page app without a full page reload. The Angular Router (`@angular/router`) is the official library, included by default in Angular CLI projects. Routing has three primary building blocks:

1. **Routes** — map a URL path to a component.
2. **Outlets** — `<router-outlet />` placeholders that render the component for the active route.
3. **Links** — `routerLink` for client-side navigation without page reloads.

This skill targets **modern, standalone Angular (v21/v22)**: `provideRouter()`, functional guards and resolvers, lazy `loadComponent`/`loadChildren`, `withComponentInputBinding()`, `input()`-bound route params, and signals for route state. It is grounded strictly in the official docs at https://angular.dev/guide/routing.

## Reference files

Read the reference that matches the task:

- `references/define-routes.md` — `Routes` config, static/parameterized/wildcard paths, first-match order, redirects, titles, route-level providers, `data`, nested routes.
- `references/loading-strategies.md` — eager vs lazy, `loadComponent`, `loadChildren`, injection-context loaders, performance trade-offs.
- `references/outlets.md` — `<router-outlet />`, nested outlets, named/secondary outlets, outlet events, `routerOutletData` / `ROUTER_OUTLET_DATA`.
- `references/navigate.md` — `RouterLink`, relative vs absolute links, `Router.navigate`, `navigateByUrl`, `relativeTo`, query params, `replaceUrl`, `browserUrl`, `RouterLinkActive`.
- `references/read-route-state.md` — `ActivatedRoute`, params/queryParams observables vs snapshot, `withComponentInputBinding()` and `input()` route params, signals, matrix params, `isActive`.
- `references/guards.md` — functional `CanActivateFn`, `CanActivateChildFn`, `CanDeactivateFn`, `CanMatchFn`, return types, `UrlTree`/`RedirectCommand`.
- `references/resolvers.md` — functional `ResolveFn`, `resolve` config, reading resolved data, `withComponentInputBinding()`, error handling, parent/child sharing.
- `references/urlmatcher.md` — custom `matcher` function, `UrlMatchResult`, `UrlSegment`, `posParams`.
- `references/route-transitions.md` — `withViewTransitions()`, View Transitions API, CSS `::view-transition-*`, `onViewTransitionCreated`.

## Core rules

- **Use standalone `provideRouter(routes)`**, not `RouterModule.forRoot`. Register it in `app.config.ts` (or `bootstrapApplication` providers). Add features as extra arguments: `provideRouter(routes, withComponentInputBinding(), withViewTransitions())`.
- **Prefer functional guards and resolvers** (`CanActivateFn`, `ResolveFn`, etc.) over class-based ones. They are plain functions that use `inject()` for dependencies.
- **Prefer `withComponentInputBinding()` + `input()`** to bind path params, query params, matrix params, `data`, and resolved data directly to component inputs, instead of subscribing to `ActivatedRoute`.
- **Lazy-load by default** with `loadComponent`/`loadChildren`; eager-load only primary landing pages.
- **Order matters** — Angular uses first-match-wins. Put specific routes before general ones and the `**` wildcard last.
- **Never rely on client-side guards as the sole source of access control.** Always enforce authorization on the server.
- Import standalone directives (`RouterOutlet`, `RouterLink`, `RouterLinkActive`) into a component's `imports` array to use them.
