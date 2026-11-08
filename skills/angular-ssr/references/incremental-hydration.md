# Incremental hydration

Incremental hydration is an advanced form of hydration that leaves sections of the
app **dehydrated** after the initial load and hydrates them only when they are
actually needed. Because the JavaScript for those sections isn't fetched or
executed up front, initial bundles are smaller and First Input Delay (FID) and
Cumulative Layout Shift (CLS) improve — while the user still sees fully rendered
server HTML immediately.

It builds on top of full hydration: the server still renders the content, but the
client defers wiring it up until a trigger fires.

## Enabling

In v22, incremental hydration is on by default with `provideClientHydration()` (browser
providers), and `withIncrementalHydration()` is deprecated. In v21, enable it with the
`withIncrementalHydration()` feature. It depends on and **automatically enables event
replay**, so a separate `withEventReplay()` is unnecessary.

```typescript
import {bootstrapApplication, provideClientHydration} from '@angular/platform-browser';
import {App} from './app/app';

// On by default in v22. In v21, use provideClientHydration(withIncrementalHydration()).
bootstrapApplication(App, {
  providers: [provideClientHydration()],
});
```

To opt out in v22, use `withNoIncrementalHydration()`. This also turns off event replay, so
add `withEventReplay()` if you want to keep it.

## `hydrate` triggers on `@defer`

Mark a `@defer` block for incremental hydration by adding a `hydrate` trigger.
Unlike a plain `@defer` (which renders a placeholder until the trigger fires),
a `hydrate` block renders its real server HTML immediately and only **hydrates**
on the trigger.

```html
@defer (hydrate on viewport) {
  <app-large-cmp />
} @placeholder {
  <p>Loading...</p>
}
```

Supported triggers:

- `hydrate on idle` — hydrates when the browser is idle (optional timeout in ms):

  ```html
  @defer (hydrate on idle(500)) {
    <app-large-cmp />
  }
  ```

- `hydrate on viewport` — hydrates when the block scrolls into view (Intersection
  Observer). Ideal for below-the-fold content.
- `hydrate on interaction` — hydrates on `click` or `keydown` within the block.
- `hydrate on hover` — hydrates on `mouseover` / `focusin`.
- `hydrate on immediate` — hydrates immediately after non-deferred content renders.
- `hydrate on timer` — hydrates after a duration (`ms` or `s`):

  ```html
  @defer (hydrate on timer(500ms)) {
    <app-large-cmp />
  }
  ```

- `hydrate when <condition>` — hydrates when a component expression becomes truthy:

  ```html
  @defer (hydrate when isReady) {
    <app-large-cmp />
  }
  ```

- `hydrate never` — keeps the block permanently dehydrated (static server HTML, no
  client JS) for the initial load.

## Combining triggers

A block can carry both a normal `@defer` trigger (controls fetch/render when there
is no server HTML) and a `hydrate` trigger, separated by `;`:

```html
@defer (on idle; hydrate on interaction) {
  <app-example-cmp />
}
```

## Best practices

- Reach for incremental hydration on **large, below-the-fold, or rarely-used**
  components — that's where deferring the JS pays off most.
- `hydrate on viewport` and `hydrate on idle` are the safest defaults for content
  the user will likely reach; `hydrate on interaction`/`hover` suit widgets that
  only matter once touched.
- Use `hydrate never` for static, non-interactive sections to ship zero JS for
  them on first load.
- Keep `@placeholder` markup structurally close to the real content to avoid layout
  shift if the block ever falls back to rendering.

## Common mistakes

- On v21, expecting incremental hydration without `withIncrementalHydration()` in the
  client providers. (In v22 it is on by default, so the feature is not needed.)
- Adding `withEventReplay()` alongside `withIncrementalHydration()` — redundant,
  since event replay is enabled automatically.
- Using `hydrate` triggers without SSR/prerendering — there is no server HTML to
  hydrate, so the block behaves like a normal deferred (placeholder) block.
- Putting critical above-the-fold interactive UI behind `hydrate on viewport`/
  `interaction`, delaying interactivity where users expect it immediately.
