---
name: angular-signals
description: Use when building reactive state in Angular v21/v22 with signal/computed/effect, linkedSignal for writable derived state, resource/rxResource for async reactivity, signal-based inputs/outputs/queries, and RxJS interop (toSignal/toObservable).
license: MIT
metadata:
  source: https://angular.dev/guide/signals
  angularVersion: '21-22'
  version: '1.0'
---

# Angular Signals

Signals are Angular's core reactivity primitive. A signal is a wrapper around a
value that notifies interested consumers when the value changes. Reading a signal
inside a *reactive context* (a template, `computed`, `effect`, `linkedSignal`, or
a `resource` params/loader) lets Angular automatically track the dependency and
re-run the consumer when the value changes.

This skill targets Angular **v21/v22**, where signals are the recommended model
for component state, derived values, side effects, async data, and component
inputs/outputs/queries. All guidance is grounded strictly in the official
`angular.dev` documentation.

## Reference files

Read the file that matches your task:

- `references/signals-overview.md` — `signal()`, reading/`set`/`update`,
  `asReadonly()`, equality functions, `untracked()`, reactive contexts,
  `isSignal`/`isWritableSignal`, signal-based inputs/outputs/queries.
- `references/computed.md` — `computed()`, lazy evaluation, memoization, dynamic
  dependencies, read-only derived state.
- `references/effects.md` — `effect()`, when effects run, `onCleanup`, injection
  context, `untracked` inside effects, async caveats.
- `references/linked-signal.md` — `linkedSignal()` for writable state derived
  from other signals, source/computation form, `previous` value, equality.
- `references/resource.md` — `resource()`, `rxResource()`, `httpResource()`,
  status, `value`/`error`/`isLoading`, `reload()`, `abortSignal`, streaming.
- `references/rxjs-interop.md` — `toSignal()`, `toObservable()`,
  `takeUntilDestroyed()`, `outputFromObservable()`, `outputToObservable()`.

## Core rules

1. **Prefer `computed` over `effect` for derived state.** Any value derived
   purely from other signals should be a `computed`. Computeds are lazy, memoized,
   and free of the ordering/glitch problems that arise when you write state from
   effects. Do not use effects to propagate state to other signals.
2. **Use `effect` for side effects only** — logging, manual DOM work,
   synchronizing with non-signal/third-party APIs, analytics. Not for computing
   values other code reads.
3. **Use `linkedSignal` for writable state that depends on other signals.** It is
   a signal you can `.set()` that also recomputes automatically when its source
   changes — the middle ground between `signal` (static default) and `computed`
   (read-only).
4. **Use `resource`/`rxResource`/`httpResource` for async data**, never manual
   `effect` + `fetch`. Resources integrate async loading, cancellation
   (`abortSignal`), loading/error status, and reload into the signal graph.
5. **Read signals synchronously inside reactive contexts.** Tracking only works
   for synchronous reads; a signal read after `await` is not tracked. Read needed
   signals before the first `await`.
6. **Use `untracked()`** to read a signal without creating a dependency, or to
   call external code inside an effect/computed without making it reactive.
7. **Create effects in an injection context** (constructor or field initializer)
   so they are cleaned up with the component/service, or pass an explicit
   `Injector`.
8. **Reuse the result of `toSignal`/`toObservable`** — call them once and store the
   result; do not call them repeatedly for the same source.
9. **Use signal-based component APIs** — `input()`, `input.required()`, `model()`,
   `output()`, `viewChild()`/`contentChild()` and their plural/`required` forms —
   so component members participate in the signal graph.
