# Loading Strategies (Lazy Loading)

Source: https://angular.dev/guide/routing/loading-strategies

Angular supports two ways to load routed code:

- **Eager loading** — the component is bundled with the route config and loaded immediately.
- **Lazy loading** — the component's JavaScript is loaded only when the route becomes active.

Two route properties enable lazy loading:

- `loadComponent` — lazily loads the JavaScript for a component at the point the route would become active.
- `loadChildren` — lazily loads a set of child routes during route matching.

## Lazy loading routes

```typescript
import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login-page'),
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component'),
    loadChildren: () => import('./admin/admin.routes'),
  },
];
```

Both properties take loader functions that return a Promise. With the standard JavaScript dynamic `import()` API you can return the import directly when the module uses a **default export** (a default-exported component for `loadComponent`, or a default-exported `Routes` array for `loadChildren`).

For a named export, resolve it explicitly:

```typescript
{
  path: 'reports',
  loadComponent: () =>
    import('./reports/reports-page').then((m) => m.ReportsPage),
},
{
  path: 'settings',
  loadChildren: () =>
    import('./settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
}
```

## Loader functions run in the route's injection context

The router executes loader functions within the injection context of the current route, so you can `inject()` services to decide what to load:

```typescript
loadComponent: () => {
  const flags = inject(FeatureFlags);
  return flags.isPremium
    ? import('./dashboard/premium-dashboard')
    : import('./dashboard/basic-dashboard');
}
```

## Eager vs lazy: performance

- Eager loading is recommended for the primary landing page(s); other pages should be lazy-loaded.
- Lazy routes reduce the initial bundle and initial data requests but introduce later requests when the route is visited.
- Deeply nested lazy loading can significantly impact performance — avoid excessive chaining of lazy boundaries.

## Best practices

- Lazy-load feature areas with `loadChildren`, pointing at a `*.routes.ts` file that exports a `Routes` array.
- Prefer default exports for lazily loaded components and route files so the loader can return `import(...)` directly.
- Eager-load only the landing/home route; lazy-load the rest.
- Combine route-level `providers` with lazy `loadChildren` to scope feature services and tree-shake them.

## Common mistakes

- Returning a non-default export from `import()` without `.then((m) => m.X)` — the route will fail to load.
- Calling the loader eagerly (e.g., `loadComponent: import(...)`) instead of passing a function (`() => import(...)`), which defeats lazy loading.
- Over-nesting lazy boundaries, causing waterfalls of network requests on deep navigation.
- Lazy-loading the initial landing page, hurting first-contentful-paint.
