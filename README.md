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

## Install

In Claude Code, run:

```
/plugin marketplace add denisakita/angular-skill
/plugin install angular-skill@angular-skill
```

All 23 skills then work in every project. Claude picks the right one from your request, or
you can call one by name, such as `/angular-skill:angular-signals`.

To copy the files yourself or use another tool, see [HOW-TO-USE.md](HOW-TO-USE.md).

## How this differs from the official Angular skills

Angular publishes its own skills at [angular/skills](https://github.com/angular/skills). At the
time of writing (November 2026), that repo has two broad skills, `angular-developer` and
`angular-new-app`. Start there if you want the official guidance.

This library goes deeper: 23 focused skills, one per topic, plus a [starter kit](starter-kit/)
with ready-made config and sample code. Because each skill covers one topic, your agent loads
only what the task needs.

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

| Skill                                                                 | Use it for                                                                                                                                           |
|-----------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| [angular-components](skills/angular-components/SKILL.md)                     | Components & selectors, signal inputs/outputs/`model`, content projection, host bindings, lifecycle, signal queries, styling, programmatic rendering |
| [angular-templates](skills/angular-templates/SKILL.md)                       | Bindings, event listeners, two-way binding, `@if`/`@for`/`@switch`, `@let`, `@defer`, pipes, expression syntax                                       |
| [angular-directives](skills/angular-directives/SKILL.md)                     | Attribute & structural directives, directive composition (`hostDirectives`), `NgOptimizedImage`                                                      |
| [angular-signals](skills/angular-signals/SKILL.md)                           | `signal`/`computed`/`effect`, `linkedSignal`, `resource`/`rxResource`/`httpResource`, RxJS interop                                                   |
| [angular-dependency-injection](skills/angular-dependency-injection/SKILL.md) | Services, `inject()`, providers, `InjectionToken`, injection context, hierarchical injectors                                                         |
| [angular-routing](skills/angular-routing/SKILL.md)                           | Defining routes, lazy loading, outlets, navigation, route state, functional guards & resolvers, transitions                                          |
| [angular-forms](skills/angular-forms/SKILL.md)                               | Reactive, template-driven, typed, dynamic forms, validation, and the new **Signal Forms** API                                                        |
| [angular-http](skills/angular-http/SKILL.md)                                 | `provideHttpClient()`, requests, functional interceptors, `httpResource()`, HTTP testing                                                             |

### Platform & tooling

| Skill                                                   | Use it for                                                                                           |
|---------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| [angular-ssr](skills/angular-ssr/SKILL.md)                     | Server-side & hybrid rendering, hydration, incremental hydration, render modes (SSR/SSG/CSR)         |
| [angular-testing](skills/angular-testing/SKILL.md)             | TestBed + Vitest (and Jasmine/Karma), components/services/directives/pipes, harnesses, coverage      |
| [angular-animations](skills/angular-animations/SKILL.md)       | Native CSS animations, route transitions (View Transitions API), migrating off `@angular/animations` |
| [angular-i18n](skills/angular-i18n/SKILL.md)                   | Marking/extracting text, translation files, locale-aware formatting, per-locale builds & deploy      |
| [angular-accessibility](skills/angular-accessibility/SKILL.md) | ARIA bindings, focus & keyboard navigation, the headless `@angular/aria` primitives                  |
| [angular-zoneless](skills/angular-zoneless/SKILL.md)           | Enabling/migrating to zoneless change detection (`provideZonelessChangeDetection()`)                 |
| [angular-performance](skills/angular-performance/SKILL.md)     | Change detection, deferrable views, image/bundle optimization, lazy routing, SSR/hydration           |
| [angular-security](skills/angular-security/SKILL.md)           | XSS/sanitization, CSP & Trusted Types, HttpClient XSRF protection                                    |
| [angular-cli](skills/angular-cli/SKILL.md)                     | `ng` generate/build/serve/test/add/update, schematics, environments, MCP server                      |
| [angular-new-app](skills/angular-new-app/SKILL.md)             | Scaffolding a brand-new app: `ng new`, project structure, app config, first component                |

### Guidance (best practices, patterns, rules, principles)

| Skill                                                       | Use it for                                                                                              |
|-------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| [angular-best-practices](skills/angular-best-practices/SKILL.md)   | Official best practices: performance, change detection, error handling, security, staying current       |
| [angular-design-patterns](skills/angular-design-patterns/SKILL.md) | Idiomatic signal-based, standalone patterns: components, state, services/DI, data loading, architecture |
| [angular-code-rules](skills/angular-code-rules/SKILL.md)           | Official Angular Style Guide: naming, file/folder structure, coding rules                               |
| [angular-principles](skills/angular-principles/SKILL.md)           | Guiding principles: signals-first, standalone-by-default, type-safety, DI, architecture                 |

### Architecture at scale (monolith & micro-frontends)

| Skill                                                                   | Use it for                                                                                                                                            |
|-------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| [angular-architecture-at-scale](skills/angular-architecture-at-scale/SKILL.md) | Large-app architecture: modular monolith & Nx monorepo vs micro-frontends (Native/Module Federation), enterprise practices, and team rules of working |

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
- [`templates/`](starter-kit/templates/) — sample `app.config.ts`, `app.routes.ts`, root `app.ts`, and a first feature
  component (`user-profile` + signal `data-access` store)

## Usage

- **Claude Code:** install the plugin as shown in [Install](#install), or copy or symlink the
  folders you want from `skills/` into your project's `.claude/skills/` directory.
- **Other agentic tools** (Gemini CLI, etc.): the `SKILL.md` + `references/` layout follows the
  open Agent Skills format and works wherever that format is supported.

## License

[MIT](LICENSE) © 2026 [denisakita](https://github.com/denisakita) (also declared per each skill's frontmatter).
