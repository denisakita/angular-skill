# resource() / rxResource() / httpResource()

Source: https://angular.dev/guide/signals/resource and
https://angular.dev/ecosystem/rxjs-interop

> Status: `resource()`, `rxResource()` and `httpResource()` are stable in v22. In v21 they are
> experimental, so their APIs can change.

All signal APIs — `signal`, `computed`, `input`, etc. — are **synchronous**.
Applications, however, often deal with data available asynchronously. A
**Resource** incorporates async data into the signal reactivity system while
keeping synchronous access to the loaded value, loading state, and errors.

## Creating a resource with `resource()`

```typescript
import {resource, Signal, computed} from '@angular/core';

const userId: Signal<string> = getUserId();

const userResource = resource({
  // Define a reactive computation.
  // The params value recomputes whenever any read signals change.
  params: () => ({id: userId()}),

  // Define an async loader that retrieves data.
  // The resource calls this function every time the `params` value changes.
  loader: ({params}) => fetchUser(params),
});

// Create a computed signal based on the result of the resource's loader function.
const firstName = computed(() => {
  if (userResource.hasValue()) {
    // `hasValue` serves 2 purposes:
    // - It acts as type guard to strip `undefined` from the type
    // - It protects against reading a throwing `value` when the resource is in error state
    return userResource.value().firstName;
  }

  // fallback in case the resource value is `undefined` or if the resource is in error state
  return undefined;
});
```

- **`params`** — a reactive computation producing parameter values. Whenever
  signals read in it change, the resource produces a new parameter value (similar
  to `computed`).
- **`loader`** — an async function receiving `ResourceLoaderParams` and returning a
  value. The resource invokes it whenever `params` changes.

## Loader parameters

The loader receives an object with:

- **`params`** — the current value of the resource's `params` computation.
- **`previous`** — an object with a `status` property holding the previous
  `ResourceStatus`.
- **`abortSignal`** — an `AbortSignal` for request cancellation.

## Status values

`status` is a signal of one of these states:

| Status        | `value()`           | Description                                   |
|---------------|---------------------|-----------------------------------------------|
| `'idle'`      | `undefined`         | No valid request; loader hasn't run           |
| `'error'`     | `undefined`         | Loader encountered an error                   |
| `'loading'`   | `undefined`         | Loader running due to a `params` change        |
| `'reloading'` | previous value      | Loader running due to a `reload()` call        |
| `'resolved'`  | resolved value      | Loader completed                              |
| `'local'`     | locally set value   | Value set via `.set()` / `.update()`          |

### Reading status

- **`value`** — the most recent loader result, or `undefined`.
- **`hasValue`** — boolean indicating a value exists (also a type guard).
- **`error`** — the most recent error, or `undefined`.
- **`isLoading`** — boolean for whether the loader is currently running.
- **`status`** — the specific `ResourceStatus` string.

## Reloading

Trigger the loader programmatically:

```typescript
const userResource = resource({
  params: () => ({id: userId()}),
  loader: ({params}) => fetchUser(params),
});

userResource.reload();
```

## Aborting requests

Resources abort outstanding operations when `params` change. Forward
`abortSignal` to `fetch` so in-flight requests are cancelled:

```typescript
const userResource = resource({
  params: () => ({id: userId()}),
  loader: ({params, abortSignal}): Promise<User> => {
    // fetch cancels any outstanding HTTP requests when the given `AbortSignal`
    // indicates that the request has been aborted.
    return fetch(`users/${params.id}`, {signal: abortSignal});
  },
});
```

## Streaming resources

For continuously updating sources (WebSockets, SSE, Firestore), provide a
`stream` instead of a `loader`. Use `loader` for one-time async operations such as
fetching from an HTTP endpoint.

```typescript
const userUpdates = signal({value: 'Alice'});

const userResource = resource({
  stream: () => userUpdates,
});

// Later, when new data arrives:
userUpdates.set({value: 'Bob'});
```

## Server-side rendering cache

Provide an `id` to reuse server-rendered values via `TransferState`:

```typescript
const userResource = resource({
  params: () => ({id: userId()}),
  loader: ({params}) => fetchUser(params),
  id: 'user-unique-id',
});
```

## Chaining resources

Express dependencies between resources with the `chain` function provided to
`params`:

```typescript
import {resource} from '@angular/core';

const userResource = resource({
  params: () => ({id: getUserId()}),
  loader: ({params}) => fetchUser(params),
});

const companyResource = resource({
  params: ({chain}) => chain(userResource)?.companyId,
  loader: ({params: companyId}) => fetchCompany(companyId),
});
```

`chain` propagates status automatically: idle → idle, loading propagates, errors
propagate, and resolved/local states return the value.

## Snapshots

Access the current state via `snapshot` (status plus value or error), and compose
resources with `resourceFromSnapshots` (experimental, so its API can change):

```typescript
import {linkedSignal, resourceFromSnapshots, Resource, ResourceSnapshot} from '@angular/core';

function withPreviousValue<T>(input: Resource<T>): Resource<T> {
  const derived = linkedSignal<ResourceSnapshot<T>, ResourceSnapshot<T>>({
    source: input.snapshot,
    computation: (snap, previous) => {
      if (snap.status === 'loading' && previous && previous.value.status !== 'error') {
        // When the input resource enters loading state, we keep the value
        // from its previous state, if any.
        return {status: 'loading' as const, value: previous.value.value};
      }

      // Otherwise we simply forward the state of the input resource.
      return snap;
    },
  });

  return resourceFromSnapshots(derived);
}

@Component({/*... */})
export class AwesomeProfile {
  userId = input.required<number>();
  user = withPreviousValue(httpResource(() => `/user/${this.userId()}`));
  // When userId changes, user.value() keeps the old user data until the new one loads
}
```

## httpResource()

`httpResource` wraps `HttpClient`, exposing request status and response as
signals. It makes requests through the Angular HTTP stack, including interceptors.

```typescript
user = httpResource(() => `/user/${this.userId()}`);
```

## rxResource() — RxJS-based resources

Source: https://angular.dev/ecosystem/rxjs-interop

`rxResource()` integrates RxJS Observables into the resource pattern. It accepts a
`stream` function returning an Observable instead of a Promise-based `loader`:

```typescript
import {Component, inject, input} from '@angular/core';
import {rxResource} from '@angular/core/rxjs-interop';

@Component({/* ... */})
export class UserProfile {
  private userData = inject(MyUserDataClient);
  protected userId = input<string>();

  private userResource = rxResource({
    params: () => ({userId: this.userId()}),
    stream: ({params}) => this.userData.load(params.userId),
  });
}
```

The `stream` factory receives the resource parameters and re-runs on each `params`
update. Aside from this, `rxResource()` mirrors `resource()` for params, value,
loading state, and error inspection.

## Best practices

- Use a resource (not a manual `effect` + fetch) for any async data tied to
  signals — you get cancellation, status, errors, and reload for free.
- Forward `abortSignal` to `fetch`/HTTP so stale requests are cancelled when
  `params` change.
- Use `hasValue()` as a type guard before reading `value()`, and provide a
  fallback for the `undefined`/error case.
- Use `loader` for one-shot fetches; use `stream`/`rxResource` for continuously
  updating sources.
- Prefer `httpResource` when calling your own backend through `HttpClient` so
  interceptors apply.
- Provide an `id` for resources whose data should survive SSR hydration.

## Common mistakes

- Reading `value()` without checking `hasValue()` — it can be `undefined` or throw
  in the error state.
- Doing async work in `params` — `params` is a synchronous reactive computation;
  put async work in `loader`/`stream`.
- Ignoring `abortSignal`, leaving stale requests racing newer ones.
- Using `loader` for a never-completing stream — use `stream`/`rxResource`
  instead.
