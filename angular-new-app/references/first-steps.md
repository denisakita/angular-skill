# First steps: your first standalone component

This walks through the essentials of writing modern Angular code: a standalone component, signals for state, templates with `@if`/`@for`, bindings and events, and dependency injection via `inject()`.

## A standalone component

Every component has four main parts: a `@Component` decorator, a CSS `selector`, an HTML `template` (inline or via `templateUrl`), and a TypeScript class for behavior.

```ts
// user-profile.ts
import { Component } from '@angular/core';

@Component({
  selector: 'user-profile',
  template: `
    <h1>User profile</h1>
    <p>This is the user profile page</p>
  `,
})
export class UserProfile {
  /* Your component code goes here */
}
```

You can add styles inline with `styles`, or move the template and styles to separate files with `templateUrl` and `styleUrl`:

```ts
@Component({
  selector: 'user-profile',
  templateUrl: 'user-profile.html',
  styleUrl: 'user-profile.css',
})
export class UserProfile {}
```

### Using one component inside another

Import the component, add it to the `imports` array, then use its selector in the template:

```ts
import { Component } from '@angular/core';
import { ProfilePhoto } from './profile-photo';

@Component({
  selector: 'user-profile',
  imports: [ProfilePhoto],
  template: `
    <h1>User profile</h1>
    <profile-photo />
  `,
})
export class UserProfile {}
```

## State with signals

A signal is a lightweight wrapper around a value. Create one with `signal()`, read it by calling it, and change it with `.set()` or `.update()`. Derive values with `computed()`.

```ts
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'user-profile',
  template: `...`,
})
export class UserProfile {
  isTrial = signal(false);
  isTrialExpired = signal(false);
  showTrialDuration = computed(() => this.isTrial() && !this.isTrialExpired());

  activateTrial() {
    this.isTrial.set(true);
  }
}
```

- Read: `this.isTrial()`
- Replace the value: `firstName.set('Jaime')`
- Transform from the current value: `firstName.update((name) => name.toUpperCase())`
- `computed()` signals are read-only — they have no `set` or `update`.

Angular tracks where signals are read and when they are updated to keep the UI in sync automatically.

## Templates

### Interpolation

Bind dynamic text with double curly braces. When a signal changes, the template updates:

```ts
@Component({
  selector: 'user-profile',
  template: `<h1>Profile for {{ userName() }}</h1>`,
})
export class UserProfile {
  userName = signal('pro_programmer_123');
}
```

### Property binding

Use square brackets to bind to DOM properties:

```html
<button [disabled]="!isValidUserId()">Save changes</button>
```

Bind HTML attributes with the `attr.` prefix:

```html
<ul [attr.role]="listRole()"></ul>
```

### Event binding

Use parentheses to listen for events. Access the event with `$event`:

```html
<button (click)="cancelSubscription()">Cancel subscription</button>
<button (click)="cancelSubscription($event)">Cancel subscription</button>
```

```ts
cancelSubscription(event: Event) {
  /* Your event handling code goes here. */
}
```

### Control flow: `@if` / `@else`

```html
<h1>User profile</h1>
@if (isAdmin()) {
  <h2>Admin settings</h2>
} @else {
  <h2>User settings</h2>
}
```

### Loops: `@for` (with required `track`)

```html
<ul class="user-badge-list">
  @for (badge of badges(); track badge.id) {
    <li class="user-badge">{{ badge.name }}</li>
  }
</ul>
```

The `track` expression associates data with the DOM elements created by `@for`, which is required and keeps rendering efficient.

## Dependency injection with `inject()`

Services are reusable pieces of code shared across components. Declare a service with the `@Injectable` decorator (use `providedIn: 'root'` to make it available app-wide), then obtain it with the `inject()` function.

```ts
// calculator.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Calculator {
  add(x: number, y: number) {
    return x + y;
  }
}
```

```ts
// receipt.ts
import { Component, inject } from '@angular/core';
import { Calculator } from './calculator';

@Component({
  selector: 'app-receipt',
  template: `<h1>The total is {{ totalCost }}</h1>`,
})
export class Receipt {
  private calculator = inject(Calculator);
  totalCost = this.calculator.add(50, 25);
}
```

## Best practices

- Build components standalone and list dependencies in the component's own `imports` array.
- Use signals for component state and `computed()` for derived values instead of recomputing manually.
- Read a signal by calling it (`value()`); never use a signal reference as if it were the value.
- Always provide a stable `track` expression in `@for` (e.g. a unique `id`).
- Inject dependencies with `inject()` and make app-wide services `@Injectable({ providedIn: 'root' })`.

## Common mistakes

- Forgetting the parentheses when reading a signal (`userName` instead of `userName()`).
- Calling `.set()`/`.update()` on a `computed()` signal — computed signals are read-only.
- Omitting `track` in `@for`, which is required.
- Forgetting to add a child component to the `imports` array before using its selector.
- Reaching for the old `*ngIf` / `*ngFor` structural directives in new code instead of the `@if` / `@for` blocks.
- Setting `attr.`-prefixed bindings as plain property bindings (use `[attr.role]` for HTML attributes).
