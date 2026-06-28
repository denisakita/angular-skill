# Structural Directives

Source: https://angular.dev/guide/directives/structural-directives

Structural directives are directives applied to an `<ng-template>` element that conditionally or repeatedly render the content of that template. They change the DOM layout by adding and removing elements.

> Note: For everyday conditional and list rendering, prefer Angular's built-in control flow (`@if`, `@for`, `@switch`) over the legacy `*ngIf` / `*ngFor` / `*ngSwitch` directives. Write a *custom* structural directive only when you need reusable templating behavior that control flow doesn't cover.

## The asterisk (`*`) shorthand and desugaring

The `*` prefix is shorthand that Angular expands into an explicit `<ng-template>`.

Shorthand:

```html
<p *select="let data; from: source">The data is: {{ data }}</p>
```

Desugared long form:

```html
<ng-template select let-data [selectFrom]="source">
  <p>The data is: {{ data }}</p>
</ng-template>
```

### Translation rules

`let data` binds a template variable to the context's `$implicit` value. A key like `from: source` becomes a property binding whose name is the directive selector prepended to the PascalCased key — `[selectFrom]="source"`.

| Shorthand | Translation |
|---|---|
| `prefix` + expression | `[prefix]="expression"` |
| `keyExp` | `[prefixKey]="expression"` |
| `let local` | `let-local="export"` |

Examples:

```text
*myDir="let item of [1,2,3]"
// → <ng-template myDir let-item [myDirOf]="[1,2,3]">

*myDir="exp as value"
// → <ng-template [myDir]="exp" let-value="myDir">
```

Only one structural directive may be applied to an element in shorthand form. To layer several, wrap with `<ng-container>`.

## Core APIs: TemplateRef and ViewContainerRef

- `TemplateRef` — a handle to the `<ng-template>` content.
- `ViewContainerRef` — the location where views are created and rendered.

Inject both with `inject()`:

```typescript
import {Directive, TemplateRef, ViewContainerRef, inject, input} from '@angular/core';

@Directive({
  selector: '[select]',
})
export class SelectDirective {
  private templateRef = inject(TemplateRef);
  private viewContainerRef = inject(ViewContainerRef);
}
```

## Building a custom structural directive

This directive loads data from a source and renders the template once the data resolves, passing it through the context's `$implicit` property.

```typescript
import {Directive, TemplateRef, ViewContainerRef, inject, input} from '@angular/core';

export interface DataSource<T> {
  load(): Promise<T>;
}

@Directive({
  selector: '[select]',
})
export class SelectDirective<T> {
  private templateRef = inject(TemplateRef);
  private viewContainerRef = inject(ViewContainerRef);

  selectFrom = input.required<DataSource<T>>();

  async ngOnInit() {
    const data = await this.selectFrom().load();
    this.viewContainerRef.createEmbeddedView(this.templateRef, {
      $implicit: data,
    });
  }
}
```

A classic `UnlessDirective` (renders content when the condition is false) follows the same shape, calling `createEmbeddedView(templateRef)` to show and `viewContainerRef.clear()` to hide.

## Template type checking

Custom structural directives need static guard methods so Angular can type-check the template.

### `ngTemplateContextGuard` — type the context

```typescript
export interface SelectTemplateContext<T> {
  $implicit: T;
}

@Directive(/* ... */)
export class SelectDirective<T> {
  selectFrom = input.required<DataSource<T>>();

  static ngTemplateContextGuard<T>(
    dir: SelectDirective<T>,
    ctx: any,
  ): ctx is SelectTemplateContext<T> {
    return true;
  }
}
```

This preserves the generic `T` so template expressions like `{{ data }}` are typed.

### `ngTemplateGuard_*` — narrow an input

Narrow the type of an input expression inside the template:

```typescript
@Directive(/* ... */)
class ActorIsUser {
  actor = input<User | Robot>();

  static ngTemplateGuard_actor(dir: ActorIsUser, expr: User | Robot): expr is User {
    return true;
  }
}
```

For truthiness-based narrowing (like `*ngIf`), declare the guard as the literal type `'binding'`:

```typescript
@Directive(/* ... */)
class CustomIf {
  condition = input.required<boolean>();

  static ngTemplateGuard_condition: 'binding';
}
```

## Best practices

- Prefer built-in control flow (`@if`, `@for`, `@switch`) for ordinary cases; reserve custom structural directives for reusable templating logic.
- Inject `TemplateRef` and `ViewContainerRef` with `inject()`.
- Always add `ngTemplateContextGuard` (and `ngTemplateGuard_*` where relevant) so consumers get type-checked templates and typed context variables.
- Pass the primary context value as `$implicit` so consumers can write `let x`.
- Use `<ng-container>` to combine multiple structural directives on one logical element.

## Common mistakes

- Applying two `*` directives to the same element (not allowed) instead of wrapping with `<ng-container>`.
- Omitting type guards, leaving template expressions typed as `any` and silently unchecked.
- Forgetting to clear the view container before re-creating a view, leaking stale embedded views.
- Naming the value input incorrectly: the shorthand maps `from:` to `[selectFrom]`, so the input must be `selectFrom`.
- Reading `input.required()` before it is set; access it where the value is guaranteed (e.g. in `ngOnInit`).
