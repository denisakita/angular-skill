# Building and Serving

## `ng build`

`ng build` compiles TypeScript to JavaScript and optimizes, bundles, and minifies the output. It "executes the builder for the `build` target in the default project as specified in `angular.json`." The build uses the **production configuration by default**, which enables:

- Ahead-of-Time (AOT) compilation of component templates.
- Bundling — concatenating files into minimal deployable files.
- Minification — removing excess whitespace and comments.
- Dead code elimination — removing unreferenced modules.

```bash
# Production build (default)
ng build

# Build with a named configuration
ng build --configuration development
ng build --configuration production

# Rebuild on changes
ng build --watch
```

Build output goes to `dist/${PROJECT_NAME}` by default and is configurable via the `outputPath` option.

### Builders

The CLI ships four builders for build targets:

- **`@angular/build:application`** — Builds an application with a client-side bundle, a Node server, and build-time prerendered routes, using **esbuild**. This is the default for new applications.
- **`@angular-devkit/build-angular:browser-esbuild`** — Bundles client-side applications with esbuild.
- **`@angular-devkit/build-angular:browser`** — Bundles client-side applications with **webpack** (legacy).
- **`@angular/build:ng-packagr`** — Builds an Angular library following the Angular Package Format (default for libraries).

### Size budgets

Define thresholds in `angular.json` under `budgets` to keep the bundle size in check:

```json
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "250kb",
    "maximumError": "500kb"
  }
]
```

Budget `type` values: `bundle`, `initial`, `allScript`, `all`, `anyComponentStyle`, `anyScript`, and `any`.

### Other build notes

- **CommonJS dependencies:** Angular warns about CommonJS deps. Suppress per-module by adding names to `allowedCommonJsDependencies` in the build options.
- **Browser compatibility:** Targets are derived from Browserslist.
- **Critical CSS inlining** is enabled by default to improve First Contentful Paint.

## `ng serve`

`ng serve` "compiles your application, skips unnecessary optimizations, starts a devserver, and automatically rebuilds and live reloads any subsequent changes." Stop it with `Ctrl+C`. By default it uses the **`@angular/build:dev-server`** builder, which is based on **Vite**.

```bash
ng serve
ng serve --open          # open the browser at http://localhost:4200/
ng s                     # alias
ng dev                   # alias
```

The serve target lives in `angular.json` under the project's `serve` target and typically extends the build options.

### Proxy configuration

To route certain URLs to a backend during development:

1. Create `src/proxy.conf.json`:

```json
{
  "/api/**": {
    "target": "http://localhost:3000",
    "secure": false
  }
}
```

2. Reference it in `angular.json`:

```json
"serve": {
  "builder": "@angular/build:dev-server",
  "options": {
    "proxyConfig": "src/proxy.conf.json"
  }
}
```

3. Run `ng serve`. **Proxy changes require restarting `ng serve`.**

Path-matching with the Vite-based dev server:

- `/api` matches only `/api`.
- `/api/*` matches `/api/users` but not `/api/users/123`.
- `/api/**` matches `/api/users` and `/api/users/123`.

## Workspace target structure (`angular.json`)

Each project's `architect` (targets) section defines builders. A build target specifies:

- `"builder"` — the npm package executing the target (e.g. `"@angular/build:application"`).
- `"options"` — default settings (e.g. `assets`, `styles`, `scripts`, `optimization`, `sourceMap`, `index`, `outputPath`).
- `"configurations"` — named alternates such as `production` and `development`.

Multiple configurations apply left-to-right, with the rightmost values taking precedence.

## Best practices

- Use the default `@angular/build:application` (esbuild/Vite) builder for new apps; reserve the webpack `browser` builder for legacy projects that still need it.
- Keep `ng serve` for development (fast rebuilds, live reload) and `ng build` for deployable output — don't try to serve a production bundle for day-to-day work.
- Set and enforce `budgets` so bundle-size regressions fail the build instead of shipping silently.
- Configure backend calls through `proxyConfig` rather than hard-coding `localhost` URLs in code.
- Verify deployable output with a production `ng build` before deploying, since `ng serve` skips some optimizations.

## Common mistakes

- Expecting `ng serve` output to match production — it intentionally skips optimizations.
- Forgetting to restart `ng serve` after editing `proxy.conf.json` (changes are not hot-reloaded).
- Using single-segment globs (`/api/*`) and being surprised that nested paths like `/api/users/123` are not matched — use `/api/**`.
- Assuming `ng build` produces a debug build; it uses the production configuration by default.
- Adding heavy CommonJS dependencies and ignoring the bundle-size/CommonJS warnings instead of addressing them or allow-listing them deliberately.
