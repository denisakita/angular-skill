# Testing Fundamentals

Source: https://angular.dev/guide/testing

## The default setup: Vitest

New Angular CLI projects (v21+) ship with **Vitest** as the test framework. Vitest runs
unit tests in a Node.js environment, using `jsdom` to simulate browser DOM APIs. This
means tests run fast without launching a real browser. Projects include `vitest` and
`jsdom` by default.

The Angular *testing utilities* (`TestBed`, `ComponentFixture`, `DebugElement`, `By`, and
component harnesses) are the same regardless of runner. Only the surrounding helpers
differ between the modern Vitest setup and the classic Jasmine + Karma stack:

| Concern            | Vitest (default v21+)             | Classic Jasmine + Karma           |
| ------------------ | --------------------------------- | --------------------------------- |
| Test/suite globals | `describe` / `it` (from `vitest`) | `describe` / `it` (Jasmine global)|
| Assertions         | `expect(x).toBe(y)`               | `expect(x).toBe(y)`               |
| Spies / mocks      | `vi.fn()`, `Mocked<T>`            | `jasmine.createSpy()`, spy objects|
| Fake timers        | `vi.useFakeTimers()` + `vi.runAllTimersAsync()` | `fakeAsync` + `tick()` |
| Runner command     | `ng test`                         | `ng test`                         |

## Running tests

```
ng test
```

Builds the application in watch mode and launches the Vitest runner, re-running tests
when files change. Sample output:

```
✓ src/app/app.spec.ts (3)
  ✓ AppComponent should create the app
  ✓ AppComponent should have as title 'my-app'
  ✓ AppComponent should render title
Test Files  1 passed (1)
     Tests  3 passed (3)
```

## Test file naming

Test files follow the pattern `**/*.spec.ts` or `**/*.test.ts`.

## A minimal test

```typescript
import {TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it} from 'vitest';
import {Calculator} from './calculator';

describe('Calculator', () => {
  let service: Calculator;

  beforeEach(() => {
    service = TestBed.inject(Calculator);
  });

  it('adds two numbers', () => {
    expect(service.add(1, 2)).toBe(3);
  });
});
```

Note that with Vitest you import `describe`, `it`, `expect`, `beforeEach`, `vi`, etc.
from `vitest`. With Jasmine/Karma these are global and no import is needed.

## Configuration in `angular.json`

Key options under the `test` target (`@angular/build:unit-test` builder):

- **include** — glob patterns for test files.
- **exclude** — patterns to exclude.
- **setupFiles** — global setup files executed before tests.
- **providersFile** — path to a file exporting Angular providers for all tests.
- **coverage** — boolean to enable/disable coverage reporting.
- **browsers** — array of browser names for real-browser testing.

### Global test providers

Create a file that default-exports providers, then point `providersFile` at it:

```typescript
import {EnvironmentProviders, Provider} from '@angular/core';
import {provideHttpClientTesting} from '@angular/common/http/testing';

const testProviders: (Provider | EnvironmentProviders)[] = [provideHttpClientTesting()];

export default testProviders;
```

## CI / CD

Run once (non-interactive) on CI servers:

```
ng test --no-watch --no-progress
```

Most CI servers automatically detect single-run mode when the `CI=true` environment
variable is set.

## Browser testing

Node.js + jsdom is the default, but tests can run in a real browser (e.g. via Playwright
or WebdriverIO) by configuring the `browsers` option in `angular.json` or passing the
`--browsers` CLI flag.

## Best practices

- Let the CLI scaffold the Vitest setup; do not hand-roll a runner config unless needed.
- Keep tests deterministic: avoid real network/timers; use test doubles and fake timers.
- Use `providersFile` to share common test providers (like HTTP testing) across the suite.
- Run `ng test --no-watch` in CI to get a single, exit-coded run.

## Common mistakes

- Assuming Karma/Jasmine — new v21+ projects default to Vitest; check `angular.json`.
- Forgetting to import `describe`/`it`/`expect` from `vitest` (they are not globals
  unless configured).
- Naming spec files something other than `*.spec.ts` / `*.test.ts` so the runner skips them.
