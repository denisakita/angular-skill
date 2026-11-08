---
name: angular-performance
description: Use this skill when optimizing Angular v21/v22 application performance — change detection, deferrable views, image loading, bundle size, lazy routing, and SSR/hydration.
license: MIT
metadata:
  source: https://angular.dev/guide/performance
  angularVersion: '21-22'
  version: '1.0'
---

# Angular Performance

Guidance for making Angular v21/v22 applications fast, grounded strictly in the official angular.dev documentation. It covers runtime change detection (OnPush + signals, zoneless), lazy loading via deferrable views and lazy routes, image optimization with `NgOptimizedImage`, bundle budgets, and server-side rendering with hydration. All examples use modern idioms: standalone components, signals, `@if`/`@for` control flow, and `inject()`.

## Reference files

- `references/runtime-performance.md` — Change detection: OnPush (the v22 default) and signals, zoneless change detection (`provideZonelessChangeDetection`), `track` in `@for`, and avoiding unnecessary work via zone pollution fixes.
- `references/deferrable-views.md` — `@defer` blocks, all triggers (`on idle`, `on viewport`, `on interaction`, `on hover`, `on timer`, `on immediate`, `when`), `@placeholder`/`@loading`/`@error`, and prefetching.
- `references/image-optimization.md` — `NgOptimizedImage` directive: `ngSrc`, `priority`, `width`/`height`, `fill`, `placeholder`, responsive `sizes`/`ngSrcset`, and built-in/custom loaders.
- `references/bundle-and-loading.md` — Lazy routes (`loadComponent`/`loadChildren`), bundle budgets in `angular.json`, code splitting, SSR (`@angular/ssr`), and hydration.

## Core rules

- Prefer signals for state; signal reads in templates notify change detection precisely. In v22 OnPush is the default change detection strategy.
- In v21+ zoneless change detection is the default — don't rely on ZoneJS-triggered detection. Use signals, `AsyncPipe`, or `markForCheck()` to notify Angular of changes.
- Always provide `track` in every `@for` loop to give each item a stable identity and avoid re-rendering the whole list.
- Defer non-critical, below-the-fold UI with `@defer`; never defer content that is visible in the initial viewport (it causes layout shift and hurts Core Web Vitals).
- Use `NgOptimizedImage` (`ngSrc`) for all content images; set `width`/`height` to prevent layout shift and mark the LCP image with `priority`.
- Lazy load feature routes with `loadComponent`/`loadChildren` to keep the initial bundle small, and enforce limits with `budgets` in `angular.json`.
- Run noisy async work (third-party libs, `setInterval`, `requestAnimationFrame`) outside Angular with `NgZone.runOutsideAngular`, re-entering via `ngZone.run()` only when state changes.
- For SSR apps, enable hydration (`provideClientHydration`) to reuse server-rendered DOM and avoid a re-render flicker; add `withEventReplay()` to capture pre-hydration interactions.
