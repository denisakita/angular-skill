---
name: angular-animations
description: Use when building animations in Angular v21/v22 apps — native CSS transitions, keyframes, enter/leave animations, route transitions via the View Transitions API, or migrating off the deprecated @angular/animations package.
license: MIT
metadata:
  source: https://angular.dev/guide/animations/css
  angularVersion: '21-22'
  version: '1.0'
---

# Angular Animations (native CSS)

As of Angular v20.2 the `@angular/animations` package is **deprecated**. Modern Angular
animations are built on **native CSS** — `transition`, `@keyframes`, `@starting-style`, and the
template attributes `animate.enter` / `animate.leave` — plus the browser **View Transitions API**
(`withViewTransitions()`) for route changes. Native CSS animations are smaller (no extra JS
bundle), can use hardware acceleration, and rely on standard web platform features.

All guidance here assumes modern Angular idioms: standalone components, signals, `@if`/`@for`
control flow, and `inject()`.

## Reference files

- **references/css-animations.md** — Read when animating elements with CSS: transitions,
  `@keyframes`, entering/leaving elements with `@if`/`@for` using `animate.enter` /
  `animate.leave`, `@starting-style`, staggering, auto-height, and reacting to animation events.
- **references/route-animations.md** — Read when animating navigation between routes using the
  View Transitions API: `provideRouter(routes, withViewTransitions())`, `onViewTransitionCreated`,
  `skipTransition()`, and the `::view-transition-*` CSS pseudo-elements.
- **references/migration-from-animations-package.md** — Read when removing `@angular/animations`:
  why it is deprecated and how each old DSL primitive (`trigger`, `state`, `transition`,
  `animate`, `keyframes`, `query`, `stagger`, etc.) maps to native CSS.

## Core rules

- Prefer **native CSS** over `@angular/animations`; the package is deprecated as of v20.2.
- Use `transition` for state-to-state changes driven by toggling classes (`[class.open]="..."`).
- Use `@keyframes` + the `animation` property for multi-step or reusable animations.
- Animate **entering** elements with `animate.enter="class-name"` and **leaving** elements with
  `animate.leave="class-name"`; Angular keeps the leaving element in the DOM until its animation
  finishes.
- Use `@starting-style { ... }` to define the "before-enter" state of an element added to the DOM.
- For **route transitions**, enable `provideRouter(routes, withViewTransitions())` and style with
  `::view-transition-old(...)` / `::view-transition-new(...)` in **global** styles.
- Respect accessibility with `@media (prefers-reduced-motion)`.
- There is **no automatic migration schematic** — refactoring from the DSL to CSS is manual.
