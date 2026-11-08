---
name: angular-best-practices
description: Use when writing, reviewing, or refactoring Angular (v21/v22) code to apply official best practices for performance, change detection, error handling, security, accessibility, and staying current.
license: MIT
metadata:
  source: https://angular.dev/best-practices
  angularVersion: '21-22'
  version: '1.0'
---

# Angular Best Practices

Guidance for building modern Angular applications (v21/v22) grounded in the
official Angular documentation at https://angular.dev/best-practices. It favors
the modern idioms that are now the default in recent Angular: **standalone
components**, **signals** (`signal`, `computed`, `input()`, `output()`,
`model()`), the built-in **control flow** (`@if` / `@for` / `@switch`),
**`inject()`**, **`OnPush`** change detection (the default since v22), and
**zoneless** change detection (the default since v21).

Use this skill whenever you generate or modify Angular code so the result is
idiomatic, fast, secure, and accessible. Read the relevant reference file before
giving detailed guidance on a topic rather than relying on memory.

## Reference files

Read these on demand; each is a self-contained dependency for its topic.

- `references/overview.md` — Read for general application best practices: project
  organization, single-responsibility components, lazy loading routes, `@defer`
  deferrable views, and `NgOptimizedImage`.
- `references/performance.md` — Read for runtime performance: minimizing change
  detection work, deferrable views, image optimization, and avoiding slow
  computations / zone pollution.
- `references/change-detection.md` — Read for how change detection works and how
  to skip subtrees: `OnPush`, `markForCheck`, `ChangeDetectorRef.detach`,
  signals, and zoneless.
- `references/error-handling.md` — Read for error handling: surfacing errors at
  the callsite, the global `ErrorHandler`, global listeners, and what Angular
  does and does not catch.
- `references/keeping-up-to-date.md` — Read for staying current (`ng update`,
  release cadence, support windows) plus the essentials of **security** (XSS,
  sanitization, CSP, XSRF) and **accessibility** (ARIA, focus, routing).

## Core rules

- **Prefer standalone components**; do not introduce `NgModule`s for new code.
- **Use signals for state** (`signal`, `computed`, `linkedSignal`, `resource`)
  and `input()` / `output()` / `model()` for component I/O instead of the
  decorator forms.
- **Use built-in control flow** (`@if`, `@for`, `@switch`) instead of
  `*ngIf` / `*ngFor` / `*ngSwitch`. Always provide a `track` expression in `@for`.
- **Use `inject()`** for dependency injection instead of constructor parameters
  where it improves clarity and reuse.
- **Keep `ChangeDetectionStrategy.OnPush`** (the v22 default) and let signals or
  immutable inputs drive updates; never mutate input objects in place.
- **Embrace zoneless** (the v21 default): notify Angular by updating signals,
  using `AsyncPipe`, or calling `markForCheck()`; replace `NgZone.onStable` with
  `afterNextRender` / `afterEveryRender`.
- **Lazy-load routes** with `loadComponent` / `loadChildren` and defer heavy,
  below-the-fold UI with `@defer`.
- **Optimize images** with `NgOptimizedImage` (`ngSrc`, `width`/`height`,
  `priority` on the LCP image).
- **Surface errors at the callsite** with `try...catch` or `catchError`; provide
  a global `ErrorHandler` only for cross-cutting logging/reporting.
- **Trust Angular's security model**: never build templates from user input,
  rely on automatic sanitization, avoid `bypassSecurityTrust*`, and keep
  Angular up to date for security patches.
- **Build for accessibility**: prefer native elements, bind ARIA via attribute
  bindings, and manage focus after navigation.
