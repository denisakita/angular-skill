# Injection Context

Source: https://angular.dev/guide/di/dependency-injection-context

## What it is

The DI system relies on a runtime context where the current injector is available. Code must execute within this context for `inject()` to work.

## Where an injection context exists

- During class construction (the `constructor`) of a DI-instantiated class such as `@Injectable`, `@Service`, or `@Component`.
- In **field initializers** of such classes.
- In the **`useFactory`** function of a `Provider` or `@Injectable`/`@Service`.
- In the **`factory`** function of an `InjectionToken`.
- Within stack frames that run inside an injection context.

## Using `inject()`

Inside a context, `inject()` retrieves dependencies. Route guards are a common example:

```typescript
const canActivateTeam: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  return inject(PermissionsService).canActivate(inject(UserToken), route.params.id);
};
```

## `runInInjectionContext()`

To run code in a context when you are not already in one, use `runInInjectionContext` with an `EnvironmentInjector`:

```typescript
@Injectable({providedIn: 'root'})
export class HeroService {
  private environmentInjector = inject(EnvironmentInjector);

  someMethod() {
    runInInjectionContext(this.environmentInjector, () => {
      inject(SomeService); // Do what you need with the injected service
    });
  }
}
```

Capture the `EnvironmentInjector` itself in a context (e.g. a field initializer), then reuse it later inside async callbacks, event handlers, or other code that runs outside a context.

## Asserting context

`assertInInjectionContext()` verifies you are in a valid context and produces a clear error otherwise. Use it in custom `inject*`-style helpers:

```typescript
import {ElementRef, assertInInjectionContext, inject} from '@angular/core';

export function injectNativeElement<T extends Element>(): T {
  assertInInjectionContext(injectNativeElement);
  return inject(ElementRef).nativeElement;
}
```

## Error NG0203

Calling `inject()` or `assertInInjectionContext()` **outside** an injection context throws Angular error **NG0203**. This guards against improper DI usage at runtime.

## Best practices

- Do all injection in field initializers or the constructor; do not defer `inject()` into lifecycle hooks, promise callbacks, or event handlers.
- If you must inject later, capture an `EnvironmentInjector` in a context and call `runInInjectionContext`.
- Guard reusable injecting helper functions with `assertInInjectionContext`.

## Common mistakes

- Calling `inject()` inside `setTimeout`, a promise `.then`, an RxJS subscription, or an event handler — outside any context → NG0203.
- Calling `inject()` in a plain class not created by Angular (no injection context exists).
- Capturing an injector but forgetting to wrap the later call in `runInInjectionContext`.
