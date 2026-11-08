# Route transition animations (View Transitions API)

Angular Router integrates the browser's native `document.startViewTransition()` API to animate
navigation between routes. When enabled, each navigation runs as a view transition:

1. The browser captures a screenshot of the current page.
2. Angular runs the navigation and updates the DOM.
3. The browser captures the new page.
4. The browser animates from the old state to the new state.

This is **progressive enhancement**: browsers without support simply perform the DOM update with
no animation, so navigation still works.

> Status: the Router's native View Transitions integration is in **developer preview**, and the
> underlying browser API has limited cross-browser support. Treat it as an enhancement.

## Enabling view transitions

### Standalone bootstrap (modern, preferred)

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter, withViewTransitions} from '@angular/router';
import {routes} from './app.routes';

bootstrapApplication(MyApp, {
  providers: [provideRouter(routes, withViewTransitions())],
});
```

### NgModule bootstrap (legacy)

```ts
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

@NgModule({
  imports: [RouterModule.forRoot(routes, {enableViewTransitions: true})],
})
export class AppRouting {}
```

## Customizing transitions with CSS

Define the animations in **global styles** (e.g. `styles.css`) — component styles are scoped by
view encapsulation and will not match the view-transition pseudo-elements.

```css
@keyframes rotate-out {
  to {
    transform: rotate(90deg);
  }
}

@keyframes rotate-in {
  from {
    transform: rotate(-90deg);
  }
}

::view-transition-old(count),
::view-transition-new(count) {
  animation-duration: 200ms;
  animation-name: -ua-view-transition-fade-in, rotate-in;
}

::view-transition-old(count) {
  animation-name: -ua-view-transition-fade-out, rotate-out;
}
```

Key pieces:

- **`view-transition-name`** — set this CSS property on an element to give it a unique transition
  name so it animates independently between the old and new pages (e.g. `count` above).
- **`::view-transition-old(name)`** — targets the outgoing (captured) state of that named element.
- **`::view-transition-new(name)`** — targets the incoming state.

```css
.hero-image {
  view-transition-name: hero;
}
```

## Controlling and skipping transitions

`withViewTransitions()` accepts an options object. The `onViewTransitionCreated` callback runs in
an injection context (so you can `inject()`) and receives a `ViewTransitionInfo` containing the
`ViewTransition` instance plus the `ActivatedRouteSnapshot` for both the "from" and "to" routes.
Call `transition.skipTransition()` to suppress the animation for a given navigation.

```ts
import {inject} from '@angular/core';
import {Router, withViewTransitions, isActive} from '@angular/router';

withViewTransitions({
  onViewTransitionCreated: ({transition}) => {
    const router = inject(Router);
    const targetUrl = router.currentNavigation()!.finalUrl!;

    // Skip the transition if the user is navigating to the same path,
    // only changing fragment or query params.
    const config = {
      paths: 'exact',
      matrixParams: 'exact',
      fragment: 'ignored',
      queryParams: 'ignored',
    };

    const isTargetRouteCurrent = isActive(targetUrl, router, config);

    if (isTargetRouteCurrent()) {
      transition.skipTransition();
    }
  },
});
```

## Best practices

- Define all `::view-transition-*` and `@keyframes` rules in **global** styles, not component CSS.
- Give a unique `view-transition-name` only to elements that should animate independently; reusing
  the same name on two simultaneously-visible elements is invalid.
- Keep route transition durations short (around 200ms) so navigation still feels fast.
- Use `onViewTransitionCreated` + `skipTransition()` to avoid pointless animations (e.g. fragment-
  or query-param-only navigations).
- Treat view transitions as an enhancement; never depend on them for correct navigation.
- Respect `@media (prefers-reduced-motion: reduce)` and reduce or disable transitions there.

## Common mistakes

- Putting view-transition CSS inside a component stylesheet, where encapsulation prevents it from
  matching the pseudo-elements (nothing animates).
- Forgetting to enable the feature — `withViewTransitions()` (standalone) or
  `enableViewTransitions: true` (NgModule) must be passed to the router.
- Assuming universal browser support; always keep the no-animation path working.
- Reaching for the old `@angular/animations` route-animation pattern (a `trigger` bound to the
  router outlet) — prefer the View Transitions API instead.
