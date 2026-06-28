---
name: angular-architecture-at-scale
description: Use when designing, structuring, or reviewing large Angular (v21/v22) applications — monolithic modular monoliths and monorepos, micro-frontends (Native/Module Federation), enterprise practices, and team rules of working.
license: MIT
metadata:
  source: https://angular.dev/style-guide
  angularVersion: '21-22'
  version: '1.0'
---

# Angular Architecture at Scale

A guide for designing, structuring, and reviewing **large** Angular applications (v21/v22) and the way **big teams actually work**. It covers the two dominant architectural styles, the enterprise practices around them, and the team governance that keeps them maintainable.

Everything here assumes **modern Angular idioms**: standalone components (no `NgModule` for app code), **signals** for reactive state, the `inject()` function over constructor injection, **zoneless** change detection, lazy loading, and the esbuild/`application` builder.

## The two architectures (and a vocabulary note)

> **There is no "microservice" on the frontend.** A browser runs one document, one JS runtime, one DOM. The closest equivalent to backend microservices is **micro-frontends (MFEs)** — independently built and deployed UI fragments composed at runtime (typically via **Native Federation** or webpack **Module Federation**). Do not call them "frontend microservices"; call them micro-frontends.

1. **Modular monolith / monorepo (the DEFAULT).** One deployable application (or a few), internally split into strongly-bounded domain modules and libraries. With **Nx**, this becomes a monorepo of `apps/` + `libs/` where boundaries are *enforced by lint rules* (tags). This is the right choice for the overwhelming majority of teams — you get modularity and team autonomy **without** the runtime and operational cost of MFEs.

2. **Micro-frontends.** Multiple independently-deployable frontends composed at runtime by a **shell** loading **remotes**. Justified only when you genuinely need **independent deployment by independent teams** (often across different release cadences, or even different frameworks/versions). It buys deployment autonomy at a real cost in complexity, shared-dependency management, and operational overhead.

**Rule of thumb:** Start with a modular monolith/monorepo. Adopt micro-frontends only when *independent deployment* is a hard requirement that the monorepo cannot satisfy — not merely for "modularity" (the monorepo already gives you that).

## Reference files

Read the file that matches your task. Each is self-contained.

- `references/choosing-an-architecture.md` — Decision guide: monolith vs monorepo vs micro-frontend. Team size, deploy independence, domain count, Conway's law, comparison table, decision flowchart.
- `references/modular-monolith-and-monorepo.md` — The default. DDD feature folders, standalone architecture, lazy feature areas, Nx `apps/`+`libs/` with library types (feature/ui/data-access/util), enforced boundaries via tags, public APIs, shared design system.
- `references/micro-frontends.md` — When MFEs are justified (and when they're an anti-pattern). Native Federation vs Module Federation, shell+remotes, exposing/consuming, shared singletons & version pitfalls, routing, cross-MFE communication, independent deploy, SSR.
- `references/enterprise-practices.md` — What big companies apply: design system, state strategy (signals first, SignalStore for complex state), strict TS, testing strategy & budgets, performance budgets, a11y, security, CI/CD, feature flags, observability, versioning.
- `references/rules-of-working.md` — Team governance: CODEOWNERS, PR rules, ESLint/Prettier in CI, Conventional Commits + semver, branching, dependency policy (Renovate/`ng update`), ADRs, Definition of Done, onboarding.
- `references/folder-structure.md` — Concrete layouts: single-app modular monolith AND Nx monorepo, annotated, using modern Style Guide filenames (no type suffixes, e.g. `user-profile.ts`).

## Core rules

1. **Default to a modular monolith/monorepo.** Treat micro-frontends as a specialized tool for an *independent-deployment* problem, not a default.
2. **Organize by feature/domain, not by file type.** No top-level `components/`, `services/`, `pipes/` buckets. (Angular Style Guide.)
3. **Enforce boundaries with tooling, not goodwill.** In Nx, tag every library with a `scope:` and `type:` and enforce direction with `@nx/enforce-module-boundaries`. Allowed direction: `feature → ui, data-access, util`; `ui → ui, util`; `data-access → data-access, util`; `util → util`.
4. **Each library/feature exposes a narrow public API** (a single `index.ts` / public-api barrel). Never deep-import internals across boundaries.
5. **Standalone + signals + `inject()` + zoneless** are the baseline. Lazy-load every feature route. Use `@defer` for heavy, below-the-fold UI.
6. **Signals first for state.** Reach for **NgRx SignalStore** only when state is genuinely complex and cross-cutting; don't add a global store reflexively.
7. **One shared design-system library**, not copy-pasted components. Presentational (`ui`) libraries hold no business logic and no data-access.
8. **For micro-frontends: share the framework as a `singleton`.** Always mark `@angular/core`, `@angular/common`, `rxjs` (and their secondary entry points) as `singleton: true` with a managed `requiredVersion`. Never expose the root `App`/bootstrap — expose lazy routes/components only.
9. **Independence is end-to-end:** boundaries in code, CODEOWNERS for ownership, separate CI checks per project, and (for MFEs) separate deploy pipelines.
10. **Document decisions (ADRs), automate enforcement (CI), and write a Definition of Done** — architecture that isn't enforced decays.

> Throughout these files, content is labeled **[Documented]** when it reflects official Angular/Nx/Native Federation docs, and **[Recommended practice]** when it is widely-adopted synthesis (team conventions, thresholds, governance) that is not a documented API.
