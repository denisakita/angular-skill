---
name: angular-accessibility
description: Use when building or reviewing accessible (a11y) Angular UI — ARIA bindings, semantic HTML, focus management, keyboard navigation, and the headless @angular/aria primitives.
license: MIT
metadata:
  source: https://angular.dev/best-practices/a11y
  angularVersion: '21-22'
  version: '1.0'
---

# Angular Accessibility (a11y)

Guidance for making Angular applications usable by everyone, including people who
rely on assistive technologies. Content is grounded strictly in the official
Angular documentation for accessibility and the new `@angular/aria` headless
primitives package. All examples use modern Angular idioms: standalone
components, `inject()`, signals, `input()`, and the `@if`/`@for` control flow.

## Reference files

- `references/a11y-fundamentals.md` — Read this for general accessibility work:
  semantic/native HTML, binding ARIA attributes (`[aria-*]` vs `[attr.aria-*]`),
  host bindings for accessible components, CDK a11y helpers (`LiveAnnouncer`,
  `cdkTrapFocus`), routing and focus management, color contrast, and keyboard
  navigation.
- `references/angular-aria.md` — Read this when you need fully custom,
  *unstyled* interactive widgets (listbox, menu, tabs, accordion, combobox,
  toolbar, tree, grid, etc.) built on the headless `@angular/aria` package
  while keeping WAI-ARIA behavior correct.

## Core rules

- Prefer native HTML elements (`<button>`, `<a>`, `<input>`, `<select>`) over
  re-implementing their behavior with generic `<div>`/`<span>`; you inherit
  keyboard, focus, and semantics for free.
- Bind string ARIA values with property binding, e.g. `[aria-label]="label()"`;
  Angular removes the attribute when the value is `null`. Use `[attr.aria-*]`
  for ARIA attributes that have no DOM property (e.g. `[attr.aria-valuenow]`).
- Define static roles and ARIA on reusable components via the `host` metadata
  rather than forcing every call site to add them.
- Manage focus on route changes: move focus to the main content/heading after
  navigation so screen-reader and keyboard users land in the right place.
- Use `routerLinkActive` together with `ariaCurrentWhenActive="page"` to expose
  the active navigation link to assistive technology.
- Use Angular CDK a11y helpers — `LiveAnnouncer` for dynamic announcements and
  `cdkTrapFocus` to constrain focus inside modals/dialogs.
- Ensure sufficient color contrast and never convey information by color alone;
  ensure all interactive elements are fully keyboard operable.
- For custom unstyled widgets, build on `@angular/aria` primitives instead of
  hand-rolling ARIA roles, keyboard handling, and focus management.
- Reach for Angular Material when you want accessible *and* pre-styled
  components; reach for `@angular/aria` when you need accessibility but full
  control over styling.
