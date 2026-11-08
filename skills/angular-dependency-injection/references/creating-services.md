# Creating and Using Injectable Services

Source: https://angular.dev/guide/di/creating-injectable-service (→ creating-and-using-services)

## Generating a service

```bash
ng generate service CUSTOM_NAME
```

Or write one manually by applying the `@Service()` decorator to a class:

```typescript
import {Service} from '@angular/core';

@Service()
export class BasicDataStore {
  private data: string[] = [];

  addData(item: string): void {
    this.data.push(item);
  }

  getData(): string[] {
    return [...this.data];
  }
}
```

## `@Service` availability

The `@Service` decorator is a more ergonomic alternative to `@Injectable({providedIn: 'root'})`. When applied, Angular:

- Creates a **singleton** instance for the entire application.
- Makes the service accessible everywhere without extra setup.
- Enables **tree-shaking**, excluding unused services from bundles.

## Factory functions

Control singleton creation with a `factory` that runs in an injection context (so it can call `inject()`):

```typescript
@Service({
  factory: () => (inject(ANALYTICS_ENABLED) ? new GoogleAnalytics() : new Analytics()),
})
export class Analytics {
  track(event: string, payload?: Record<string, unknown>) {
    // No-op by default.
  }
}
```

## Opting out of auto-provisioning

Set `autoProvided: false` to control provider scope manually (e.g. provide it only on a component or route):

```typescript
@Service({autoProvided: false})
export class AnalyticsLogger {
  trackEvent(name: string) {
    console.log('event:', name);
  }
}
```

## Injecting services

Use `inject()` to access services in components or other services:

```typescript
// In a component
export class Example {
  dataStore = inject(BasicDataStore);
}

// In another service
@Service()
export class BasicDataStore {
  private advancedDataStore = inject(AdvancedDataStore);
}
```

## When to use each decorator

- **`@Service`** — new singleton classes that use `inject()` for their own dependencies. Preferred default.
- **`@Injectable`** — when you need constructor-based injection, advanced provider options (`useClass`, `useValue`, `useExisting`, `useFactory`), or a non-root scope.

A service with no `providedIn` (plain `@Injectable()`) is only available where you list it in a `providers` array:

```typescript
import {Injectable, Component, inject} from '@angular/core';

@Injectable()
export class LocalDataStore {
  private data: string[] = [];
  addData(item: string) {
    this.data.push(item);
  }
}

@Component({
  selector: 'app-example',
  providers: [LocalDataStore],
  template: `...`,
})
export class Example {
  dataStore = inject(LocalDataStore);
}
```

## Best practices

- Default to `@Service()` for app-wide singletons; it is tree-shakable and needs no manual registration.
- Use a `factory` to choose an implementation at creation time instead of branching in business code.
- Use `autoProvided: false` when a service must be scoped to a component/route rather than the root.
- Inject service dependencies with `inject()` in field initializers.

## Common mistakes

- Adding a `@Service()` / root service to a `providers` array unnecessarily — that creates an extra, non-tree-shakable instance scoped to that component.
- Expecting a plain `@Injectable()` (no `providedIn`) to be injectable anywhere; it is only available where provided.
- Putting side effects in field initializers that run before the rest of construction is ready — prefer the `factory` or a lifecycle hook.
