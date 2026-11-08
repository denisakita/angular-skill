---
name: angular-security
description: Use when building or reviewing Angular v21/v22 apps to apply official angular.dev security guidance — XSS/sanitization, CSP & Trusted Types, and HttpClient XSRF protection.
license: MIT
metadata:
  source: https://angular.dev/best-practices/security
  angularVersion: '21-22'
  version: '1.0'
---

# Angular Security

Guidance for writing secure Angular v21/v22 applications, grounded strictly in the official [angular.dev security best practices](https://angular.dev/best-practices/security). Angular treats every value as untrusted by default and automatically sanitizes data bound into the DOM; templates themselves are trusted, executable code. The job of an app author is to avoid disabling these protections, harden the runtime with a Content Security Policy and Trusted Types, and lean on `HttpClient`'s built-in XSRF protection. Use modern idioms throughout: standalone components, signals, `@if`/`@for`, and `inject()`.

## Reference files

- `references/xss-and-sanitization.md` — XSS prevention, Angular's contextual sanitization, `[innerHTML]` binding, `DomSanitizer` / `bypassSecurityTrust*`, avoiding direct DOM access and template injection.
- `references/csp-and-trusted-types.md` — Content Security Policy, `ngCspNonce` / `CSP_NONCE` / `autoCsp`, and how Angular supports Trusted Types.
- `references/http-security.md` — `HttpClient` built-in XSRF/CSRF protection (`withXsrfConfiguration`, `withNoXsrfProtection`), XSSI prefix stripping, and general HTTP safety.

## Core rules

- Trust Angular's automatic sanitization. Bind untrusted data with interpolation or property binding and let Angular sanitize the four security contexts (HTML, Style, URL, Resource URL).
- Never build Angular templates from user input. Dynamically generating templates is the same as executing arbitrary code; rely on the AOT compiler, which eliminates template-injection vulnerabilities.
- Avoid `bypassSecurityTrust*` methods. Only use `DomSanitizer.bypassSecurityTrust*` for values you fully control and have verified; never pass user input through them.
- Don't touch the DOM directly. Avoid `ElementRef.nativeElement`, `document`, and other raw DOM APIs that sidestep sanitization; prefer template bindings.
- Deploy a strict Content Security Policy and use Angular's nonce support (`ngCspNonce`, `CSP_NONCE`, or `autoCsp`); nonces must be unique and unpredictable per request.
- Enable Trusted Types via CSP to block DOM-XSS sinks at the browser level.
- Keep Angular and dependencies up to date, never modify your copy of Angular, and avoid any API documented as a "Security Risk".
- Use `provideHttpClient()` and keep XSRF protection on; configure it with `withXsrfConfiguration()` only when you need custom cookie/header names.
- Do all output escaping for server-side templates on the server — never construct Angular templates server-side.
