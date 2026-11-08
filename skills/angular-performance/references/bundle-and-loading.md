# Bundle Size and Loading

Keeping the initial JavaScript bundle small is one of the highest-impact performance levers. Use lazy routes and code splitting to remove code from the initial download, enforce limits with bundle budgets, and use SSR with hydration to improve perceived load time.

## Lazy routes

Lazily loading routes can significantly improve load speed by removing large portions of JavaScript from the initial bundle. Angular provides two route properties for this, both using the standard dynamic `import()` API.

### loadComponent

Loads a standalone component's JavaScript only when its route becomes active.

```ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login-page'),
  },
];
```

### loadChildren

Defers loading a set of child routes until the route is matched.

```ts
export const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component'),
    loadChildren: () => import('./admin/admin.routes'),
  },
];
```

Both run within the route's injection context, so you can `inject()` providers to make loading decisions:

```ts
import { inject } from '@angular/core';

{
  path: 'dashboard',
  loadComponent: () => {
    const flags = inject(FeatureFlags);
    return flags.isPremium
      ? import('./dashboard/premium-dashboard')
      : import('./dashboard/basic-dashboard');
  },
}
```

## Code splitting

Lazy routes and `@defer` blocks (see `deferrable-views.md`) are the two primary code-splitting mechanisms. To ensure the bundler can split a chunk, import dependencies directly from their source files rather than from barrel (`index.ts`) files, which can pull unrelated code into the initial bundle.

## Bundle budgets

The Angular CLI lets you set size thresholds in `angular.json` so parts of your app stay within boundaries you define. Builds emit a warning or fail with an error when a budget is exceeded.

```json
{
  "configurations": {
    "production": {
      "budgets": [
        {
          "type": "initial",
          "maximumWarning": "250kb",
          "maximumError": "500kb"
        }
      ]
    }
  }
}
```

Key properties:

- `type` — what to measure (e.g. `initial` for the JS/CSS needed to bootstrap the app, `bundle` for a named bundle).
- `maximumWarning` — threshold that triggers a build warning.
- `maximumError` — threshold that fails the build.
- `baseline` — a reference size against which percentages are calculated.
- `name` — bundle identifier (for `type: "bundle"`).

Budgets can be expressed as percentages relative to a baseline:

```json
{
  "type": "bundle",
  "name": "main",
  "baseline": "200kb",
  "maximumWarning": "10%",
  "maximumError": "20%"
}
```

Here a warning appears at 220kb and an error at 240kb.

## Server-side rendering (SSR)

Add hybrid rendering to an existing project with the CLI:

```
ng add @angular/ssr
```

Configure server rendering in `app.config.server.ts`:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
  ],
};
```

Choose a render mode per route in `app.routes.server.ts`:

```ts
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Client },     // CSR
  { path: 'about', renderMode: RenderMode.Prerender }, // SSG
  { path: 'profile', renderMode: RenderMode.Server },  // SSR
];
```

## Hydration

Hydration restores a server-rendered app on the client by reusing the server-rendered DOM, persisting application state, and transferring already-fetched data. This avoids destroying and re-rendering the DOM, eliminating the UI flicker and improving Core Web Vitals (LCP, CLS, FID).

If you ran `ng add @angular/ssr`, hydration is included automatically. To enable it manually, add `provideClientHydration()` to the bootstrap providers (in both client and server configs):

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideClientHydration } from '@angular/platform-browser';
import { App } from './app/app';

bootstrapApplication(App, {
  providers: [provideClientHydration()],
});
```

Event Replay captures user interactions that happen before hydration completes and replays them afterward. It is on by default in v22. On v21, enable it:

```ts
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

bootstrapApplication(App, {
  providers: [provideClientHydration(withEventReplay())],
});
```

Skip hydration for a problematic component with `ngSkipHydration` (forfeits hydration benefits for that component but avoids errors):

```html
<app-example ngSkipHydration />
```

## Best practices

- Lazy load every feature area with `loadComponent`/`loadChildren`; keep the eager bundle limited to the shell and first route.
- Set an `initial` budget early so regressions in bundle size fail the build before they ship.
- Import from source files, not barrels, so dynamic imports split cleanly.
- Enable hydration for any SSR/SSG app, and, on v21, add `withEventReplay()` so early clicks are not lost (on by default in v22).
- Choose `Prerender` (SSG) for static pages and `Server` (SSR) only for genuinely dynamic ones.

## Common mistakes

- Eagerly importing feature components into the root, so `loadComponent` provides no benefit.
- Shipping SSR without hydration, causing a full client re-render and a visible flicker.
- Breaking hydration by manipulating the DOM directly (`innerHTML`, `appendChild`, moving nodes) or rendering different DOM on server vs. client (e.g. `@if (isPlatformBrowser())`).
- Mismatched configuration between server and browser builds (e.g. `preserveWhitespaces`), which causes hydration errors.
- Having no bundle budgets, letting the initial bundle grow unchecked.
