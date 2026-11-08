# Error Handling

Source: https://angular.dev/best-practices/error-handling.

## Core principle

> "A fundamental principle in Angular's error handling strategy is that errors
> should be surfaced to developers at the callsite whenever possible."

Handling errors where they occur gives you the context to recover correctly and
keep application state consistent. Use `try...catch` (synchronous) or operators
like `catchError` (RxJS) at the source, rather than relying solely on a global
handler.

```ts
import { inject } from '@angular/core';
import { catchError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export class UserService {
  private http = inject(HttpClient);

  loadUser(id: string) {
    return this.http.get<User>(`/api/users/${id}`).pipe(
      catchError((err) => {
        // handle/log at the callsite, return a safe fallback
        console.error('Failed to load user', err);
        return of(null);
      }),
    );
  }
}
```

```ts
// Synchronous async work: handle at the source
async save() {
  try {
    await this.store.persist();
  } catch (err) {
    this.showToast('Could not save. Please retry.');
  }
}
```

## What Angular catches (and what it doesn't)

Angular automatically catches errors only when it is running
**framework-controlled code** — component constructors, lifecycle methods, and
template expressions. It does **not** catch errors from APIs that *you* call
directly; you must handle those yourself.

For async work, Angular catches errors only when there is an explicit contract
for it to await/use the result and the error is not surfaced via a return value
or state:

- **Caught:** `AsyncPipe`, `PendingTasks.run()`.
- **Not caught:** `resource()` — errors are exposed on its `status` / `error`
  properties for you to read, not thrown.

```ts
import { resource } from '@angular/core';

userResource = resource({
  params: () => ({ id: this.id() }),
  loader: ({ params }) => fetchUser(params.id),
});

// In the template, read the error from state — it is NOT routed to ErrorHandler:
// @if (userResource.error()) { <app-error /> }
```

## Global `ErrorHandler`

Unhandled errors are routed to the application's root `ErrorHandler`. Provide a
custom one in `ApplicationConfig` for cross-cutting concerns like logging and
reporting — not as a substitute for local handling.

```ts
import { ErrorHandler, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly router = inject(Router);

  handleError(error: any) {
    const url = this.router.url;
    const errorMessage = error?.message ?? 'unknown';
    this.analyticsService.trackEvent({
      eventName: 'exception',
      description: `Screen: ${url} | ${errorMessage}`,
    });
    console.error(GlobalErrorHandler.name, { error });
  }
}
```

```ts
import { ApplicationConfig, ErrorHandler } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
};
```

## Global error listeners

### Browser (client-side)

Add `provideBrowserGlobalErrorListeners()` to `ApplicationConfig`. It forwards
browser `'error'` and `'unhandledrejection'` events to the `ErrorHandler`. The
Angular CLI includes this by default in new apps.

```ts
import { ApplicationConfig } from '@angular/core';
import { provideBrowserGlobalErrorListeners } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners()],
};
```

### Server-side / hybrid rendering

Angular automatically adds `'unhandledRejection'` and `'uncaughtException'`
listeners, which prevent the server from crashing and log errors to the console.
With Zone.js enabled, only `'unhandledRejection'` is added because Zone already
forwards application errors to the `ErrorHandler`.

## Testing

`TestBed` rethrows unexpected errors by default so exceptions are not silently
missed. To opt out for a specific test:

```ts
TestBed.configureTestingModule({ rethrowApplicationErrors: false });
```

## DO / DON'T

- DO handle errors at the callsite with `try...catch` or `catchError`.
- DO provide a global `ErrorHandler` for logging/reporting cross-cutting errors.
- DO read `resource()` errors from its `error()` state — they are not thrown.
- DON'T rely solely on the global `ErrorHandler` for recoverable, contextual
  errors.
- DON'T assume Angular catches errors from APIs you call directly outside
  framework-controlled code.
