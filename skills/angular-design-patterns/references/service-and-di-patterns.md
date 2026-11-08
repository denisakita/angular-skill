# Service and Dependency Injection Patterns

Grounded in:
- https://angular.dev/guide/di
- https://angular.dev/guide/components (for `inject()` usage in components)

## Injectable services with `providedIn: 'root'`

The idiomatic way to declare an app-wide singleton service. This is tree-shakable: if nothing
injects it, it is dropped from the bundle.

```typescript
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class AnalyticsLogger {
  trackEvent(category: string, value: string) {
    console.log('Analytics:', {category, value, at: new Date().toISOString()});
  }
}
```

> Note (v22+): Angular adds `@Service()` as an ergonomic shorthand for
> `@Injectable({providedIn: 'root'})`. Both are valid; `@Injectable({providedIn: 'root'})`
> remains the widely documented form and is safe across v21/v22.

## `inject()` over constructor injection

Prefer the `inject()` function. It works in field initializers, constructor bodies, factory
functions, and route guards, and composes cleanly with inheritance and generics.

```typescript
import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';

@Component({ selector: 'app-navbar', /* ... */ })
export class Navbar {
  private readonly router = inject(Router);
  private readonly analytics = inject(AnalyticsLogger);

  goToDetail() {
    this.analytics.trackEvent('navigation', '/details');
    this.router.navigate(['/details']);
  }
}
```

DI value: separation of concerns (improved maintainability), reusable modular units
(scalability), and substitutable test doubles (better testing).

## Injection tokens

Use `InjectionToken` for non-class dependencies (config objects, primitives, interfaces).
A `factory` makes the token tree-shakable and gives it a default.

```typescript
import {InjectionToken, inject} from '@angular/core';

export interface AppConfig {
  apiUrl: string;
  pageSize: number;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG', {
  providedIn: 'root',
  factory: () => ({apiUrl: '/api', pageSize: 20}),
});

// consume
const config = inject(APP_CONFIG);
```

Override at bootstrap or route level:

```typescript
bootstrapApplication(App, {
  providers: [
    {provide: APP_CONFIG, useValue: {apiUrl: 'https://prod/api', pageSize: 50}},
  ],
});
```

## Provider recipes

| Recipe | When |
| --- | --- |
| `{provide: T, useClass: Impl}` | Swap implementation class for a token/abstract class. |
| `{provide: TOKEN, useValue: obj}` | Supply a constant/config object. |
| `{provide: T, useFactory: fn, deps: [...]}` | Construct based on other deps / runtime logic. |
| `{provide: Alias, useExisting: T}` | Alias one token to an already-provided instance (single shared instance). |

```typescript
{provide: Logger, useClass: VerboseLogger}
{provide: API_URL, useValue: 'https://prod/api'}
{provide: Http, useFactory: () => new Http(inject(API_URL)), deps: []}
{provide: AbstractStore, useExisting: CartStore}
```

`useExisting` reuses one instance; `useClass` would create a separate instance.

## Hierarchical DI

Angular resolves dependencies up an injector tree (element/component injectors → route
injectors → root → platform). Provision scope by where you declare a provider:

- `providedIn: 'root'` — one app-wide singleton (default choice).
- Route-level `providers: [...]` — one instance per lazy-loaded feature/route subtree.
- Component-level `providers: [...]` — a fresh instance per component instance (e.g. local,
  per-widget state); children of that component inject the same instance.

```typescript
@Component({
  selector: 'wizard',
  providers: [WizardState], // scoped to this component + its template descendants
})
export class Wizard {}
```

## Facade services

**Recommended pattern synthesized from official guidance.** A facade is an injectable that
hides coordination of multiple lower-level services behind a small API, so components depend
on one thing. (See state-management-patterns.md for the signal-based facade variant.)

```typescript
@Injectable({providedIn: 'root'})
export class OrdersFacade {
  private readonly api = inject(OrdersApi);
  private readonly cart = inject(CartStore);
  private readonly toast = inject(ToastService);

  async placeOrder() {
    const order = await this.api.create(this.cart.items());
    this.cart.clear();
    this.toast.success(`Order ${order.id} placed`);
    return order;
  }
}
```

## DO / DON'T

DO:
- Use `@Injectable({providedIn: 'root'})` for singletons.
- Use `inject()` in new code; keep fields `private readonly`.
- Use `InjectionToken` (with a `factory`) for config and non-class values.
- Scope state-bearing services with component/route `providers` when per-instance lifetime is wanted.
- Use facades to keep component dependency lists small.

DON'T:
- Don't register app singletons in NgModule `providers` for new code.
- Don't mix decorator constructor injection and `inject()` arbitrarily; standardize on `inject()`.
- Don't use `useExisting` when you actually need separate instances (use `useClass`).
- Don't put environment secrets/API keys in client-shipped files.
