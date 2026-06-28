# Route Transition Animations

Source: https://angular.dev/guide/routing/route-transition-animations

The Router can animate navigations using the browser's native View Transitions API (`document.startViewTransition`). This feature is in developer preview and degrades gracefully in browsers that don't support it.

## How view transitions work

The browser API:

1. Captures the current page state.
2. Runs the DOM-update callback.
3. Captures the new page state.
4. Animates from the old to the new state.

```javascript
document.startViewTransition(async () => {
  await updateTheDOMSomehow();
});
```

The router wires the route change into this callback for you.

## Enabling view transitions

### Standalone bootstrap (preferred)

```typescript
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter, withViewTransitions} from '@angular/router';
import {routes} from './app.routes';

bootstrapApplication(MyApp, {
  providers: [provideRouter(routes, withViewTransitions())],
});
```

### NgModule bootstrap (legacy)

```typescript
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

@NgModule({
  imports: [RouterModule.forRoot(routes, {enableViewTransitions: true})],
})
export class AppRouting {}
```

## Customizing animations with CSS

Define animations in **global** styles (component styles are scoped by view encapsulation and won't apply to `::view-transition-*` pseudo-elements). Use `view-transition-name` on elements you want to animate individually.

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

## Advanced control: onViewTransitionCreated

`withViewTransitions` accepts a callback that runs in an injection context and receives `ViewTransitionInfo` (the `ViewTransition` instance plus source/target route snapshots). Use it to skip transitions in certain cases.

```typescript
import {inject} from '@angular/core';
import {Router, withViewTransitions, isActive} from '@angular/router';

withViewTransitions({
  onViewTransitionCreated: ({transition}) => {
    const router = inject(Router);
    const targetUrl = router.currentNavigation()!.finalUrl!;

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

- Enable with `provideRouter(routes, withViewTransitions())` in standalone apps.
- Put `::view-transition-*` rules and `@keyframes` in global styles, not component CSS.
- Assign unique `view-transition-name` values to elements that should animate independently (and shared names for elements that should morph between routes).
- Use `onViewTransitionCreated` + `transition.skipTransition()` to suppress animations for no-op or query-param-only navigations.
- Treat transitions as progressive enhancement — ensure the app works where the API is unsupported.

## Common mistakes

- Placing transition CSS in a component stylesheet, where encapsulation prevents it from matching the pseudo-elements.
- Forgetting unique `view-transition-name`s, causing the browser to error or animate the wrong elements.
- Expecting transitions in every browser — it is developer preview and depends on native support.
- Running heavy synchronous work inside `onViewTransitionCreated`, delaying the animation.
