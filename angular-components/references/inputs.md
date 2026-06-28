# Inputs (signal-based)

Source: https://angular.dev/guide/components/inputs

Inputs let a component receive data from its parent. Modern Angular uses the `input()` function, which returns a read-only **signal**. Use `input()` instead of the legacy `@Input` decorator.

## Declaring inputs

```typescript
import {Component, input, computed} from '@angular/core';

@Component({
  selector: 'custom-slider',
  template: `<p>{{ label() }}</p>`,
})
export class CustomSlider {
  // Default value — type inferred as InputSignal<number>
  value = input(0);

  // Optional, no default — InputSignal<number | undefined>
  max = input<number>();

  // Required — caller must provide it or the build fails
  id = input.required<string>();

  // Read an input by calling it like any signal
  label = computed(() => `Value: ${this.value()}`);
}
```

Bind to inputs from a parent template:

```html
<custom-slider [value]="50" [max]="100" id="vol" />
```

## Reading input values

Inputs are signals. Call them to read the current value, and they integrate with `computed()` and `effect()`:

```typescript
import {Component, input, effect} from '@angular/core';

@Component({/* ... */})
export class CustomSlider {
  value = input(0);
  constructor() {
    effect(() => console.log('value is now', this.value()));
  }
}
```

## Transforms

A transform runs on the bound value before it is stored. Keep transforms **pure and statically analyzable**.

```typescript
import {Component, input, booleanAttribute, numberAttribute} from '@angular/core';

function trimString(value: string | undefined): string {
  return value?.trim() ?? '';
}

@Component({/* ... */})
export class CustomSlider {
  label = input('', {transform: trimString});

  // Built-in transforms
  disabled = input(false, {transform: booleanAttribute});
  value = input(0, {transform: numberAttribute});
}
```

- `booleanAttribute` mimics native HTML boolean-attribute behavior (presence = `true`).
- `numberAttribute` parses the bound value to a number.

## Aliases

Change the public binding name without changing the property name:

```typescript
@Component({/* ... */})
export class CustomSlider {
  value = input(0, {alias: 'sliderValue'});
}
```

```html
<custom-slider [sliderValue]="50" />
```

## Two-way binding with `model()`

`model()` declares a writable input that also emits changes, enabling `[(...)]` two-way binding. Angular automatically creates a matching `valueChange` output.

```typescript
import {Component, model} from '@angular/core';

@Component({
  selector: 'custom-slider',
  template: `<button (click)="increment()">+10</button>`,
})
export class CustomSlider {
  value = model(0);

  increment() {
    this.value.update((old) => old + 10);
  }
}
```

```typescript
@Component({
  selector: 'media-controls',
  imports: [CustomSlider],
  template: `<custom-slider [(value)]="volume" />`,
})
export class MediaControls {
  volume = signal(0);
}
```

Use `model()` for custom form controls and components whose value the user edits (date pickers, comboboxes, sliders).

## Best practices

- Prefer `input()` / `model()` over `@Input` for all new code.
- Use `input.required()` when a component cannot function without the value.
- Use `transform` (with `booleanAttribute`/`numberAttribute`) instead of getters/setters or `ngOnChanges` reshaping.
- Use `model()` only when the component genuinely owns and mutates the value; otherwise pair `input()` + `output()`.
- Keep transform functions pure so the compiler can analyze them.

## Common mistakes

- **Mutating an `input()` signal** — inputs are read-only; use `model()` if you need to write back.
- **Naming inputs after native DOM properties** (e.g. `class`, `style`, `id` on the wrong element) — avoid collisions.
- **Adding prefixes to input names** — unlike selectors, inputs should not be prefixed.
- **Reading an input value in the constructor expecting it to be set** — inputs are available from `ngOnInit` onward; signals read in `effect()`/`computed()` update automatically.
- **Using complex/impure transforms** — they break static analysis and can cause subtle bugs.
