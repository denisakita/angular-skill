---
name: angular-dependency-injection
description: Use when working with Angular dependency injection — creating services, injecting with inject(), configuring providers, defining InjectionTokens, running code in an injection context, and scoping dependencies through hierarchical injectors (Angular v21/v22).
license: MIT
metadata:
  source: https://angular.dev/guide/di
  angularVersion: '21-22'
  version: '1.0'
---

# Angular Dependency Injection

Dependency Injection (DI) is a design pattern for organizing and sharing code by supplying a class's dependencies to it instead of having the class create them itself. A dependency is any object, value, function, or service a class needs to work.

DI gives you: improved maintainability through separation of concerns, scalability via reusable modular code, and better testing by swapping real implementations for test doubles.

This skill targets modern Angular (v21/v22): the `inject()` function, the `@Service()` decorator (the ergonomic successor to `@Injectable({providedIn: 'root'})`), `InjectionToken`, injection context, hierarchical injectors, lazy-loaded services via `injectAsync`, and lightweight injection tokens. `@Service()`, its `autoProvided` option and `injectAsync` need v22 or later; on v21, use `@Injectable({providedIn: 'root'})` instead of `@Service()`.

## Reference files

Read the file that matches your task:

- `references/fundamentals.md` — What DI is, services, `inject()`, where injection works, the two-step mental model.
- `references/creating-services.md` — Creating injectable services with `@Service()` / `@Injectable`, factory functions, `autoProvided`, injecting services into services.
- `references/providers.md` — `useClass`, `useValue`, `useFactory`, `useExisting`, `multi`, `InjectionToken`, provider scoping levels, the `provide*` library pattern.
- `references/injection-context.md` — What an injection context is, where it exists, `runInInjectionContext`, `assertInInjectionContext`, error NG0203.
- `references/hierarchical-injectors.md` — `EnvironmentInjector` vs `ElementInjector`, platform/root/Null injectors, resolution rules, `optional`/`self`/`skipSelf`/`host`, `providers` vs `viewProviders`.
- `references/lazy-loading-services.md` — `injectAsync` for on-demand service loading and prefetch triggers.
- `references/lightweight-tokens.md` — The lightweight injection token pattern for tree-shakable libraries.

## Core rules

1. **Prefer `inject()` over constructor parameter injection.** Assign dependencies in field initializers: `private readonly http = inject(HttpClient);`. It works in components, directives, services, route guards, factory functions, and other injection contexts.
2. **Prefer `@Service()` on v22+ (or `@Injectable({providedIn: 'root'})`, which also works on v21) for application-wide singletons.** Both make the service a tree-shakable root singleton — unused services are dropped from the bundle. Prefer this over listing the service in an `ApplicationConfig`/`bootstrapApplication` `providers` array.
3. **Use `@Injectable` (not `@Service`) when you need constructor injection, a non-root scope, or advanced provider options** (`useClass`, `useValue`, `useExisting`, `useFactory`).
4. **Use `InjectionToken` for any non-class dependency** — config objects, primitives, functions, or interface-typed values. TypeScript interfaces cannot be DI tokens because they do not exist at runtime.
5. **Scope deliberately.** `providedIn: 'root'` / `@Service()` for app singletons; component/directive `providers` for per-instance state; route `providers` for a lazy feature area.
6. **Only call `inject()` inside an injection context.** Calling it elsewhere throws NG0203; use `runInInjectionContext` with an `EnvironmentInjector` to bridge.
7. **Use `useExisting` to alias** an existing token to the same singleton; `useClass` creates a separate instance.
8. **Add `{optional: true}`** when a dependency may be absent, to resolve `null` instead of throwing.
9. **Library authors:** expose a `provide*()` function returning `Provider[]`, and design with lightweight injection tokens so consumers can tree-shake unused features.
