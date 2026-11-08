# Testing HTTP requests

The `@angular/common/http/testing` library mocks the HTTP backend so tests never make
real network calls. You assert which requests were made and supply the responses.
Source: https://angular.dev/guide/http/testing

## Setup

Configure `TestBed` with `provideHttpClient()` and `provideHttpClientTesting()`, then
inject `HttpTestingController`:

```typescript
import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting, HttpTestingController} from '@angular/common/http/testing';

TestBed.configureTestingModule({
  providers: [
    provideHttpClient(),
    provideHttpClientTesting(),
  ],
});

const httpTesting = TestBed.inject(HttpTestingController);
```

> **Ordering matters:** provide `provideHttpClient(...)` **before**
> `provideHttpClientTesting()`. The testing provider overwrites part of the real backend,
> so it must come last (this is especially important when configuring interceptors).

## Expecting requests and flushing responses

### expectOne()

Asserts exactly one matching request is outstanding (fails on zero or multiple matches):

```typescript
const req = httpTesting.expectOne('/api/config', 'Request to load configuration');
expect(req.request.method).toBe('GET');
```

Match on method and URL together:

```typescript
const req = httpTesting.expectOne(
  {method: 'GET', url: '/api/config'},
  'Request to load the configuration',
);
```

### flush()

Delivers the mock response body, completing the request:

```typescript
req.flush(DEFAULT_CONFIG);
```

### verify()

Asserts there are no outstanding (unanswered) requests. Put it in `afterEach()`:

```typescript
afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
});
```

## A full test example

```typescript
it('loads the config', () => {
  const service = TestBed.inject(ConfigService);

  let actual: Config | undefined;
  service.getConfig().subscribe((config) => (actual = config));

  const req = httpTesting.expectOne('/api/config');
  expect(req.request.method).toBe('GET');

  req.flush(DEFAULT_CONFIG);

  expect(actual).toEqual(DEFAULT_CONFIG);
  httpTesting.verify();
});
```

## Handling multiple requests

Use `match()` to retrieve all requests matching a criterion (returns an array):

```typescript
const allGetRequests = httpTesting.match({method: 'GET'});
for (const req of allGetRequests) {
  // assert / flush each request
}
```

## Testing errors

Backend error responses (non-2xx status codes):

```typescript
const req = httpTesting.expectOne('/api/config');
req.flush('Failed!', {status: 500, statusText: 'Internal Server Error'});
```

Network errors (a `ProgressEvent`):

```typescript
const req = httpTesting.expectOne('/api/config');
req.error(new ProgressEvent('network error!'));
```

## Advanced matching

Custom predicate functions for sophisticated matching:

```typescript
const requestsWithBody = httpTesting.expectOne((req) => req.body !== null);

httpTesting.expectNone((req) => req.method !== 'GET');
```

## Testing interceptors

For functional interceptors, register them on the real client and assert on the
intercepted request:

```typescript
TestBed.configureTestingModule({
  providers: [
    AuthService,
    provideHttpClient(withInterceptors([authInterceptor])),
    provideHttpClientTesting(),
  ],
});

// ... trigger a request, then:
const req = httpTesting.expectOne('/api/config');
expect(req.request.headers.get('X-Authentication-Token')).toEqual(service.getAuthToken());
```

For class-based interceptors, use `withInterceptorsFromDi()` and register the interceptor
via the `HTTP_INTERCEPTORS` multi-provider.

## Testing httpResource

`httpResource` uses the same `HttpTestingController`. Because it is signal-driven, tick
the framework and await stability before reading signals — see `http-resource.md`.

## Best practices

- Call `httpTesting.verify()` in `afterEach()` so no test leaks unhandled requests.
- Assert request details (`req.request.method`, headers, body, params) before flushing.
- Provide descriptive messages to `expectOne` for clearer failure output.
- Keep `provideHttpClient(...)` before `provideHttpClientTesting()`.

## Common mistakes

- **Wrong provider order** — `provideHttpClientTesting()` must come after
  `provideHttpClient()`, or interceptors/backends won't behave correctly.
- **Forgetting `verify()`** — outstanding or duplicate requests go undetected.
- **Not subscribing before expecting** — the observable is cold; the request only exists
  after `.subscribe()` (or `async` pipe / change detection).
- **Using `expectOne` when several requests match** — it fails; use `match()` instead.
- **Flushing before asserting** — inspect the request before calling `flush()`/`error()`.
