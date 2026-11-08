# Content Security Policy and Trusted Types

A Content Security Policy (CSP) and Trusted Types are browser-enforced defenses that complement Angular's sanitization. They reduce the impact of any XSS that does slip through by restricting which scripts and styles the browser will execute.

## Content Security Policy (CSP)

A CSP is delivered via the `Content-Security-Policy` HTTP response header and tells the browser which sources of script, style, and other resources are allowed. To use CSP with Angular you must allow the styles Angular injects at runtime, which requires a **nonce-based** policy.

The minimal policy Angular requires:

```
default-src 'self'; style-src 'self' 'nonce-randomNonceGoesHere'; script-src 'self' 'nonce-randomNonceGoesHere';
```

Replace `randomNonceGoesHere` with a value that is **unique per request and unpredictable** (cryptographically random). Reusing or guessing nonces defeats the policy.

## Telling Angular about the nonce

Angular needs to know the nonce so it can attach it to the `<style>` elements it injects. There are three supported ways to provide it.

### 1. `ngCspNonce` attribute

Set the `ngCspNonce` attribute on the application root element. Useful when the nonce is available as the page HTML is constructed server-side.

```html
<app ngCspNonce="randomNonceGoesHere"></app>
```

### 2. `CSP_NONCE` injection token

Provide the nonce through the `CSP_NONCE` token at bootstrap. Useful when the nonce is available in client-side code.

```ts
import { bootstrapApplication, CSP_NONCE } from '@angular/core';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    {
      provide: CSP_NONCE,
      useValue: globalThis.myRandomNonceValue,
    },
  ],
});
```

### 3. `autoCsp`

Set the `autoCsp` option to `true` in the workspace configuration (`angular.json`) to have the CLI generate a hash-based / auto CSP for you.

## Trusted Types

Trusted Types is a web platform feature that helps prevent DOM-based XSS by forcing dangerous DOM sinks (such as `innerHTML`) to receive typed, policy-approved values instead of plain strings. Angular supports Trusted Types and ships several policies the browser must allow.

Enforce Trusted Types via the CSP header:

```
Content-Security-Policy: trusted-types angular; require-trusted-types-for 'script';
```

If your app uses `DomSanitizer` bypass methods, also allow the bypass policy:

```
Content-Security-Policy: trusted-types angular angular#unsafe-bypass; require-trusted-types-for 'script';
```

### Angular's Trusted Types policies

| Policy | Purpose |
|--------|---------|
| `angular` | Used by security-reviewed code internal to Angular; required for Angular to function when Trusted Types are enforced. |
| `angular#bundler` | Used by the Angular CLI bundler when creating lazy chunk files. |
| `angular#unsafe-bypass` | Required when the app uses `DomSanitizer` bypass methods such as `bypassSecurityTrustHtml`. |
| `angular#unsafe-jit` | Used by the Just-In-Time (JIT) compiler; only needed if you compile templates at runtime. |
| `angular#unsafe-upgrade` | Used by the `@angular/upgrade` package (AngularJS hybrid apps). |

Only include the policies your application actually needs. Apps using AOT (the production default) and no bypass calls need just `angular` (and `angular#bundler` for lazy chunks).

## Best practices

- Serve a strict, nonce-based CSP that includes at least `default-src 'self'`, `style-src 'self' 'nonce-...'`, and `script-src 'self' 'nonce-...'`.
- Generate a fresh, cryptographically random nonce for every request; never hard-code or reuse one.
- Pick one nonce delivery mechanism (`ngCspNonce`, `CSP_NONCE`, or `autoCsp`) appropriate to where the nonce becomes available.
- Enforce Trusted Types with `require-trusted-types-for 'script'` and grant only the Angular policies you need.
- Avoid JIT in production so you can omit `angular#unsafe-jit`; avoid bypass methods so you can omit `angular#unsafe-bypass`.

## Common mistakes

- Using `'unsafe-inline'` for scripts or styles, which neutralizes the CSP.
- Reusing a static nonce across requests, making it predictable.
- Forgetting to tell Angular the nonce, so its injected `<style>` tags are blocked and styling breaks.
- Enabling Trusted Types but omitting `angular#unsafe-bypass` while still calling `DomSanitizer.bypassSecurityTrust*`, causing runtime failures.
- Granting more Trusted Types policies than necessary (e.g. `angular#unsafe-jit`) and widening the attack surface.
