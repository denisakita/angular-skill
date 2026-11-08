# Architecture Patterns

Grounded in:
- https://angular.dev/guide/components
- https://angular.dev/guide/di
- https://angular.dev/ai/develop-with-ai (official modern-Angular conventions)

## Standalone-by-default architecture

Modern Angular (v19+) is standalone-first. Build the app from standalone components,
directives, and pipes wired via `imports`; bootstrap with `bootstrapApplication`. Do not
author NgModules for new features.

```typescript
// main.ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {App} from './app/app';
import {routes} from './app/app.routes';
import {authInterceptor} from './app/core/auth.interceptor';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
});
```

App-wide configuration lives in `providers` at bootstrap via `provide*` functions, not in a
root NgModule.

## Feature-based folder organization

**Recommended pattern synthesized from official guidance.** Organize by feature, not by file
type. Each feature owns its components, state, services, and routes. Cross-cutting concerns go
in `core/` (singletons, interceptors) and `shared/` (reusable presentational components,
directives, pipes).

```
src/app/
  core/                 # app-wide singletons: auth, interceptors, config tokens
    auth.service.ts
    auth.interceptor.ts
  shared/               # reusable, dependency-light UI + utilities
    ui/
      button.ts
      card.ts
  features/
    users/
      user-list-page.ts      # smart/container
      user-card.ts           # presentational
      user.store.ts          # signal store
      users.api.ts           # data access (HttpClient)
      users.routes.ts        # feature routes
      user.model.ts          # types
    orders/
      ...
  app.ts
  app.routes.ts
```

## Separation of concerns (layers)

Keep responsibilities in distinct layers so each is independently testable and replaceable:

- **Presentational components** — UI only; `input()`/`output()`, `computed()`, `OnPush`, no DI.
- **Container components** — orchestration; inject stores/facades, wire data and events.
- **State (signal stores / facades)** — own writable signals + `computed` + mutation methods.
- **Data access (API services)** — talk to HTTP/backends; return data, hold no view state.
- **Models** — interfaces/types shared across the feature.

Data flows: API service → store/facade (signals) → container → presentational (inputs);
events flow back up via `output()` → container → store methods.

## Lazy-loaded routes

Lazy-load features to keep the initial bundle small. Use `loadChildren` for a feature's route
group and `loadComponent` for a single route. Provide feature-scoped services in the route's
`providers`.

```typescript
// app.routes.ts
import {Routes} from '@angular/router';

export const routes: Routes = [
  {path: '', loadComponent: () => import('./features/home/home').then(m => m.Home)},
  {
    path: 'users',
    loadChildren: () => import('./features/users/users.routes').then(m => m.USERS_ROUTES),
  },
];
```

```typescript
// features/users/users.routes.ts
import {Routes} from '@angular/router';
import {UsersApi} from './users.api';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    providers: [UsersApi],            // scoped to this lazy feature
    loadComponent: () => import('./user-list-page').then(m => m.UserListPage),
  },
  {
    path: ':id',
    loadComponent: () => import('./user-detail-page').then(m => m.UserDetailPage),
  },
];
```

## Official modern-Angular conventions (from angular.dev AI guidance)

These are the conventions Angular publishes for code generation; apply them everywhere:

- Use strict type checking.
- Always use standalone components over NgModules; don't set `standalone: true` explicitly.
- Use signals for local state and `computed()` for derived values.
- Use `input()` and `output()` functions instead of decorators.
- Use native control flow `@if` / `@for` / `@switch` instead of `*ngIf` / `*ngFor` / `*ngSwitch`.
- `OnPush` is the default in v22. Keep it explicit in code that must also run on v21; in a v22-only app you can leave it out.
- Prefer Signal Forms for new forms (experimental on v21).
- Accessibility is mandatory: pass AXE checks and meet WCAG AA.

## DO / DON'T

DO:
- Bootstrap with `bootstrapApplication` and `provide*` functions.
- Organize by feature; isolate singletons in `core/`, reusable UI in `shared/`.
- Lazy-load features via `loadChildren` / `loadComponent`.
- Scope feature services in route `providers`.
- Keep layers separated: presentational ↔ container ↔ store/facade ↔ API.

DON'T:
- Don't create NgModules for new code.
- Don't organize folders by type (`components/`, `services/`) at app scope; organize by feature.
- Don't eager-load large features into the initial bundle.
- Don't let presentational components inject services or talk to APIs.
- Don't put API/HTTP calls directly in components; route them through API services and stores.
