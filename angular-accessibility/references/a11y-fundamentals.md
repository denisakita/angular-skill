# Angular Accessibility Fundamentals

General accessibility (a11y) best practices for Angular applications, grounded in
the official Angular accessibility guide. Examples use standalone components,
`inject()`, signals, and `@if`/`@for` control flow.

## Semantic and native HTML

The single most effective accessibility strategy is to **re-use native HTML
elements** rather than re-implementing their behavior. Native `<button>`, `<a>`,
`<input>`, `<select>`, and heading elements come with built-in keyboard support,
focus handling, and correct semantics that assistive technologies understand.

- Use `<button>` for actions and `<a routerLink="...">` for navigation — do not
  attach click handlers to a `<div>` and re-create button behavior.
- When you must build a custom container, wrap a native control with content
  projection (`<ng-content />`) rather than replacing it.
- Angular Material follows this same principle (e.g. `MatButton`, `MatTabNav`,
  `MatTable` wrap or extend native elements).

## Binding ARIA attributes

Angular distinguishes between ARIA attributes that map to a DOM **property** and
those that only exist as an **attribute**.

### String values via property binding

For ARIA attributes that expose a DOM property (such as `aria-label`), use
ordinary property binding. Angular writes the string to the element's
`aria-label` attribute and **removes it when the bound value is `null`**.

```html
<button type="button" [aria-label]="actionLabel()">
  {{ actionLabel() }}
</button>
```

Static ARIA attributes are written as plain HTML:

```html
<button aria-label="Save document">…</button>
```

### Attribute-only values via `[attr.aria-*]`

Some ARIA attributes have no corresponding DOM property. Bind those with the
`[attr.]` prefix, e.g. `[attr.aria-valuenow]`. This is common inside a
component's `host` metadata (see below).

### Structured values (element references)

Some newer ARIA features accept structured values such as element references.
Use standard property binding for these so Angular keeps the element references
synchronized when template data changes.

```typescript
import {Component} from '@angular/core';

@Component({
  selector: 'review-dialog',
  template: `
    <h2 #dialogTitle>Attention</h2>
    <p #dialogDescription>Please review your answers before continuing.</p>

    <section
      role="dialog"
      [ariaLabelledByElements]="[dialogTitle, dialogDescription]"
    >
      <ng-content />
    </section>
  `,
})
export class ReviewDialog {}
```

> Convention note: HTML attributes use lowercase names (`tabindex`), while the
> corresponding DOM properties use camelCase names (`tabIndex`).

## Host bindings for accessible components

Define static roles and ARIA on reusable components via the `host` metadata so
every consumer gets correct semantics automatically. Combine static values with
bound `[attr.aria-*]` values for dynamic state.

```typescript
import {Component, input} from '@angular/core';

@Component({
  selector: 'app-example-progressbar',
  template: '<div class="bar" [style.width.%]="value()"></div>',
  styleUrls: ['./progress-bar.component.css'],
  host: {
    'role': 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.aria-valuenow]': 'value()',
  },
})
export class ExampleProgressbar {
  value = input(0);
}
```

Usage:

```html
<app-example-progressbar [value]="progress" aria-label="Example of a progress bar" />
```

## CDK accessibility helpers

The Angular Component Development Kit (CDK) ships an `a11y` package with
ready-made accessibility utilities. Two of the most important:

- **`LiveAnnouncer`** — announces messages to screen-reader users by writing to
  an `aria-live` region. Inject and call it for dynamic, non-focus changes
  (e.g. "Item added to cart").
- **`cdkTrapFocus`** — a directive that constrains Tab-key focus within an
  element such as a modal dialog, so keyboard users cannot tab out of it while
  it is open.

```typescript
import {Component, inject} from '@angular/core';
import {LiveAnnouncer} from '@angular/cdk/a11y';

@Component({
  selector: 'app-cart',
  template: `<button type="button" (click)="addItem()">Add to cart</button>`,
})
export class Cart {
  private readonly announcer = inject(LiveAnnouncer);

  addItem(): void {
    // …update state…
    this.announcer.announce('Item added to your cart');
  }
}
```

```html
<!-- Constrain focus within a dialog while it is open -->
<div role="dialog" cdkTrapFocus>
  <h2>Confirm</h2>
  <!-- focusable content -->
</div>
```

See the Angular CDK accessibility overview for the full API
(https://material.angular.dev/cdk/a11y/overview).

## Routing and focus management

### Move focus after navigation

Single-page navigation does not move focus the way a full page load does. Listen
for `NavigationEnd` and move focus to the main content or its heading.

```typescript
import {Component, inject} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {filter} from 'rxjs/operators';

@Component({ /* … */ })
export class AppShell {
  private readonly router = inject(Router);

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        const mainHeader =
          document.querySelector<HTMLElement>('#main-content-header');
        mainHeader?.focus();
      });
  }
}
```

### Mark the active link

Use `routerLinkActive` together with `ariaCurrentWhenActive` so assistive
technology knows which navigation item represents the current page.

```html
<nav>
  <a routerLink="home" routerLinkActive="active-page" ariaCurrentWhenActive="page">Home</a>
  <a routerLink="about" routerLinkActive="active-page" ariaCurrentWhenActive="page">About</a>
  <a routerLink="shop" routerLinkActive="active-page" ariaCurrentWhenActive="page">Shop</a>
</nav>
```

### Deferred content

When lazily loading content with `@defer`, place the deferred content inside an
ARIA live region so its appearance is announced to assistive technologies.

## Color contrast and keyboard navigation

- Ensure text and interactive elements meet sufficient color-contrast ratios,
  and never communicate meaning through color alone.
- Verify every interactive element is reachable and operable with the keyboard
  alone (Tab/Shift+Tab to move, Enter/Space to activate). Native elements give
  you this automatically; custom widgets must implement it (prefer
  `@angular/aria` — see `angular-aria.md`).

## Tooling

- **Angular ESLint** provides accessibility lint rules to catch issues at build
  time (https://github.com/angular-eslint/angular-eslint).
- **Angular Material** offers a library of fully accessible, pre-styled
  components built on the CDK.

## Best practices

- Default to native elements; only build custom widgets when no native element
  fits, and then layer ARIA on correctly.
- Put static roles/ARIA in `host` metadata so semantics travel with the
  component, not the call site.
- Use property binding `[aria-label]="…"` for string ARIA values and
  `[attr.aria-*]` for attribute-only values like `aria-valuenow`.
- Announce dynamic, non-focus updates with `LiveAnnouncer`.
- Trap focus inside modals with `cdkTrapFocus` and restore focus on close.
- Move focus to main content on route changes and expose the active link with
  `ariaCurrentWhenActive`.
- Enforce contrast and full keyboard operability; lint with Angular ESLint.

## Common mistakes

- Using `<div (click)>` instead of `<button>`, losing keyboard and focus
  behavior and correct semantics.
- Adding a `role` without the matching ARIA state/keyboard handling (a half-built
  ARIA widget is worse than a native element).
- Binding attribute-only ARIA like `aria-valuenow` as a property instead of
  `[attr.aria-valuenow]`.
- Forgetting to move focus after route navigation, leaving keyboard users
  stranded at the top of the previous view.
- Relying on color alone (e.g. red/green) to convey state.
- Hard-coding text in `aria-live`/announcements that never actually updates, or
  conversely failing to announce important asynchronous changes.
