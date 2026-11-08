# Project structure of a new Angular app

When you run `ng new my-app`, the CLI generates a workspace containing one application plus the configuration needed to build, serve, and test it. A new app uses standalone APIs — there is no `app.module.ts`.

## Default layout

```
my-app/
├── src/
│   ├── app/
│   │   ├── app.ts            # Root component class (App)
│   │   ├── app.html          # Root component template
│   │   ├── app.css           # Root component styles
│   │   ├── app.config.ts     # ApplicationConfig with providers
│   │   └── app.routes.ts     # Route definitions (when routing is enabled)
│   ├── main.ts               # Entry point — bootstraps the app
│   ├── index.html            # Host HTML page (<app-root> lives here)
│   └── styles.css            # Global application styles
├── public/                   # Static assets served as-is
├── angular.json              # Workspace & build/serve/test configuration
├── package.json              # Dependencies and npm scripts (start, build, test)
├── tsconfig.json             # Base TypeScript configuration
└── README.md
```

> Exact file extensions depend on the options you chose. For example, `--style=scss` produces `app.scss` / `styles.scss`, and `--inline-style` / `--inline-template` keep styles or the template inside `app.ts` instead of separate files.

## Key files

- **`src/main.ts`** — The application entry point. It calls `bootstrapApplication()` with the root component and the application config.
- **`src/index.html`** — The single host page loaded in the browser. It contains the root component's element (its selector, e.g. `<app-root>`).
- **`src/app/app.ts`** — The root standalone component class. It carries the `@Component` decorator, template, styles, and `imports`.
- **`src/app/app.config.ts`** — Exports an `ApplicationConfig` object listing the application's providers (router, HTTP client, zoneless change detection, etc.).
- **`src/app/app.routes.ts`** — The route table, present when routing is enabled. Wired up via `provideRouter(routes)`.
- **`src/styles.css`** — Global styles applied across the whole application.
- **`public/`** — Static assets (images, fonts, `favicon.ico`) copied to the build output untouched.
- **`angular.json`** — Workspace configuration: build, serve, and test targets and their options.
- **`package.json`** — Project dependencies and scripts; `npm start` runs the dev server, `npm run build` builds, `npm test` runs unit tests.
- **`tsconfig.json`** — TypeScript compiler options shared by the workspace.

## Best practices

- Put feature code under `src/app/` and group related components, services, and routes by feature.
- Place static assets in `public/` so they are served as-is.
- Keep app-wide styles in `src/styles.css` (or `.scss`) and component-specific styles with the component.
- Centralize cross-cutting configuration (providers) in `app.config.ts` rather than scattering it.
- Define routes in `app.routes.ts` and register them through `provideRouter` in the config.

## Common mistakes

- Looking for an `app.module.ts` — modern apps are standalone and don't have one.
- Editing `src/index.html` for application logic instead of treating it as a static host page.
- Storing assets outside `public/` and then finding they aren't included in the build.
- Hand-editing `angular.json` build paths when a CLI flag or generator would do it correctly.
- Assuming fixed extensions — they vary based on the `--style`, `--inline-style`, and `--inline-template` choices.
