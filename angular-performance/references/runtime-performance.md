# Runtime Performance

Change detection is the process through which Angular checks whether your application state has changed and updates the DOM. Running it too frequently, or over too much of the component tree, causes slowdowns. Modern Angular minimizes this work through OnPush, signals, and zoneless change detection.

## OnPush change detection

In Angular v22, `OnPush` is the default change detection strategy. With OnPush, Angular runs change detection for a component subtree only when:

- The root component of the subtree receives new inputs as the result of a template binding.
- Angular handles an event in the subtree's root component or any of its children.

Set it explicitly on a component when targeting older versions or to be explicit:

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-user-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>{{ name() }}</p>`,
})
export class UserCard {
  // ...
}
```

Edge cases to remember:

- Modifying input properties via `@ViewChild`/`@ContentChild` in TypeScript does not automatically trigger change detection for OnPush components — call `ChangeDetectorRef.markForCheck()`.
- Mutating an object's contents while keeping the same reference will not trigger change detection. Angular compares references, not values, so create new references (or use signals).

## Signals

Signals give Angular fine-grained knowledge of exactly what changed, so it only checks the views that read changed signals. Reading a signal in a template registers a dependency; updating it notifies change detection automatically.

```ts
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <p>Count: {{ count() }}</p>
    <p>Doubled: {{ doubled() }}</p>
    <button (click)="increment()">+</button>
  `,
})
export class Counter {
  protected readonly count = signal(0);
  protected readonly doubled = computed(() => this.count() * 2);

  protected increment(): void {
    this.count.update((c) => c + 1);
  }
}
```

## Zoneless change detection

ZoneJS triggers synchronization more frequently than necessary because it has no insight into whether application state actually changed. Zoneless change detection removes that dependency.

- In Angular v21+, zoneless is the default; no action is required.
- In Angular v20, enable it at bootstrap:

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { App } from './app/app';

bootstrapApplication(App, {
  providers: [provideZonelessChangeDetection()],
});
```

Under zoneless, Angular schedules change detection based on notifications such as:

- `ChangeDetectorRef.markForCheck()` (called automatically by `AsyncPipe`)
- `ComponentRef.setInput`
- Updating signals that are read in templates
- Bound host/template listener callbacks
- Attaching dirty-marked views

Removing ZoneJS: delete `zone.js` / `zone.js/testing` from the `polyfills` in `angular.json` build and test targets (and any `import 'zone.js';` in `polyfills.ts`), then `npm uninstall zone.js`. Replace any `NgZone.onMicrotaskEmpty` / `onUnstable` / `onStable` / `isStable` usage with `afterNextRender()` or `afterEveryRender()`.

## track in @for

Always provide a `track` expression in `@for`. It gives Angular a stable identity for each item so it can reuse DOM nodes instead of recreating the entire list on every change.

```html
@for (user of users(); track user.id) {
  <app-user-card [user]="user" />
} @empty {
  <p>No users.</p>
}
```

## Avoiding unnecessary work (zone pollution)

Not every async operation needs change detection. Timers, `requestAnimationFrame`, network polling, and third-party libraries can repeatedly trigger needless cycles ("zone pollution"). Run them outside Angular with `NgZone.runOutsideAngular`, and re-enter with `ngZone.run()` only when you actually change state that the view depends on.

```ts
import { Component, NgZone, OnInit, output, inject } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';

@Component({ /* ... */ })
export class Chart implements OnInit {
  private ngZone = inject(NgZone);
  plotlyClick = output<Plotly.PlotMouseEvent>();

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => this.createPlotly());
  }

  private async createPlotly() {
    const plotly = await Plotly.newPlot('chart', data);
    plotly.on('plotly_click', (event: Plotly.PlotMouseEvent) => {
      // Re-enter the zone only to notify Angular of a real change.
      this.ngZone.run(() => this.plotlyClick.emit(event));
    });
  }
}
```

Use Angular DevTools' profiler to spot consecutive change-detection bars triggered by `setTimeout`, `setInterval`, `requestAnimationFrame`, or event handlers.

## Best practices

- Default to OnPush (or rely on the v22 default) and model state with signals so change detection is precise.
- Always supply `track` in `@for`; track by a stable, unique id rather than `$index` when items can be reordered.
- Keep template expressions cheap; move expensive derivations into `computed()` signals so they are memoized.
- Move noisy async work outside the Angular zone and re-enter only to update view state.
- Adopt zoneless to eliminate ZoneJS overhead; verify components notify Angular via signals, `AsyncPipe`, or `markForCheck()`.

## Common mistakes

- Mutating an object/array in place (same reference) and expecting an OnPush view to update — create a new reference or use a signal.
- Omitting `track` in `@for`, forcing Angular to destroy and recreate the entire list.
- Doing heavy computation directly in templates instead of memoizing it with `computed()`.
- Leaving `setInterval`/third-party callbacks inside the Angular zone, causing constant change detection.
- Going zoneless while still depending on `NgZone.onStable`/`isStable` or assuming ZoneJS will trigger detection for non-signal state.
