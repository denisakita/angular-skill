# Attribute Directives

Source: https://angular.dev/guide/directives/attribute-directives

An attribute directive changes the appearance or behavior of an element, component, or another directive. You apply it to a host element via its attribute selector.

## Defining a directive

Declare a class with the `@Directive` decorator and an attribute selector (the brackets make it an attribute selector). Directives are standalone by default.

```typescript
import {Directive} from '@angular/core';

@Directive({
  selector: '[appHighlight]',
})
export class HighlightDirective {}
```

Use a custom prefix (here `app`) on selectors so your directives don't collide with native attributes or third-party directives.

## Accessing the host element

Inject `ElementRef` with `inject()` to get a reference to the host DOM element via its `nativeElement` property.

```typescript
import {Directive, ElementRef, inject} from '@angular/core';

@Directive({
  selector: '[appHighlight]',
})
export class HighlightDirective {
  private el = inject(ElementRef);

  constructor() {
    this.el.nativeElement.style.backgroundColor = 'yellow';
  }
}
```

## Handling user events with the `host` object

Bind to host DOM events in the `host` metadata. Each key is an event in parentheses; the value is the handler statement.

```typescript
import {Directive, ElementRef, inject} from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  host: {
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
  },
})
export class HighlightDirective {
  private el = inject(ElementRef);

  onMouseEnter() {
    this.highlight('yellow');
  }

  onMouseLeave() {
    this.highlight('');
  }

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}
```

The `host` object also binds host properties, attributes, and classes:

```typescript
@Directive({
  selector: '[appHighlight]',
  host: {
    '[class.active]': 'isActive',
    '[attr.role]': '"button"',
    '[style.cursor]': '"pointer"',
  },
})
export class HighlightDirective {
  isActive = true;
}
```

## Passing values with signal inputs

Use the `input()` function to accept bindings. The directive can share its selector name as an input, so a single binding both applies the directive and passes a value.

```typescript
import {Directive, ElementRef, inject, input} from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  host: {
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
  },
})
export class HighlightDirective {
  private el = inject(ElementRef);

  appHighlight = input('');
  defaultColor = input('');

  onMouseEnter() {
    this.highlight(this.appHighlight() || this.defaultColor() || 'red');
  }

  onMouseLeave() {
    this.highlight('');
  }

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}
```

Apply it, importing the directive into the consuming component's `imports`:

```html
<p [appHighlight]="color" defaultColor="violet">Highlight me!</p>
```

Read input values by calling the signal: `this.appHighlight()`. For required values use `input.required<T>()`.

## Built-in attribute directives

- `NgClass` — manage several CSS classes at once: `[ngClass]="classRecord"` where `classRecord` is `Record<string, boolean>`.
- `NgStyle` — apply several inline styles at once: `[ngStyle]="styleRecord"`.
- `NgModel` — add two-way binding to a form element with `[(ngModel)]`.

To add or remove a **single** class or style, prefer class/style binding (`[class.foo]`, `[style.color]`) over `NgClass`/`NgStyle`.

## Deactivating Angular processing

`ngNonBindable` tells Angular not to compile or bind the contents of an element, so interpolation is shown literally. The element's own directives still run.

```html
<p ngNonBindable>This should not evaluate: {{ 1 + 1 }}</p>
<div ngNonBindable [appHighlight]="'yellow'">
  This should not evaluate: {{ 1 + 1 }}, but will highlight yellow.
</div>
```

## Best practices

- Keep directives standalone and import them into the components that use them.
- Use `inject(ElementRef)` rather than constructor injection.
- Prefer the `host` metadata object over the `@HostListener` and `@HostBinding` decorators.
- Use signal inputs (`input()`, `input.required()`) and read them by calling the signal.
- Prefix selectors (e.g. `app`) to avoid collisions.
- Prefer Angular's `Renderer2` or class/style host bindings over manual `nativeElement` writes when you need SSR safety; direct DOM access ties you to the browser.

## Common mistakes

- Forgetting to import the directive into the consuming component's `imports` array, so the selector silently does nothing.
- Reading a signal input as a value (`this.appHighlight`) instead of calling it (`this.appHighlight()`).
- Using `@Input()` / `@HostListener` / `@HostBinding` decorators when the modern `input()` and `host` object are preferred.
- Using `NgClass`/`NgStyle` to toggle a single class or style instead of a direct binding.
- Setting `standalone: false` on a directive.
