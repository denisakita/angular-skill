# Data Loading Patterns

Grounded in:
- https://angular.dev/guide/signals/resource
- https://angular.dev/guide/signals
- https://angular.dev/guide/di (HttpClient via inject)

The `resource()` family loads async data into signals while keeping reads synchronous. It
tracks reactive `params`, re-runs the loader on change, exposes loading/error status as
signals, and supports cancellation via `AbortSignal`.

## `resource()` — promise-based async

```typescript
import {resource, signal} from '@angular/core';

const userId = signal('1');

const userResource = resource({
  // reactive: recomputes when any read signal changes -> triggers loader
  params: () => ({id: userId()}),
  // called on every new params value
  loader: ({params, abortSignal}): Promise<User> =>
    fetch(`/users/${params.id}`, {signal: abortSignal}).then(r => r.json()),
});
```

### Status / value surface (all signals)

| Member | Meaning |
| --- | --- |
| `value()` | Latest value, or `undefined` if none received yet. |
| `hasValue()` | Whether a value is present (use to narrow before `value()`). |
| `error()` | Last error, or `undefined`. |
| `isLoading()` | Loader currently running. |
| `status()` | `'idle' \| 'loading' \| 'reloading' \| 'resolved' \| 'error' \| 'local'`. |

Type-safe access — guard with `hasValue()`:

```typescript
const firstName = computed(() =>
  userResource.hasValue() ? userResource.value().firstName : undefined,
);
```

`reload()` re-runs the loader on demand; `loader` receives `{params, previous, abortSignal}`.

## Loading / error / loaded UI

Render branches off the status/value signals with native control flow:

```html
@if (userResource.isLoading()) {
  <spinner />
} @else if (userResource.error(); as err) {
  <error-banner [message]="err.message" />
  <button (click)="userResource.reload()">Retry</button>
} @else if (userResource.hasValue()) {
  <user-detail [user]="userResource.value()" />
}
```

## `rxResource()` — RxJS/Observable loaders

Use when the data source is an Observable (e.g. an existing RxJS-based API service). Same
status/value surface as `resource()`; the loader returns an Observable instead of a Promise.

```typescript
import {rxResource} from '@angular/core/rxjs-interop';

@Injectable({providedIn: 'root'})
export class UsersApi {
  private http = inject(HttpClient);
  getUser(id: string) { return this.http.get<User>(`/users/${id}`); }
}

// in a component/store
private api = inject(UsersApi);
userId = signal('1');

userResource = rxResource({
  params: () => this.userId(),
  stream: ({params}) => this.api.getUser(params), // returns Observable<User>
});
```

## `httpResource()` — HTTP-native resource

A thin wrapper that issues an HTTP request and exposes the request status and typed response
as signals. It runs through the Angular HTTP stack, so interceptors apply. The request is a
reactive function, so it re-fetches when read signals change.

```typescript
import {httpResource} from '@angular/common/http';

userId = signal('1');

// reactive URL -> auto re-fetch when userId changes
user = httpResource<User>(() => `/users/${this.userId()}`);
```

```html
@if (user.isLoading()) { <spinner /> }
@else if (user.hasValue()) { {{ user.value().name }} }
```

## Choosing between them

**Recommended pattern synthesized from official guidance:**
- `httpResource()` — straightforward typed HTTP GETs driven by signals; least boilerplate.
- `rxResource()` — when you already have/need Observables (RxJS operators, existing services).
- `resource()` — generic promise loaders (fetch, SDKs, non-HTTP sources) and full control over
  `abortSignal` and custom logic.
- Use `stream` (in `resource`) for continuously updating sources (WebSockets/SSE/Firestore).

## HttpClient + signals (manual, when not using a resource)

When you must subscribe manually, push results into signals through a store method rather than
binding Observables in templates with `async` where a resource would be cleaner.

```typescript
@Injectable({providedIn: 'root'})
export class ReportStore {
  private http = inject(HttpClient);
  private readonly _data = signal<Report | null>(null);
  readonly data = this._data.asReadonly();

  load(id: string) {
    this.http.get<Report>(`/reports/${id}`).subscribe(r => this._data.set(r));
  }
}
```

## DO / DON'T

DO:
- Default to the `resource()` family for async reads; it gives signal-based loading/error state.
- Make `params` (or the `httpResource` URL fn) read signals so loads re-run reactively.
- Guard with `hasValue()` before calling `value()`.
- Use `abortSignal` to cancel superseded/in-flight requests.
- Expose `isLoading()` / `error()` / `reload()` to drive UI states and retries.

DON'T:
- Don't store async results in plain fields and manage loading flags by hand when a resource fits.
- Don't call `value()` without checking `hasValue()` (it can be `undefined`).
- Don't put long-lived `subscribe()` chains in components without cleanup; prefer resources.
- Don't ship API keys/secrets in client-side code.
