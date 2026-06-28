# Deferrable Views (@defer)

Deferrable views, also known as `@defer` blocks, reduce the initial bundle size of your application by deferring the loading of code that is not strictly necessary for the initial rendering of a page. The dependencies inside a `@defer` block are lazily loaded as a separate JavaScript chunk when a trigger fires.

```html
@defer {
  <large-component />
}
```

Requirements for a dependency to be deferred:

- It must be **standalone**. Non-standalone dependencies load eagerly.
- It cannot be referenced outside the `@defer` block in the same file, nor in `@ViewChild` queries.

Only standalone components, directives, and pipes can be deferred, though `@defer` blocks themselves are compatible with both standalone and NgModule-based code.

## Block structure

A `@defer` block can be paired with optional sub-blocks that control what the user sees during loading.

```html
@defer (on viewport) {
  <large-component />
} @placeholder (minimum 500ms) {
  <p>Placeholder content</p>
} @loading (after 100ms; minimum 1s) {
  <img alt="loading..." src="loading.gif" />
} @error {
  <p>Failed to load large component.</p>
}
```

- `@placeholder` — shown before the block triggers. Its dependencies load eagerly. The `minimum` parameter (ms or s) keeps it visible for at least that long to prevent flicker.
- `@loading` — shown while dependencies are loading; replaces the placeholder once loading begins. Supports `minimum` (minimum display time) and `after` (wait this long before showing it). Both timers start when loading triggers.
- `@error` — shown if deferred loading fails.

## Triggers

The default trigger is `on idle`. Multiple triggers can be combined with semicolons and act as OR conditions.

### on idle

Fires when the browser is idle (via `requestIdleCallback`). Optional timeout in ms.

```html
@defer (on idle) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}

@defer (on idle(500)) {
  <large-cmp />
}
```

### on viewport

Fires when content enters the viewport (Intersection Observer). Watches the placeholder by default (which must have a single root element), or a template reference variable.

```html
<div #greeting>Hello!</div>
@defer (on viewport(greeting)) {
  <greetings-cmp />
}

@defer (on viewport({ trigger: greeting, rootMargin: '100px', threshold: 0.5 })) {
  <greetings-cmp />
}
```

### on interaction

Fires on `click` or `keydown`. Defaults to the placeholder element, or a referenced element.

```html
@defer (on interaction) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

### on hover

Fires on `mouseover` and `focusin`. Defaults to the placeholder element, or a referenced element.

```html
@defer (on hover) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

### on timer

Fires after a specified duration (ms or s).

```html
@defer (on timer(500ms)) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

### on immediate

Fires immediately after non-deferred content finishes rendering.

```html
@defer (on immediate) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

### when (custom condition)

Fires when the expression becomes truthy. This is a one-time operation — it does not revert if the condition later becomes false.

```html
@defer (when isReady()) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

## Prefetching

Prefetch loads the JavaScript chunk ahead of time without rendering the content. Separate the main trigger and the `prefetch` trigger with a semicolon.

```html
@defer (on interaction; prefetch on idle) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

## SSR and incremental hydration

By default during SSR/SSG, a `@defer` block renders only its `@placeholder`; triggers do not activate on the server. The client hydrates the placeholder and then activates the triggers. To render the main content on the server, enable Incremental Hydration and configure `hydrate` triggers.

## Best practices

- Defer below-the-fold and rarely-used UI; pair `on interaction`/`on hover` with `prefetch on idle` so the chunk is ready before the user needs it.
- Give nested `@defer` blocks different triggers to avoid cascading loads where everything fetches at once.
- Always provide a meaningful `@placeholder` to reserve space and avoid layout shift.
- Import deferred dependencies directly from their component files, not from barrel (`index.ts`) files, so the bundler can split them.
- Wrap defer blocks in an `aria-live` region so screen readers announce state changes.

## Common mistakes

- Deferring components that are visible in the initial viewport — using `immediate`, `timer`, `viewport`, or `when` for above-the-fold content causes layout shift and hurts Core Web Vitals.
- Trying to defer a non-standalone component, or referencing the deferred component elsewhere in the file (e.g. in a `@ViewChild`), which forces it to load eagerly.
- Importing deferred dependencies through barrel files, which defeats chunk splitting.
- Expecting `when` to re-hide content when the condition turns false — it is a one-way trigger.
- Forgetting that during SSR only the placeholder renders unless incremental hydration is configured.
