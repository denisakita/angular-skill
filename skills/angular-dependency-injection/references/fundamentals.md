# DI Fundamentals

Source: https://angular.dev/guide/di · https://angular.dev/guide/di/dependency-injection

## What dependency injection is

Dependency Injection (DI) is a design pattern you use to organize and share code across your application by supplying dependencies to a class instead of creating them inside it.

A **dependency** is any object, value, function, or service that a class requires to work but does not create itself. Common dependencies include configuration values, factories, and services.

Why it matters:

- **Maintainability** — separation of concerns; a class declares what it needs, not how to build it.
- **Scalability** — reusable, modular functionality.
- **Testability** — inject test doubles instead of real implementations.

## Services

An Angular service is a TypeScript class whose instances can be injected as dependencies. In Angular v22+ you mark such a class with the `@Service()` decorator (on v21, use `@Injectable({providedIn: 'root'})`), which makes it available throughout the entire application as a singleton.

```typescript
import {Service} from '@angular/core';

@Service()
export class AnalyticsLogger {
  trackEvent(category: string, value: string) {
    console.log('Analytics event logged:', {
      category,
      value,
      timestamp: new Date().toISOString(),
    });
  }
}
```

(`@Injectable({providedIn: 'root'})` is the equivalent, longer-standing form — see `creating-services.md`.)

## Injecting dependencies with `inject()`

The `inject()` function retrieves a dependency at runtime. Prefer it over constructor parameter injection.

```typescript
import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {AnalyticsLogger} from './analytics-logger';

@Component({
  selector: 'app-navbar',
  template: `<a href="#" (click)="navigateToDetail($event)">Detail Page</a>`,
})
export class Navbar {
  private router = inject(Router);
  private analytics = inject(AnalyticsLogger);

  navigateToDetail(event: Event) {
    event.preventDefault();
    this.analytics.trackEvent('navigation', '/details');
    this.router.navigate(['/details']);
  }
}
```

## Where `inject()` works

You can inject dependencies during construction of a component, directive, or service. The call to `inject()` can appear in either the `constructor` or in a field initializer. Valid locations:

- Class field initializers
- Constructor bodies
- Services, directives, route guards, and other injection contexts

See `injection-context.md` for the full list and how to bridge non-context code.

## The two-step mental model

1. **Provide** the dependency — automatically with `@Service()` / `providedIn: 'root'`, or manually via a `providers` array (application config, component/directive, or route).
2. **Inject** the dependency where it is needed with `inject()`.

## Best practices

- Prefer `inject()` field initializers over constructor parameters; mark them `private readonly`.
- Make application-wide services root singletons (`@Service()` / `providedIn: 'root'`) so they are tree-shakable.
- Depend on the smallest surface you need; this keeps classes testable.

## Common mistakes

- Calling `inject()` outside an injection context (throws NG0203). See `injection-context.md`.
- Manually `new`-ing a service instead of injecting it — you lose the singleton, the injector hierarchy, and test substitution.
- Listing every service in a `bootstrapApplication` `providers` array when `@Service()` / `providedIn: 'root'` would let unused ones be tree-shaken.
