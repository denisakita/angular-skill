---
name: angular-new-app
description: Use this skill when scaffolding a brand-new modern Angular (v21/v22) application from scratch — installing the CLI, running `ng new`, understanding the generated project, and writing the first standalone, signal-based component.
license: MIT
metadata:
  source: https://angular.dev/installation
  angularVersion: '21-22'
  version: '1.0'
---

# angular-new-app

This skill helps you create a brand-new, modern Angular application targeting Angular v21/v22. It is grounded strictly in the official documentation at angular.dev. Everything here uses current idioms: standalone components (no NgModules), signals for state, the built-in control flow blocks `@if`/`@for`, the `inject()` function for dependency injection, and `bootstrapApplication` with an `ApplicationConfig` for setup. Zoneless change detection is the default in Angular v21+.

Use the reference files below for detailed, copy-ready guidance on each phase of creating a new app.

## Reference files

- `references/creating-a-project.md` — Prerequisites, installing the Angular CLI, the `ng new` command and its documented flags, and starting the dev server.
- `references/project-structure.md` — The default file and folder layout the CLI generates for a new workspace.
- `references/app-configuration.md` — `app.config.ts` / `ApplicationConfig`, common provider functions, and bootstrapping in `main.ts`.
- `references/first-steps.md` — Writing your first standalone component: signals, templates with `@if`/`@for`, bindings/events, and dependency injection via `inject()`.

## Core rules

- Require a supported Node.js before installing the CLI: `^22.22.3`, `^24.15.0` or `>=26.0.0` for Angular 22, and `^20.19.0`, `^22.12.0` or `>=24.0.0` for Angular 21.
- Install the CLI globally with `npm install -g @angular/cli`, then scaffold with `ng new <project-name>`.
- Always build standalone — components declare their own `imports`; there are no NgModules in a new app.
- Bootstrap the app with `bootstrapApplication(App, appConfig)` in `main.ts`; configure providers in `app.config.ts`.
- Manage component state with `signal()`, derive values with `computed()`, and read a signal by calling it (`value()`).
- Use the built-in control flow blocks `@if` / `@for` in templates; `@for` requires a `track` expression.
- Bind data with `{{ }}` (interpolation), `[prop]` (property binding), and `(event)` (event binding).
- Inject dependencies with the `inject()` function rather than constructor parameters in new code.
- Do not invent CLI flags or APIs — only use options the official docs document.
