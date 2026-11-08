# Two-way binding

Two-way binding binds a value to an element AND lets changes propagate back through the same binding. The syntax combines property binding `[]` with event binding `()` into `[()]` — informally called the "banana-in-a-box."

## With native form controls (`ngModel`)

1. Import `FormsModule` from `@angular/forms`.
2. Use the `ngModel` directive with two-way binding syntax.

```typescript
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  imports: [FormsModule],
  template: `
    <main>
      <h2>Hello {{ firstName }}!</h2>
      <input type="text" [(ngModel)]="firstName" />
    </main>
  `,
})
export class App {
  firstName = 'Ada';
}
```

## Between components with `model()`

The child exposes a writable `model` signal; the parent binds to it with `[()]`.

**Child (`counter.ts`):**

```typescript
import {Component, model} from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <button (click)="updateCount(-1)">-</button>
    <span>{{ count() }}</span>
    <button (click)="updateCount(+1)">+</button>
  `,
})
export class Counter {
  count = model<number>(0);

  updateCount(amount: number): void {
    this.count.update((currentCount) => currentCount + amount);
  }
}
```

**Parent (`app.ts`):**

```typescript
import {Component} from '@angular/core';
import {Counter} from './counter';

@Component({
  selector: 'app-root',
  imports: [Counter],
  template: `
    <main>
      <h1>Counter: {{ initialCount }}</h1>
      <app-counter [(count)]="initialCount"></app-counter>
    </main>
  `,
})
export class App {
  initialCount = 18;
}
```

The parent wraps the child's `model` property name in `[()]` and assigns a property or signal to it. The `model()` signal is read with `count()` and updated with `.set()` / `.update()` inside the child.

## Best practices

- Use `model()` (not the old `@Input()` + `@Output()` "xChange" pair) for new component two-way bindings.
- Only import `FormsModule` where you actually use `ngModel`.
- Update a `model` signal with `.set()` / `.update()`; both sides stay in sync automatically.

## Common mistakes

- Forgetting to import `FormsModule`, so `[(ngModel)]` fails to compile.
- Mismatched names — `[(count)]` requires a child member named exactly `count` declared as `model()`.
- Reading a `model`/signal without calling it (`count` instead of `count()`).
- Trying to two-way bind to a plain `input()` (read-only) — two-way binding requires `model()`.
