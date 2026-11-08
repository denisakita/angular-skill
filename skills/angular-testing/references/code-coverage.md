# Code Coverage

Source: https://angular.dev/guide/testing/code-coverage

Code coverage reports show which parts of your code base are not properly exercised by
unit tests. The default Angular setup uses **Vitest** for coverage (not Karma).

## Install the coverage provider

```
npm install --save-dev @vitest/coverage-v8
```

Other package managers:

```
yarn add --dev @vitest/coverage-v8
pnpm add -D @vitest/coverage-v8
bun add --dev @vitest/coverage-v8
```

## Generate a report

```
ng test --coverage
```

This creates a `coverage/` directory with an `index.html` showing coverage metrics.

## Enable coverage automatically in `angular.json`

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "coverage": true
          }
        }
      }
    }
  }
}
```

## Enforce thresholds

Fail the run if coverage falls below minimums:

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "coverage": true,
            "coverageThresholds": {
              "statements": 80,
              "branches": 80,
              "functions": 80,
              "lines": 80
            }
          }
        }
      }
    }
  }
}
```

## Advanced options

- `coverageInclude` — glob patterns for files to include.
- `coverageExclude` — glob patterns for files to exclude.
- `coverageReporters` — reporter formats, e.g. `html`, `lcov`, `json`.
- `coverageWatermarks` — low/high thresholds that drive color-coding in the HTML report.

## Best practices

- Add `coverageThresholds` so coverage regressions fail CI rather than slipping through.
- Use `coverageExclude` to drop generated/boilerplate files that distort the numbers.
- Emit `lcov` (`coverageReporters`) when integrating with external coverage dashboards.
- Treat coverage as a signal, not a goal — high coverage of meaningful behavior matters
  more than hitting a percentage.

## Common mistakes

- Running `ng test --coverage` without installing `@vitest/coverage-v8`.
- Chasing 100% coverage by testing trivial code instead of real behavior.
- Setting thresholds but never running coverage in CI, so they are never enforced.
