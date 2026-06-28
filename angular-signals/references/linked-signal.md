# linkedSignal()

Source: https://angular.dev/guide/signals/linked-signal

`linkedSignal` creates a **writable** signal whose value is intrinsically linked
to some other state. Unlike a plain `signal` (which has a static default), a
`linkedSignal` recomputes automatically when its dependencies change, while still
allowing you to override its value with `.set()`/`.update()`. Think of it as the
middle ground between `signal` (writable, static default) and `computed`
(read-only, derived).

## Basic usage

The simplest form takes a computation function — just like `computed`, but the
result is writable:

```typescript
const shippingOptions = signal(['Ground', 'Air', 'Sea']);
const selectedOption = linkedSignal(() => shippingOptions()[0]);
console.log(selectedOption()); // 'Ground'

selectedOption.set(shippingOptions()[2]);
console.log(selectedOption()); // 'Sea'

shippingOptions.set(['Email', 'Will Call', 'Postal service']);
console.log(selectedOption()); // 'Email'
```

When `shippingOptions` changes, `selectedOption` recomputes back to the linked
value (here, the first option), even if it had been manually `.set()`.

## Source / computation form with previous value

For logic that needs the prior state, use the object form with separate `source`
and `computation`. The `computation` receives the new source value and a
`previous` object:

```typescript
interface ShippingMethod {
  id: number;
  name: string;
}

selectedOption = linkedSignal<ShippingMethod[], ShippingMethod>({
  source: this.shippingOptions,
  computation: (newOptions, previous) => {
    return newOptions.find((opt) => opt.id === previous?.value.id) ?? newOptions[0];
  },
});
```

The `previous` object contains:

- `previous.source` — the prior source value.
- `previous.value` — the prior `linkedSignal` value.

This lets you **preserve a user's selection** across source changes when the
selected item still exists, falling back to a default otherwise.

## Custom equality

Control when downstream consumers re-run with a custom `equal` function:

```typescript
// Computation-only form:
const activeUserEditCopy = linkedSignal(() => activeUser(), {
  equal: (a, b) => a.id === b.id,
});

// Source/computation form:
const activeUserEditCopy = linkedSignal({
  source: activeUser,
  computation: (user) => user,
  equal: (a, b) => a.id === b.id,
});
```

## When to use each

- **`signal`** — simple state with no dependencies.
- **`computed`** — read-only value derived from other signals.
- **`linkedSignal`** — mutable state that depends on other signals, needs
  automatic updates when those change, but also allows occasional manual
  adjustment via `.set()`/`.update()`.

## Best practices

- Reach for `linkedSignal` when a writable local value should reset/recompute
  when an upstream source changes (e.g. a selected item tied to a list, an
  editable copy tied to a loaded entity).
- Use the source/computation form with `previous` to keep valid user selections
  across source changes instead of blindly resetting.
- Provide `equal` (e.g. compare by `id`) to avoid clobbering edits on unrelated
  source updates.

## Common mistakes

- Using a plain `signal` and manually resetting it from an effect when the source
  changes — `linkedSignal` does this declaratively.
- Using `computed` when you actually need to also `.set()` the value — computeds
  are read-only.
- Expecting manual `.set()` values to persist after the source changes — by
  default a source change recomputes the value (use the `previous` value in the
  computation to preserve it intentionally).
