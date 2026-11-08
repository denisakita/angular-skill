---
name: angular-components
description: Use when creating or structuring Angular components — defining components and selectors, signal inputs/outputs/model, content projection, host bindings, lifecycle hooks, signal queries, styling/view encapsulation, and programmatic rendering, using modern standalone + signal idioms.
license: MIT
metadata:
  source: https://angular.dev/guide/components
  angularVersion: '21-22'
  version: '1.0'
---

# Angular Components

Authoritative guidance for building Angular components the modern way (Angular v21 LTS / v22 stable). All content is grounded in the official Angular documentation at https://angular.dev/guide/components.

Components are the fundamental building block of Angular UIs. Every component has three things: a TypeScript class (behavior), an HTML template (rendering), and a CSS selector (how it is used). Components are **standalone by default** — there are no NgModules in modern Angular.

```typescript
import {Component, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfile {}
```

To use one component inside another, list it in the `imports` array of the consuming component:

```typescript
@Component({
  selector: 'app-root',
  imports: [UserProfile],
  template: `<user-profile />`,
})
export class App {}
```

## Reference files

Load only the file you need for the task at hand (dependency-graph style — start here, then branch out):

- **references/selectors.md** — Read when choosing or designing a component's CSS selector (element vs attribute vs class selectors, prefixes, `:not`, combining selectors).
- **references/inputs.md** — Read when a component needs to receive data from its parent. Covers `input()`, `input.required()`, transforms, aliases, and `model()` two-way binding.
- **references/outputs.md** — Read when a component needs to emit custom events to its parent. Covers `output()`, `emit()`, aliases, and `outputFromObservable`.
- **references/content-projection.md** — Read when a component should render caller-supplied content. Covers `<ng-content>`, multi-slot `select`, fallback content, and `ngProjectAs`.
- **references/host-elements.md** — Read when binding attributes/classes/styles/events onto the component's own host element. Covers the `host` object and (legacy) `@HostBinding`/`@HostListener`.
- **references/lifecycle.md** — Read when you need to run logic at a specific point in a component's life (init, change, destroy, render). Covers all hooks plus `afterNextRender`/`afterEveryRender` and `DestroyRef`.
- **references/queries.md** — Read when a component must reference child elements/components in its template or projected content. Covers `viewChild()`, `viewChildren()`, `contentChild()`, `contentChildren()`.
- **references/styling.md** — Read when working with component CSS, scoping, or encapsulation. Covers `styles`/`styleUrl`, `ViewEncapsulation`, `:host`, `:host-context`, `::ng-deep`.
- **references/programmatic-rendering.md** — Read when rendering components dynamically at runtime (unknown-until-runtime, overlays/modals, lists). Covers `NgComponentOutlet`, `ViewContainerRef.createComponent`, and the standalone `createComponent`.

## Core rules

Do:
- **Use standalone components.** No `NgModule`. Declare dependencies in the component's `imports` array.
- **Set `changeDetection: ChangeDetectionStrategy.OnPush`** on new components for performance and to align with signals.
- **Use signal-based state**: `input()`, `output()`, `model()`, `viewChild()`/`contentChild()`, and `signal()`/`computed()`/`effect()`.
- **Use native control flow** in templates: `@if`, `@for` (with `track`), `@switch`, and `@defer`.
- **Use the `host` object** in the `@Component` decorator for host bindings and listeners.
- **Use `inject()`** for dependency injection instead of constructor parameters where it reads more cleanly.
- **Give component selectors a short, consistent custom prefix** (e.g. `app-`, `yt-`) and use dash-case element names.

Do not:
- Do not use `*ngIf`, `*ngFor`, or `*ngSwitch` — use `@if`, `@for`, `@switch`.
- Do not write `NgModule`s, `declarations`, or `entryComponents`.
- Do not use `@Input`/`@Output` decorators or `EventEmitter` for new code — use `input()`/`output()`.
- Do not use `@ViewChild`/`@ContentChild` decorators for new code — use signal queries.
- Do not use `@HostBinding`/`@HostListener` for new code — use the `host` object. (These decorators exist only for backwards compatibility.)
- Do not prefix the framework selector `ng` for your own components — it is reserved for Angular.
- Do not add prefixes to input/output names (unlike selectors), and avoid names that collide with native DOM properties/events.
