# Zoneless Change Detection Overview

Traditionally Angular shipped `zone.js`, which monkey-patches browser async APIs (`setTimeout`, `Promise`, DOM events, XHR, etc.) so the framework can guess when application state might have changed and run change detection. Zoneless change detection removes that guesswork: Angular runs change detection only when it is explicitly notified that something changed.

This produces a smaller bundle, fewer unnecessary change detection cycles, better Core Web Vitals, clearer stack traces (no Zone frames), and better ecosystem compatibility. Zoneless is the default in Angular v21+.

## Enabling zoneless

Add `provideZonelessChangeDetection()` to your application providers.

Standalone bootstrap:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { App } from './app/app';

bootstrapApplication(App, {
  providers: [provideZonelessChangeDetection()],
});
```

NgModule bootstrap:

```typescript
import { NgModule, provideZonelessChangeDetection } from '@angular/core';

@NgModule({
  providers: [provideZonelessChangeDetection()],
})
export class AppModule {}
```

## What triggers change detection

Without Zone.js, Angular schedules change detection in response to these notifications:

- A **signal** that is read in a template is updated.
- `ChangeDetectorRef.markForCheck()` is called (the `AsyncPipe` calls this automatically when an observable emits).
- `ComponentRef.setInput()` is called.
- A bound host listener or template event listener callback runs.
- A view marked dirty by any of the above is attached.

The recommended, idiomatic approach is to model state as signals and read them directly in the template, so updates are tracked automatically.

```typescript
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';

@Component({
  selector: 'app-counter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (count() > 0) {
      <p>Count: {{ count() }} (doubled: {{ doubled() }})</p>
    }
    <button (click)="increment()">Add</button>
  `,
})
export class Counter {
  protected readonly count = signal(0);
  protected readonly doubled = computed(() => this.count() * 2);

  protected increment(): void {
    // Updating a signal read in the template notifies Angular automatically.
    this.count.update((n) => n + 1);
  }
}
```

When you receive data from a non-signal source (for example a plain callback), notify Angular by reflecting it into a signal or by calling `markForCheck()`:

```typescript
import { Component, ChangeDetectorRef, inject, signal } from '@angular/core';

@Component({ /* ... */ })
export class DataView {
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly data = signal<string | null>(null);

  load(): void {
    // Preferred: write into a signal.
    fetchData().then((value) => this.data.set(value));

    // Alternative when not using signals: mark the view dirty.
    fetchData().then((value) => {
      this.legacyValue = value;
      this.cdr.markForCheck();
    });
  }

  legacyValue = '';
}

declare function fetchData(): Promise<string>;
```

## Component change detection strategy

`ChangeDetectionStrategy.OnPush` is recommended because it guarantees a component is zoneless-compatible. It is not strictly mandatory — a component using the default strategy still works as long as it notifies Angular through signals, the `AsyncPipe`, or `markForCheck()`. Note that a library component cannot safely use `OnPush` if it hosts user-defined child components that still rely on Zone.js.

## Reactive forms

Reactive form model changes (e.g. `valueChanges` / `statusChanges` observables) do not automatically trigger change detection in zoneless mode. Reflect form state through signals (for example with `toSignal`) or call `ChangeDetectorRef.markForCheck()` so the view updates.

## Best practices

- Model component state as **signals** and read them in templates; this is the cleanest way to drive zoneless change detection.
- Use `ChangeDetectionStrategy.OnPush` on every component.
- Use the `AsyncPipe` for observables in templates so `markForCheck()` is handled for you.
- Use `afterNextRender()` / `afterEveryRender()` when you need to run code after the DOM is updated.
- Wrap async work that must affect rendered output (especially during SSR) in `PendingTasks` so the app reports as unstable until it completes.

## Common mistakes

- Mutating a plain class property and expecting the view to update — without a signal, `AsyncPipe`, event binding, or `markForCheck()`, nothing notifies Angular.
- Relying on `NgZone.isStable` / `onStable` / `onMicrotaskEmpty` / `onUnstable` — these do not fire meaningfully without Zone.js. Use `afterNextRender()`/`afterEveryRender()` or `MutationObserver` instead.
- Assuming reactive form `valueChanges` updates the view automatically — connect it to a signal or call `markForCheck()`.
- Forgetting that third-party components depending on Zone.js may not refresh; they need to be updated to notify Angular explicitly.
