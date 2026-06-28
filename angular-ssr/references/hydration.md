# Hydration

Hydration is the process that restores the server-side rendered application on the
client. Instead of throwing away the server HTML and re-rendering, Angular reuses
the existing DOM nodes, persists application state, and transfers pre-fetched data.
This removes the post-load flicker and improves Core Web Vitals (LCP, CLS, FID).

## Enabling hydration

If you scaffolded with `ng add @angular/ssr` / `ng new --ssr`, hydration is already
enabled. Manually, add `provideClientHydration()` to the **browser** providers.

Standalone:

```typescript
import {bootstrapApplication, provideClientHydration} from '@angular/platform-browser';
import {App} from './app/app';

bootstrapApplication(App, {
  providers: [provideClientHydration()],
});
```

NgModule:

```typescript
import {provideClientHydration} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

@NgModule({
  declarations: [App],
  bootstrap: [App],
  providers: [provideClientHydration()],
})
export class AppModule {}
```

## Feature functions (passed to `provideClientHydration`)

All from `@angular/platform-browser` unless noted:

- `withEventReplay()` — captures user interactions (clicks and other native
  events) that occur before hydration completes and replays them afterward, so no
  early interaction is lost.
- `withIncrementalHydration()` — enables incremental hydration via `@defer (hydrate ...)`
  blocks (see `incremental-hydration.md`). It depends on and **automatically
  enables event replay**, so you can drop a separate `withEventReplay()`.
- `withI18nSupport()` — enables hydration for apps using Angular i18n.
- `withHttpTransferCacheOptions({...})` — configures the SSR HTTP transfer cache
  (`includeHeaders`, `includePostRequests`, etc.).
- `withNoHttpTransferCache()` — disables the HTTP transfer cache entirely.

Example combining features:

```typescript
import {
  bootstrapApplication,
  provideClientHydration,
  withIncrementalHydration,
  withI18nSupport,
} from '@angular/platform-browser';

bootstrapApplication(App, {
  providers: [
    provideClientHydration(withIncrementalHydration(), withI18nSupport()),
  ],
});
```

## Constraints — keep server and client DOM identical

Hydration requires the **same generated DOM structure** on server and client. The
HTML must not be altered between server and client. Common breakers:

- **Direct DOM manipulation.** Components using `innerHTML`/`outerHTML`,
  `appendChild`, `document` queries, or other native DOM APIs to change structure
  produce a tree Angular does not expect → hydration error. Use Angular bindings/
  `Renderer2` instead.
- **Invalid HTML.** Browsers "fix" invalid markup, changing the DOM the client
  sees. Avoid: `<table>` without `<tbody>` (always declare `<tbody>` explicitly),
  `<div>` inside `<p>`, `<a>` inside another `<a>`.
- **Whitespace config.** Keep the default `preserveWhitespaces: false`; a
  mismatched value breaks hydration.
- **Conditional rendering differences.** Don't render different templates on
  server vs. browser. If you must branch, branch on
  `isPlatformBrowser(inject(PLATFORM_ID))` consistently and be aware that
  browser-only branches are best deferred.

## Browser-only code — `afterNextRender`

Run code that needs the DOM (measurements, focus, third-party DOM libraries) in
`afterNextRender`, which executes **only in the browser** and only after the DOM
exists:

```typescript
import {Component, ElementRef, afterNextRender, inject} from '@angular/core';

@Component({
  selector: 'app-chart',
  template: `<div #host></div>`,
})
export class ChartComponent {
  private readonly host = inject(ElementRef);

  constructor() {
    afterNextRender(() => {
      // Safe: browser only, DOM present. e.g. init a D3/Chart.js instance.
      renderChart(this.host.nativeElement);
    });
  }
}
```

## Skipping hydration — `ngSkipHydration`

For a component that genuinely cannot hydrate (e.g. wraps a third-party library
that manipulates its own DOM), opt it out. The component will then destroy and
re-render itself instead of hydrating — use sparingly.

As an attribute in a template:

```html
<app-example ngSkipHydration />
```

As a host binding:

```typescript
@Component({
  host: {ngSkipHydration: 'true'},
})
export class ExampleComponent {}
```

## Application stability

Hydration only runs once the application becomes stable. Long timeouts, unresolved
promises, or pending microtasks keep it unstable and trigger an "Application
remains unstable" error. To debug, add `provideStabilityDebugging()` from
`@angular/core`.

## Best practices

- Always pair SSR/SSG with `provideClientHydration()`.
- Add `withEventReplay()` (or `withIncrementalHydration()`, which includes it) so
  early clicks aren't dropped during hydration.
- Replace native DOM manipulation with Angular APIs; isolate unavoidable DOM work
  in `afterNextRender`.
- Write valid HTML (explicit `<tbody>`, no `<div>` in `<p>`, no nested `<a>`).
- Reserve `ngSkipHydration` for truly incompatible third-party components.

## Common mistakes

- Manipulating the DOM in `ngOnInit`/constructor → DOM mismatch and hydration
  errors.
- Touching `window`/`document` during render instead of in `afterNextRender`.
- Changing `preserveWhitespaces` and breaking the server/client match.
- Long pending promises/timers keeping the app unstable so hydration never starts.
- Slapping `ngSkipHydration` on large subtrees to "fix" errors — it disables the
  performance benefit for that subtree; fix the root cause instead.
