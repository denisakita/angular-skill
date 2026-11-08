# Lazy Loading Services

Source: https://angular.dev/guide/di/lazy-loading-services

`injectAsync` (v22+) loads a service on demand, splitting its code into a separate JavaScript chunk that downloads only when needed.

## Requirement

Auto-provisioning is mandatory: the lazy-loaded service must be decorated with `@Injectable({providedIn: 'root'})` or `@Service()`.

## Basic usage

```typescript
import {Component, injectAsync} from '@angular/core';

@Component({
  selector: 'app-report',
  template: `<button (click)="export()">Export</button>`,
})
export class Report {
  private exporter = injectAsync(() =>
    import('./report-exporter').then((m) => m.ReportExporter),
  );

  async export() {
    const exporter = await this.exporter();
    exporter.export();
  }
}
```

For default exports, pass the import directly and Angular unwraps it automatically.

`injectAsync` runs in an injection context (like `inject()`), so call it in a field initializer.

## Prefetching

### Built-in `onIdle` trigger

```typescript
import {Component, injectAsync, onIdle} from '@angular/core';

@Component({ /* … */ })
export class Report {
  private exporter = injectAsync(
    () => import('./report-exporter').then((m) => m.ReportExporter),
    {prefetch: onIdle},
  );
}
```

Configure a maximum wait time:

```typescript
injectAsync(loader, {prefetch: () => onIdle({timeout: 1_000})});
```

### Custom triggers

Implement `PrefetchTrigger` — a function returning a promise — for scenarios such as hover:

```typescript
import {PrefetchTrigger} from '@angular/core';

export function onHover(target: HTMLElement): PrefetchTrigger {
  return () =>
    new Promise<void>((resolve) => {
      target.addEventListener('pointerenter', () => resolve(), {once: true});
    });
}
```

## Best practices

- Reserve lazy loading for heavy or rarely used services (large exporters, charting, editors) to shrink the initial bundle.
- Add a `prefetch` trigger (`onIdle` or a custom one) so the chunk is ready before the user acts.
- Keep the loader resolving to a tree-shakable root service.

## Common mistakes

- Trying to lazy-load a service that is not auto-provisioned (`@Service()` / `providedIn: 'root'`) — it will not work.
- Forgetting to `await` the returned async getter before using the service.
- Calling `injectAsync` outside an injection context.
