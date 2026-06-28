---
name: angular-design-patterns
description: Use when designing or reviewing modern Angular (v21/v22) code to apply idiomatic, signal-based, standalone design patterns grounded in official Angular guidance.
license: MIT
metadata:
  source: https://angular.dev/guide/components
  angularVersion: '21-22'
  version: '1.0'
---

# Angular Design Patterns

This skill captures idiomatic design patterns for modern Angular (v21/v22): signals,
standalone components, native control flow (`@if`/`@for`/`@switch`), `inject()`,
`input()`/`output()`, `computed`/`effect`/`linkedSignal`, and the `resource()` family for
async data. Content is grounded in the official Angular documentation at https://angular.dev.
Where a pattern is an architectural recommendation rather than a documented API, it is
explicitly labeled **"recommended pattern synthesized from official guidance."**

Use these patterns when authoring new components/services, refactoring legacy decorator-based
or NgModule-based code, or reviewing Angular code for idiomatic structure.

## Reference files

Load the reference that matches the task; each is self-contained.

- `references/component-patterns.md` — Container/presentational split, `input()`/`output()` signal IO, `computed` view state, OnPush, host bindings.
- `references/state-management-patterns.md` — Signal state, signal store services, signal facades, immutability, `linkedSignal`, `effect` cautions.
- `references/service-and-di-patterns.md` — `@Injectable`/`providedIn: 'root'`, `inject()`, `InjectionToken`, hierarchical DI, facade services.
- `references/data-loading-patterns.md` — `resource()`, `rxResource()`, `httpResource()`, loading/error state, signals + `HttpClient`.
- `references/architecture-patterns.md` — Standalone-by-default architecture, feature folders, lazy-loaded routes, separation of concerns.

## Core rules

- Standalone is the default in v19+. Do NOT set `standalone: true` and do NOT create NgModules for new code.
- Use signals for state: `signal()` for writable, `computed()` for derived, `effect()` only for side effects.
- Use `input()` / `output()` functions, never the `@Input()` / `@Output()` decorators.
- Inject with the `inject()` function over constructor parameter injection in new code.
- Use native control flow `@if` / `@for` (with `track`) / `@switch`, never `*ngIf` / `*ngFor` / `*ngSwitch`.
- Prefer `OnPush` change detection; signals integrate with it automatically (in v22+ this trends toward default — do not fight the default).
- Load async data with the `resource()` family (`resource`, `rxResource`, `httpResource`) instead of manual subscribe/store-in-field patterns.
- Bind host state via the `host` metadata object, not `@HostBinding` / `@HostListener`.
- Keep state immutable: replace objects/arrays with new references via `.set()` / `.update()`.
- Never read or mutate signals through `async`/`await` inside a reactive context without first reading them synchronously (tracking only works on synchronous reads).
- Use strict TypeScript; keep templates simple and push logic into `computed()` and methods.
