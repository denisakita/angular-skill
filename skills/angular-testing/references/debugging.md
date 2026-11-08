# Debugging Tests

Source: https://angular.dev/guide/testing/debugging

The Angular CLI exposes a `--debug` flag on `ng test` for both Node.js and browser
debugging with the default Vitest setup.

## Debugging in Node.js

Often the quickest way to diagnose issues that are not related to browser-specific APIs
or rendering:

```
ng test --debug
```

The test runner starts in debug mode and waits for a debugger to attach. Attach your
preferred debugger — VS Code's built-in Node.js debugger or Chrome DevTools for Node.js
(`chrome://inspect`).

## Debugging in a browser

For browser-specific functionality, run the same command with Vitest configured for
browser mode:

```
ng test --debug
```

The runner starts in debug mode and waits for you to open the browser devtools to debug
the tests. (Browser mode requires the `browsers` option / `--browsers` flag; see the
browser-mode configuration and the Vitest migration guide.)

## Practical tips

- Choose Node.js debugging for logic, DI, and data-flow bugs; choose browser debugging
  when the problem involves real rendering or browser APIs.
- Place `debugger;` statements or editor breakpoints in your spec or source, then run
  `ng test --debug` and attach.
- With Vitest you can also narrow the run while iterating using `it.only` / `describe.only`
  (and `it.skip`). The classic Jasmine/Karma equivalents are `fit` / `fdescribe` (focus)
  and `xit` / `xdescribe` (skip). Remove focus markers before committing.

## Best practices

- Reproduce a failing test in isolation (`.only`) before attaching a debugger.
- Prefer the Node.js debugger for speed; reach for the browser only when needed.
- Never leave `it.only`/`fit`/`fdescribe` in committed code — it silently skips the rest
  of the suite.
