# Testing Attribute Directives

Source: https://angular.dev/guide/testing/attribute-directives

An attribute directive modifies an element, component, or another directive by being
applied as an attribute. The recommended way to test one is with an artificial **test
host component** that exercises every way the directive can be applied — rather than
testing it in isolation or hunting through real app components.

## The test host pattern

```typescript
@Component({
  imports: [Highlight],
  template: `
    <h2 highlight="yellow">Something Yellow</h2>
    <h2 highlight>The Default (Gray)</h2>
    <h2>No Highlight</h2>
    <input #box [highlight]="box.value" value="cyan" />
  `,
})
class Test {}
```

This covers explicit binding, default behavior, an element without the directive, and a
dynamic value binding.

## Querying with `By.directive()`

Use `By.directive()` to find all elements carrying the directive, even when their tag
types differ:

```typescript
let fixture: ComponentFixture<Test>;
let des: DebugElement[];

beforeEach(async () => {
  fixture = TestBed.createComponent(Test);
  await fixture.whenStable();

  // all elements with an attached Highlight
  des = fixture.debugElement.queryAll(By.directive(Highlight));
});

it('should have three highlighted elements', () => {
  expect(des.length).toBe(3);
});
```

## Asserting styles

```typescript
it('should color 1st <h2> background "yellow"', () => {
  const bgColor = des[0].nativeElement.style.backgroundColor;
  expect(bgColor).toBe('yellow');
});
```

## Accessing the directive instance

Get the directive from the element's injector to read its internal state / defaults:

```typescript
it('should color 2nd <h2> background w/ default color', () => {
  const dir = des[1].injector.get(Highlight);
  const bgColor = des[1].nativeElement.style.backgroundColor;
  expect(bgColor).toBe(dir.defaultColor);
});
```

## Dynamic bindings

Dispatch the DOM event, then await stability:

```typescript
it('should bind <input> background to value color', async () => {
  const input = des[2].nativeElement as HTMLInputElement;
  expect(input.style.backgroundColor).toBe('cyan');

  input.value = 'green';
  input.dispatchEvent(new Event('input'));
  await fixture.whenStable();

  expect(input.style.backgroundColor).toBe('green');
});
```

## Testing absence of the directive

```typescript
it('bare <h2> should not have a backgroundColor', () => {
  const bareH2 = fixture.debugElement.query(By.css('h2:not([highlight])'));
  expect(bareH2.styles.backgroundColor).toBeUndefined();
});
```

## Best practices

1. Prefer a test host component over testing in real app components — better coverage and isolation.
2. Use `By.directive()` when element tag types are unknown.
3. Use `DebugElement` abstractions (`.styles`, `.properties`) for cross-environment safety.
4. `await fixture.whenStable()` after DOM events.
5. Read directive instances via the element injector to verify defaults/state.
6. Use CSS pseudo-classes like `:not()` to test edge cases (no directive).

## Common mistakes

- Testing only one usage of the directive (insufficient coverage).
- Class-only unit tests that never touch the DOM.
- Forgetting to dispatch DOM events for dynamic bindings.
- Not awaiting `whenStable()` after interactions.
- Assuming element presence without verifying counts.
