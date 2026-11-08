# Project conventions — Angular v21/v22 (for AI assistants)

> Copy this file to the **root of your Angular project**. Claude Code (and other agents)
> read `CLAUDE.md` automatically and apply it as standing instructions.

This is a modern **Angular v21/v22** application. Build everything with current idioms only.
When a task matches one of the installed Angular skills (from the plugin or `.claude/skills/`), use it.

## Non-negotiable rules

- **Standalone only.** No `NgModule`. Bootstrap with `bootstrapApplication` + `app.config.ts`.
- **Signals for state.** Use `signal` / `computed` / `effect`, `linkedSignal` for writable
  derived state. Use `effect` for side effects only — never to compute values other code reads.
- **Zoneless.** `provideZonelessChangeDetection()` is on; do not rely on Zone.js. No
  `NgZone.onStable`/`isStable` — use `afterNextRender`/`afterEveryRender` for browser-only work.
- **`ChangeDetectionStrategy.OnPush`** on every component. It is the default in v22; keep it
  explicit so the code also runs on v21.
- **Built-in control flow** `@if` / `@for` (with `track`) / `@switch`. Never `*ngIf` / `*ngFor` /
  `*ngSwitch` / `ngClass` / `ngStyle` (use class/style bindings).
- **`inject()`** for dependencies — not constructor parameter injection.
- **Signal component APIs**: `input()` / `input.required()`, `output()`, `model()`,
  `viewChild()` / `contentChild()`. Never `@Input()` / `@Output()` / `@ViewChild()`.
- **Services**: `@Injectable({ providedIn: 'root' })` (or `@Service()` in v22). Stateless where
  possible; expose signals, not subjects, for component-facing state.
- **HTTP**: `provideHttpClient(withInterceptors([...]))` (on v21, also add `withFetch()`). Functional interceptors
  only. Use `httpResource()` (experimental on v21) for reactive read/GET data in components; `HttpClient` for mutations.
- **Routing**: `provideRouter` with `withComponentInputBinding()`. Lazy-load with
  `loadComponent` / `loadChildren`. Functional guards/resolvers (`CanActivateFn`, `ResolveFn`).
- **Forms**: prefer typed Reactive Forms or Signal Forms (`@angular/forms/signals`, experimental on v21). Always typed.
- **Filenames have no type suffix** (current Style Guide): `user-profile.ts`, `auth.ts`,
  `cart-store.ts` — not `user-profile.component.ts` / `auth.service.ts`. Class names keep the
  suffix only where idiomatic (e.g. `UserProfile`, `AuthInterceptor`).
- **Templates**: keep logic out of templates; bind to `computed` signals. ARIA via `[attr.aria-*]`
  for dynamic values. Accessibility is a requirement, not an afterthought.
- **Strict TypeScript**: no `any`; honor `strictTemplates` / `strictStandalone`.

## Architecture

- Feature-based folders: `core/`, `shared/`, `features/<domain>/`. Co-locate component, template,
  styles, and tests. See the `angular-architecture-at-scale` skill before adding cross-feature deps.
- For monorepos use Nx with `feature` / `ui` / `data-access` / `util` library types and enforced
  module boundaries. For micro-frontends use Native Federation (see the same skill).

## Testing

- **Vitest** (default runner for new CLI projects) with `TestBed`. Test behavior, not internals.
- Use component/CDK **harnesses** for Material/CDK components.

## Workflow

- Lint + format must pass (`ng lint`, Prettier) before a change is "done".
- Conventional Commits. Keep PRs small and focused.
- When unsure about an API, consult the matching `angular-*` skill's references rather
  than guessing — these are grounded in the official angular.dev docs for v21/v22.
