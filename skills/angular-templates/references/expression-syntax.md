# Expression syntax (and whitespace)

Template expressions are based on JavaScript but are a restricted subset, designed to be side-effect-light and safe.

## Supported value literals

Strings (`'Hello'`, `"World"`), booleans (`true`, `false`), numbers (`123`, `3.14`), objects (`{name: 'Alice'}`), arrays (`['Onion', 'Cheese', 'Garlic']`), `null`, regular expressions (`/\d+/`), and template strings (`` `Hello ${name}` ``).

NOT supported: BigInt literals (`1n`).

## Available globals

Only `undefined` and `$any` are available. Other JS globals are NOT accessible: `Number`, `Boolean`, `NaN`, `Infinity`, `parseInt`, etc. (`$any(...)` casts an expression to `any` to bypass type checking.)

## Supported operators

- Arithmetic: `+`, `-`, `*`, `/`, `%`, `**`
- Logical: `&&`, `||`, `!`
- Comparison: `<`, `<=`, `>`, `>=`, `==`, `===`, `!=`, `!==`
- Conditional (ternary): `cond ? a : b`
- Nullish coalescing: `??`
- Assignment operators (allowed in event handler statements)

NOT supported: bitwise operators (`&`, `|`, `^`, `~`, `<<`, `>>`).

## Special features

- **Pipe operator** `|` transforms a value: `{{ total | currency }}`. (See `pipes.md`.)
- **Optional chaining** `?.`: `someObj.someProp?.nestedProp` returns `null` (rather than `undefined`) when the left side is nullish.
- **Non-null assertion** `!`: `someObj!.someProp` (TypeScript syntax, compile-time only).

NOT supported: the `new` keyword and destructuring.

## Expressions vs. event handler statements

- Binding/interpolation expressions: may use pipes; may NOT use assignment or destructuring.
- Event handler statements: may use assignment operators (e.g. `(click)="count = count + 1"`); may NOT use pipes or destructuring assignments.

```html
<!-- expression: pipe ok -->
{{ total | currency }}

<!-- event statement: assignment ok -->
<button (click)="open = !open">Toggle</button>
```

## Whitespace handling

Angular optimizes whitespace during compilation:

- Whitespace **between elements** (newlines, indentation used for formatting) is removed, eliminating unnecessary text nodes.
- Multiple consecutive spaces **inside text** are collapsed to a single space, mirroring browser behavior.

To preserve whitespace, set `preserveWhitespaces: true` on the component:

```typescript
@Component({
  /* ... */
  preserveWhitespaces: true,
  template: `
    <p>Hello         world</p>
  `,
})
```

Preserving whitespace can produce significantly more DOM nodes and slow rendering. To keep a single intentional space without enabling the option globally, use the `&ngsp;` entity.

## Best practices

- Keep expressions simple and free of side effects; move logic into the component class or a pipe.
- Use `?.` to guard nullable chains and `??` for fallbacks instead of long ternaries.
- Use `$any(...)` sparingly, only to work around type-checking edge cases.
- Leave `preserveWhitespaces` off (the default) unless a specific layout truly needs it.

## Common mistakes

- Calling JS globals like `parseInt(...)` or `Math.max(...)` in a template — not available; compute in the class or a pipe.
- Using bitwise `|` expecting OR — `|` is the pipe operator in templates; use `||` for logical OR.
- Using `new` or destructuring in an expression — not supported.
- Using a pipe inside an event handler statement — not allowed there.
