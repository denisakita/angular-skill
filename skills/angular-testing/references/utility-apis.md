# Testing Utility APIs

Source: https://angular.dev/guide/testing/utility-apis

Reference for the core Angular testing utilities: `TestBed`, `ComponentFixture`,
`DebugElement`, and `By`.

## `TestBed`

The central testing utility that builds and configures a testing module. Common static
members:

- `configureTestingModule(metadata)` — configure providers, imports, declarations, schemas.
- `compileComponents()` — asynchronously compile components with their resources.
- `createComponent<T>(component)` — create the component and return a `ComponentFixture<T>`.
- `inject(token, notFoundValue?)` — get a service from the injector; optional fallback.
- `overrideComponent(component, override)` — replace component metadata.
- `overrideDirective(directive, override)` — replace directive metadata.
- `overridePipe(pipe, override)` — replace pipe metadata.
- `overrideModule(ngModule, override)` — replace module metadata.
- `overrideProvider(token, provider)` — replace a provider.
- `initTestEnvironment(...)` — initialize the test environment (typically once).
- `resetTestEnvironment()` — reset the test environment.

Call configuration methods inside `beforeEach()` for a fresh module per test. **Do not
reconfigure `TestBed` after `createComponent`.**

```typescript
TestBed.configureTestingModule({
  imports: [MyStandaloneComponent],
  providers: [{provide: DataService, useClass: DataServiceStub}],
});
const fixture = TestBed.createComponent(MyStandaloneComponent);
const service = TestBed.inject(DataService);
```

## `ComponentFixture<T>`

Wraps the created component for inspection and control.

**Properties:**
- `componentInstance` — the component class instance.
- `debugElement` — the root `DebugElement`.
- `nativeElement` — the root native DOM element.
- `changeDetectorRef` — for manual change-detection control.

**Methods:**
- `detectChanges()` — run a change-detection cycle (also runs `ngOnInit` on first call).
- `autoDetectChanges(true | false)` — enable/disable automatic change detection.
- `checkNoChanges()` — assert no pending changes.
- `isStable()` — whether async tasks are complete.
- `whenStable()` — promise that resolves when the fixture stabilizes (preferred for async).
- `destroy()` — trigger component destruction.

## `DebugElement`

Cross-platform wrapper for inspecting the component tree.

- `nativeElement` — the underlying DOM element.
- `query(predicate)` — first matching `DebugElement` in the subtree.
- `queryAll(predicate)` — all matching `DebugElement`s.
- `injector` — the element's injector (use `.get(Token)` to read directives/services).
- `componentInstance` — the component instance, if any.
- `context` — the parent template context (e.g. the item value inside a `@for`).
- `children` / `parent` — tree navigation.
- `name` — element tag name.
- `triggerEventHandler(eventName, eventObject)` — fire an Angular event binding.
- `listeners` — registered output/event listeners.
- `properties` / `styles` / `classes` / `attributes` — element state maps.
- `providerTokens` — DI tokens at this element.
- `references` — template reference variables keyed by name.

```typescript
const h2De = fixture.debugElement.query(By.css('h2'));
h2De.triggerEventHandler('click', null);
const dir = h2De.injector.get(Highlight);
```

## `By`

Predicate factory for `query` / `queryAll`:

- `By.all()` — match every element.
- `By.css(selector)` — match a CSS selector.
- `By.directive(DirectiveClass)` — match elements that have the directive attached.

```typescript
const h2 = fixture.debugElement.query(By.css('h2'));
const highlighted = fixture.debugElement.queryAll(By.directive(Highlight));
```

## The standalone `inject()` test function

`inject(token, notFoundValue?)` injects from the current `TestBed` injector inside a test
function. It cannot inject services that are provided at the component level (use
`fixture.debugElement.injector.get(...)` for those).

## Best practices

- Prefer `await fixture.whenStable()` over manual `detectChanges()` loops for async flows.
- Read injected dependencies via `TestBed.inject` (root) or `debugElement.injector.get`
  (component-level).
- Use `By.css` / `By.directive` predicates instead of raw `querySelector` for portability.

## Common mistakes

- Reconfiguring `TestBed` after `createComponent`.
- Using `TestBed.inject` for component-scoped providers (returns the wrong/none) — use the
  component's `debugElement.injector`.
- Forgetting that the first `detectChanges()` is what triggers `ngOnInit`.
