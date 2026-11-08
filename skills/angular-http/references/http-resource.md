# httpResource — signal-based reactive fetching

`httpResource()` wraps `HttpClient` to expose HTTP request status and response data as
**signals**, integrating naturally with `computed`, `effect`, `linkedSignal`, and other
reactive APIs. Source: https://angular.dev/guide/http/http-resource

Requires `provideHttpClient()` to be configured — see `setup.md`.

> Status: stable in v22. In v21, `httpResource()` is experimental, so its API can change.

## Eager and reactive

Unlike `HttpClient` (which only issues a request when the returned observable is
subscribed), `httpResource()`:

- **Initiates the request eagerly** when created.
- **Re-fetches automatically** when any signal read inside its request function changes.
- **Cancels an in-flight request** before issuing a new one when dependencies change.

## Basic usage

The request function returns a URL (or `undefined` to skip the request):

```typescript
userId = input.required<string>();
user = httpResource(() => `/api/user/${userId()}`);
```

## Advanced request configuration

Return a request-options object for full control:

```typescript
user = httpResource(() => ({
  url: `/api/user/${userId()}`,
  method: 'GET',
  headers: {'X-Special': 'true'},
  params: {fast: 'yes'},
  reportProgress: true,
  transferCache: true,
  keepalive: true,
  mode: 'cors',
  redirect: 'error',
  priority: 'high',
  cache: 'force-cache',
  credentials: 'include',
}));
```

## Reading the resource in a template

The resource exposes `value()`, `hasValue()`, `error()`, and `isLoading()` signals:

```typescript
@if (user.hasValue()) {
  <user-details [user]="user.value()" />
} @else if (user.error()) {
  <div>Could not load user information</div>
} @else if (user.isLoading()) {
  <div>Loading user info...</div>
}
```

> Always guard `value()` reads with `hasValue()`. Reading `value()` while the resource is
> in an error state throws.

## Response types

By default the response is parsed as JSON. Use the typed variants for other formats:

```typescript
httpResource.text(() => ({ /* ... */ }));        // returns string
httpResource.blob(() => ({ /* ... */ }));        // returns Blob
httpResource.arrayBuffer(() => ({ /* ... */ })); // returns ArrayBuffer
```

## Response parsing & runtime validation

Use the `parse` option to transform and validate the response (e.g. with Zod). The return
type of `parse` becomes the type of `value()`:

```typescript
import {z} from 'zod';

const starWarsPersonSchema = z.object({
  name: z.string(),
  height: z.number({coerce: true}),
  edited: z.string().datetime(),
  films: z.array(z.string()),
});

swPersonResource = httpResource(
  () => `https://swapi.info/api/people/${this.id()}`,
  {parse: starWarsPersonSchema.parse},
);
```

This is the recommended way to get true runtime type safety, since `HttpClient` generics
are only compile-time assertions.

## When to use httpResource vs HttpClient

- **Use `httpResource()` for queries / read-only data fetching** in components that should
  reactively update when inputs or signals change (GET-style reads).
- **Avoid `httpResource()` for mutations** (`POST`, `PUT`, `PATCH`, `DELETE`). Use the
  underlying `HttpClient` APIs directly for those.
- Use `HttpClient` (observables) for service-layer logic, streaming/progress, and anywhere
  you need full RxJS composition.

## Testing

Test with the same `HttpTestingController` APIs as `HttpClient`. Because the resource is
signal-driven, tick the framework and wait for stability:

```typescript
TestBed.configureTestingModule({
  providers: [provideHttpClient(), provideHttpClientTesting()],
});

const id = signal(0);
const mockBackend = TestBed.inject(HttpTestingController);
const response = httpResource(() => `/data/${id()}`, {injector: TestBed.inject(Injector)});

TestBed.tick();
const firstRequest = mockBackend.expectOne('/data/0');
firstRequest.flush(0);

await TestBed.inject(ApplicationRef).whenStable();
expect(response.value()).toEqual(0);
```

## Best practices

- Read signals inside the request function so the resource tracks them and re-fetches on
  change.
- Return `undefined` from the request function to conditionally skip a request (e.g. while
  a required input is empty).
- Pair `httpResource` with `parse` (Zod or similar) for runtime-validated, well-typed data.
- Drive templates off `isLoading()` / `error()` / `hasValue()` for clean loading and error
  states.

## Common mistakes

- **Using `httpResource` for mutations** — it is for reactive reads; use `HttpClient` for
  writes.
- **Reading `value()` without `hasValue()`** — throws in the error state.
- **Reading dependent signals outside the request function** — changes won't trigger a
  re-fetch.
- **Forgetting `provideHttpClient()`** — `httpResource` needs `HttpClient` configured.
- **Not awaiting stability in tests** — read resource signals only after `TestBed.tick()`
  and `whenStable()`.
