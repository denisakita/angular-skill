---
name: angular-testing
description: Use when writing or fixing unit tests for Angular components, services, attribute directives, or pipes with TestBed and Vitest (or classic Jasmine/Karma), including async/DI scenarios, debugging, testing utility APIs, code coverage, and Angular CDK/Material component harnesses.
license: MIT
metadata:
  source: https://angular.dev/guide/testing
  angularVersion: '21-22'
  version: '1.0'
---

# Angular Testing (v21 / v22)

This skill helps you write idiomatic unit tests for Angular applications using the
testing setup that ships with the modern Angular CLI. It is grounded strictly in the
official Angular documentation at https://angular.dev/guide/testing.

## Default test runner: Vitest

New Angular CLI projects (v21+) default to **Vitest**, running tests in Node.js with
`jsdom` to simulate the DOM. Tests are run with `ng test`, which builds in watch mode
and re-runs on file changes. Test files match `**/*.spec.ts` or `**/*.test.ts`.

The Angular test *utilities* — `TestBed`, `ComponentFixture`, `DebugElement`, `By`,
and component harnesses — are framework-agnostic and behave the same whether the runner
is **Vitest** or the classic **Jasmine + Karma** stack. The main differences are the
assertion/spy helpers (`vi.fn()` / `expect(...).toBe()` for Vitest vs.
`jasmine.createSpy()` / Jasmine matchers) and fake-timer helpers (`vi.useFakeTimers()`
vs. Angular's `fakeAsync`/`tick`). Where docs show both, the reference files note it.

## Reference files

Read the file that matches your task before writing tests:

- `references/fundamentals.md` — setup, `ng test`, Vitest vs Jasmine/Karma, config in `angular.json`, CI.
- `references/services.md` — testing services, DI, stubs, spies, HTTP testing.
- `references/components-basics.md` — `TestBed`, `ComponentFixture`, querying the DOM.
- `references/components-scenarios.md` — inputs/outputs (signals), async, DI, router, forms, nested components.
- `references/attribute-directives.md` — the test-host pattern and `By.directive`.
- `references/pipes.md` — direct pipe instantiation and in-template testing.
- `references/debugging.md` — `ng test --debug` for Node and browser.
- `references/utility-apis.md` — full `TestBed`, `ComponentFixture`, `DebugElement`, `By` API.
- `references/component-harnesses.md` — using and creating CDK/Material harnesses.
- `references/code-coverage.md` — `ng test --coverage`, thresholds, reporters.

## Core rules

1. **Configure `TestBed` for standalone.** Modern Angular components, directives, and
   pipes are standalone — put them (and their dependencies) in `imports`, not
   `declarations`. Call `TestBed.configureTestingModule({...})` and never reconfigure
   `TestBed` after calling `TestBed.createComponent`.
2. **Drive change detection correctly.** `TestBed.createComponent` does not run change
   detection synchronously. `await fixture.whenStable()` (preferred) before asserting on
   bound DOM; dispatch real DOM events (`el.dispatchEvent(new Event('input'))`) after
   changing inputs.
3. **Prefer harnesses for Angular Material / CDK widgets.** Use `TestbedHarnessEnvironment`
   and component harnesses instead of querying internal DOM/CSS classes — they keep tests
   resilient to implementation changes and reusable across unit and e2e.
4. **Test behavior, not implementation.** Assert on what a user observes (rendered text,
   emitted events, navigation) rather than private fields or internal method calls. Stub
   only what is complex, slow, or unpredictable.
5. **Keep each test isolated.** Use `beforeEach` so every test gets a fresh service or
   fixture; never let state leak between tests.
