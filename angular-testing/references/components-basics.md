# Component Testing Basics

Source: https://angular.dev/guide/testing/components-basics

A component combines an HTML template and a TypeScript class, so component tests must
verify that the two work together. `TestBed` builds the component's DOM element so tests
can inspect and interact with it.

## TestBed configuration and fixture

```typescript
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Banner} from './banner';

describe('Banner', () => {
  let component: Banner;
  let fixture: ComponentFixture<Banner>;

  beforeEach(async () => {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(Banner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

For standalone components, add the component (and any dependencies it needs that the
test must control) to `imports` in `configureTestingModule`. Standalone components are
automatically usable; you only configure providers/imports for dependencies.

### `createComponent()`

`TestBed.createComponent(Banner)` returns a `ComponentFixture` and adds the element to
the runner's DOM. **Do not re-configure `TestBed` after calling `createComponent`.**

### `ComponentFixture`

A harness around the created component. Access the instance with
`fixture.componentInstance`.

### Minimal setup alternative

```typescript
describe('Banner (minimal)', () => {
  it('should create', () => {
    const fixture = TestBed.createComponent(Banner);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
  });
});
```

## Accessing the DOM

### `nativeElement`

```typescript
it('should contain "banner works!"', () => {
  const bannerElement: HTMLElement = fixture.nativeElement;
  expect(bannerElement.textContent).toContain('banner works!');
});
```

### `DebugElement`

A cross-platform abstraction wrapping native elements:

```typescript
const bannerDe: DebugElement = fixture.debugElement;
const bannerEl: HTMLElement = bannerDe.nativeElement;
const p = bannerEl.querySelector('p')!;
expect(p.textContent).toEqual('banner works!');
```

Angular builds a `DebugElement` tree wrapping the native elements for the runtime
platform, which is why `DebugElement` queries work across browser and server environments.

### `By.css()` queries

```typescript
import {By} from '@angular/platform-browser';

it('should find the <p> with fixture.debugElement.query(By.css)', () => {
  const bannerDe: DebugElement = fixture.debugElement;
  const paragraphDe = bannerDe.query(By.css('p'));
  const p: HTMLElement = paragraphDe.nativeElement;
  expect(p.textContent).toEqual('banner works!');
});
```

## A reusable setup function

```typescript
function setup(providers?: StaticProviders[]): ComponentFixture<Banner> {
  TestBed.configureTestingModule({providers});
  return TestBed.createComponent(Banner);
}
```

## Why `whenStable()`

`await fixture.whenStable()` in `beforeEach` lets async startup work settle so the
individual tests can be written synchronously and assert reliably on rendered output.

## Best practices

- Await `fixture.whenStable()` before asserting on bound DOM content.
- Prefer `By.css` / `DebugElement` queries for portability; use `nativeElement` for
  direct DOM assertions.
- Put shared `TestBed` setup in `beforeEach` or a helper `setup()` function.
- For standalone components, configure `imports`, not `declarations`.

## Common mistakes

- Re-configuring `TestBed` after `createComponent` (throws / has no effect).
- Asserting on the DOM before change detection / `whenStable()` has run.
- Using `declarations` for standalone components instead of `imports`.
