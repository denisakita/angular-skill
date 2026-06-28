# Deferred loading (`@defer`)

`@defer` reduces the initial bundle size by lazily loading parts of a template. The code for components, directives, and pipes inside a `@defer` block is split into a separate JavaScript file and loaded only when a trigger fires.

## Blocks

### `@defer`

The main, lazily-loaded content. By default it triggers on browser idle.

```html
@defer {
  <large-component />
}
```

### `@placeholder`

Optional content shown before the trigger fires. Its dependencies are loaded eagerly. Accepts a `minimum` time to avoid flicker:

```html
@defer {
  <large-component />
} @placeholder (minimum 500ms) {
  <p>Placeholder content</p>
}
```

### `@loading`

Optional content shown while dependencies are loading (replaces the placeholder). Accepts `after` (delay before showing) and `minimum`:

```html
@defer {
  <large-component />
} @loading (after 100ms; minimum 1s) {
  <img alt="loading..." src="loading.gif" />
}
```

### `@error`

Optional content shown if loading fails. Its dependencies are loaded eagerly.

```html
@defer {
  <large-component />
} @error {
  <p>Failed to load the component.</p>
}
```

## Triggers

Specify triggers in `@defer (...)`. Combine multiple with `;` (treated as OR).

| Trigger | Behavior |
| --- | --- |
| `on idle` | Default. Loads when the browser is idle (`requestIdleCallback`). Optional timeout: `on idle(500)` |
| `on viewport` | Loads when content enters the viewport (Intersection Observer). Watches the placeholder by default, or a referenced element: `on viewport(greeting)`; with options `on viewport({trigger: greeting, rootMargin: '100px', threshold: 0.5})` |
| `on interaction` | Loads on `click` or `keydown`. Watches placeholder by default: `on interaction(greeting)` |
| `on hover` | Loads on `mouseover` / `focusin`: `on hover(greeting)` |
| `on immediate` | Loads immediately after non-deferred content finishes rendering |
| `on timer` | Loads after a duration: `on timer(500ms)` |
| `when` | Loads when a custom expression becomes truthy: `when condition` |

```html
@defer (on viewport) {
  <large-component />
} @placeholder {
  <div>Scroll down to load</div>
}
```

## Prefetching

`prefetch` loads the JavaScript ahead of time (before the content is shown), so resources are ready when the user interacts:

```html
@defer (on interaction; prefetch on idle) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

## Dependency requirements

- Only **standalone** components/directives/pipes can be deferred.
- A deferred dependency must NOT be referenced outside the `@defer` block in the same file, and must not be used in `@ViewChild`/`viewChild` queries — otherwise it cannot be code-split.
- Transitive dependencies may still be NgModule-based.
- Import deferred components directly, not through barrel (`index.ts`) files — barrels prevent code splitting:

```typescript
// Wrong — defeats code splitting
import {HeavyComponent} from './index';

// Correct
import {HeavyComponent} from './heavy.component';
```

## SSR / SSG

By default, `@defer` renders the `@placeholder` on the server; triggers activate on the client. Enable Incremental Hydration to render the main content server-side.

## Testing

Use `DeferBlockBehavior.Manual` to drive defer states manually:

```typescript
TestBed.configureTestingModule({deferBlockBehavior: DeferBlockBehavior.Manual});
const deferBlockFixture = (await componentFixture.getDeferBlocks())[0];
await deferBlockFixture.render(DeferBlockState.Loading);
```

## Best practices

- Defer heavy, non-critical UI (charts, comments, below-the-fold widgets).
- Provide a `@placeholder` sized like the final content to avoid layout shift.
- Use `prefetch` to load ahead of an expected interaction.
- Use `aria-live="polite"` regions so screen readers announce content that appears.
- Avoid nesting `@defer` blocks with identical triggers (causes cascading loads).

## Common mistakes

- Deferring a component that is also referenced outside the block / in a view query — breaks code splitting.
- Deferring content in the initial viewport — causes cumulative layout shift instead of saving bytes.
- Importing the deferred component via a barrel file, which prevents the bundler from splitting it out.
- Deferring a non-standalone (NgModule) component directly.
