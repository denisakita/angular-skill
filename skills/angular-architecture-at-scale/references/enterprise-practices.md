# Enterprise Practices (what big companies actually apply)

These are the cross-cutting practices that distinguish a large, long-lived Angular codebase from a prototype. They apply to **both** the modular monolith/monorepo and micro-frontend architectures. Items are labeled **[Documented]** (official Angular/Nx guidance) or **[Recommended practice]** (industry-standard synthesis).

## 1. Design system / component library

- **One shared design system**, not copy-pasted components. A `shared/ui` (Nx) library or published package holds buttons, inputs, dialogs, layout primitives, and **design tokens** (color/spacing/typography as CSS custom properties). **[Recommended practice]**
- Components are **presentational only** — inputs/outputs + signals, no HTTP, no business logic — so they're reusable and trivially testable.
- **Document it** (Storybook is the de-facto tool) so product teams discover and reuse components instead of reinventing.
- **Theming via CSS custom properties / tokens** so brands/dark-mode are configuration, not forks.
- In micro-frontends, the design system is a **shared singleton dependency** — version it carefully (see `micro-frontends.md`).

## 2. State management strategy (signals first)

A deliberate, tiered strategy beats "NgRx everywhere" or "services with `BehaviorSubject` everywhere." **[Recommended practice, building on Documented signal APIs]**

1. **Local component state → signals** (`signal`, `computed`, `effect`, `linkedSignal`, `resource`). Default for most UI state. **[Documented]**
2. **Shared feature/domain state → a signal-based store service** in `data-access` (a class exposing `readonly` signals + methods), provided at the route or root as appropriate.
3. **Complex, cross-cutting state → NgRx SignalStore.** When state is large, shared across many features, has intricate derivations/effects, or needs structured patterns (entities, dev-tooling), use `@ngrx/signals` SignalStore. Classic Redux-style `@ngrx/store` remains valid for teams already invested in it or needing strict event-sourcing/time-travel. **[Recommended practice]**
4. **Server state** → use `httpResource`/`resource` or a data layer; don't hand-roll cache invalidation if a tool fits. **[Documented — resource APIs]**

Guideline: **push state down to the lowest level that needs it.** Don't promote everything to a global store. Keep async edges in RxJS where streams are natural; convert to signals (`toSignal`) at the component boundary.

## 3. Strict TypeScript

- **`strict: true`** in `tsconfig` (enables `strictNullChecks`, `noImplicitAny`, etc.). Non-negotiable at scale. **[Documented — Angular CLI enables strict by default]**
- Add **`noUncheckedIndexedAccess`**, **`noImplicitOverride`**, and Angular's **strict templates** (`strictTemplates: true` in `angularCompilerOptions`). **[Documented]**
- Ban `any` via lint; prefer `unknown` + narrowing. Type API responses (generate from OpenAPI/GraphQL where possible). **[Recommended practice]**

## 4. Testing strategy & coverage budgets

A layered "testing trophy/pyramid": **[Recommended practice]**
- **Unit tests** — pure logic, signal stores, pipes, utils. Fast, numerous.
- **Component/integration tests** — components with their template and DI, using the Angular `TestBed`. Test behavior, not implementation.
- **E2E tests** — critical user journeys with **Playwright** (or Cypress). Keep them few and high-value; they're slow and flaky-prone.
- **For micro-frontends:** add **contract/integration tests** that load the composed shell + remotes — unit tests per remote can't catch integration breaks.
- **Coverage budgets** enforced in CI (e.g., fail under a team-agreed threshold such as 80% on changed lines). Track **trend**, not just absolute number; don't chase 100%. **[Recommended practice]**

## 5. Performance budgets

- **Bundle budgets** in `angular.json` so CI fails when the initial bundle grows past a threshold. **[Documented — Angular budgets]**

```jsonc
// angular.json (architect > build > configurations > production > budgets)
"budgets": [
  { "type": "initial", "maximumWarning": "500kb", "maximumError": "1mb" },
  { "type": "anyComponentStyle", "maximumWarning": "4kb", "maximumError": "8kb" }
]
```

- **Runtime performance** **[Documented — angular.dev/best-practices/runtime-performance]**: zoneless change detection or `OnPush` everywhere; signals for fine-grained updates; lazy-load routes; `@defer` heavy/below-the-fold UI; profile with **Angular DevTools** and Chrome DevTools; eliminate "zone pollution"; avoid heavy work in templates (use `computed`).
- **Core Web Vitals** as product SLOs (LCP/INP/CLS); enable **SSR + hydration** (incremental hydration in v19+) for content-heavy/SEO pages. **[Documented — Angular SSR]**
- **CI performance gates** (e.g., Lighthouse CI) on key routes. **[Recommended practice]**

## 6. Accessibility by default

- **WCAG 2.2 AA** as the baseline target. **[Recommended practice]**
- Semantic HTML first; correct ARIA only where needed; manage focus; ensure keyboard operability; use the Angular CDK **a11y** module (focus trap, live announcer). **[Documented — Angular CDK]**
- **Automated a11y checks in CI** (axe via Playwright/Storybook) plus periodic manual/screen-reader audits. **[Recommended practice]**
- Bake a11y into the **design system** so every consuming team inherits accessible components.

## 7. Security baseline

- **Rely on Angular's built-in contextual escaping**; never bypass `DomSanitizer` (`bypassSecurityTrust*`) without review. Avoid `innerHTML` with untrusted data. **[Documented — Angular security]**
- **Content Security Policy** (and Angular's CSP/nonce support for inline styles). **[Documented]**
- **No secrets in the frontend bundle**; auth tokens handled carefully (prefer HttpOnly cookies or secure in-memory patterns); CSRF protection via the HttpClient XSRF support. **[Documented]**
- **Dependency scanning** (npm audit / Snyk / Dependabot) and SCA in CI. **[Recommended practice]**
- **AuthZ enforced on the backend**; frontend route guards are UX, not security. **[Recommended practice]**

## 8. CI/CD pipelines

- **Pipeline stages:** install → lint → typecheck → unit/integration tests → build (with budgets) → e2e → deploy. **[Recommended practice]**
- **In Nx monorepos:** run **`nx affected`** + **remote caching** + **distributed task execution (Nx Agents)** so CI scales with the change, not the repo size. **[Documented — Nx]**
- **In micro-frontends:** each remote and the shell get their **own pipeline**; deploys are independent; add a composed integration test stage. **[Recommended practice]**
- **Environments:** PR preview deploys, staging, production; progressive delivery (canary/blue-green) for risky changes. **[Recommended practice]**

## 9. Feature flags

- Decouple deploy from release with a flag service (LaunchDarkly, Unleash, or in-house). **[Recommended practice]**
- Use for **trunk-based development** (merge incomplete work behind a flag), gradual rollouts, A/B tests, and kill switches.
- **Clean up stale flags** — track them as tech debt; old flags rot into untested branches.
- Implement as an injectable signal-backed service so templates react to flag changes.

## 10. Observability & error tracking

- **Client error tracking** (Sentry/Datadog/etc.) wired through a global `ErrorHandler` and HTTP interceptors. **[Recommended practice]**
- **Source maps uploaded** for readable stack traces; tag errors with release version and (for MFEs) which remote.
- **RUM / performance monitoring** for Web Vitals in the field; structured logging; distributed trace IDs propagated to the backend.
- Define **SLOs and alerting** on error rate and key vitals.

## 11. Versioning & release

- **Conventional Commits → automated semantic versioning & changelogs** (e.g., `semantic-release` / Nx release). **[Recommended practice]** (see `rules-of-working.md`).
- **Shared libraries are versioned**; in MFEs the `exposes` surface is a **versioned contract** — deprecate, don't break. **[Recommended practice]**
- **Track Angular LTS**; schedule regular `ng update` so you never fall multiple majors behind. **[Documented — Angular release/update]**

## Decision / when to use

- **Adopt all of these for any enterprise app**, scaling rigor to risk. A small internal tool needs strict TS + tests + CI; a customer-facing flagship needs the full set (a11y audits, perf gates, observability, feature flags, design-system program).
- **Sequence:** strict TS + lint/format in CI + tests first; then budgets, a11y, security; then design-system program, feature flags, observability as the org grows.

## Best practices

- **Automate enforcement in CI** — budgets, coverage, lint, a11y. Guidance that isn't enforced is ignored.
- **Signals first; add NgRx SignalStore only for genuinely complex state.**
- **Strict everything** (TS + templates) from day one — retrofitting strictness later is expensive.
- **Bake a11y and theming into the design system** so teams inherit them.
- **Keep e2e suites small and stable**; invest in unit/integration coverage.

## Common mistakes / anti-patterns

- **Global store cargo-culting** — NgRx for trivial state adds boilerplate with no benefit. Signals first.
- **Loosening `strict`** to make errors go away — you're deferring bugs to runtime.
- **Treating a11y/security/perf as a "later" phase** — they become near-impossible to retrofit.
- **No performance budgets** — bundles silently bloat until startup is slow.
- **Bypassing the sanitizer** (`bypassSecurityTrust*`) casually → XSS.
- **Feature-flag debt** — flags added but never removed.
- **Copy-pasted UI instead of a design system** — inconsistent UX and N places to fix every bug.
- **E2E-heavy test pyramid** — slow, flaky CI that teams learn to ignore.
