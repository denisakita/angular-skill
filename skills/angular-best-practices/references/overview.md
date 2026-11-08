# Overview: General Angular Best Practices

General application-level guidance for modern Angular (v21/v22). Focus areas:
component design, project organization, lazy loading, deferrable views, and image
optimization. Source: https://angular.dev/best-practices and the linked
performance, defer, and image-optimization guides.

## Components and structure

Build with **standalone components** and keep each component focused on a single
responsibility — presentation logic in the component, business/data logic in
injectable services. Use the modern reactive primitives.

```ts
import { Component, ChangeDetectionStrategy, input, output, computed, inject } from '@angular/core';
import { UserStore } from './user.store';

@Component({
  selector: 'app-user-card',
  changeDetection: ChangeDetectionStrategy.OnPush, // default since v22, but be explicit
  template: `
    @if (user(); as u) {
      <h2>{{ u.name }}</h2>
      <p>{{ greeting() }}</p>
      <button (click)="selected.emit(u.id)">Select</button>
    } @else {
      <p>No user.</p>
    }
  `,
})
export class UserCard {
  // Signal inputs / outputs instead of @Input()/@Output() decorators
  user = input.required<{ id: string; name: string }>();
  selected = output<string>();

  private store = inject(UserStore); // inject() instead of constructor params
  greeting = computed(() => `Hello, ${this.user().name}!`);
}
```

### DO / DON'T

- DO write standalone components, directives, and pipes; do not create
  `NgModule`s for new code.
- DO use `input()` / `output()` / `model()` and signals (`signal`, `computed`)
  for state.
- DO use `inject()` for dependencies.
- DON'T mix unrelated concerns in one component; extract services for data
  access and shared logic.
- DON'T reach into the DOM directly when a template binding or signal will do.

## Control flow

Use the built-in control flow blocks. They are faster, type-checked, and
require no imports.

```html
<!-- DO -->
@if (isLoggedIn()) {
  <app-dashboard />
} @else {
  <app-login />
}

@for (item of items(); track item.id) {
  <li>{{ item.name }}</li>
} @empty {
  <li>No items</li>
}

@switch (status()) {
  @case ('loading') { <app-spinner /> }
  @case ('error')   { <app-error /> }
  @default          { <app-content /> }
}
```

- DO always provide a `track` expression in `@for` (use a stable id, not
  `$index`, when items have identity).
- DON'T use the legacy `*ngIf` / `*ngFor` / `*ngSwitch` structural directives in
  new code.

## Lazy loading routes

Split the application into route-level chunks so users only download what they
need. Use `loadComponent` for a single standalone component and `loadChildren`
for a group of routes.

```ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent),
  },
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports.routes').then(m => m.REPORT_ROUTES),
  },
];
```

- DO lazy-load feature areas and large, rarely-visited routes.
- DON'T eagerly import heavy components into the initial bundle.

## Deferrable views (`@defer`)

Defer the loading of heavy, non-critical template sections. Code for components,
directives, and pipes inside a `@defer` block is split into a separate
JavaScript file and loaded only when a trigger fires. Dependencies must be
**standalone** and not referenced elsewhere in the same file.

```html
@defer (on viewport; prefetch on idle) {
  <app-heavy-chart [data]="data()" />
} @placeholder (minimum 500ms) {
  <p>Chart will load when scrolled into view…</p>
} @loading (after 100ms; minimum 1s) {
  <app-spinner />
} @error {
  <p>Failed to load the chart.</p>
}
```

Triggers: `on idle` (default), `on viewport`, `on interaction`, `on hover`,
`on immediate`, `on timer(500ms)`, and `when <condition>` (one-time; it does not
revert when the condition becomes falsy). Combine a display trigger with a
`prefetch` trigger using a semicolon.

- DO use `@defer` for below-the-fold or interaction-gated UI.
- DO wrap deferred content in an ARIA live region so screen readers announce it
  when it appears (see `keeping-up-to-date.md` accessibility section).
- DON'T defer content that is part of the initial, above-the-fold experience.

## Image optimization (`NgOptimizedImage`)

Use the `NgOptimizedImage` directive from `@angular/common` for all meaningful
images. It enforces best practices and improves Core Web Vitals.

```ts
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-hero',
  imports: [NgOptimizedImage],
  template: `
    <!-- LCP image: mark priority -->
    <img ngSrc="hero.jpg" width="800" height="400" priority />

    <!-- Unknown dimensions, sized parent must be position: relative/fixed/absolute -->
    <div class="thumb">
      <img ngSrc="cat.jpg" fill />
    </div>
  `,
})
export class Hero {}
```

- DO use `ngSrc` instead of `src` (so the browser does not eagerly download
  before Angular applies optimizations).
- DO always set `width` and `height` (or use `fill`) with a correct aspect
  ratio to prevent layout shift.
- DO mark the LCP image with `priority` (sets `fetchpriority=high`,
  `loading=eager`, and adds preload hints); Angular warns in dev if it is
  missing.
- DON'T mark multiple non-critical images as `priority`.
- DON'T set `width`/`height` together with `fill`.
