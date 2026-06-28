# Pipes

Pipes transform data declaratively in templates using the vertical bar `|` (inspired by Unix pipes). Note this differs from JavaScript, where `|` is bitwise OR.

## Syntax

Pass a value into a pipe with `|`:

```html
<p>Total: {{ amount | currency }}</p>
```

Pass parameters after a colon (multiple parameters are colon-separated):

```html
<p>The event will occur at {{ scheduledOn | date: 'hh:mm' : 'UTC' }}.</p>
```

Chain pipes left-to-right:

```html
<p>The event will occur on {{ scheduledOn | date | uppercase }}.</p>
```

## Built-in pipes (`@angular/common`)

- `AsyncPipe` — unwraps values from a Promise or RxJS Observable
- `CurrencyPipe` — formats a number as locale currency
- `DatePipe` — formats a date by locale rules
- `DecimalPipe` — formats a number as a decimal string
- `I18nPluralPipe` — maps a value to a pluralized string
- `I18nSelectPipe` — maps a key to a custom selector string
- `JsonPipe` — converts an object to a JSON string (debugging)
- `KeyValuePipe` — turns an Object/Map into an array of key-value pairs
- `LowerCasePipe` — lowercases text
- `PercentPipe` — formats a number as a percentage
- `SlicePipe` — returns a subset (slice) of an array or string
- `TitleCasePipe` — title-cases text
- `UpperCasePipe` — uppercases text

Import the pipe (or `CommonModule`) into the component's `imports` to use it.

## Operator precedence

The pipe operator binds **lower** than arithmetic and logical operators but **higher** than the ternary (conditional) operator. Use parentheses to disambiguate:

```html
{{ (a + b) | currency }}
{{ (isAdmin ? adminTotal : userTotal) | currency }}
```

## Change detection (pure vs impure)

Pipes are **pure** by default: `transform` re-runs only when the primitive input changes or an object/array input changes by reference. Mutating the contents of an object/array does NOT re-run a pure pipe.

Set `pure: false` to make the pipe re-run on every change detection cycle — useful for detecting in-place mutations, but it costs performance.

## Custom pipes

A custom pipe uses the `@Pipe` decorator and implements `PipeTransform`:

```typescript
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'kebabCase',
})
export class KebabCasePipe implements PipeTransform {
  transform(value: string): string {
    return value.toLowerCase().replace(/ /g, '-');
  }
}
```

Add parameters as extra `transform` arguments:

```typescript
@Pipe({
  name: 'myCustomTransformation',
})
export class MyCustomTransformationPipe implements PipeTransform {
  transform(value: string, format: string): string {
    let msg = `My custom transformation of ${value}.`;
    if (format === 'uppercase') {
      return msg.toUpperCase();
    } else {
      return msg;
    }
  }
}
```

Impure pipe example:

```typescript
@Pipe({
  name: 'joinNamesImpure',
  pure: false,
})
export class JoinNamesImpurePipe implements PipeTransform {
  transform(names: string[]): string {
    return names.join();
  }
}
```

## Best practices

- Prefer pure pipes; they are cached and efficient.
- Use `AsyncPipe` to subscribe/unsubscribe to Observables automatically instead of manual subscriptions.
- Use parentheses when mixing pipes with the ternary operator.
- Pass an immutable new reference to a pure pipe when inputs change, rather than mutating in place.

## Common mistakes

- Expecting a pure pipe to react to in-place array/object mutation — it will not; change the reference or (sparingly) make it impure.
- Forgetting to add the pipe / `CommonModule` to the component's `imports`.
- Overusing `pure: false`, which runs the pipe on every change detection cycle and can hurt performance.
- Misjudging precedence: `{{ a ? b : c | pipe }}` applies the pipe to `c` only; wrap with parentheses if you meant the whole result.
