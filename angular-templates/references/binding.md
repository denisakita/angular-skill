# Binding (interpolation, property, attribute, class, style)

Bindings create a dynamic connection between a component's data and the template, so the DOM updates automatically when values change. Values that change over time should be read from **signals**.

## Text interpolation

Use double curly braces to render dynamic text. Changes to the component's data automatically update the rendered template.

```typescript
@Component({
  template: `<p>Your color preference is {{ theme }}.</p>`,
})
export class App {
  theme = 'dark';
}
```

For reactive values, read from a signal in the interpolation:

```html
<p>Count: {{ count() }}</p>
```

## Property binding

Square brackets bind a dynamic value to an element property, a component input, or a directive property.

```html
<!-- native element property -->
<button [disabled]="isFormValid()">Save</button>

<!-- component input -->
<my-listbox [value]="mySelection()" />
```

The value inside the quotes is a template expression, re-evaluated whenever its dependencies change.

## Attribute binding

Use the `attr.` prefix when an attribute has no corresponding DOM property (common with SVG and ARIA-style attributes). If the bound value is `null`, Angular removes the attribute.

```html
<ul [attr.role]="listRole()">...</ul>
<button [attr.aria-pressed]="isPressed()">Toggle</button>
```

## Class binding

Three forms:

```html
<!-- 1. Toggle a single class conditionally -->
<ul [class.expanded]="isExpanded()">...</ul>

<!-- 2. Bind a string of classes -->
<ul [class]="'full-width outlined'">...</ul>

<!-- 3. Bind an object of class -> boolean -->
<ul [class]="{ highlighted: true, embiggened: false }">...</ul>
```

When binding arrays or objects, provide a **new instance** when values change — Angular detects changes using triple-equals (`===`) reference comparison, so in-place mutation is not detected.

## Style binding

```html
<!-- single property -->
<section [style.display]="isExpanded() ? 'block' : 'none'">...</section>

<!-- with a unit suffix -->
<section [style.height.px]="sectionHeightInPixels()">...</section>

<!-- multiple styles as a string -->
<ul [style]="'display: flex; padding: 8px'">...</ul>
```

## ARIA attributes

ARIA attributes bind like normal properties/attributes with string values:

```html
<button [aria-label]="actionLabel()">...</button>
```

## Best practices

- Read time-varying values from signals (`value()`), so the binding stays reactive.
- Use `[class.x]` / `[style.x]` for individual toggles; use `[class]` / `[style]` object form for groups managed together.
- Use `[attr.*]` only when there is no DOM property; otherwise prefer plain property binding.
- When binding an object/array literal, create a fresh instance on change rather than mutating in place.

## Common mistakes

- Mutating a bound array/object in place and expecting an update — Angular compares by reference, so the change is missed.
- Forgetting to call a signal: `[disabled]="isFormValid"` binds the signal function itself instead of its value. Use `isFormValid()`.
- Using `[attr.disabled]` when the property `[disabled]` is what you want (or vice versa).
- Using legacy `ngClass`/`ngStyle` — prefer `[class]`/`[style]` bindings.
