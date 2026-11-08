# Migrating to Zoneless

Migrating an existing app to zoneless involves enabling the provider, removing `zone.js`, replacing any Zone-dependent code, and updating SSR and tests. Do it incrementally — enable zoneless first and verify the app works, then remove `zone.js` from the build.

## Step 1 — Enable the zoneless provider

Add `provideZonelessChangeDetection()` to your application providers (it is the default in v21+, but adding it explicitly makes intent clear and works on older v20.x setups).

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { App } from './app/app';
import { appConfig } from './app/app.config';

bootstrapApplication(App, {
  providers: [provideZonelessChangeDetection(), ...appConfig.providers],
});
```

## Step 2 — Verify components notify Angular

Before removing `zone.js`, run the app and confirm the UI still updates. Anywhere the view relied on Zone.js detecting an async callback, switch to a signal, the `AsyncPipe`, or `ChangeDetectorRef.markForCheck()`. Prefer migrating component state to signals and using `ChangeDetectionStrategy.OnPush`.

## Step 3 — Remove Zone-only APIs

Replace any usage of the following, which no longer behave meaningfully without Zone.js:

- `NgZone.onMicrotaskEmpty`
- `NgZone.onUnstable`
- `NgZone.onStable`
- `NgZone.isStable`

Replacements:

- To run code after change detection / DOM update, use `afterNextRender()` or `afterEveryRender()`.
- To observe DOM changes, use direct DOM APIs such as `MutationObserver`.

```typescript
import { Component, afterNextRender, ElementRef, inject } from '@angular/core';

@Component({ /* ... */ })
export class Measured {
  private readonly host = inject(ElementRef<HTMLElement>);

  constructor() {
    afterNextRender(() => {
      // Runs once after the next render — replaces waiting on NgZone.onStable.
      console.log(this.host.nativeElement.offsetHeight);
    });
  }
}
```

`NgZone.run()` and `NgZone.runOutsideAngular()` remain compatible and are safe to keep.

## Step 4 — Remove zone.js from the build

Once the app behaves correctly:

1. In `angular.json`, remove `zone.js` from the `polyfills` array of the `build` target and `zone.js/testing` from the `test` target.
2. If you use a `polyfills.ts` file, delete `import 'zone.js';` and `import 'zone.js/testing';`.
3. Uninstall the package:

```bash
npm uninstall zone.js
```

Example `angular.json` after removal (note the empty/zone-free polyfills):

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "options": {
            "polyfills": []
          }
        }
      }
    }
  }
}
```

## Step 5 — Server-side rendering

During SSR, Angular must know when asynchronous work is finished before it serializes the page. Without Zone.js, register that work with the `PendingTasks` service so the application stays "unstable" until it completes.

```typescript
import { Component, inject, signal, PendingTasks } from '@angular/core';

@Component({ /* ... */ })
export class ServerData {
  private readonly pendingTasks = inject(PendingTasks);
  protected readonly result = signal<string | null>(null);

  load(): void {
    this.pendingTasks.run(async () => {
      const value = await doSomeWorkThatNeedsToBeRendered();
      this.result.set(value);
    });
  }
}

declare function doSomeWorkThatNeedsToBeRendered(): Promise<string>;
```

Manual add/cleanup form:

```typescript
const pendingTasks = inject(PendingTasks);
const cleanup = pendingTasks.add();
try {
  await doSomeWorkThatNeedsToBeRendered();
} finally {
  cleanup();
}
```

For observable-driven work, `pendingUntilEvent()` (developer preview) from `@angular/core/rxjs-interop` keeps the application unstable until the source emits or completes.

## Step 6 — Update tests

Force zoneless in `TestBed` and rely on Angular's automatic scheduling instead of manual `detectChanges()`.

```typescript
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

TestBed.configureTestingModule({
  providers: [provideZonelessChangeDetection()],
});

const fixture = TestBed.createComponent(MyComponent);
await fixture.whenStable();
```

Avoid `fixture.detectChanges()` where possible; prefer `await fixture.whenStable()` so the test exercises the same scheduling as production.

### Debug-time validation

Enable exhaustive change-detection checks to catch bindings that mutate without notifying Angular. `provideCheckNoChangesConfig` is in developer preview:

```typescript
import { provideCheckNoChangesConfig } from '@angular/core';

provideCheckNoChangesConfig({ exhaustive: true, interval: 100 });
```

This periodically re-runs change detection and errors if a binding changed without a proper notification — a fast way to find components that still relied on Zone.js.

## Best practices

- Migrate in two phases: enable `provideZonelessChangeDetection()` and validate behavior first, then strip `zone.js` from the build.
- Convert component state to signals and adopt `OnPush` as part of the migration.
- Wrap SSR async work in `PendingTasks` / `pendingUntilEvent()` (developer preview) to avoid serializing incomplete pages.
- Use `provideCheckNoChangesConfig({ exhaustive: true })` (developer preview) during development to surface missing notifications early.
- Replace `NgZone.onStable`-style waiting with `afterNextRender()` / `afterEveryRender()`.

## Common mistakes

- Removing `zone.js` from polyfills before verifying components notify Angular — the UI silently stops updating.
- Leaving `NgZone.isStable` / `onStable` logic in place; it no longer fires as expected.
- Forgetting SSR pending tasks, causing pages to be serialized before async data resolves.
- Keeping heavy `fixture.detectChanges()`-driven tests instead of `await fixture.whenStable()`, which can mask real notification bugs.
- Assuming third-party libraries are zoneless-ready; verify they update the view through supported mechanisms.
