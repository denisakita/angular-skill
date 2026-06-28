# Architecture Principles

How to structure components, services, and features. Grounded in angular.dev overview, essentials/components, and style guide.

## 1. Dependency injection with inject()

**Rationale:** DI lets you "easily share code across components throughout your entire application." The `inject()` function offers better readability, type inference, and syntactic clarity than constructor parameters.

```typescript
private readonly users = inject(UserService);
```

- DO use the `inject()` function to obtain dependencies.
- DO provide services via `providedIn: 'root'` (tree-shakable) unless a narrower scope is required.
- DON'T inject through constructor parameters in new code.

## 2. Component composition

**Rationale:** "Angular components make it easy to split your code into well-encapsulated parts." Build pages from small, reusable components wired together through inputs/outputs and explicit `imports`.

```typescript
@Component({ selector: 'user-profile', imports: [ProfilePhoto], template: `<profile-photo />` })
export class UserProfile {}
```

- DO compose UI from small components and pass data via `input()` / `model()` / `output()`.
- DO mark Angular-initialized members (`input()`, `model()`, `output()`, queries) as `readonly`.
- DON'T build large monolithic components that mix many responsibilities.

## 3. Single responsibility

**Rationale:** "Prefer focusing source files on a single concept" — typically one component, directive, or service per file. Focused files are easier to name, test, and reuse.

```typescript
// user-profile.ts  -> one component; validation lives in its own file/function
```

- DO keep one concept per file with hyphenated names (`user-profile.ts`, `user-profile.spec.ts`).
- DO keep lifecycle hooks simple, delegating to well-named methods.
- DON'T mix unrelated concerns or put business logic in `ngOnInit()`.

## 4. Accessibility by default

**Rationale:** Angular favors clean, semantic templates ("prefer `class` and `style` over `ngClass`/`ngStyle`"); building accessibility in from the start makes apps usable by everyone and avoids costly retrofits.

```typescript
// name handlers for the action, not the event
saveUserData() { /* ... */ }
```

- DO use semantic HTML, labels, and ARIA attributes; name event handlers for the action performed (`saveUserData()` not `handleClick()`).
- DO use the built-in control flow (`@if` / `@for` / `@switch`) to keep templates readable.
- DON'T rely on non-semantic elements or unlabeled interactive controls.

## 5. Lazy loading and feature organization

**Rationale:** Angular's router provides "lazy-loading" so initial bundles stay small and features load on demand. Organizing by feature area (not by file type) keeps related code together as the app scales.

```typescript
{ path: 'admin', loadComponent: () => import('./admin/admin').then(m => m.Admin) }
```

- DO organize source by feature area and lazy-load routes with `loadComponent` / `loadChildren`.
- DO group closely related files (component, template, styles, tests) in one directory.
- DON'T create type-based folders (`components/`, `services/`, `directives/`) or a single global `tests/` directory.
