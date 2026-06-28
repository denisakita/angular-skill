---
name: angular-principles
description: Use when writing or reviewing modern Angular (v21/v22) code to apply official guiding principles for signals, standalone components, type-safety, dependency injection, and architecture.
license: MIT
metadata:
  source: https://angular.dev/overview
  angularVersion: '21-22'
  version: '1.0'
---

# Angular Principles (v21/v22)

This skill captures the core *guiding principles* for building modern Angular applications, grounded in the official Angular documentation (angular.dev). It favors current idioms throughout: signals for reactivity, standalone components (no NgModules), `inject()` over constructor injection, the built-in control flow (`@if` / `@for` / `@switch`), and an `OnPush`/zoneless mindset. Use it when authoring new components or services, refactoring legacy module-based code, or reviewing a PR for idiomatic style.

Apply these principles by default. When a rule contradicts the established style of an existing file, prioritize consistency within that file.

## Reference files

- `references/core-principles.md` — Read when deciding the foundational shape of code: signals-first reactivity, standalone-by-default, strict type-safety, immutability, and separation of concerns.
- `references/reactivity-principles.md` — Read when modeling state and data flow: the `signal`/`computed`/`effect` mental model, unidirectional data flow, deriving (not duplicating) state, and the `OnPush`/zoneless mindset.
- `references/architecture-principles.md` — Read when structuring an app or feature: dependency injection, component composition, accessibility-by-default, single responsibility, and lazy loading / feature organization.

## Core rules

- Model state with `signal()`; derive read-only state with `computed()`; treat `effect()` as a last resort for side effects only.
- Write standalone components, directives, and pipes — declare dependencies in the `imports` array; do not use NgModules.
- Inject dependencies with the `inject()` function rather than constructor parameters.
- Keep `strict` mode on; never use `any` to silence the compiler.
- Treat signal values as immutable — update with `.set()` / `.update()`, never by mutating in place.
- Use the built-in control flow `@if` / `@for` / `@switch`; keep complex logic out of templates.
- Prefer `OnPush` change detection and design as if zoneless: UI updates should flow from signal reads.
- Give each file a single responsibility; organize by feature, not by file type.
- Mark Angular-initialized members (`input()`, `model()`, `output()`, queries) as `readonly`; use `protected` for template-only members.
- Build accessible UI by default: semantic HTML, labels, and ARIA where needed.
