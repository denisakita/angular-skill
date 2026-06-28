# Reactivity Principles

How to model state and data flow with signals. Grounded in angular.dev signals guide and essentials.

## 1. The signal / computed / effect mental model

**Rationale:** Each primitive has a distinct job. A `signal` holds source state, a `computed` derives state lazily and memoized, and an `effect` runs side effects when dependencies change. Reaching for the right one keeps reactive graphs predictable.

```typescript
const count = signal(0);
const doubled = computed(() => count() * 2);      // lazy, memoized, read-only
effect(() => console.log(`count is ${count()}`)); // side effects only
```

- DO use `signal()` for writable source-of-truth state.
- DO use `computed()` for any value that can be calculated from other signals.
- DON'T use `effect()` to compute and store derived state — use `computed()` instead.

## 2. Derive, don't duplicate, state

**Rationale:** Computed signals track only the signals actually read and recalculate only when those change, so derived values stay correct for free. Storing a separate copy invites drift and manual sync bugs.

```typescript
showTrialDuration = computed(() => this.isTrial() && !this.isTrialExpired());
```

- DO express relationships between state as `computed()` graphs.
- DON'T mirror derived results into extra writable signals you update by hand.

## 3. Unidirectional data flow

**Rationale:** State flows one way — sources change, derivations recompute, the template renders. Reading signals is synchronous; async work belongs behind `Resource`, not inside the reactive read path.

```typescript
const firstNameUpper = computed(() => firstName().toUpperCase());
```

- DO keep all signal APIs synchronous; load async data with `resource()` / `Resource`.
- DO read signals *before* an `await`; reactive context is lost after an async boundary.
- DON'T read signals after `await` inside an effect and expect them to be tracked.

## 4. OnPush + zoneless mindset

**Rationale:** Reading a signal in an `OnPush` template automatically marks the component for check when that signal changes, so you no longer need Zone.js-driven detection. Designing for this yields faster, more predictable updates.

```typescript
@Component({ changeDetection: ChangeDetectionStrategy.OnPush, /* ... */ })
export class UserProfile { name = signal('Morgan'); }
```

- DO set `ChangeDetectionStrategy.OnPush` and drive the UI from signal reads.
- DO assume no Zone.js: trigger UI changes by updating signals, not by mutating fields.
- DON'T rely on manual `markForCheck()` or implicit zone change detection for signal state.

## 5. Control side effects deliberately

**Rationale:** Effects are powerful but easy to overuse. Use `untracked()` to read a signal without subscribing, keeping the dependency set intentional.

```typescript
effect(() => log(`user ${currentUser()}, counter ${untracked(counter)}`));
```

- DO reserve `effect()` for genuine side effects (logging, DOM, third-party sync).
- DO use `untracked()` to exclude reads that should not trigger re-runs.
- DON'T create effects that write to signals they also read (feedback loops).
