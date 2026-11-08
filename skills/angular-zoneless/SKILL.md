---
name: angular-zoneless
description: Use when enabling, migrating to, or debugging Angular's zoneless change detection (removing Zone.js and driving updates with signals) in v21/v22 apps.
license: MIT
metadata:
  source: https://angular.dev/guide/zoneless
  angularVersion: '21-22'
  version: '1.0'
---

# Angular Zoneless Change Detection

Zoneless change detection lets Angular update the view without `zone.js`. Instead of patching browser async APIs to guess when state might have changed, Angular runs change detection only when it is explicitly notified — primarily through signals, the `AsyncPipe`, bound event listeners, and `markForCheck()`. It is enabled with `provideZonelessChangeDetection()` and is the default in Angular v21+.

Use this skill when you are turning on zoneless mode, removing `zone.js` from an existing project, fixing components or tests that relied on Zone.js, or handling SSR stability.

## Reference files

- `references/zoneless-overview.md` — Read to understand what zoneless is, how to enable it with `provideZonelessChangeDetection()`, and exactly what triggers change detection.
- `references/migrating-to-zoneless.md` — Read for the step-by-step migration: removing `zone.js` from polyfills, fixing Zone-dependent code, SSR with `PendingTasks`, and testing.

## Core rules

- Enable zoneless with `provideZonelessChangeDetection()` in your application providers; it is the default from Angular v21.
- Drive UI updates through **signals** (read in templates), the `AsyncPipe`, `ComponentRef.setInput()`, bound host/template event listeners, or an explicit `ChangeDetectorRef.markForCheck()`.
- Prefer `ChangeDetectionStrategy.OnPush` on components; it guarantees zoneless compatibility (though it is not strictly mandatory).
- Never depend on Zone-only APIs: `NgZone.onMicrotaskEmpty`, `onUnstable`, `onStable`, or `isStable`. Use `afterNextRender()` / `afterEveryRender()` or DOM APIs like `MutationObserver` instead.
- For async work that must complete before SSR serializes (or to keep the app "unstable"), use the `PendingTasks` service or `pendingUntilEvent()` (developer preview).
- After truly going zoneless, remove `zone.js` and `zone.js/testing` from `angular.json` polyfills and uninstall the package to shrink the bundle.
