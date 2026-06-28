# Micro-Frontends (MFEs) in Angular

> **There is no "microservice" on the frontend.** The browser is a single runtime. The frontend equivalent of microservices is **micro-frontends**: independently built and deployed UI fragments composed at runtime by a **shell** (host) that loads **remotes**. If someone says "frontend microservices," they mean this.

Micro-frontends solve exactly one problem well: **independent deployment by autonomous teams.** They are not a modularity tool — a modular monolith/monorepo already gives you modularity at far lower cost (see `modular-monolith-and-monorepo.md`). Adopt MFEs only when independent deployment is a real, present requirement.

## When MFEs are justified — and when they're an anti-pattern

**Justified when:** **[Recommended practice, grounded in Native Federation/MF docs]**
- Multiple **autonomous teams** must release on **different schedules** without coordinating a single deploy.
- Frontends are owned by **different orgs/vendors**, or must run **different framework versions** (e.g., one remote still on Angular 19 while the shell is on 22) during a long migration.
- You're incrementally **strangling a legacy app** — wrap old and new behind a shell and migrate route by route.
- A **plugin system** where third parties contribute UI loaded at runtime.

**Anti-pattern when:**
- You want "modularity," cleaner boundaries, or smaller PRs — use an **Nx monorepo** instead.
- One team owns everything and all remotes deploy together anyway — you paid the complexity tax for nothing.
- The app is small/medium, or the team is inexperienced with the operational burden (per-remote hosting, version negotiation, integration testing).
- You need maximum runtime performance and minimal bundle size — federation risks duplicated dependencies and adds runtime composition cost.

## Native Federation vs webpack Module Federation

**Use Native Federation for new Angular work.** **[Documented]**

| | **Native Federation** (recommended) | **webpack Module Federation** |
|---|---|---|
| Bundler | Bundler-agnostic; delegates to Angular's **esbuild `application` builder** | Tied to **webpack** |
| Angular alignment | Aligned with Angular's modern toolchain since v17.1; supports SSR/incremental hydration (v18+), i18n (v19+) | Predates esbuild migration; needs custom webpack builders |
| Standards | Built on **ES Modules + Import Maps** | webpack-specific container runtime |
| Mental model | Same as Module Federation (host/remote/shared) — easy migration | Original model |
| Package | `@angular-architects/native-federation` | `@angular-architects/module-federation` (legacy for esbuild Angular) |

Match the plugin version to your Angular version (Angular 22.x → Native Federation 22.x). **[Documented]** Module Federation is still valid for existing webpack apps and multi-framework setups, but new Angular CLI apps use esbuild, so Native Federation is the natural fit.

## Shell + remotes: the topology

- **Shell (host):** the always-loaded application. Owns the top-level shell UI (nav, layout), global providers (router, HttpClient, auth), and the routes that lazy-load remotes.
- **Remote:** an independently deployable app that **exposes** components/routes. Built and deployed on its own; the shell discovers it at runtime via a **manifest**.
- **Shared dependencies:** libraries (Angular, RxJS, design system) loaded **once** and shared between shell and remotes — the source of both the biggest benefit and the biggest pitfalls.

## Setup (Native Federation) **[Documented — @angular-architects/native-federation]**

Install per app (shell and each remote):

```bash
# Shell as a dynamic host (reads remotes from a runtime manifest)
ng add @angular-architects/native-federation --project shell --type dynamic-host

# A remote exposing components
ng add @angular-architects/native-federation --project bookings-mfe --type remote --port 4201
```

### Remote `federation.config.js`

```js
const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'bookings-mfe',
  exposes: {
    // expose lazy routes/components — NEVER the root App/bootstrap
    './routes': './src/app/bookings.routes.ts',
  },
  shared: {
    // share framework + RxJS as singletons with managed versions
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },
  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],
});
```

### Shell `federation.config.js` (same `shareAll`, no `exposes` needed for a pure host)

```js
const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');
module.exports = withNativeFederation({
  shared: { ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }) },
  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],
});
```

### Runtime manifest (shell) — `public/federation.manifest.json`

```json
{
  "bookings-mfe": "http://localhost:4201/remoteEntry.json",
  "catalog-mfe":  "http://localhost:4202/remoteEntry.json"
}
```

Using a **runtime manifest** (dynamic host) is the recommended pattern: you change remote URLs per environment **without rebuilding** the shell. **[Documented]**

### Bootstrap (`src/main.ts`) — initialize federation before bootstrapping

```ts
import { initFederation } from '@angular-architects/native-federation';

initFederation('/federation.manifest.json')
  .catch(err => console.error(err))
  .then(() => import('./bootstrap'))   // ./bootstrap calls bootstrapApplication(App, ...)
  .catch(err => console.error(err));
```

### Consuming a remote via routing (shell)

```ts
import { loadRemoteModule } from '@angular-architects/native-federation';

export const appRoutes: Routes = [
  {
    path: 'bookings',
    loadChildren: () =>
      loadRemoteModule('bookings-mfe', './routes').then(m => m.bookingsRoutes),
  },
  {
    path: 'catalog',
    loadChildren: () =>
      loadRemoteModule('catalog-mfe', './routes').then(m => m.catalogRoutes),
  },
];
```

## Shared singleton dependencies & version-mismatch pitfalls (the hard part)

The stateful framework **must** be a single instance across shell + all remotes. Two Angular copies → broken DI ("`inject()` must be called from an injection context"), duplicated `providedIn: 'root'` services, and subtle state bugs. **[Documented — angulararchitects.io]**

Rules: **[Documented]**
- **`singleton: true` + `strictVersion: true`** for `@angular/*` and `rxjs`. This makes the loader fail loudly on incompatible versions instead of silently loading two copies.
- **Manage `requiredVersion`** (use `'auto'` to read from `package.json`). Secondary entry points like `@angular/common/http` aren't auto-detected — `shareAll` / `includeSecondaries` handle them; otherwise specify by hand.
- **Share the dependencies of shared libraries too.** If you share `auth-lib` but not a lib it depends on, shell and remote get separate instances and state won't be shared.
- **Keep shell and remotes on compatible Angular versions.** "Different versions per remote" is *possible* but should be a deliberate, time-boxed migration strategy, not a steady state — it risks loading multiple framework copies.

```js
// Equivalent explicit form if not using shareAll:
const { share } = require('@angular-architects/native-federation/config');
shared: share({
  '@angular/core':   { singleton: true, strictVersion: true, requiredVersion: 'auto' },
  '@angular/common': { singleton: true, strictVersion: true, requiredVersion: 'auto',
                       includeSecondaries: { skip: ['@angular/common/http/testing'] } },
  'rxjs':            { singleton: true, strictVersion: true, requiredVersion: 'auto' },
})
```

## Routing across MFEs

- The **shell owns the top-level router**; each remote exposes its own child routes (lazy-loaded as above).
- Provide **global services in the shell** (HttpClient, auth/session, error handling) so remotes don't each create their own. **[Documented — avoids NullInjectorError]**
- Remotes should use **relative/child routing** under their mounted path so they remain runnable standalone *and* embedded.
- For deep-linking, the shell's route config maps URL prefixes → remotes; the remote handles everything below its prefix.

## Cross-MFE communication

Keep coupling minimal — the whole point is autonomy. Preference order: **[Recommended practice]**
1. **URL / route params** — the loosest coupling; shareable, bookmarkable state belongs in the URL.
2. **Custom DOM events** (`CustomEvent` on `window`) — framework-agnostic pub/sub for "something happened" notifications. Define a typed event contract.
3. **A shared, singleton state library** (e.g., a `shared/data-access-session` exposing a signal store) — for genuinely shared cross-cutting state like the current user. Only works if it's a *true singleton* (see sharing rules above).
4. **Backend as the source of truth** — often the cleanest: remotes coordinate through APIs, not the browser.

Avoid: remotes importing each other directly (recreates a distributed monolith) or large shared mutable global objects.

## Independent deployment

- Each remote has its **own CI/CD pipeline** and its **own host/URL**; deploying a remote does **not** rebuild or redeploy the shell. This is the entire value proposition.
- Use the **runtime manifest** to point the shell at the right remote URLs per environment.
- **Version your remote contracts.** The `exposes` surface is a public API between teams — changing it can break the shell. Treat it like an API: deprecate, don't break.
- **Integration testing matters more here:** unit tests live per remote, but you need contract/e2e tests that load the composed shell to catch integration regressions.

## SSR considerations

- Native Federation supports **SSR and incremental hydration** (Angular v18+). **[Documented]** It is more involved than client-only federation: the server must resolve and render remotes, and shared-dependency rules apply on the server too.
- **[Recommended practice]** If you need both SSR *and* micro-frontends, budget extra time, keep the shared-dependency graph tight, and validate hydration carefully. Many teams start client-only and add SSR per remote later.

## Decision / when to use

- **Adopt MFEs** only when independent deployment by autonomous teams (and/or mixed framework versions / multi-vendor / legacy strangulation / plugin systems) is a hard requirement.
- **Use Native Federation** for new Angular apps; reserve Module Federation for existing webpack apps or multi-framework hosts.
- **If one org owns all the remotes**, consider hosting shell + remotes in an **Nx monorepo** — you get enforced boundaries *and* independent deploy pipelines. **[Documented — Nx supports federation generators]**
- **Otherwise, choose the modular monolith/monorepo.**

## Best practices

- **Expose lazy routes/components, never the root `App`/bootstrap.** Exposing the root creates duplicate root injector scopes and duplicated root services. **[Documented]**
- **`singleton: true` + `strictVersion: true` + managed `requiredVersion`** for Angular & RxJS, including secondary entry points. **[Documented]**
- **Provide global services in the shell.** **[Documented]**
- **Dynamic host + runtime manifest** so remote URLs are environment config, not build-time constants. **[Documented]**
- **Keep remotes runnable standalone** (in dev) as well as embedded — eases development and testing.
- **Treat the `exposes` surface as a versioned contract** between teams; add contract/e2e integration tests.
- **Keep the shared dependency set small and uniform** to avoid duplication and negotiation pain.

## Common mistakes / anti-patterns

- **Using MFEs for modularity instead of deployment independence** — the cardinal mistake; use a monorepo.
- **Not sharing Angular as a singleton** → two framework copies → broken DI and duplicated services. **[Documented]**
- **Sharing a library but not its dependencies** → separate instances, state not shared. **[Documented]**
- **Exposing `AppModule`/root bootstrap** → duplicate root scopes. **[Documented]**
- **Forgetting secondary entry points** (`@angular/common/http`) in sharing config → "no required version specified" / mismatch errors. **[Documented]**
- **Remotes importing each other** → distributed monolith with all the cost and none of the autonomy.
- **Divergent Angular versions as a permanent state** rather than a time-boxed migration → fragile runtime.
- **Skipping integration/contract tests** → "works in isolation, breaks when composed."
- **Hardcoding remote URLs in the shell build** → can't repoint per environment without rebuilding.
