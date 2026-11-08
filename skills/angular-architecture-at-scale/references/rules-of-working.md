# Rules of Working (team governance for large Angular teams)

How big teams keep a shared codebase healthy. These are the social + automated contracts that make many people working in one repo (or across federated repos) sustainable. Most items are **[Recommended practice]** (industry-standard governance); tool features are noted as **[Documented]** where applicable.

## 1. Code ownership (CODEOWNERS)

- A **`CODEOWNERS`** file maps paths/libraries to owning teams; GitHub/GitLab auto-requests the right reviewers. **[Documented — platform feature]**
- **Align ownership with architecture boundaries:** in an Nx monorepo, each `scope:` maps to a team; in MFEs, each remote has an owner.

```
# .github/CODEOWNERS
/libs/bookings/        @org/bookings-team
/libs/catalog/         @org/catalog-team
/libs/shared/ui/       @org/design-system-team   # design system needs guardians
/apps/booking-web/     @org/bookings-team
*                      @org/frontend-architects   # fallback reviewers
```

- **Shared/foundational libraries** (design system, shared util) should require review from a dedicated guardian team — changes there ripple everywhere.

## 2. PR review rules

- **All changes via PR; no direct pushes to `main`** (branch protection). **[Documented — platform feature]**
- **Minimum approvals** (commonly 1–2), at least one from a **CODEOWNER**.
- **Required status checks** must pass before merge: lint, typecheck, tests, build/budgets. **[Documented — platform feature]**
- **Keep PRs small and focused** (use feature flags to merge incomplete work). Reviewable PRs get better reviews.
- **PR template** prompting: what/why, screenshots for UI, testing done, ADR link if architectural, checklist for the Definition of Done.
- **Author responds to every comment**; reviewers review promptly (team SLA, e.g., within one business day).

## 3. Linting & formatting enforced in CI

- **ESLint + `angular-eslint`** for Angular-aware rules; **`@nx/enforce-module-boundaries`** for architecture boundaries (see `modular-monolith-and-monorepo.md`). **[Documented]**
- **Prettier** for formatting — eliminates style debates; run via lint-staged on commit and verify in CI.
- **CI fails on lint/format violations** — formatting is not a review topic, it's automated.

```jsonc
// .lintstagedrc — pre-commit
{ "*.{ts,html,scss,css,json,md}": ["prettier --write"], "*.ts": ["eslint --fix"] }
```

- Run **`nx affected -t lint`** so only impacted projects lint in CI. **[Documented — Nx]**

## 4. Commit conventions + semantic versioning

- **Conventional Commits** (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`, `BREAKING CHANGE:`). **[Documented — Conventional Commits spec]**
- Enforce with **commitlint** + Husky `commit-msg` hook. **[Documented — tool]**
- Drives **automated semantic versioning + changelog** (`semantic-release` or **Nx release**): `fix:`→patch, `feat:`→minor, `BREAKING CHANGE:`→major. **[Documented — semver / tooling]**

```
feat(bookings): add seat-selection step

Adds an interactive seat map to the booking flow.

BREAKING CHANGE: BookingStore.create() now requires a seatId.
```

## 5. Branching strategy

- **Trunk-based development** is the modern default at scale: short-lived branches off `main`, merged within ~1–2 days, incomplete work behind **feature flags**. Pairs naturally with monorepos + CI. **[Recommended practice]**
- **GitHub Flow** (feature branch → PR → merge → deploy) is a fine lighter-weight variant.
- Avoid long-lived release branches and heavy Git Flow unless you ship versioned desktop-style releases — they cause painful merges in a monorepo.
- **Protected `main`**, linear history (squash-merge is common), required checks.

## 6. Dependency update policy

- **Automate updates with Renovate or Dependabot** — grouped PRs, scheduled, auto-merge for green low-risk updates (patches/dev deps). **[Documented — tools]**
- **Angular/CLI/Nx upgrades via their migration tools:** `ng update` and `nx migrate` run code mods — do **not** hand-bump Angular versions. **[Documented]**
- **Track Angular LTS**; schedule each major within its support window so you never fall multiple majors behind. **[Documented — Angular support policy]**
- **Single-version policy** in the monorepo — one version of each third-party dep across all projects. **[Documented — Nx]**
- Security advisories patched on an SLA (e.g., criticals within days).

## 7. Architecture Decision Records (ADRs)

- Record significant decisions as short, immutable **ADRs** in-repo (`docs/adr/0001-use-nx-monorepo.md`). **[Recommended practice — Nygard ADR format]**
- Template: **Context → Decision → Status (proposed/accepted/superseded) → Consequences.**
- Write an ADR for: choosing monolith vs monorepo vs MFE, state-management choice, adopting Native Federation, design-system tech, testing tooling. Supersede rather than edit accepted ADRs.
- Makes onboarding faster and stops re-litigating settled choices.

## 8. Definition of Done (DoD)

A shared checklist a change must satisfy before it's "done": **[Recommended practice]**
- [ ] Meets acceptance criteria; code reviewed and approved by a CODEOWNER.
- [ ] Unit/integration tests added; coverage budget met; e2e for critical journeys.
- [ ] Lint, typecheck, format, build, and **boundary rules** pass in CI.
- [ ] Performance budgets respected; no significant Web Vitals regression.
- [ ] Accessibility checked (axe + keyboard); design-system components reused where applicable.
- [ ] Security considered (no sanitizer bypass, no secrets, deps clean).
- [ ] Docs/Storybook updated; ADR added if architectural; feature flagged if incomplete.
- [ ] Telemetry/error tracking in place for new flows.

## 9. Onboarding docs

- A living **`README` / `CONTRIBUTING.md`** + a `docs/` (or wiki) covering: local setup, architecture overview, the ADR index, the four library types + tag conventions, the DoD, branching/commit rules, and "where do I put this code?" guidance. **[Recommended practice]**
- **Codify, don't tribal-knowledge:** boundaries in lint, formatting in Prettier, conventions in generators (`nx generate` custom schematics) so new devs fall into the pit of success.
- Keep an **architecture diagram** (Nx project graph `nx graph` is free and always current). **[Documented — Nx]**

## Decision / when to use

- **Every multi-person team needs:** CODEOWNERS, PR reviews + branch protection, lint/format in CI, Conventional Commits, a branching strategy, a dependency policy, and a DoD. These are table stakes.
- **Add ADRs and formal onboarding docs** as soon as more than one team touches the repo or decisions start getting re-debated.
- **Scale review rigor to blast radius:** stricter ownership/approvals on shared/foundational libraries and (in MFEs) on exposed contracts.

## Best practices

- **Automate the rules** — boundaries, formatting, commit format, coverage, budgets all enforced in CI, not by reviewers' memory.
- **Small PRs + trunk-based + feature flags** keep flow fast and reviews meaningful.
- **CODEOWNERS mirrors the architecture** (scopes/remotes → teams).
- **Use the framework's migration tools** (`ng update`, `nx migrate`) and stay within LTS.
- **Write decisions down (ADRs)** and keep onboarding docs living.

## Common mistakes / anti-patterns

- **Rules that live only in a wiki** nobody reads — if it's not enforced in CI, it doesn't exist.
- **Giant long-lived branches** → merge hell (especially in monorepos). Prefer trunk-based + flags.
- **Manual Angular version bumps** instead of `ng update` → broken builds and skipped migrations.
- **No CODEOWNERS / everyone owns everything** → no real review of shared libraries.
- **Bikeshedding formatting in reviews** instead of delegating to Prettier.
- **Falling years behind on Angular** because upgrades were never scheduled — the jump becomes a project.
- **No Definition of Done** → inconsistent quality and "done means different things to different people."
- **Skipping ADRs** → the same architectural debates resurface every quarter.
