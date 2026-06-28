# effect()

Source: https://angular.dev/guide/signals (the dedicated
`/guide/signals/effects` URL was not reachable at authoring time; this content is
drawn from the official Signals overview, which documents `effect()`.)

An **effect** runs a side-effecting function whenever one or more of the signals
it reads change. Executing an `effect()` (or `afterRenderEffect()`) callback puts
Angular into a reactive context, so every signal read synchronously inside it
becomes a tracked dependency.

```typescript
import {Component, signal, effect} from '@angular/core';

@Component({/* ... */})
export class Logger {
  count = signal(0);

  constructor() {
    effect(() => {
      console.log(`The count is: ${this.count()}`);
    });
  }
}
```

The effect runs at least once and re-runs whenever any tracked signal changes.

## When to use effects

Effects are for **side effects**, not for computing values other code reads. Good
use cases include:

- Logging / analytics when data changes.
- Manual DOM manipulation not expressible in the template.
- Synchronizing signal state with non-signal / third-party APIs
  (`localStorage`, charting libraries, canvas, etc.).

For deriving values from signals, use `computed` (read-only) or `linkedSignal`
(writable). Do **not** use effects to propagate state between signals.

## Injection context and cleanup

Create effects within an **injection context** — typically a constructor or a
field initializer — so Angular ties their lifetime to the enclosing component,
directive, or service and destroys them automatically:

```typescript
@Component({/* ... */})
export class Widget {
  data = signal<Data | null>(null);
  // Field initializer runs in an injection context:
  private logger = effect(() => console.log(this.data()));
}
```

When you cannot run in an injection context, pass an explicit `Injector` via the
options object, or capture the returned `EffectRef` and call `.destroy()`
manually.

## Cleanup with `onCleanup`

The effect callback receives an `onCleanup` function. Register cleanup logic that
runs before the next execution and on destruction — useful for timers,
subscriptions, and listeners:

```typescript
effect((onCleanup) => {
  const id = this.userId();
  const timer = setInterval(() => poll(id), 1000);
  onCleanup(() => clearInterval(timer));
});
```

## Reading without tracking: `untracked()`

Read a signal inside an effect without creating a dependency:

```typescript
effect(() => {
  console.log(`User set to ${currentUser()} and counter is ${untracked(counter)}`);
});
```

This effect re-runs only when `currentUser` changes, not `counter`. Wrap calls to
external code that should not become dependencies:

```typescript
effect(() => {
  const user = currentUser();
  untracked(() => {
    this.loggingService.log(`User set to ${user}`);
  });
});
```

## Async caveat

Tracking only applies to **synchronous** reads. A signal read after `await` is not
tracked. Read needed signals before the first `await`:

```typescript
// Avoid — theme() not tracked:
effect(async () => {
  const data = await fetchUserData();
  console.log(`Theme: ${theme()}`);
});

// Prefer — read before await:
effect(async () => {
  const currentTheme = theme();
  const data = await fetchUserData();
  console.log(`Theme: ${currentTheme}`);
});
```

For async *data loading*, prefer a `resource`/`rxResource` over an effect (see
`resource.md`).

## Best practices

- Use effects only for side effects; use `computed`/`linkedSignal` for state.
- Create effects in an injection context for automatic cleanup.
- Register teardown with `onCleanup` for any subscription/timer/listener.
- Use `untracked()` to avoid unintended dependencies and feedback loops.
- Read all needed signals synchronously, before any `await`.

## Common mistakes

- Writing to a signal that the same effect reads — this risks infinite loops; use
  `computed`/`linkedSignal` instead.
- Using an effect to derive a value other code reads, instead of `computed`.
- Creating effects outside an injection context without an `Injector`, leaking the
  effect.
- Forgetting cleanup for intervals/subscriptions started inside the effect.
- Doing async data fetching in an effect instead of using a `resource`.
