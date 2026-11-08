# Reading Route State

Source: https://angular.dev/guide/routing/read-route-state
Also: https://angular.dev/guide/routing/common-router-tasks

Two ways to read route state: bind it to component `input()`s with `withComponentInputBinding()` (preferred in modern Angular), or read `ActivatedRoute` directly.

## Preferred: component input binding

Enable it once when configuring the router:

```typescript
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {routes} from './app.routes';

bootstrapApplication(App, {
  providers: [provideRouter(routes, withComponentInputBinding())],
});
```

Now route data binds directly to component inputs: static/resolved `data`, path parameters, matrix parameters, and query parameters all become available by name.

```typescript
import {Component, computed, inject, input} from '@angular/core';

@Component({/* ... */})
export class HeroDetail {
  private service = inject(HeroService);

  // bound from the :id path param
  id = input.required<string>();
  hero = computed(() => this.service.getHero(this.id()));
}
```

Configuration options for `withComponentInputBinding`:

- Disable query-param binding: `withComponentInputBinding({queryParams: false})`.
- Avoid overwriting unmatched inputs with `undefined` on stale navigations: `unmatchedInputBehavior: 'undefinedIfStale'`.
- Param inheritance from parent routes is on by default; restore legacy behavior with `paramsInheritanceStrategy: 'emptyOnly'` (a router option).

## ActivatedRoute service

Inject `ActivatedRoute` to access `url`, `data`, `params`, and `queryParams` (all observables).

```typescript
import {Component, inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({selector: 'app-product'})
export class Product {
  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    console.log(this.activatedRoute);
  }
}
```

### Snapshot vs observable

Snapshot = static, point-in-time read. Use it when the component is not reused across param changes.

```typescript
this.userId = this.route.snapshot.paramMap.get('id');

const snapshot = this.route.snapshot;
console.log({
  url: snapshot.url,
  params: snapshot.params,
  queryParams: snapshot.queryParams,
});
```

Observable = reactive; fires when params change while the component stays mounted.

```typescript
this.activatedRoute.params.subscribe((params) => {
  this.productId.set(params['id']);
});
```

Bridge to a signal with `toSignal`:

```typescript
import {toSignal} from '@angular/core/rxjs-interop';

private data = toSignal(this.route.data);
```

## Route parameters

```typescript
const routes: Routes = [{path: 'product/:id', component: Product}];
```

```typescript
this.activatedRoute.params.subscribe((params) => {
  this.productId.set(params['id']);
});
```

## Query parameters

Navigate with them:

```typescript
router.navigate(['/products'], {
  queryParams: {category: 'electronics', sort: 'price', page: 1},
});
```

Read them reactively:

```typescript
this.route.queryParams.subscribe((params) => {
  const sort = params['sort'] || 'price';
  const page = Number(params['page']) || 1;
  this.loadProducts(sort, page);
});
```

Preserve existing query params during navigation with `queryParamsHandling: 'merge'`.

## Matrix parameters

Semicolon-scoped to a single segment:

```typescript
this.router.navigate(['/awesome-products', {view: 'grid', filter: 'new'}]);
// URL: /awesome-products;view=grid;filter=new
```

Read them through the `params` observable, same as route params.

## Active-link detection

`RouterLinkActive` in templates (see `navigate.md`), or the `isActive` signal helper:

```typescript
import {isActive, Router} from '@angular/router';

isSettingsActive = isActive('/settings', this.router, {
  paths: 'subset',
  queryParams: 'ignored',
  fragment: 'ignored',
  matrixParams: 'ignored',
});
```

## Best practices

- Prefer `withComponentInputBinding()` + `input()` over manual `ActivatedRoute` subscriptions — less boilerplate, no manual unsubscription, signal-friendly.
- Use `computed()` to derive data from `input()` route params (e.g., fetch by id).
- Use the observable (`params`/`queryParams`) form when the same component instance is reused across param changes; the snapshot won't update in that case.
- Convert observables to signals with `toSignal` to stay in the signal world.

## Common mistakes

- Reading `this.route.snapshot.paramMap.get('id')` in a component that the router reuses across `:id` changes — the snapshot stays on the first value. Use the observable or component input binding instead.
- Forgetting to enable `withComponentInputBinding()` and expecting `input()` route params to populate.
- Manually subscribing without unsubscribing (memory leaks) — prefer `toSignal` or `takeUntilDestroyed`.
- Assuming query params are numbers — they are always strings; coerce explicitly (`Number(params['page'])`).
