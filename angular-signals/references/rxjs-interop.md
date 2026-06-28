# RxJS Interop

Sources: https://angular.dev/ecosystem/rxjs-interop and
https://angular.dev/ecosystem/rxjs-interop/output-interop

Angular provides interoperability between signals and RxJS through the
`@angular/core/rxjs-interop` package.

## toSignal()

`toSignal()` converts an RxJS Observable into a signal that tracks the
Observable's values. It is similar to the `async` pipe but usable anywhere.

Key behaviors:

- Subscribes to the Observable **immediately** upon creation (which may trigger
  side effects).
- Automatically **unsubscribes** when the containing component or service is
  destroyed.
- The returned signal should be **reused**, not recreated by calling `toSignal()`
  repeatedly for the same Observable.

```typescript
import {Component} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {interval} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  template: `{{ counter() }}`,
})
export class Ticker {
  counterObservable = interval(1000);
  counter = toSignal(this.counterObservable, {initialValue: 0});
}
```

### Initial value handling

- **`initialValue`** — the signal's value before the Observable's first emission.
- **No `initialValue`** — the signal returns `undefined` until the first emission
  (the type includes `undefined`).
- **`requireSync: true`** — for Observables that emit synchronously on subscribe
  (e.g. `BehaviorSubject`), this enforces a synchronous first value and removes
  `undefined` from the type.

### Injection context

`toSignal()` runs in an injection context by default (component/service
construction). When no injection context is available, pass an explicit
`Injector` via options.

### Custom equality

```typescript
import {Component} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {interval, map} from 'rxjs';

@Component(/* ... */)
export class EqualExample {
  temperature$ = interval(1000).pipe(
    map(() => ({temperature: Math.floor(Math.random() * 3) + 20})),
  );

  temperature = toSignal(this.temperature$, {
    initialValue: {temperature: 20},
    equal: (prev, curr) => prev.temperature === curr.temperature,
  });
}
```

Equal values prevent signal updates, avoiding redundant computation and DOM
changes.

### Manual cleanup

- **`manualCleanup: true`** — overrides automatic unsubscription, for Observables
  that complete on their own.

### Error and completion behavior

- Errors thrown by the Observable are re-thrown when the signal is **read**.
- After the Observable completes, the signal keeps returning its last emitted
  value.

## toObservable()

`toObservable()` creates an Observable that tracks a signal's value changes. It
uses an internal **effect** and emits values through a `ReplaySubject`.

```typescript
import {Component, signal} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';

@Component(/* ... */)
export class SearchResults {
  query: Signal<string> = inject(QueryService).query;
  query$ = toObservable(this.query);

  results$ = this.query$.pipe(switchMap((query) => this.http.get('/search?q=' + query)));
}
```

### Timing

The first available value emits synchronously on the first subscription;
subsequent values are asynchronous. Signals have no synchronous change
notification, so multiple rapid updates emit only the final value:

```typescript
const obs$ = toObservable(mySignal);
obs$.subscribe((value) => console.log(value));

mySignal.set(1);
mySignal.set(2);
mySignal.set(3);
// Only `3` is logged.
```

### Injection context

Like `toSignal()`, `toObservable()` requires an injection context but accepts a
manual `Injector`.

## takeUntilDestroyed()

Use `takeUntilDestroyed()` to automatically complete a subscription when the
current injection context is destroyed (e.g. component destroyed), avoiding manual
unsubscribe boilerplate. (Run it in an injection context or pass a
`DestroyRef`.)

## Output interop

Source: https://angular.dev/ecosystem/rxjs-interop/output-interop

### outputFromObservable()

Creates a component/directive output that emits whenever a source Observable
emits. It has special compiler significance and may only be called in a
component/directive property initializer.

```typescript
import {Directive} from '@angular/core';
import {outputFromObservable} from '@angular/core/rxjs-interop';

@Directive({/*...*/})
class Draggable {
  pointerMoves$: Observable<PointerMovements> = listenToPointerMoves();

  // Whenever `pointerMoves$` emits, the `pointerMove` event fires.
  pointerMove = outputFromObservable(this.pointerMoves$);
}
```

### outputToObservable()

Converts an existing output into an Observable for further reactive composition.

```typescript
import {outputToObservable} from '@angular/core/rxjs-interop';

@Component(/*...*/)
class CustomSlider {
  valueChange = output<number>();
}

const slider: CustomSlider = createSlider();

outputToObservable(slider.valueChange) // Observable<number>
  .pipe(/* ... */)
  .subscribe(/* ... */);
```

Prefer using `output()` directly when values can be emitted imperatively, and use
the `subscribe()` method on `OutputRef` for simple consumption scenarios.

## Best practices

- Call `toSignal`/`toObservable` once and store the result; never call them
  repeatedly for the same source.
- Use `requireSync: true` (or an `initialValue`) to avoid `undefined` when the
  source emits synchronously.
- Provide an `equal` function to suppress redundant emissions/renders.
- Rely on automatic cleanup by creating these in an injection context; use
  `manualCleanup` only when the source completes itself.
- Use `outputFromObservable` to expose an Observable-driven event, and
  `outputToObservable` only when you need to pipe an existing output.

## Common mistakes

- Recreating signals/observables by calling `toSignal`/`toObservable` inside
  templates or methods, causing repeated subscriptions.
- Expecting `toObservable` to emit every intermediate signal value — only the
  latest value per change-detection step is emitted.
- Forgetting that `toSignal` errors surface on read, not at subscription time.
- Calling `outputFromObservable` outside a property initializer.
