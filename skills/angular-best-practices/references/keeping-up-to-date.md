# Keeping Up to Date, Security, and Accessibility

Sources: https://angular.dev/best-practices/keeping-up-to-date,
https://angular.dev/best-practices/security,
https://angular.dev/best-practices/a11y.

> Note: at fetch time the keeping-up-to-date page returned only the generic
> landing content, so the "Keeping up to date" section below is intentionally
> conservative and limited to the official, stable guidance (`ng update`, the
> update guide, and release channels). Security and accessibility below are
> grounded directly in the fetched security and a11y pages.

---

## Keeping up to date

Staying current is also a **security** practice: each release includes bug and
security fixes.

- DO update with the Angular CLI: `ng update` analyzes your dependencies and runs
  migration schematics that automatically update code for breaking changes.

  ```bash
  ng update @angular/core @angular/cli
  ```

- DO follow the official step-by-step **Update Guide** at
  https://angular.dev/update-guide, selecting your current and target versions.
- DO upgrade one major version at a time; do not skip majors when migrating.
- DO keep dependencies on supported versions so security patches keep flowing.
- DON'T fork or "vendor" a private copy of Angular — you will miss security
  updates. (Stated explicitly on the security page.)
- Follow release announcements via the Angular blog and official social channels
  (X, Bluesky, YouTube, Discord, GitHub).

---

## Security essentials

Angular's security model treats **all values as untrusted by default** and
treats **Angular templates as trusted** executable code.

### Best practices (from the security page)

1. Keep current with the latest Angular library releases for security patches.
2. Don't modify your copy of Angular / use a private fork that misses updates.
3. Avoid APIs marked **"Security Risk"** in the documentation.

### Cross-Site Scripting (XSS) and sanitization

Angular automatically sanitizes values bound into the DOM through template
bindings. There are security contexts: **HTML** (e.g. `[innerHTML]`), **Style**,
**URL** (e.g. `[href]`), and **Resource URL** (e.g. `<script src>` /
`<iframe src>`). Resource URLs cannot be sanitized because they contain
executable code.

```ts
@Component({
  template: `<p [innerHTML]="htmlSnippet"></p>`,
})
export class InnerHtmlBinding {
  // Angular strips the <script> but keeps <b>
  htmlSnippet = 'Template <script>alert("0wned")</script> <b>Syntax</b>';
}
```

- DO use Angular templates and interpolation/bindings — they sanitize for you.
- DO use `DomSanitizer.sanitize()` with the appropriate `SecurityContext` if you
  must touch the DOM directly.
- DON'T construct templates from user input (server- or client-side).
- DON'T use `bypassSecurityTrust*` (`bypassSecurityTrustHtml`,
  `...Url`, `...ResourceUrl`, etc.) unless the value is genuinely safe and you
  fully control it — these are security-sensitive and must be audited.

```ts
// Only when you have verified the value is safe:
private sanitizer = inject(DomSanitizer);
trustedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
  'https://www.youtube.com/embed/' + id,
);
```

### AOT compilation

The AOT template compiler (the CLI default) prevents template-injection
vulnerabilities. Use it for all production builds; treat JIT with user-supplied
templates as an anti-pattern.

### Content Security Policy (CSP) and Trusted Types

- DO serve a strict CSP. A minimal starter policy:

  ```
  default-src 'self'; style-src 'self' 'nonce-randomNonceGoesHere';
  script-src 'self' 'nonce-randomNonceGoesHere';
  ```

- Provide the nonce via `autoCsp: true` in `angular.json`, the `ngCspNonce`
  attribute on the root element, or the `CSP_NONCE` injection token. Nonces must
  be **unique and unpredictable per request** (generate at the edge/CDN; never
  cache a static nonce).
- Consider **Trusted Types** (`require-trusted-types-for 'script'`) to enforce
  safe DOM sinks where browser support allows.

### HTTP-level protections

- **XSRF/CSRF:** `HttpClient` automatically reads the `XSRF-TOKEN` cookie and
  sends it as the `X-XSRF-TOKEN` header on mutating requests (POST/PUT/DELETE/
  PATCH); GET/HEAD are not protected by design. Customize with
  `withXsrfConfiguration({ cookieName, headerName })` or disable with
  `withNoXsrfProtection()`.

  ```ts
  provideHttpClient(
    withXsrfConfiguration({ cookieName: 'CUSTOM_XSRF_TOKEN', headerName: 'X-Custom-Xsrf-Header' }),
  );
  ```

- **XSSI:** `HttpClient` automatically strips the `)]}',\n` JSON-vulnerability
  prefix if your server adds it.
- **SSRF (SSR):** `X-Forwarded-*` headers are untrusted/removed by default;
  configure `allowedHosts` (in `angular.json` or via `AngularAppEngine` /
  `AngularNodeAppEngine`) and only enable `trustProxyHeaders` behind a trusted
  proxy. Never use `*` for `allowedHosts` in production.

---

## Accessibility (a11y) essentials

Design for users relying on assistive technologies.

### ARIA via bindings

Use attribute binding for dynamic ARIA; plain attributes for static values.
Remember: HTML attributes are lowercase (`tabindex`), DOM properties are
camelCase (`tabIndex`).

```html
<button [attr.aria-label]="myActionLabel">…</button>   <!-- dynamic -->
<button aria-label="Save document">…</button>          <!-- static -->
```

```ts
@Component({
  selector: 'app-example-progressbar',
  template: `<div class="bar" [style.width.%]="value()"></div>`,
  host: {
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.aria-valuenow]': 'value()',
  },
})
export class ExampleProgressbar {
  value = input(0);
}
```

### Prefer native elements and accessible libraries

- DO reuse native elements (`<button>`, `<a>`, `<input>`) instead of
  reimplementing their behavior; augment them with attribute-selector
  directives.
- DO use **Angular Material** components and the **CDK `a11y`** package
  (`LiveAnnouncer` for `aria-live` messages, `cdkTrapFocus` for modals).
- DO consider **Angular Aria** headless directives (accordion, combobox,
  listbox, menu, tabs, toolbar) for WAI-ARIA patterns.

### Routing accessibility

- DO move focus to the main content after navigation (don't leave focus on
  `<body>`).

  ```ts
  router.events
    .pipe(filter((e) => e instanceof NavigationEnd))
    .subscribe(() => document.querySelector<HTMLElement>('#main-content-header')?.focus());
  ```

- DO mark active links with `RouterLinkActive` + `ariaCurrentWhenActive`:

  ```html
  <a routerLink="home" routerLinkActive="active-page" ariaCurrentWhenActive="page">Home</a>
  ```

### Deferred content

- DO wrap `@defer` blocks in an ARIA live region so screen readers announce
  content when deferred components load.

### Tooling

- DO use **Angular ESLint** accessibility rules to catch issues automatically.

### DO / DON'T

- DO keep Angular updated for security fixes; use `ng update` and the update
  guide.
- DON'T bypass sanitization or build templates from user input.
- DO use native, accessible elements and manage focus on navigation.
- DON'T ship a private fork of Angular or use JIT with user-provided templates.
