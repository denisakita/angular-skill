# Folder Structure (concrete, annotated layouts)

Two reference layouts: a **single-app modular monolith** and an **Nx monorepo**. Filenames follow the **modern Angular Style Guide (v21/v22): no type suffixes** — a component is `user-profile.ts` (not `user-profile.component.ts`), a service is `booking-store.ts` (not `booking.service.ts`). Template/style/test share the base name. **[Documented — Angular Style Guide]**

> Naming recap **[Documented]**: kebab-case files; file name matches the class it contains; component TS/HTML/CSS share a base name (`user-profile.ts` / `.html` / `.css`); tests are `*.spec.ts` colocated next to the code; organize by **feature**, not by file type (no top-level `components/`, `services/`, `pipes/`).

## Layout A — Single-app modular monolith

For one team, one deployable. Organized by domain; each feature lazy-loaded.

```
my-app/
├─ src/
│  ├─ main.ts                      # bootstrapApplication(App, { providers: [...] })
│  ├─ index.html
│  ├─ styles.css                   # global styles + design tokens (CSS custom props)
│  └─ app/
│     ├─ app.ts                    # root standalone component (shell layout)
│     ├─ app.html
│     ├─ app.css
│     ├─ app.config.ts             # ApplicationConfig: providers (router, http, zoneless)
│     ├─ app.routes.ts             # top-level routes -> lazy loadChildren per domain
│     │
│     ├─ core/                     # app-wide singletons (used once, app lifetime)
│     │  ├─ auth-interceptor.ts
│     │  ├─ error-handler.ts
│     │  ├─ auth-guard.ts
│     │  └─ session-store.ts       # signal-based current-user store
│     │
│     ├─ shared/                   # cross-cutting, presentational + pure utils
│     │  ├─ ui/                    # design-system components (no business logic)
│     │  │  ├─ button/
│     │  │  │  ├─ button.ts
│     │  │  │  ├─ button.html
│     │  │  │  └─ button.css
│     │  │  └─ dialog/
│     │  └─ util/                  # pure functions, types, constants (no DI)
│     │     ├─ format-currency.ts
│     │     └─ date.ts
│     │
│     ├─ bookings/                 # ===== DOMAIN: bookings =====
│     │  ├─ booking.routes.ts      # child routes for this domain (lazy targets)
│     │  ├─ booking-list/          # feature area (smart/container)
│     │  │  ├─ booking-list.ts
│     │  │  ├─ booking-list.html
│     │  │  ├─ booking-list.css
│     │  │  └─ booking-list.spec.ts
│     │  ├─ booking-detail/
│     │  │  ├─ booking-detail.ts
│     │  │  └─ booking-detail.html
│     │  ├─ ui/                    # presentational components for this domain
│     │  │  └─ booking-card/
│     │  │     ├─ booking-card.ts
│     │  │     └─ booking-card.html
│     │  └─ data/                  # domain data-access
│     │     ├─ booking-store.ts    # signal store / service
│     │     ├─ booking-store.spec.ts
│     │     ├─ bookings-api.ts     # HttpClient calls
│     │     └─ booking.ts          # Booking model/type
│     │
│     └─ catalog/                  # ===== DOMAIN: catalog ===== (same shape)
│        ├─ catalog.routes.ts
│        ├─ product-list/
│        ├─ ui/
│        └─ data/
├─ angular.json                    # budgets live here (production config)
├─ eslint.config.js                # angular-eslint + prettier
├─ tsconfig.json                   # strict: true, strictTemplates: true
└─ package.json
```

Notes:
- **`core/`** = singletons instantiated once (interceptors, guards, app-wide stores).
- **`shared/`** = reusable presentational UI + pure utilities; **no business logic, no HTTP**.
- Each **domain folder** mirrors the Nx library types internally: feature areas (smart), `ui/` (dumb), `data/` (data-access). This keeps the door open to graduate to Nx later with minimal churn.
- Everything under a domain is **lazy-loaded** via its `*.routes.ts`.

## Layout B — Nx monorepo

For multiple teams/apps and shared code with **enforced** boundaries. Apps are thin; logic lives in `libs/`.

```
my-workspace/
├─ apps/
│  ├─ booking-web/                 # deployable app (thin: wires routes + providers)
│  │  ├─ src/
│  │  │  ├─ main.ts
│  │  │  └─ app/
│  │  │     ├─ app.ts
│  │  │     ├─ app.config.ts
│  │  │     └─ app.routes.ts       # loadChildren -> feature libs
│  │  └─ project.json              # tags: ["scope:bookings", "type:app"]
│  ├─ admin-web/
│  │  └─ project.json              # tags: ["scope:admin", "type:app"]
│  └─ booking-web-e2e/             # Playwright e2e for booking-web
│
├─ libs/
│  ├─ bookings/                    # ===== scope:bookings =====
│  │  ├─ feature-booking-list/
│  │  │  ├─ src/
│  │  │  │  ├─ index.ts            # PUBLIC API (only exported surface)
│  │  │  │  └─ lib/
│  │  │  │     ├─ booking-list.ts
│  │  │  │     ├─ booking-list.html
│  │  │  │     └─ booking.routes.ts
│  │  │  └─ project.json           # tags: ["scope:bookings", "type:feature"]
│  │  ├─ ui-booking-card/
│  │  │  ├─ src/index.ts
│  │  │  └─ project.json           # tags: ["scope:bookings", "type:ui"]
│  │  └─ data-access/
│  │     ├─ src/
│  │     │  ├─ index.ts            # exports BookingStore + Booking type only
│  │     │  └─ lib/
│  │     │     ├─ booking-store.ts
│  │     │     └─ booking.ts
│  │     └─ project.json           # tags: ["scope:bookings", "type:data-access"]
│  │
│  ├─ catalog/                     # ===== scope:catalog ===== (same shape)
│  │  ├─ feature-catalog/          # tags: ["scope:catalog", "type:feature"]
│  │  └─ data-access/              # tags: ["scope:catalog", "type:data-access"]
│  │
│  └─ shared/                      # ===== scope:shared (usable by all) =====
│     ├─ ui/                       # design system   tags: ["scope:shared","type:ui"]
│     │  ├─ src/index.ts
│     │  └─ src/lib/button/ ...
│     ├─ util-formatting/          # tags: ["scope:shared", "type:util"]
│     │  └─ src/index.ts
│     └─ data-access-auth/         # tags: ["scope:shared", "type:data-access"]
│        └─ src/index.ts
│
├─ docs/
│  └─ adr/                         # Architecture Decision Records
│     └─ 0001-use-nx-monorepo.md
├─ .github/
│  └─ CODEOWNERS                   # scopes -> teams
├─ eslint.config.js                # @nx/enforce-module-boundaries depConstraints
├─ nx.json                         # tags defaults, targetDefaults, caching
├─ tsconfig.base.json              # path aliases: @my-org/bookings/data-access -> libs/...
└─ package.json                    # single-version policy for deps
```

Notes:
- **Two tag axes per library:** `scope:*` (domain/team) + `type:*` (feature/ui/data-access/util). Enforced by `@nx/enforce-module-boundaries` (see `modular-monolith-and-monorepo.md` for the full `depConstraints`). **[Documented — Nx]**
- **`index.ts` is the only public API.** Cross-library imports use the TS path alias (e.g., `@my-org/bookings/data-access`); deep imports into `lib/` across boundaries are blocked. **[Documented — Nx]**
- **`apps/` are thin** — `app.routes.ts` lazy-loads feature libraries; no business logic in the app.
- **`shared/`** holds the design system + cross-cutting util/data-access; it may only depend on other `scope:shared` libs.

### Adding a micro-frontend to the Nx layout (optional)

If a remote needs **independent deployment**, add it as its own app with a `federation.config.js` (see `micro-frontends.md`); the shell is another app loading it via `loadRemoteModule`:

```
apps/
  shell/                # dynamic host: federation.manifest.json + loadRemoteModule routes
  bookings-mfe/         # remote: federation.config.js exposes './routes'
```

Both still live in the monorepo (enforced boundaries) but deploy on separate pipelines.

## Decision / when to use

- **Layout A** for a single team / single deployable. Keep domain folders clean so you can graduate to Nx later.
- **Layout B** for multiple teams/apps, shared design system, or when you need enforced boundaries.
- **Add the MFE apps** to Layout B only when independent deployment is required.

## Best practices

- **No type suffixes; kebab-case; colocate template/style/test.** **[Documented]**
- **Organize by feature/domain**, never by file type. **[Documented]**
- **One public `index.ts` per library**; never deep-import across boundaries.
- **Tag every library** (`scope:` + `type:`) and enforce direction in lint.
- **Keep apps thin**; mirror the four library types even inside a single-app monolith's domain folders.

## Common mistakes / anti-patterns

- **Legacy `*.component.ts` / `*.service.ts` suffixes** for new code — the v21/v22 Style Guide drops them.
- **Top-level `components/`, `services/`, `pipes/` buckets** — folder-by-type fights cohesion. **[Documented — avoid]**
- **Sprawling barrel files** re-exporting everything inside one app/lib — hurts tree-shaking and invites circular imports. Barrels are for **library boundaries** only.
- **Business logic / HTTP in the app shell or in `ui` libraries** — push to `data-access`.
- **Untagged libraries** — they escape boundary enforcement.
- **Fat apps** holding feature code instead of delegating to libraries.
