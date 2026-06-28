# Core Principles

Foundational principles that shape every Angular file. Grounded in angular.dev (overview, signals guide, style guide).

## 1. Signals-first reactivity

**Rationale:** Angular's fine-grained reactivity model tracks exactly where state is read, so the framework updates only what changed — "simplifies development and helps build faster apps by default." Make signals the default container for component state instead of plain fields.

```typescript
isTrial = signal(false);
```

- DO use `signal()` for mutable state and `computed()` for values derived from it.
- DO expose state as read-only where appropriate via `signal(...).asReadonly()`.
- DON'T keep parallel plain-property copies of signal state that you must manually sync.

## 2. Standalone by default (no NgModules)

**Rationale:** Standalone components are the modern building blocks; each declares its own dependencies, removing the indirection and boilerplate of NgModules.

```typescript
@Component({ selector: 'user-profile', imports: [ProfilePhoto], template: `<profile-photo />` })
export class UserProfile {}
```

- DO write standalone components, directives, and pipes and list dependencies in `imports`.
- DO bootstrap the app from `main.ts` at the `src/` root.
- DON'T create or import NgModules for new code.

## 3. Type-safety and strict mode

**Rationale:** Angular is built for scale and stability ("checked against hundreds of thousands of tests"); strong typing catches errors at compile time and powers editor tooling. Signals and `inject()` are designed for excellent type inference.

```typescript
const count = signal<number>(0); // inferred or explicit, never `any`
```

- DO keep TypeScript `strict` mode enabled and lean on type inference.
- DO use typed reactive/forms APIs and typed inputs (`input<T>()`).
- DON'T reach for `any` or non-null assertions to silence the compiler.

## 4. Immutability

**Rationale:** Signals notify consumers on *replacement* of a value, not deep mutation — readonly signals have "no built-in mechanism that would prevent deep-mutation." Treating values as immutable keeps reactivity and change detection correct.

```typescript
items.update(list => [...list, newItem]); // new reference, not list.push(...)
```

- DO update signals with `.set()` / `.update()` returning new references.
- DO supply a custom `equal` function only when value-equality semantics are needed.
- DON'T mutate objects/arrays held inside a signal in place.

## 5. Separation of concerns

**Rationale:** "Prefer focusing source files on a single concept." Keep presentation in components, business rules in services/functions, and logic out of templates so each piece stays testable and reusable.

```typescript
// component delegates: validation/transform live in their own functions or services
saveUserData() { this.users.save(this.form()); }
```

- DO move validation, data transformation, and business logic into dedicated functions/services.
- DO keep components focused on presentation and user interaction.
- DON'T embed complex logic directly in templates or in lifecycle hooks like `ngOnInit()`.
