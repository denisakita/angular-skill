---
name: angular-http
description: Use when working with HTTP in Angular v21/v22 — setting up HttpClient with provideHttpClient(), making requests with observables, writing functional interceptors, fetching read data reactively with httpResource() signals, and testing HTTP code.
license: MIT
metadata:
  source: https://angular.dev/guide/http
  angularVersion: '21-22'
  version: '1.0'
---

# Angular HTTP (HttpClient & httpResource)

Angular ships `HttpClient` in `@angular/common/http` for communicating with backend
services over HTTP. It provides typed responses, error handling, request/response
interception, and first-class testing utilities. Angular v21/v22 also provides
`httpResource()`, a signal-based wrapper for reactive, read-only data fetching.

This skill covers the modern, recommended approach: `provideHttpClient()` with the
`withFetch()` and `withInterceptors()` features, functional interceptors, observable-based
requests via `HttpClient`, signal-based fetching via `httpResource()`, and HTTP testing.

## Reference files

Read the relevant reference before writing code:

- `references/setup.md` — Configuring `HttpClient` with `provideHttpClient()` and its features (`withFetch`, `withInterceptors`, XSRF, JSONP, etc.).
- `references/making-requests.md` — GET/POST/PUT/DELETE, response types, headers, params, full responses, progress events, error handling, and request options.
- `references/interceptors.md` — Functional interceptors, modifying requests, DI in interceptors, `HttpContext`, and class-based interceptors.
- `references/http-resource.md` — `httpResource()` signal-based reactive fetching, response types, parsing/validation, and when to use it.
- `references/testing.md` — `provideHttpClientTesting()`, `HttpTestingController`, mocking responses, errors, and interceptor testing.

## Core rules

1. **Always register HTTP via `provideHttpClient()`** in `app.config.ts` (standalone)
   or module providers. Never rely on the legacy `HttpClientModule`.
2. **Use the fetch backend** with `provideHttpClient(withFetch())`. It is the modern
   default-recommended backend with broad environment support. Only switch to
   `withXhr()` if you need upload progress events (XHR server support is deprecated
   and removed in Angular 23).
3. **Prefer functional interceptors** (`HttpInterceptorFn`) registered with
   `withInterceptors([...])` over class-based interceptors. They have predictable
   ordering and can use `inject()` directly. Reserve `withInterceptorsFromDi()` for
   legacy class-based interceptors only.
4. **Use `httpResource()` for read-only GETs in components** that should reactively
   re-fetch when inputs/signals change. Use `HttpClient` directly for mutations
   (`POST`/`PUT`/`PATCH`/`DELETE`) and for service-layer logic returning observables.
5. **Requests are cold observables** — nothing happens until `.subscribe()` (or the
   `async` pipe). `httpResource()` is the exception: it fetches eagerly and reactively.
6. **`HttpHeaders` and `HttpParams` are immutable** — mutation methods return new
   instances. Clone requests in interceptors with `req.clone({...})`.
7. **Generic types are assertions only** — `http.get<Config>()` does not validate the
   server response at runtime. Use `parse` (e.g. Zod) with `httpResource` when you
   need runtime validation.
