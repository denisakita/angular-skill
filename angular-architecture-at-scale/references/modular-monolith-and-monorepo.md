# Modular Monolith & Monorepo (the default architecture)

This is the right architecture for the vast majority of large Angular apps. It gives you strong internal boundaries,
team autonomy, and shared code — **without** the runtime and operational cost of micro-frontends. With Angular v21/v22
the building blocks are standalone components, signals, `inject()`, zoneless change detection, and lazy-loaded routes; *
*Nx** adds the monorepo layer with *enforced* boundaries.

## 1. Domain-driven feature folders

Organize by **feature/domain**, never by file type. The Angular Style Guide is explicit: structure directories around
features, and "avoid creating subdirectories based on the type of code" like `components/` or `services/`. *
*[Documented — Angular Style Guide]**

```
src/app/
  bookings/          # a domain
    booking-list/    # a feature area within the domain
    booking-detail/
    data/            # data-access for this domain (services, signal stores)
    booking.routes.ts
  catalog/
  shared/            # cross-cutting presentational + utilities (no business logic)
  core/              # app-wide singletons: app config, interceptors, guards
```

Keep a file's template, styles, and unit test **colocated** with it. **[Documented]**

## 2. Standalone-component architecture (no NgModules)

Angular v21/v22 app code is **standalone-only** in practice. Bootstrap with `bootstrapApplication` and providers, not
`AppModule`. **[Documented]**

```ts
// main.ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {provideZonelessChangeDetection} from '@angular/core';
import {App} from './app/app';
import {appRoutes} from './app/app.routes';
import {authInterceptor} from './app/core/auth-interceptor';

bootstrapApplication(App, {
    providers: [
        provideZonelessChangeDetection(),            // zoneless baseline
        provideRouter(appRoutes, withComponentInputBinding()),
        provideHttpClient(withInterceptors([authInterceptor])),
    ],
});
```

Component conventions **[Documented — Style Guide]**: prefer `inject()` over constructor params; mark
inputs/outputs/queries `readonly`; use `protected` for template-only members; move complex template logic into
`computed()` signals; prefer `class`/`style` bindings over `NgClass`/`NgStyle`; name handlers by action (`saveUser()`not
`onClick()`).

```ts

@Component({
    selector: 'app-booking-list',
    changeDetection: ChangeDetectionStrategy.OnPush, // signals + OnPush
    templateUrl: './booking-list.html',
})
export class BookingList {
    private readonly store = inject(BookingStore);
    protected readonly bookings = this.store.bookings;          // Signal
    protected readonly total = computed(() => this.bookings().length);
}
```

## 3. Lazy-loaded feature areas

Every feature is lazy-loaded so the initial bundle stays small. Use `loadChildren` (route files) and `loadComponent`. *
*[Documented]**

```ts
// app.routes.ts
export const appRoutes: Routes = [
    {path: '', pathMatch: 'full', loadComponent: () => import('./home/home').then(m => m.Home)},
    {path: 'bookings', loadChildren: () => import('./bookings/booking.routes').then(m => m.bookingRoutes)},
    {path: 'catalog', loadChildren: () => import('./catalog/catalog.routes').then(m => m.catalogRoutes)},
];
```

Use `@defer` blocks for heavy, below-the-fold, or interaction-triggered UI (charts, editors) to defer their JS until
needed. **[Documented — Deferrable Views]**

## 4. Nx monorepo structure (`apps/` + `libs/`)

When you have multiple apps/teams or want to share code, move to **Nx**. The core idea: **apps are thin; logic lives in
libraries.** **[Documented — Nx]**

```
apps/
  booking-web/            # deployable app — wires routes + providers, minimal logic
  admin-web/
libs/
  bookings/
    feature-booking-list/ # smart/container components + routes
    feature-booking-detail/
    ui-booking-card/      # presentational only
    data-access/          # services, signal stores, HTTP, models
  catalog/
    feature-catalog/
    data-access/
  shared/
    ui/                   # design system components (buttons, dialogs)
    util-formatting/      # pure functions, no Angular DI
    data-access-auth/     # shared auth/session
```

### Library types (the four-type model) **[Documented — Nx]**

| Type          | Contains                                                   | May depend on                          |
|---------------|------------------------------------------------------------|----------------------------------------|
| `feature`     | Smart/container components, routes, orchestration          | `feature`, `ui`, `data-access`, `util` |
| `ui`          | Presentational/dumb components, no business logic, no HTTP | `ui`, `util`                           |
| `data-access` | Services, state (signal stores / NgRx), HTTP, models       | `data-access`, `util`                  |
| `util`        | Pure functions, types, constants — no Angular DI ideally   | `util`                                 |

A second axis is **scope** (the domain/team): `scope:bookings`, `scope:catalog`, `scope:shared`. A library carries both,
e.g. tags `["scope:bookings", "type:feature"]`.

## 5. Enforced module boundaries with tags

This is the feature that makes a monorepo *better* than separate repos: boundaries are checked by lint in CI, not by
convention. Tag each project, then constrain dependencies with `@nx/enforce-module-boundaries`. **[Documented — Nx]**

Tag a library in its `project.json` (or `package.json`):

```jsonc
// libs/bookings/feature-booking-list/project.json
{ "name": "bookings-feature-booking-list", "tags": ["scope:bookings", "type:feature"] }
```

Enforce both **type direction** and **scope isolation** in the root ESLint config (flat config):

```js
// eslint.config.js
{
    rules: {
        '@nx/enforce-module-boundaries'
    :
        ['error', {
            enforceBuildableLibDependency: true,
            depConstraints: [
                // --- type direction ---
                {
                    sourceTag: 'type:feature',
                    onlyDependOnLibsWithTags: ['type:feature', 'type:ui', 'type:data-access', 'type:util']
                },
                {sourceTag: 'type:ui', onlyDependOnLibsWithTags: ['type:ui', 'type:util']},
                {sourceTag: 'type:data-access', onlyDependOnLibsWithTags: ['type:data-access', 'type:util']},
                {sourceTag: 'type:util', onlyDependOnLibsWithTags: ['type:util']},
                // --- scope isolation: a domain can use its own libs + shared ---
                {sourceTag: 'scope:bookings', onlyDependOnLibsWithTags: ['scope:bookings', 'scope:shared']},
                {sourceTag: 'scope:catalog', onlyDependOnLibsWithTags: ['scope:catalog', 'scope:shared']},
                {sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared']},
            ],
        }],
    }
,
}
```

This makes "a `ui` library importing a `feature`" or "the catalog domain importing booking internals" a **failing lint
error**. Untagged projects cannot depend on anything (unless you allow `*`). **[Documented — Nx]**

## 6. Public API (barrel) per library

Every library exposes exactly one entry point — `index.ts` (the "public API"). Consumers import from the library's
name/alias; **never** deep-import internals across a boundary. Nx's boundary rule blocks deep imports across projects by
default. **[Documented — Nx]**

```ts
// libs/bookings/data-access/src/index.ts  (public API)
export {BookingStore} from './lib/booking-store';
export type {Booking} from './lib/booking.model';
// internal helpers are NOT exported — they stay private to the lib
```

> Note on **in-app barrels**: a per-library `index.ts` for *cross-library* imports is good. Avoid sprawling barrel files
*inside* a single app/library that re-export everything — they can hurt tree-shaking and create circular imports.
> Barrels are for boundaries, not for internal convenience.

## 7. Shared design-system library

A single `shared/ui` library holds the design system (buttons, inputs, dialogs, theming tokens). It is `type:ui`,
`scope:shared`: presentational only, no data-access, no business logic. Every app and feature consumes it; nobody
copy-pastes components. **[Recommended practice]** See `enterprise-practices.md` for the design-system program around
it.

## Decision / when to use

- **Use a single-app modular monolith** for one team / one deployable. Apply sections 1–3 and 6–7 (you can keep
  public-API discipline without Nx).
- **Use an Nx monorepo** once you have multiple apps or teams, or want enforced boundaries and shared libraries. Apply
  all sections.
- **Do not jump to micro-frontends** for modularity — this architecture already provides it. Move to MFEs only for
  *independent deployment* (see `micro-frontends.md`).

## Best practices

- **Apps are thin; libraries hold the logic.** An app should mostly wire routes and providers. **[Documented — Nx]**
- **One responsibility per library; tag every library** with `scope:` + `type:` and enforce in CI.
- **Single-version policy** for third-party deps across the monorepo — avoids "two versions of RxJS" bugs. *
  *[Documented — Nx]**
- **Use `nx affected`** to build/test/lint only what a change impacts, plus remote caching, to keep CI fast at scale. *
  *[Documented — Nx]**
- **Keep `ui` pure** (inputs/outputs + signals only) so it's reusable and trivially testable.
- **Colocate tests**; put state in `data-access`, orchestration in `feature`, presentation in `ui`.

## Common mistakes / anti-patterns

- **Folder-by-type** (`components/`, `services/`, `pipes/`) — fights against feature cohesion and scales badly. *
  *[Documented — Style Guide says avoid]**
- **No enforced boundaries** — a monorepo without tags becomes a tangle. Add `@nx/enforce-module-boundaries` from day
  one.
- **Deep cross-library imports** bypassing the public API — couples you to internals and breaks the boundary model.
- **Business logic in `ui` libraries** or **HTTP calls in components** — push state/HTTP into `data-access`.
- **God "shared" / "common" library** that everything depends on — split by purpose (`shared/ui`, `shared/util-*`,
  `shared/data-access-*`).
- **Fat apps** that contain feature logic directly instead of delegating to libraries.
- **Reintroducing NgModules** for app code — use standalone + provider functions.
