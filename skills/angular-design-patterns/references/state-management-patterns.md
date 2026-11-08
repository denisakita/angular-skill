# State Management Patterns

Grounded in:
- https://angular.dev/guide/signals
- https://angular.dev/guide/signals/resource (for async state, see data-loading-patterns.md)
- https://angular.dev/guide/di

## Signal primitives

```typescript
import {signal, computed, effect} from '@angular/core';

const count = signal(0);            // writable signal
count();                            // read by calling
count.set(3);                       // replace value
count.update(v => v + 1);           // derive from previous
const readonly = count.asReadonly();// read-only view

const doubled = computed(() => count() * 2); // memoized, lazy, read-only
```

- `computed()` is lazily evaluated and memoized; dependencies are tracked dynamically (only
  signals actually read are tracked). It cannot be `.set()`/`.update()`.
- Custom equality avoids spurious updates: `signal(value, {equal: isEqual})`.
- Type guards: `isSignal(x)`, `isWritableSignal(x)`.

## Immutability

Signals detect change by reference for objects/arrays. Always replace, never mutate.

```typescript
const todos = signal<Todo[]>([]);

// DO: new reference
todos.update(list => [...list, newTodo]);
todos.update(list => list.map(t => t.id === id ? {...t, done: true} : t));

// DON'T: in-place mutation won't notify reliably
// todos().push(newTodo);  // wrong
```

## Signal store service pattern

**Recommended pattern synthesized from official guidance.** Encapsulate a feature's state in
an injectable service: private writable signals, public read-only signals/`computed`, and
methods that mutate. Components read the public surface and call methods — they never write
the signals directly.

```typescript
import {Injectable, signal, computed} from '@angular/core';

@Injectable({providedIn: 'root'})
export class CartStore {
  // private writable state
  private readonly _items = signal<CartItem[]>([]);
  private readonly _loading = signal(false);

  // public read-only surface
  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();

  // derived state
  readonly count = computed(() => this._items().length);
  readonly total = computed(() =>
    this._items().reduce((sum, i) => sum + i.price * i.qty, 0),
  );

  // methods own all mutation
  add(item: CartItem) {
    this._items.update(list => [...list, item]);
  }

  remove(id: string) {
    this._items.update(list => list.filter(i => i.id !== id));
  }

  clear() {
    this._items.set([]);
  }
}
```

## Facade pattern with signals

**Recommended pattern synthesized from official guidance.** A facade is a thin injectable
that exposes a simplified, signal-based API over one or more lower-level stores/services so
components depend on a single coordinated surface.

```typescript
@Injectable({providedIn: 'root'})
export class CheckoutFacade {
  private readonly cart = inject(CartStore);
  private readonly user = inject(UserStore);

  // re-expose only what the view needs
  readonly lineItems = this.cart.items;
  readonly total = this.cart.total;
  readonly canCheckout = computed(() =>
    this.cart.count() > 0 && this.user.isAuthenticated(),
  );

  checkout() { /* orchestrate cart + user + payment services */ }
}
```

## `linkedSignal`: writable state derived from other signals

Use `linkedSignal` when you need a writable value that should reset/recompute from a source
but can also be locally overridden (e.g. a selection that resets when the option list changes).

```typescript
import {signal, linkedSignal} from '@angular/core';

const options = signal<string[]>(['a', 'b', 'c']);

// resets to first option whenever options change, but remains settable
const selected = linkedSignal(() => options()[0]);

selected.set('b'); // local override allowed
options.set(['x', 'y']); // selected recomputes to 'x'
```

Prefer `computed()` when the value should be strictly read-only; reach for `linkedSignal`
only when local writes plus source-driven resets are both required.

## `effect()`: side effects only, with cautions

`effect()` runs when its tracked signal dependencies change. Use it for synchronization with
the non-reactive world (logging, DOM, localStorage, analytics) — NOT for deriving state.

```typescript
effect(() => {
  localStorage.setItem('theme', theme());
});
```

Cautions:
- For derived values use `computed()`, not an `effect()` that writes another signal.
- Reactive tracking is synchronous only. Read signals BEFORE any `await`:

```typescript
// DON'T: theme() after await is not tracked
effect(async () => {
  const data = await fetchUserData();
  console.log(theme());
});

// DO: read synchronously first
effect(async () => {
  const currentTheme = theme();
  const data = await fetchUserData();
  console.log(currentTheme, data);
});
```

- Use `untracked()` to read a signal inside an effect without depending on it:

```typescript
effect(() => {
  const user = currentUser();          // tracked
  untracked(() => logger.log(user, theme())); // theme() not tracked
});
```

## DO / DON'T

DO:
- Keep writable signals private; expose `asReadonly()` and `computed()` surfaces.
- Centralize mutation in store/facade methods.
- Use `computed()` for all derived state.
- Replace objects/arrays immutably via `.set()` / `.update()`.
- Use `linkedSignal` for writable-but-source-resettable state.

DON'T:
- Don't let components write store signals directly.
- Don't use `effect()` to derive state (chained effects cause bugs and extra renders).
- Don't mutate signal values in place.
- Don't read signals after `await` inside a reactive context and expect tracking.
