# Change Detection and Skipping Subtrees

Source: https://angular.dev/best-practices/skipping-subtrees and the zoneless
guide.

## OnPush is the default

> "OnPush is the default change detection strategy in Angular (since v22)."

`OnPush` tells Angular to run change detection for a component subtree only in
specific circumstances, rather than on every check. This is the foundation of
skipping work.

Angular runs change detection on an `OnPush` component when:

1. **The root of the subtree receives new inputs** as the result of a template
   binding. Angular compares the current and previous input value with `==`.
2. **Angular handles an event** (event binding, output binding, or
   `@HostListener`) in the subtree's root component or any of its children,
   whether or not those children use `OnPush`.

```ts
import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-greeting',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>Hello, {{ name() }}</p>`,
})
export class Greeting {
  name = input.required<string>();
}
```

## How subtrees get skipped

- When a component with the **default (eager)** strategy handles an event,
  Angular runs change detection across the tree but **skips descendant subtrees
  rooted at `OnPush` components that have not received new inputs**.
- When an event is handled **inside** an `OnPush` component (or one of its
  children), Angular runs change detection across the **entire component tree**,
  including that component's ancestors.

## Inputs, references, and `markForCheck`

- Setting an input via a **template binding** runs change detection in the
  `OnPush` child.
- If an input receives a **mutable object** and you modify the object but
  **preserve the reference**, Angular will **not** run change detection — the
  previous and current values point to the same reference. This is expected.
- If you modify an `@Input` / input imperatively via `@ViewChild` /
  `@ContentChild`, Angular does not detect it automatically. Inject
  `ChangeDetectorRef` and call `markForCheck()`.

```ts
import { Component, ChangeDetectorRef, inject, viewChild } from '@angular/core';

export class Parent {
  private cdr = inject(ChangeDetectorRef);
  child = viewChild.required(ChildComponent);

  updateChild() {
    this.child().someInput = 'new value';
    this.cdr.markForCheck(); // schedule the OnPush subtree to be checked
  }
}
```

### DO / DON'T

- DO pass **new references** (immutable updates) to `OnPush` inputs, or use
  signal inputs which notify automatically.
- DON'T mutate an object in place and expect an `OnPush` child to update.
- DO call `markForCheck()` after imperative input changes via view/content
  queries.

## Signals and change detection

Signals are the recommended way to drive updates under `OnPush` and zoneless.
Reading a signal in a template creates a dependency; updating that signal marks
the component for check automatically — no manual `markForCheck` or new object
references required.

```ts
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';

@Component({
  selector: 'app-counter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p>Count: {{ count() }} (doubled: {{ doubled() }})</p>
    <button (click)="count.set(count() + 1)">+</button>
  `,
})
export class Counter {
  count = signal(0);
  doubled = computed(() => this.count() * 2);
}
```

## Detaching a subtree manually

For advanced cases (e.g., a component updated at high frequency that you want to
control yourself), inject `ChangeDetectorRef` and `detach()` it from the tree,
then call `detectChanges()` (or `reattach()`) when you decide an update is
needed.

```ts
import { Component, ChangeDetectorRef, NgZone, inject } from '@angular/core';

export class Ticker {
  private cdr = inject(ChangeDetectorRef);
  value = 0;

  constructor() {
    this.cdr.detach(); // opt out of automatic change detection
    setInterval(() => {
      this.value++;
      this.cdr.detectChanges(); // check this subtree only, when we choose
    }, 16);
  }
}
```

- DO prefer signals + `OnPush` first; reach for `detach()` only for genuine
  high-frequency hotspots.

## Zoneless change detection

Zoneless is the **default since v21**. Without Zone.js, Angular does not
automatically detect async work; you notify it explicitly.

Enable it explicitly (e.g. on v20) at bootstrap:

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';

bootstrapApplication(App, {
  providers: [provideZonelessChangeDetection()],
});
```

Remove Zone.js by deleting it from the `angular.json` build/test polyfills,
removing any `import 'zone.js';`, and uninstalling the package
(`npm uninstall zone.js`).

Angular is notified to run change detection when you:

- Update a **signal** that is read in a template.
- Use the **`AsyncPipe`** (it calls `markForCheck` internally).
- Call **`ChangeDetectorRef.markForCheck()`**.
- Call **`ComponentRef.setInput()`**.

Recommended practices for zoneless:

- Use `ChangeDetectionStrategy.OnPush` for components.
- Replace `NgZone.onStable` / `NgZone.onMicrotaskEmpty` with `afterNextRender()`
  or `afterEveryRender()`.
- For reactive forms, connect observables to change-detection notifications or
  use signals.
- For SSR, use the `PendingTasks` service so serialization waits for async work:

```ts
import { PendingTasks, inject } from '@angular/core';

const tasks = inject(PendingTasks);
tasks.run(async () => {
  const result = await doSomeWork();
  this.state.set(result);
});
```

Benefits: improved performance, smaller payload (no Zone.js), clearer stack
traces, and better ecosystem compatibility.

- DO build new apps zoneless with signals and `OnPush`.
- DON'T rely on Zone.js side effects (e.g. `setTimeout` auto-triggering CD) in
  zoneless apps.
