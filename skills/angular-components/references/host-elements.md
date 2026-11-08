# Host Elements

Source: https://angular.dev/guide/components/host-elements

The **host element** is the DOM element that matches a component's selector; the component's template renders inside it. For selector `'profile-photo'`, `<profile-photo>` is the host element.

## Binding with the `host` object (recommended)

Define attribute, property, class, style, and event bindings on the host via the `host` property of `@Component`. This is the modern, preferred approach.

```typescript
import {Component, signal} from '@angular/core';

@Component({
  selector: 'custom-slider',
  template: `...`,
  host: {
    // Static attribute
    'role': 'slider',
    // Attribute binding
    '[attr.aria-valuenow]': 'value()',
    // Class binding
    '[class.active]': 'isActive()',
    // Style binding
    '[style.background]': `hasError() ? 'red' : 'green'`,
    // Property binding
    '[tabIndex]': 'disabled() ? -1 : 0',
    // Event listener
    '(keydown)': 'updateValue($event)',
  },
})
export class CustomSlider {
  value = signal(0);
  disabled = signal(false);
  isActive = signal(false);
  hasError = signal(false);

  updateValue(event: KeyboardEvent) {
    /* ... */
  }
}
```

### Global event targets

Prefix event names with `document:`, `window:`, or `body:` to listen on those targets:

```typescript
host: {
  '(window:resize)': 'onResize($event)',
  '(document:click)': 'onDocumentClick($event)',
}
```

## CSS custom properties

Bind CSS custom properties on the host, or set them on a child:

```typescript
@Component({
  host: {'[style.--my-background]': 'color()'},
})
export class MyComponent {
  color = signal('lightgreen');
}
```

```typescript
@Component({
  template: `<my-child [style.--my-background]="color()" />`,
})
export class Parent {
  color = signal('lightgreen');
}
```

## Injecting static host attributes

Read a static attribute set on the host with `HostAttributeToken`. It throws if the attribute is missing unless the injection is optional.

```typescript
import {Component, HostAttributeToken, inject} from '@angular/core';

@Component({
  selector: 'app-button',
  template: `<ng-content />`,
})
export class Button {
  variation = inject(new HostAttributeToken('variation'));
}
```

```html
<app-button variation="primary">Click me</app-button>
```

## Binding collisions and precedence

When the component's `host` and the element where it's used both bind the same property:

```typescript
@Component({
  host: {
    'role': 'presentation',
    '[id]': 'id',
  },
})
export class ProfilePhoto {}
```

```html
<profile-photo role="group" [id]="otherId" />
```

Precedence rules:
- A **static** binding at the usage site wins over a **static** binding in the component.
- A **dynamic** binding wins over a **static** binding.
- When **both are dynamic**, the **component's** host binding wins.

## Legacy decorators (backwards compatibility only)

`@HostBinding` and `@HostListener` still work but exist only for backwards compatibility. Always prefer the `host` object.

```typescript
export class CustomSlider {
  @HostBinding('attr.aria-valuenow') value = 0;

  @HostBinding('tabIndex')
  get tabIndex() {
    return this.disabled ? -1 : 0;
  }

  @HostListener('keydown', ['$event'])
  updateValue(event: KeyboardEvent) {
    /* ... */
  }
}
```

## Best practices

- Use the `host` object for all host bindings/listeners; reserve `@HostBinding`/`@HostListener` for legacy code.
- Add accessibility attributes (`role`, `aria-*`) via `host` so they live with the component.
- Bind signals in host expressions (`'value()'`) for reactive updates with OnPush.
- Use `HostAttributeToken` to read one-time configuration attributes from the host.

## Common mistakes

- **Using `@HostBinding`/`@HostListener` in new code** — prefer the `host` object.
- **Misremembering precedence** — when both bindings are dynamic, the component (not the usage site) wins.
- **Forgetting to call signals** inside host string expressions (write `'isActive()'`, not `'isActive'`).
- **Assuming `HostAttributeToken` is optional** — it throws on a missing attribute unless explicitly made optional.
