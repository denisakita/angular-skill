# HTTP security

`HttpClient` includes built-in protections against two common HTTP-layer attacks: Cross-Site Request Forgery (XSRF/CSRF) and Cross-Site Script Inclusion (XSSI).

## XSRF / CSRF protection

Cross-Site Request Forgery tricks an authenticated user's browser into sending an unwanted request to your server. Angular defends against this with the **cookie-to-header token** pattern.

> When performing HTTP requests, an interceptor reads a token from a cookie, by default `XSRF-TOKEN`, and sets it as an HTTP header, `X-XSRF-TOKEN`.

> By default, an interceptor sends this header on all mutating requests (such as `POST`) to relative and same-origin URLs, but not on `GET` or `HEAD` requests.

How it works end to end:

1. Your server sets a `XSRF-TOKEN` cookie (readable by JavaScript, so **not** `HttpOnly`) on page load.
2. Angular's interceptor reads that cookie and copies it into the `X-XSRF-TOKEN` header on mutating, same-origin requests.
3. Your server verifies the header matches the cookie. Because a malicious site cannot read the cookie value to forge the header, the request is rejected.

The server is responsible for issuing the cookie on the first GET and validating the header on each mutating request. Angular only handles the client-side copy from cookie to header.

### Enabling and configuring

XSRF protection is active by default when you set up `HttpClient` with `provideHttpClient()`. To use custom cookie/header names, add `withXsrfConfiguration()`:

```ts
import { ApplicationConfig } from '@angular/core';
import {
  provideHttpClient,
  withXsrfConfiguration,
} from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withXsrfConfiguration({
        cookieName: 'CUSTOM_XSRF_TOKEN',
        headerName: 'X-Custom-Xsrf-Header',
      }),
    ),
  ],
};
```

To disable the built-in protection entirely (for example when you implement your own scheme), use `withNoXsrfProtection()`:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withNoXsrfProtection } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withNoXsrfProtection())],
};
```

## XSSI protection

Cross-Site Script Inclusion can leak JSON data returned by APIs. A common server mitigation is to prefix JSON responses with a non-executable string such as `)]}',\n`. Angular's `HttpClient` automatically strips this prefix before parsing the response, so the protection works transparently as long as your server emits the prefix.

## General HTTP safety guidance

- Send the XSRF header only to same-origin, relative URLs (Angular's default) so the token is never leaked to third-party hosts.
- Keep the `XSRF-TOKEN` cookie readable by JavaScript (not `HttpOnly`) but mark it `Secure` and scope it appropriately; validate it server-side on every mutating request.
- Prefer relative API URLs so the interceptor recognizes requests as same-origin and attaches the token.
- Let the server own token issuance and validation; the client cannot enforce XSRF protection alone.

## Best practices

- Configure HTTP with `provideHttpClient()` and leave XSRF protection enabled.
- Use `withXsrfConfiguration()` only to match an existing server cookie/header naming convention.
- Have the server emit the XSSI prefix `)]}',\n` on JSON responses; Angular strips it automatically.
- Validate the `X-XSRF-TOKEN` header against the cookie on the server for every state-changing request.

## Common mistakes

- Disabling protection with `withNoXsrfProtection()` without implementing an equivalent server-side defense.
- Marking the `XSRF-TOKEN` cookie `HttpOnly`, which prevents Angular from reading it so the header is never sent.
- Expecting the header on `GET`/`HEAD` requests or on cross-origin/absolute URLs — Angular only adds it to mutating, same-origin requests.
- Relying on Angular alone for XSRF safety while the server never validates the header.
- Returning JSON without the XSSI prefix and assuming Angular still protects against XSSI.
