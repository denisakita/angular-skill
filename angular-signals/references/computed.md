# computed()

Source: https://angular.dev/guide/signals

A **computed signal** is a read-only signal that derives its value from other
signals. Create one with `computed()`, passing a derivation function:

```typescript
const count: WritableSignal<number> = signal(0);
const doubleCount: Signal<number> = computed(() => count() * 2);
```

When `count` updates, Angular knows `doubleCount` must update.

## Lazy evaluation and memoization

- The derivation function does **not** run until you first read the computed
  signal.
- The computed value is **cached**. Subsequent reads return the cached value
  without recomputing.
- When a dependency changes, Angular invalidates the cache; the next read
  recomputes the value.

Because of memoization, it is safe to perform expensive derivations (such as
filtering or mapping large arrays) inside `computed`.

## Computed signals are read-only

You cannot assign to a computed signal:

```typescript
doubleCount.set(3); // compilation error
```

If you need writable state derived from other signals, use `linkedSignal`
(see `linked-signal.md`).

## Dynamic dependencies

Only the signals actually read while the derivation runs are tracked as
dependencies:

```typescript
const showCount = signal(false);
const count = signal(0);
const conditionalCount = computed(() => {
  if (showCount()) {
    return `The count is ${count()}.`;
  } else {
    return 'Nothing to see here!';
  }
});
```

- When `showCount` is `false`, `count` is never read, so updating `count` does
  not invalidate `conditionalCount`.
- Setting `showCount` to `true` reads `count` and establishes it as a dependency.
- Setting `showCount` back to `false` removes `count` from the dependency set.

## Equality functions

`computed()` accepts the same `equal` option as `signal()` to control when
downstream consumers re-run:

```typescript
const items = signal<number[]>([1, 2, 3]);
const sorted = computed(() => [...items()].sort(), {equal: (a, b) => a.length === b.length});
```

By default it uses referential equality (`Object.is()`).

## Best practices

- **Prefer `computed` over `effect` for any value derived from signals.** It is
  lazy, memoized, and avoids the ordering/glitch issues of writing state from
  effects.
- Keep derivation functions **pure** — no side effects, no writes to other
  signals, no async work.
- Lean on memoization for expensive transforms instead of caching manually.
- Use `computed` to derive from `input()` and query signals.

## Common mistakes

- Performing side effects (HTTP calls, logging, DOM writes) inside `computed` —
  use `effect` or a `resource` instead.
- Trying to `set()`/`update()` a computed — it is read-only.
- Writing to another signal inside the derivation function.
- Expecting the function to run eagerly — it runs only on first read and only
  re-runs when a tracked dependency changes and the value is read again.
