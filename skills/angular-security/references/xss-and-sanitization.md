# XSS prevention and sanitization

Cross-site scripting (XSS) lets an attacker inject malicious code into a page so it runs in the victim's browser. Angular's primary defense is **automatic, contextual sanitization**: any value bound into the DOM through interpolation or property binding is treated as untrusted and inspected before it reaches the DOM.

> Sanitization is the inspection of an untrusted value, turning it into a value that's safe to insert into the DOM.

## Security contexts

Angular defines four security contexts, each with its own sanitization rules:

- **HTML** — values used where HTML is interpreted (e.g. `[innerHTML]`).
- **Style** — values bound into CSS (e.g. `[style]`).
- **URL** — values used as URLs (e.g. `<a href>`).
- **Resource URL** — URLs loaded and executed as code (e.g. `<script src>`, `<iframe src>`). Resource URLs cannot be sanitized because they may contain arbitrary code, so Angular never auto-sanitizes them.

## Interpolation is always escaped

Interpolated content is always escaped — the HTML is not interpreted, and the browser displays angle brackets as text content rather than executing them.

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-inner-html-binding',
  templateUrl: './inner-html-binding.component.html',
})
export class InnerHtmlBindingComponent {
  htmlSnippet = 'Template <script>alert("0wned")</script> <b>Syntax</b>';
}
```

```html
<h3>Binding innerHTML</h3>
<p>Bound value:</p>
<p class="e2e-inner-html-interpolated">{{ htmlSnippet }}</p>
<p>Result of binding to innerHTML:</p>
<p class="e2e-inner-html-bound" [innerHTML]="htmlSnippet"></p>
```

With interpolation (`{{ htmlSnippet }}`) the markup is shown literally. With `[innerHTML]` Angular **sanitizes** the value: the `<script>` element is stripped while the safe `<b>` element is kept.

## DomSanitizer and bypassSecurityTrust\*

`DomSanitizer` lets you mark a value as already-safe so Angular skips sanitization. This bypasses Angular's protection, so it must only be used for values you fully control and have verified. Never pass user input through it.

Available bypass methods:

- `bypassSecurityTrustHtml`
- `bypassSecurityTrustStyle`
- `bypassSecurityTrustScript`
- `bypassSecurityTrustUrl`
- `bypassSecurityTrustResourceUrl`

```ts
import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-bypass-security',
  templateUrl: './bypass-security.component.html',
})
export class BypassSecurityComponent {
  private sanitizer = inject(DomSanitizer);

  dangerousUrl = 'javascript:alert("Hi there")';
  trustedUrl: SafeUrl;

  constructor() {
    // Only safe because the value is a hard-coded constant, not user input.
    this.trustedUrl = this.sanitizer.bypassSecurityTrustUrl(this.dangerousUrl);
  }
}
```

```html
<h4>An untrusted URL:</h4>
<p><a class="e2e-dangerous-url" [href]="dangerousUrl">Click me</a></p>
<h4>A trusted URL:</h4>
<p><a class="e2e-trusted-url" [href]="trustedUrl">Click me</a></p>
```

If you need to sanitize a value yourself rather than trust it, call `DomSanitizer.sanitize()` with the appropriate `SecurityContext`:

```ts
import { Component, inject, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({ selector: 'app-clean', template: '' })
export class CleanComponent {
  private sanitizer = inject(DomSanitizer);

  clean(value: string): string | null {
    return this.sanitizer.sanitize(SecurityContext.HTML, value);
  }
}
```

## Avoid direct DOM access

Reaching into the DOM directly bypasses sanitization and reopens XSS holes. Avoid `ElementRef.nativeElement`, the global `document`, and other raw DOM APIs for inserting content. Prefer Angular template bindings; if you must process a value imperatively, route it through `DomSanitizer.sanitize()` with the correct `SecurityContext`.

## Avoid template injection / dynamic templates

Angular templates are trusted, executable code — equivalent to JavaScript. Never generate template source from user input, and never concatenate user data into a template string. The Ahead-of-Time (AOT) template compiler, the Angular CLI default for production builds, prevents a whole class of template-injection vulnerabilities by compiling templates at build time. Keep using AOT and avoid JIT compilation in production.

## Best practices

- Let Angular sanitize: bind untrusted data with interpolation or property binding and trust the framework's contextual sanitization.
- Treat `bypassSecurityTrust*` as a last resort, only for constant/verified values you control; isolate such code and review it carefully.
- Prefer `[innerHTML]` over manual DOM insertion when you must render HTML; the value is sanitized automatically.
- Build with AOT (the production default) and never construct templates from user input.
- Do server-side escaping on the server; never assemble Angular templates server-side.
- Keep Angular and dependencies current, and avoid any API documented as a "Security Risk".

## Common mistakes

- Passing user-supplied strings into `bypassSecurityTrustHtml` / `bypassSecurityTrustResourceUrl`, defeating sanitization entirely.
- Using `ElementRef.nativeElement.innerHTML = userValue` or `document.write(...)` instead of property bindings.
- Concatenating user input into template strings or dynamically compiling templates (template injection).
- Assuming interpolation `{{ }}` and `[innerHTML]` behave identically — interpolation escapes everything; `[innerHTML]` sanitizes and renders safe HTML.
- Expecting Angular to sanitize Resource URLs (`<script src>`, `<iframe src>`); it cannot, so these require trusted, controlled values.
