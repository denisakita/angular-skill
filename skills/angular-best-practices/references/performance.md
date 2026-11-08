# Runtime Performance

Source: https://angular.dev/best-practices/runtime-performance and linked guides
(deferrable views, image optimization, zoneless).

## How performance relates to change detection

> "Change detection is the process through which Angular checks to see whether
> your application state has changed, and if any DOM needs to be updated."

Angular does a top-down traversal of components to find changes, triggered by
manual calls or async events (user interaction, HTTP completion). Change
detection is highly optimized, but it can still cause slowdowns if the
application runs it too frequently. The core performance strategy is therefore
to **run change detection less often and over smaller subtrees**, and to keep
each pass cheap.

## Reduce how often change detection runs

- DO adopt **zoneless** change detection (the default since v21). Without
  Zone.js, Angular only checks the app when you explicitly notify it (signal
  updates, `AsyncPipe`, `markForCheck()`, `ComponentRef.setInput()`), which
  eliminates many redundant passes. See `change-detection.md`.
- DO keep components on `OnPush` (the default since v22) so subtrees that did not
  receive new inputs or handle events are skipped.
- DON'T run work inside Zone for high-frequency browser events. Replace
  `NgZone.onStable` / `NgZone.onMicrotaskEmpty` with `afterNextRender()` /
  `afterEveryRender()` and drive UI from signals.

## Keep each change-detection pass cheap (avoid slow computations)

Template expressions and getters run on every check. Keep them trivial.

```ts
// DON'T: heavy work in a getter/method called from the template runs every CD pass
get sortedItems() {
  return this.items.slice().sort(expensiveCompare); // recomputed constantly
}
```

```ts
// DO: memoize with computed() so it only recalculates when inputs change
import { signal, computed } from '@angular/core';

items = signal<Item[]>([]);
sortedItems = computed(() => this.items().slice().sort(expensiveCompare));
```

- DO move expensive derivations into `computed()` signals or pure pipes.
- DON'T call functions or use complex expressions directly in templates that
  run on every change-detection cycle.
- DO provide a stable `track` in `@for` so Angular reuses DOM nodes instead of
  re-rendering the whole list.

## Profiling

- Use **Angular DevTools** (the profiler tab) to see which components are being
  checked and how long each pass takes.
- Use **Chrome DevTools** performance profiling to find long tasks and scripting
  hotspots.

## Defer non-critical work with `@defer`

Deferrable views split heavy dependencies into separate JavaScript files loaded
only when needed, reducing the initial bundle and main-thread work.

```html
@defer (on viewport) {
  <app-comments [postId]="postId()" />
} @placeholder {
  <p>Comments load when scrolled into view.</p>
}
```

Use triggers such as `on idle`, `on viewport`, `on interaction`, `on hover`, or
`on timer(...)`, and add `prefetch on idle` to fetch ahead of display. See
`overview.md` for the full block/trigger reference.

## Optimize images

Images are frequently the Largest Contentful Paint element. Use
`NgOptimizedImage` from `@angular/common`:

- Use `ngSrc` (not `src`), always set `width`/`height` (or `fill`), and mark the
  LCP image with `priority`.
- Avoid marking many images `priority`; reserve it for the single most important
  image.

See `overview.md` for full `NgOptimizedImage` examples.

## Lazy-load code

- Lazy-load routes with `loadComponent` / `loadChildren`.
- Lazy-load rarely-used services and libraries via dynamic `import()` so they do
  not bloat the initial bundle.

## DO / DON'T summary

- DO run change detection as rarely as possible (zoneless + OnPush + signals).
- DO keep template expressions cheap and memoize with `computed()`.
- DO defer, lazy-load, and image-optimize to shrink initial load and CD cost.
- DON'T do heavy work in getters/methods bound in templates.
- DON'T mutate objects in place when an `OnPush` input depends on them.
