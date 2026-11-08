# Setting up HttpClient

`HttpClient` requires dependency-injection setup via `provideHttpClient()` before it
can be injected. Source: https://angular.dev/guide/http/setup

## Standalone applications (recommended)

Add `provideHttpClient()` to the application config providers. In v22 it uses the `fetch`
backend by default and `withFetch()` is deprecated. In v21, add `withFetch()` to opt in:

```typescript
// app.config.ts
import {ApplicationConfig} from '@angular/core';
import {provideHttpClient} from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient()],
};
```

When bootstrapping directly:

```typescript
import {bootstrapApplication} from '@angular/platform-browser';
import {provideHttpClient, withInterceptors} from '@angular/common/http';

bootstrapApplication(App, {
  providers: [
    provideHttpClient(
      withInterceptors([loggingInterceptor, authInterceptor]),
    ),
  ],
});
```

## NgModule-based applications

```typescript
import {provideHttpClient} from '@angular/common/http';

@NgModule({
  providers: [provideHttpClient()],
  // ... other application configuration
})
export class AppModule {}
```

## Injecting HttpClient

Once configured, inject `HttpClient` into services or components using `inject()`:

```typescript
import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class ConfigService {
  private http = inject(HttpClient);
  // This service can now make HTTP requests via `this.http`.
}
```

## Configuration features

Pass these feature functions to `provideHttpClient(...)`:

- **`withFetch()`** — Deprecated in v22, where `fetch` is already the default backend. In
  v21, add it to use `fetch`. The `fetch` backend has broad environment support (including
  server-side rendering) but does not report upload progress events.
- **`withInterceptors([fn1, fn2, ...])`** — Register functional interceptors. They run
  in the order listed. See `interceptors.md`.
- **`withInterceptorsFromDi()`** — Enable legacy class-based interceptors registered via
  the `HTTP_INTERCEPTORS` token. Ordering is hard to predict; avoid for new code.
- **`withXhr()`** — v22+. Use `XMLHttpRequest` instead of `fetch`. Only needed for upload
  progress events. In v21, XHR is already the default, so leave out `withFetch()` instead.
  **Server-side XHR support is deprecated and intended to be removed in Angular 23.**
- **`withRequestsMadeViaParent()`** — Route requests through the parent injector's
  `HttpClient` after local interceptors process them (hierarchical interceptor setups).
- **`withJsonpSupport()`** — Enable the `.jsonp()` method for JSONP cross-domain
  requests. Prefer CORS instead where possible.
- **`withXsrfConfiguration({...})`** — Customize the built-in XSRF/CSRF protection
  (cookie name, header name).
- **`withNoXsrfProtection()`** — Disable built-in XSRF protection.

## Best practices

- In v22, call plain `provideHttpClient()`, which already uses `fetch`. In v21, add
  `withFetch()`, which is recommended for SSR.
- Register interceptors at setup time with `withInterceptors([...])`, keeping all HTTP
  configuration in one place (`app.config.ts`).
- Configure HTTP providers once at the application root, not per feature/route, unless you
  deliberately need a hierarchical `HttpClient` (then use `withRequestsMadeViaParent()`).

## Common mistakes

- **Using `HttpClientModule`** — the legacy module-based API is superseded by
  `provideHttpClient()`. Do not import it.
- **Forgetting `provideHttpClient()`** — injecting `HttpClient` without it throws a
  no-provider error at runtime.
- **Putting `provideHttpClientTesting()` before `provideHttpClient()` in tests** —
  ordering matters; see `testing.md`.
- **Relying on `withXhr()` for new code** — it exists mainly for upload progress and is
  being deprecated on the server.
