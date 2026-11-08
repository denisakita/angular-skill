# HTTP interceptors

Interceptors are middleware that let you abstract common patterns — authentication,
retrying, caching, logging, loading spinners, timeouts — away from individual requests.
Source: https://angular.dev/guide/http/interceptors

Angular supports two styles. **Prefer functional interceptors** for their predictable
ordering and direct `inject()` access. Class-based interceptors exist for legacy code.

## Functional interceptors (recommended)

A functional interceptor is an `HttpInterceptorFn`: a function receiving the request and
a `next` handler, returning an `Observable<HttpEvent<unknown>>`.

```typescript
import {HttpInterceptorFn, HttpHandlerFn, HttpRequest, HttpEvent} from '@angular/common/http';
import {Observable} from 'rxjs';

export function loggingInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  console.log(req.url);
  return next(req);
}
```

Register them with `withInterceptors([...])`. They execute **in the order listed**:

```typescript
import {provideHttpClient, withInterceptors} from '@angular/common/http';

bootstrapApplication(App, {
  providers: [
    provideHttpClient(
      withInterceptors([loggingInterceptor, cachingInterceptor]),
    ),
  ],
});
```

## Inspecting response events

Pipe over the event stream from `next(req)`:

```typescript
import {tap} from 'rxjs';
import {HttpEventType} from '@angular/common/http';

export function loggingInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  return next(req).pipe(
    tap((event) => {
      if (event.type === HttpEventType.Response) {
        console.log(req.url, 'returned a response with status', event.status);
      }
    }),
  );
}
```

## Modifying requests

`HttpRequest`/`HttpResponse` instances are immutable. Apply changes by cloning:

```typescript
const reqWithHeader = req.clone({
  headers: req.headers.set('X-New-Header', 'new header value'),
});
return next(reqWithHeader);
```

> Note: request/response **bodies** are not deep-protected from mutation; avoid mutating
> body objects in place.

## Dependency injection in interceptors

Functional interceptors run in an injection context, so they can use `inject()` directly:

```typescript
export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const authToken = inject(AuthService).getAuthToken();
  const newReq = req.clone({
    headers: req.headers.append('X-Authentication-Token', authToken),
  });
  return next(newReq);
}
```

## Passing metadata with HttpContext

Use `HttpContextToken` to pass per-request metadata to interceptors without polluting
headers:

```typescript
import {HttpContextToken, HttpContext} from '@angular/common/http';

export const CACHING_ENABLED = new HttpContextToken<boolean>(() => true);
```

Read it inside the interceptor:

```typescript
if (req.context.get(CACHING_ENABLED)) {
  // apply caching logic
}
```

Set it when making a request:

```typescript
const data$ = http.get('/sensitive/data', {
  context: new HttpContext().set(CACHING_ENABLED, false),
});
```

## Class-based interceptors (legacy / DI-based)

Implement `HttpInterceptor`:

```typescript
@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, handler: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Request URL: ' + req.url);
    return handler.handle(req);
  }
}
```

Register with `withInterceptorsFromDi()` and the `HTTP_INTERCEPTORS` multi-provider:

```typescript
import {provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS} from '@angular/common/http';

bootstrapApplication(App, {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    {provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true},
  ],
});
```

> DI-based interceptors run in the order their providers are registered, which can be
> very hard to predict in large hierarchical apps. This is the main reason functional
> interceptors are preferred.

## Best practices

- Default to functional interceptors registered with `withInterceptors([...])`.
- Keep each interceptor single-purpose (auth, logging, caching) and compose them via the
  ordered array.
- Always `clone()` the request to modify it; never mutate `req` directly.
- Use `HttpContext` for per-request flags (e.g. skip-auth, skip-cache) instead of magic
  headers.
- Order matters — place auth/header-setting interceptors before logging interceptors that
  inspect the final request.

## Common mistakes

- **Mutating the request object directly** instead of cloning — requests are immutable.
- **Forgetting to call `next(req)`** (or returning without it) — the request never
  proceeds.
- **Mixing `withInterceptors` and `withInterceptorsFromDi` carelessly** — understand that
  functional interceptors run in array order while DI interceptors run in provider order.
- **Doing heavy synchronous work** in an interceptor — it runs on every request.
- **Relying on injection outside the injection context** — only call `inject()` at the top
  of the functional interceptor, not inside async callbacks.
