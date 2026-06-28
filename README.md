# Angular Agent Skills (v21 / v22)

A library of [Agent Skills](https://www.anthropic.com/news/skills) for building and reviewing
**modern Angular** applications. Every skill is grounded strictly in the official
[angular.dev](https://angular.dev) documentation and targets the current supported releases:

- **Angular 22** — latest stable (released June 3, 2026)
- **Angular 21** — LTS (released November 20, 2025; LTS through May 2027)

All skills assume **modern idioms only**: standalone components (no NgModules), signals,
built-in control flow (`@if` / `@for` / `@switch`), `inject()`, the `input()` / `output()` /
`model()` functions, signal queries, `OnPush` / zoneless change detection, and functional
guards/interceptors. Legacy APIs are noted only as "do not use in new code."

## How skills work

Each skill is a folder containing:

- `SKILL.md` — a lean orchestrator: YAML frontmatter (loaded first by the agent) + an intro,
  a **Reference files** dependency list, and **Core rules**.
- `references/*.md` — focused topic files loaded on demand, each with explanation, correct
  modern code examples, **Best practices**, and **Common mistakes**.

An agent reads the frontmatter to decide relevance, then pulls in only the reference files it
needs for the task — keeping token use low.

## Skill index

### Core framework

| Skill | Use it for |
| --- | --- |
| [angular-components](angular-components/SKILL.md) | Components & selectors, signal inputs/outputs/`model`, content projection, host bindings, lifecycle, signal queries, styling, programmatic rendering |
| [angular-templates](angular-templates/SKILL.md) | Bindings, event listeners, two-way binding, `@if`/`@for`/`@switch`, `@let`, `@defer`, pipes, expression syntax |
| [angular-directives](angular-directives/SKILL.md) | Attribute & structural directives, directive composition (`hostDirectives`), `NgOptimizedImage` |
| [angular-signals](angular-signals/SKILL.md) | `signal`/`computed`/`effect`, `linkedSignal`, `resource`/`rxResource`/`httpResource`, RxJS interop |
| [angular-dependency-injection](angular-dependency-injection/SKILL.md) | Services, `inject()`, providers, `InjectionToken`, injection context, hierarchical injectors |
| [angular-routing](angular-routing/SKILL.md) | Defining routes, lazy loading, outlets, navigation, route state, functional guards & resolvers, transitions |
| [angular-forms](angular-forms/SKILL.md) | Reactive, template-driven, typed, dynamic forms, validation, and the new **Signal Forms** API |
| [angular-http](angular-http/SKILL.md) | `provideHttpClient()`, requests, functional interceptors, `httpResource()`, HTTP testing |

### Platform & tooling

| Skill | Use it for |
| --- | --- |
| [angular-ssr](angular-ssr/SKILL.md) | Server-side & hybrid rendering, hydration, incremental hydration, render modes (SSR/SSG/CSR) |
| [angular-testing](angular-testing/SKILL.md) | TestBed + Vitest (and Jasmine/Karma), components/services/directives/pipes, harnesses, coverage |
| [angular-animations](angular-animations/SKILL.md) | Native CSS animations, route transitions (View Transitions API), migrating off `@angular/animations` |
| [angular-i18n](angular-i18n/SKILL.md) | Marking/extracting text, translation files, locale-aware formatting, per-locale builds & deploy |
| [angular-accessibility](angular-accessibility/SKILL.md) | ARIA bindings, focus & keyboard navigation, the headless `@angular/aria` primitives |
| [angular-zoneless](angular-zoneless/SKILL.md) | Enabling/migrating to zoneless change detection (`provideZonelessChangeDetection()`) |
| [angular-performance](angular-performance/SKILL.md) | Change detection, deferrable views, image/bundle optimization, lazy routing, SSR/hydration |
| [angular-security](angular-security/SKILL.md) | XSS/sanitization, CSP & Trusted Types, HttpClient XSRF protection |
| [angular-cli](angular-cli/SKILL.md) | `ng` generate/build/serve/test/add/update, schematics, environments, MCP server |
| [angular-new-app](angular-new-app/SKILL.md) | Scaffolding a brand-new app: `ng new`, project structure, app config, first component |

### Guidance (best practices, patterns, rules, principles)

| Skill | Use it for |
| --- | --- |
| [angular-best-practices](angular-best-practices/SKILL.md) | Official best practices: performance, change detection, error handling, security, staying current |
| [angular-design-patterns](angular-design-patterns/SKILL.md) | Idiomatic signal-based, standalone patterns: components, state, services/DI, data loading, architecture |
| [angular-code-rules](angular-code-rules/SKILL.md) | Official Angular Style Guide: naming, file/folder structure, coding rules |
| [angular-principles](angular-principles/SKILL.md) | Guiding principles: signals-first, standalone-by-default, type-safety, DI, architecture |

### Architecture at scale (monolith & micro-frontends)

| Skill | Use it for |
| --- | --- |
| [angular-architecture-at-scale](angular-architecture-at-scale/SKILL.md) | Large-app architecture: modular monolith & Nx monorepo vs micro-frontends (Native/Module Federation), enterprise practices, and team rules of working |

## Sourcing & accuracy

All content is grounded in the official documentation at [angular.dev](https://angular.dev)
(fetched June 2026). Key version-specific facts verified during authoring:

- **Signal Forms** (`@angular/forms/signals`) — stable in v22; full API captured in `angular-forms`.
- **`@Service()` decorator, `autoProvided`, `injectAsync`** — genuine v22 additions, documented
  alongside the classic `@Injectable({ providedIn: 'root' })` in `angular-dependency-injection`.
- **Zoneless change detection** — default for new projects in v21; covered in `angular-zoneless`.
- **Native CSS animations** — `@angular/animations` is deprecated (v20.2+); see `angular-animations`.
- **Vitest** — the default test runner for new CLI projects in v21/v22; see `angular-testing`.
- **Style Guide** — modern filenames drop type suffixes (e.g. `user-profile.ts`,
  not `user-profile.component.ts`); see `angular-code-rules`.

## Starter kit (turn-key setup)

The [`starter-kit/`](starter-kit/) folder makes new projects copy-paste ready (all config
verified against official docs, June 2026):

- [`SETUP.md`](starter-kit/SETUP.md) — one-command `ng new` recipe + steps tying it together
- [`CLAUDE.md`](starter-kit/CLAUDE.md) — conventions file Claude auto-reads; copy to your project root
- [`eslint.config.js`](starter-kit/eslint.config.js) — angular-eslint flat config (a11y + modern-idiom rules)
- [`.prettierrc.json`](starter-kit/.prettierrc.json) — formatting
- [`tsconfig.strict.json`](starter-kit/tsconfig.strict.json) — strict TS + Angular strict templates
- [`CODEOWNERS`](starter-kit/CODEOWNERS) — review governance
- [`federation.config.js`](starter-kit/federation.config.js) — Native Federation (micro-frontends only)
- [`templates/`](starter-kit/templates/) — sample `app.config.ts`, `app.routes.ts`, root `app.ts`, and a first feature component (`user-profile` + signal `data-access` store)

## Usage

- **Claude Code / agents:** copy or symlink the skill folders you want into your project's
  `.claude/skills/` directory (or a global skills directory).
- **Other agentic tools** (Gemini CLI, etc.): the `SKILL.md` + `references/` layout follows the
  open Agent Skills format and works wherever that format is supported.

## License

MIT (per each skill's frontmatter).
