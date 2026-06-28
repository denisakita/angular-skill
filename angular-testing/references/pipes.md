# Testing Pipes

Source: https://angular.dev/guide/testing/pipes

A pipe class has one method, `transform`, that converts an input value into an output
value. Because pure pipes are typically stateless functions, you can test them by
instantiating the class directly — no `TestBed` required.

## Direct instantiation (preferred for unit tests)

```typescript
describe('TitleCasePipe', () => {
  const pipe = new TitleCasePipe();

  it('transforms "abc" to "Abc"', () => {
    expect(pipe.transform('abc')).toBe('Abc');
  });

  it('transforms "abc def" to "Abc Def"', () => {
    expect(pipe.transform('abc def')).toBe('Abc Def');
  });
});
```

The pipe under test:

```typescript
@Pipe({name: 'titlecase', pure: true})
export class TitleCasePipe implements PipeTransform {
  transform(input: string): string {
    return input.length === 0
      ? ''
      : input.replace(/\w\S*/g, (txt) =>
          txt[0].toUpperCase() + txt.slice(1).toLowerCase());
  }
}
```

## In-template (integration) test

Supplement the isolated test with a component test to confirm the pipe works in a real
template:

```typescript
it('should convert hero name to Title Case', async () => {
  const hostElement: HTMLElement = harness.routeNativeElement!;
  const nameInput: HTMLInputElement = hostElement.querySelector('input')!;
  const nameDisplay: HTMLElement = hostElement.querySelector('span')!;

  nameInput.value = 'quick BROWN  fOx';
  nameInput.dispatchEvent(new Event('input'));
  await harness.fixture.whenStable();

  expect(nameDisplay.textContent).toBe('Quick Brown  Fox');
});
```

## Best practices

- Use direct instantiation for fast, isolated unit tests of `transform`.
- Test edge cases thoroughly, especially for regex-based transformations (empty strings,
  multiple spaces, mixed case).
- Add a component/template test to verify DOM integration.

## Common mistakes

- Reaching for `TestBed` when a simple `new MyPipe()` would do.
- Only testing the happy path and missing empty/edge inputs.
- Skipping the in-template test, so a wiring bug in the template goes unnoticed.
