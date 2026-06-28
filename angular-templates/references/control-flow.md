# Control flow (`@if`, `@for`, `@switch`)

Built-in control flow blocks replace the legacy structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`). They are part of the template syntax and need no imports.

## `@if` / `@else if` / `@else`

Render content when a condition is truthy:

```html
@if (a > b) {
  <p>{{ a }} is greater than {{ b }}</p>
}
```

Chain alternatives:

```html
@if (a > b) {
  {{ a }} is greater than {{ b }}
} @else if (b > a) {
  {{ a }} is less than {{ b }}
} @else {
  {{ a }} is equal to {{ b }}
}
```

Capture the result of the condition with `as` for reuse inside the block (useful for narrowing/aliasing an async or nested value):

```html
@if (user.profile.settings.startDate; as startDate) {
  {{ startDate }}
}
```

## `@for`

Iterates over any JavaScript iterable, with optimized handling for arrays. **A `track` expression is required** — it identifies each item uniquely so Angular can maintain the relationship between data and DOM nodes and minimize re-rendering.

```html
@for (item of items; track item.id) {
  {{ item.name }}
}
```

### Contextual variables

Implicit variables available inside `@for`:

- `$count` — total number of items in the collection
- `$index` — index of the current row
- `$first` — `true` on the first row
- `$last` — `true` on the last row
- `$even` — `true` when the index is even
- `$odd` — `true` when the index is odd

Alias them with `let`:

```html
@for (item of items; track item.id; let idx = $index, e = $even) {
  <p>Item #{{ idx }}: {{ item.name }}</p>
}
```

### `@empty`

Optional block rendered when the collection is empty:

```html
@for (item of items; track item.name) {
  <li>{{ item.name }}</li>
} @empty {
  <li>There are no items.</li>
}
```

## `@switch` / `@case` / `@default`

Conditional rendering by strict equality (`===`). There is **no fallthrough** (unlike JavaScript `switch`).

```html
@switch (userPermissions) {
  @case ('admin') {
    <app-admin-dashboard />
  }
  @case ('reviewer')
  @case ('editor') {
    <app-editor-dashboard />
  }
  @default {
    <app-viewer-dashboard />
  }
}
```

Consecutive `@case` blocks (as with `'reviewer'`/`'editor'` above) share the same body. `@default` handles unmatched values.

### Exhaustive type checking

Use `@default never;` to get a compile-time error if not all values of a union type are handled — this catches missing branches when the union is later extended.

## Best practices

- Always `track` by a stable unique identifier (`track item.id`). Use `track $index` only when items have no stable identity (e.g. primitive lists that can repeat).
- Use `@empty` instead of a separate `@if (items.length === 0)`.
- Use `as` in `@if` to narrow nullable values once and reuse them.
- Use consecutive `@case` blocks to group shared UI rather than duplicating markup.

## Common mistakes

- Omitting `track` in `@for` — this is a compile error and the whole point of efficient rendering.
- Tracking by `$index` when items can reorder — DOM state can attach to the wrong item; track by id instead.
- Expecting `@switch` fallthrough like JavaScript — there is none; group cases explicitly.
- Still using `*ngIf` / `*ngFor` / `*ngSwitch` — use the built-in blocks instead.
