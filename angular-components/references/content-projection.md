# Content Projection

Source: https://angular.dev/guide/components/content-projection

`<ng-content>` marks where caller-supplied content should render inside a component's template. It is similar to the native `<slot>` element but with Angular-specific features. Projection is resolved at **build time**.

## Single slot

All children of the host element render where `<ng-content>` appears.

```typescript
import {Component} from '@angular/core';

@Component({
  selector: 'custom-card',
  template: `
    <div class="card-shadow">
      <ng-content />
    </div>
  `,
})
export class CustomCard {}
```

```html
<custom-card>
  <p>This is the projected content</p>
</custom-card>
```

## Multiple slots with `select`

Route specific children to specific slots using a CSS selector. An `<ng-content>` without a `select` captures everything that did not match another slot.

```typescript
@Component({
  selector: 'custom-card',
  template: `
    <div class="card-shadow">
      <ng-content select="card-title"></ng-content>
      <div class="card-divider"></div>
      <ng-content select="card-body"></ng-content>
      <ng-content></ng-content> <!-- catch-all for unmatched content -->
    </div>
  `,
})
export class CustomCard {}
```

```html
<custom-card>
  <card-title>Hello</card-title>
  <card-body>Welcome to the example</card-body>
</custom-card>
```

`select` accepts any CSS selector — element, attribute (`select="[some-attr]"`), or class (`select=".some-class"`).

## Fallback (default) content

Content inside `<ng-content>` renders when nothing is projected into that slot.

```html
<ng-content select="card-title">Default Title</ng-content>
<ng-content select="card-body">Default Body</ng-content>
```

## Aliasing with `ngProjectAs`

`ngProjectAs` makes an element match a projection selector it otherwise wouldn't. It accepts **static values only** — no dynamic binding.

```html
<custom-card>
  <h3 ngProjectAs="card-title">Hello</h3>
  <p>Welcome to the example</p>
</custom-card>
```

## Important constraints

- `<ng-content>` is processed at **build time** — you cannot wrap it in `@if`, `@for`, or `@switch` to conditionally include it.
- Projected content belongs to the **parent** component for change detection and dependency injection purposes (not the component that projects it).
- `ngProjectAs` supports only static values, not bound expressions.

## Best practices

- Provide a catch-all `<ng-content>` (no `select`) when using multiple slots so unmatched content isn't silently dropped.
- Supply fallback content for slots that should always show something.
- Prefer attribute/class selectors (`select="[card-title]"`) when you want consumers to use semantic native tags.

## Common mistakes

- **Wrapping `<ng-content>` in control flow** to toggle it — projection is static. To conditionally show projected content, conditionally render the surrounding wrapper instead.
- **Expecting projected content to be change-detected by the child** — it belongs to the parent.
- **Trying to bind `[ngProjectAs]`** — it only accepts static strings.
- **Forgetting the catch-all slot** in multi-slot cards, causing unmatched content to disappear.
