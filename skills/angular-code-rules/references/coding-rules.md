# Coding Rules

Grounded in the official Angular Style Guide (angular.dev / next.angular.dev).
Targets modern Angular (v21/v22): signals, standalone, `@if`/`@for`/`@switch`,
`inject()`, `input()`/`output()`/`model()`, and `OnPush`.

## Single responsibility

- **Focus each file on a single concept** — one component, directive, or service
  per file (small cohesive classes may share a file).
- **Code in components and directives should relate to the UI** shown on the
  page. Refactor validation rules, data transformations, and other non-UI logic
  into separate functions or classes.

## Dependency injection

- **Prefer the `inject()` function over constructor parameter injection.** It
  reads better with many dependencies, allows comments on each dependency,
  improves type inference, and avoids separating field declaration from
  initialization (ES2022+).

```typescript
import { inject } from '@angular/core';

@Component({ /* ... */ })
export class UserProfile {
  private readonly userService = inject(UserService);
  private readonly logger = inject(Logger);
}
```

## Member organization & access modifiers

- **Group Angular-specific properties near the top** of the class declaration:
  injected dependencies, inputs, outputs, and queries.
- **Declare properties before methods.**
- **Mark Angular-initialized properties `readonly`** — those created by `input`,
  `model`, `output`, and queries.
- **Use `protected` for members read only from the template** (not part of the
  public API).

```typescript
@Component({
  selector: 'user-profile',
  template: `<p>{{ fullName() }}</p>`,
})
export class UserProfile {
  // Angular-initialized, readonly, grouped at top:
  readonly userId = input();
  readonly userName = model();
  readonly userSaved = output();

  // template-only member is protected:
  protected fullName = computed(() => `${this.firstName()} ${this.lastName()}`);
}
```

## Template rules

- **Prefer `class` and `style` bindings over `NgClass` and `NgStyle`.** The
  native bindings use simpler syntax aligned with standard HTML attributes and
  have less performance overhead.

```html
<!-- DO -->
<div [class.admin]="isAdmin" [class.dense]="density === 'high'"></div>
<div [style.color]="textColor" [style.background-color]="backgroundColor"></div>

<!-- also fine: object form -->
<div [class]="{admin: isAdmin, dense: density === 'high'}"></div>
<div [style]="{'color': textColor, 'background-color': backgroundColor}"></div>
```

```html
<!-- DON'T -->
<div [ngClass]="{admin: isAdmin}"></div>
<div [ngStyle]="{'color': textColor}"></div>
```

- **Name event handlers for the action they perform**, not the triggering event.

```html
<!-- DO -->
<button (click)="saveUserData()">Save</button>
<textarea
  (keydown.control.enter)="commitNotes()"
  (keydown.control.space)="showSuggestions()"></textarea>

<!-- DON'T -->
<button (click)="handleClick()">Save</button>
```

- **Avoid overly complex logic in templates.** When a template expression gets
  too complex, refactor it into TypeScript — typically a `computed()` signal.

## Lifecycle hooks

- **Keep lifecycle methods simple.** Extract long logic into well-named methods.

```typescript
// DO
ngOnInit() {
  this.startLogging();
  this.runBackgroundTask();
}
```

- **Implement the lifecycle interface** (e.g. `OnInit`) so the hook method name
  is type-checked.

```typescript
import { Component, OnInit } from '@angular/core';

@Component({ /* ... */ })
export class UserProfile implements OnInit {
  ngOnInit() { /* ... */ }
}
```

## Directives

- Use **attribute selectors in camelCase** with an app-specific prefix
  (e.g. `[mrTooltip]`). See `naming-conventions.md`.

## DO / DON'T summary

DO:
- Keep one concept per file; keep non-UI logic out of components/directives.
- Use `inject()` for dependencies.
- Group Angular members at the top; properties before methods.
- Mark `input`/`model`/`output`/query members `readonly`.
- Use `protected` for template-only members.
- Use `class`/`style` bindings and action-named event handlers.
- Move complex template logic into `computed()` signals.
- Keep lifecycle hooks short and implement their interfaces.

DON'T:
- Put validation/data-transformation logic inside components.
- Inject via constructor parameters when `inject()` will do.
- Use `NgClass`/`NgStyle` for class/style binding.
- Name handlers after events (`handleClick`) instead of actions.
- Pack complex expressions or long logic into templates or lifecycle hooks.
