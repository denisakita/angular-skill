# Signal Queries

Source: https://angular.dev/guide/components/queries

Queries let a component reference child elements, components, or directives. Modern Angular uses signal-based query functions. They return **signals**, so results stay current and integrate with `computed()`/`effect()`.

| Function | Scope | Result |
|----------|-------|--------|
| `viewChild()` | Component's own template | single (or `undefined`) |
| `viewChildren()` | Component's own template | array signal |
| `contentChild()` | Projected (`<ng-content>`) content | single (or `undefined`) |
| `contentChildren()` | Projected content | array signal |

## View queries

Query elements from the component's own template.

```typescript
import {Component, viewChild, viewChildren, computed} from '@angular/core';
import {CustomCardHeader} from './custom-card-header';

@Component({
  selector: 'custom-card',
  imports: [CustomCardHeader],
  template: `<custom-card-header>Visit sunny California!</custom-card-header>`,
})
export class CustomCard {
  header = viewChild(CustomCardHeader);            // Signal<CustomCardHeader | undefined>
  headerText = computed(() => this.header()?.text);

  allHeaders = viewChildren(CustomCardHeader);     // Signal<readonly CustomCardHeader[]>
}
```

## Content queries

Query elements passed into the component as projected content.

```typescript
import {Component, contentChildren, computed} from '@angular/core';
import {CustomMenuItem} from './custom-menu-item';

@Component({
  selector: 'custom-menu',
  template: `<ng-content />`,
})
export class CustomMenu {
  items = contentChildren(CustomMenuItem);
  itemTexts = computed(() => this.items().map((item) => item.text));
}
```

## Required queries

Use `.required()` when the child must exist. The signal type drops `undefined`, and Angular reports an error if no match is found.

```typescript
export class CustomCard {
  header = viewChild.required(CustomCardHeader);
  body = contentChild.required(CustomCardBody);
}
```

## Locators

A query's first argument identifies what to find:

- A **component or directive class**: `viewChild(CustomCardHeader)`
- A **template reference variable** string: `viewChild('save')` (matches `#save`)
- An **`InjectionToken`**

```typescript
@Component({
  template: `<button #save>Save</button>`,
})
export class Form {
  saveButton = viewChild<ElementRef<HTMLButtonElement>>('save');
}
```

## The `read` option

Use `read` to retrieve a specific type from the matched element instead of the default.

```typescript
import {Component, contentChild, TemplateRef, ElementRef} from '@angular/core';

@Component({/* ... */})
export class Expando {
  toggle = contentChild(ExpandoContent, {read: TemplateRef});
  el = viewChild('save', {read: ElementRef});
}
```

## Descendants

- **View queries always traverse descendants** (there is no `descendants` option).
- **`contentChild()` traverses descendants by default.**
- **`contentChildren()` queries only direct children** unless you pass `{descendants: true}`.

```typescript
items = contentChildren(CustomMenuItem, {descendants: true});
```

## When results resolve

- Queries return **signals**; read them in `computed()`, `effect()`, or template expressions and they update automatically.
- A query with no match returns `undefined` (single) or an empty array (multiple). This happens when the target is hidden by `@if`, etc.
- Queries **do not pierce** into other components' templates — they respect encapsulation boundaries.

## Legacy decorators

`@ViewChild`, `@ViewChildren`, `@ContentChild`, `@ContentChildren` still work; their results become available in `ngAfterViewInit` / `ngAfterContentInit`. Prefer signal queries for new code.

## Best practices

- Prefer signal queries (`viewChild()` etc.) over decorator queries.
- Use `.required()` to express invariants and remove `undefined` from the type.
- Derive from query results with `computed()` rather than caching them imperatively.
- Use `read` when you need an `ElementRef`, `TemplateRef`, or a specific provider rather than the component instance.

## Common mistakes

- **Forgetting `{descendants: true}`** with `contentChildren()` when items are nested below direct children.
- **Reading a query result too early** — with signals, read inside reactive contexts; results may be `undefined` until the view/content renders.
- **Expecting queries to reach into another component's template** — they stop at component boundaries.
- **Using decorator queries in new code** — prefer the signal-based functions.
