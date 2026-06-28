# Making HTTP requests

`HttpClient` exposes methods for every HTTP verb. They return **cold** RxJS
`Observable`s: no request is sent until you `.subscribe()` (or use the `async` pipe),
and each subscription triggers a separate backend request. Unsubscribing aborts an
in-flight request. Source: https://angular.dev/guide/http/making-requests

> The generic type of request methods (e.g. `get<Config>`) is a **type assertion** about
> the data the server returns. `HttpClient` does not verify the actual response matches.

## GET requests

```typescript
http.get<Config>('/api/config').subscribe((config) => {
  // process the configuration.
});
```

Non-JSON response types (`'json'` default, `'text'`, `'arraybuffer'`, `'blob'`):

```typescript
http.get('/images/dog.jpg', {responseType: 'arraybuffer'}).subscribe((buffer) => {
  console.log('The image is ' + buffer.byteLength + ' bytes large');
});
```

> `responseType` must be a literal type, not a `string`, because it determines the
> return type of the call.

## POST / PUT / DELETE (mutations)

POST/PUT take a body argument before the options object:

```typescript
http.post<Config>('/api/config', newConfig).subscribe((config) => {
  console.log('Updated config:', config);
});
```

Body serialization by type: strings → plain text; numbers/booleans/arrays/objects →
JSON; `ArrayBuffer` → raw; `Blob` → raw with content type; `FormData` → multipart;
`HttpParams`/`URLSearchParams` → form-encoded.

> **Remember to `.subscribe()` to mutation observables** — without subscription the
> request never fires.

## URL parameters

Object literal (simplest):

```typescript
http.get('/api/config', {params: {filter: 'all'}}).subscribe((config) => {
  // ...
});
```

`HttpParams` for finer control (immutable — mutation methods return a new instance):

```typescript
const baseParams = new HttpParams().set('filter', 'all');

http
  .get('/api/config', {params: baseParams.set('details', 'enabled')})
  .subscribe((config) => {
    // ...
  });
```

Custom parameter encoding via `HttpParameterCodec`:

```typescript
import {HttpClient, HttpParams, HttpParameterCodec} from '@angular/common/http';
import {inject} from '@angular/core';

export class CustomHttpParamEncoder implements HttpParameterCodec {
  encodeKey(key: string): string { return encodeURIComponent(key); }
  encodeValue(value: string): string { return encodeURIComponent(value); }
  decodeKey(key: string): string { return decodeURIComponent(key); }
  decodeValue(value: string): string { return decodeURIComponent(value); }
}

export class ApiService {
  private http = inject(HttpClient);

  search() {
    const params = new HttpParams({encoder: new CustomHttpParamEncoder()})
      .set('email', 'dev+alerts@example.com')
      .set('q', 'a & b? c/d = e');

    return this.http.get('/api/items', {params});
  }
}
```

## Request headers

Object literal:

```typescript
http.get('/api/config', {headers: {'X-Debug-Level': 'verbose'}}).subscribe((config) => {
  // ...
});
```

`HttpHeaders` (also immutable):

```typescript
const baseHeaders = new HttpHeaders().set('X-Debug-Level', 'minimal');

http
  .get<Config>('/api/config', {headers: baseHeaders.set('X-Debug-Level', 'verbose')})
  .subscribe((config) => {
    // ...
  });
```

## Accessing the full response

```typescript
http.get<Config>('/api/config', {observe: 'response'}).subscribe((res) => {
  console.log('Response status:', res.status);
  console.log('Body:', res.body);
});
```

## Progress events

Enable with `observe: 'events'` and `reportProgress: true`:

```typescript
http
  .post('/api/upload', myData, {reportProgress: true, observe: 'events'})
  .subscribe((event) => {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        console.log('Uploaded ' + event.loaded + ' out of ' + event.total + ' bytes');
        break;
      case HttpEventType.Response:
        console.log('Finished uploading!');
        break;
    }
  });
```

> The fetch backend does **not** report upload progress events. For upload progress,
> configure `provideHttpClient(withXhr())`.

## Error handling

Failures (network/connection errors with status 0, timeouts, and backend error status
codes) surface through the observable's error channel as an `HttpErrorResponse`:

```typescript
http.get<Config>('/api/config').subscribe({
  next: (config) => { /* success */ },
  error: (err: HttpErrorResponse) => {
    console.error('Request failed:', err.status, err.message);
  },
});
```

Timeouts (applies only to the backend request, not the whole handling chain):

```typescript
http.get('/api/config', {timeout: 3000}).subscribe({
  next: (config) => console.log('Config fetched successfully:', config),
  error: (err) => { /* request timed out */ },
});
```

## Other fetch request options

These options map onto the underlying fetch request:

- `cache`: `'force-cache' | 'no-cache' | 'only-if-cached' | ...` — HTTP cache control.
- `priority`: `'high' | 'low' | 'auto'` (default `'auto'`).
- `mode`: `'same-origin' | 'cors' | 'no-cors'` (default `'cors'`).
- `redirect`: `'follow' | 'error' | 'manual'` (default `'follow'`).
- `credentials`: `'omit' | 'same-origin' | 'include'` (default `'same-origin'`).
  `withCredentials: true` takes precedence and forces `credentials: 'include'`.
- `keepalive: true` — allow the request to outlive the page.
- `referrer`, `referrerPolicy`, `integrity` — standard fetch metadata/security options.

```typescript
http.post('/api/analytics', analyticsData, {keepalive: true}).subscribe();

http.get('/api/user-profile', {priority: 'high'}).subscribe((profile) => { /* ... */ });

http
  .get('https://api.example.com/protected-data', {credentials: 'include'})
  .subscribe((data) => { /* ... */ });
```

## Best practices

- **Encapsulate HTTP in reusable services** that return observables; keep components thin:

  ```typescript
  @Injectable({providedIn: 'root'})
  export class UserService {
    private http = inject(HttpClient);

    getUser(id: string): Observable<User> {
      return this.http.get<User>(`/api/user/${id}`);
    }
  }
  ```

- **Prefer the `async` pipe** for subscription/cleanup in templates:

  ```typescript
  import {AsyncPipe} from '@angular/common';

  @Component({
    imports: [AsyncPipe],
    template: `
      @if (user$ | async; as user) {
        <p>Name: {{ user.name }}</p>
      }
    `,
  })
  export class UserProfile {
    private userService = inject(UserService);
    user$ = this.userService.getUser('123');
  }
  ```

- Always type request methods (`get<T>`, `post<T>`) for better editor support.
- For reactive read GETs in components, prefer `httpResource()` (see `http-resource.md`).

## Common mistakes

- **Forgetting to subscribe** — the request never fires (cold observable). Especially
  easy to miss with mutations whose result you ignore.
- **Mutating `HttpHeaders`/`HttpParams` in place** — `.set()`/`.append()` return new
  instances; reassign or chain them.
- **Passing `responseType` as a non-literal** — breaks the inferred return type.
- **Expecting runtime type checks** — generics are assertions only; validate manually or
  use `parse` with `httpResource`.
- **Expecting upload progress with the fetch backend** — use `withXhr()` instead.
- **Manual `.subscribe()` in components without cleanup** — prefer the `async` pipe or
  `takeUntilDestroyed()` to avoid leaks.
