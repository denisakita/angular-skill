# Programmatic / Dynamic Rendering

Source: https://angular.dev/guide/components/programmatic-rendering

Render components dynamically when the component to show isn't known until runtime, or for overlays/modals/lists. Angular offers three approaches.

> For lazy-loading a heavy component, prefer the built-in `@defer` block, which automatically code-splits — reach for dynamic rendering only when you truly need runtime component selection or insertion.

## 1. NgComponentOutlet (template-based)

A structural directive that renders a component chosen at runtime.

```typescript
import {Component, input} from '@angular/core';
import {NgComponentOutlet} from '@angular/common';

@Component({
  imports: [NgComponentOutlet],
  template: `<ng-container *ngComponentOutlet="getBioComponent()" />`,
})
export class CustomDialog {
  user = input.required<User>();

  getBioComponent() {
    return this.user().isAdmin ? AdminBio : StandardBio;
  }
}
```

Passing inputs, content, and a custom injector:

```typescript
@Component({
  imports: [NgComponentOutlet],
  template: `
    <ng-container
      *ngComponentOutlet="greetingComponent; inputs: greetingInputs()" />
  `,
})
export class ProfileView {
  greetingComponent = UserGreeting;
  greetingInputs = signal({username: 'ngAwesome', role: 'admin'});
}
```

```html
<ng-container *ngComponentOutlet="cardComponent; content: cardContent()" />
<ng-container *ngComponentOutlet="panelComponent; injector: customInjector" />
```

Access the created instance via the exported directive reference:

```html
<ng-container [ngComponentOutlet]="counterComponent" #outlet="ngComponentOutlet" />
<button (click)="outlet.componentInstance?.increment()">Increment</button>
```

## 2. ViewContainerRef.createComponent (programmatic, in-hierarchy)

Inject a `ViewContainerRef` and create a component that integrates into the logical component tree (good for lists and inline UI). The component is inserted as a sibling at the container's location.

```typescript
import {Component, ViewContainerRef, inject} from '@angular/core';

@Component({
  selector: 'inner-item',
  template: `<button (click)="loadContent()">Load content</button>`,
})
export class InnerItem {
  private viewContainer = inject(ViewContainerRef);

  loadContent() {
    this.viewContainer.createComponent(LeafContent);
  }
}
```

Configure bindings, two-way bindings, outputs, and directives declaratively:

```typescript
import {inputBinding, twoWayBinding, outputBinding} from '@angular/core';

const compRef = this.viewContainer.createComponent(AppWarning, {
  bindings: [
    inputBinding('canClose', this.canClose),
    twoWayBinding('isExpanded', this.isExpanded),
    outputBinding<boolean>('close', (confirmed) => {
      console.log('Closed with result:', confirmed);
    }),
  ],
  directives: [FocusTrap, {type: ThemeDirective, bindings: [/* ... */]}],
});
```

## 3. Standalone createComponent (maximum control)

Render outside the normal view hierarchy — e.g. overlays attached to `document.body`.

```typescript
import {createComponent, inputBinding, outputBinding} from '@angular/core';

const ref = createComponent(Popup, {
  environmentInjector: this.injector,
  hostElement: host,
  bindings: [
    inputBinding('message', () => message),
    outputBinding('closed', () => { /* cleanup */ }),
  ],
});
this.appRef.attachView(ref.hostView);
document.body.appendChild(host);
```

## Choosing an approach

| Method | Use case |
|--------|----------|
| `NgComponentOutlet` | Template-driven; simple runtime component selection |
| `ViewContainerRef.createComponent` | Insert into the logical tree; lists, inline UI |
| `createComponent` + `hostElement` | Overlays/modals, `document.body` insertion, full control |

## Best practices

- Prefer `@defer` for lazy-loading rather than hand-rolled dynamic loading.
- Use declarative `bindings`/`directives` config on `createComponent` rather than poking instance properties.
- Destroy/clean up: detach views and remove host elements you appended (e.g. for `createComponent` overlays).

## Common mistakes

- **Touching `componentInstance` too early** — it is `null` before rendering completes.
- **Inserting DOM via native APIs under hydration** — hydration doesn't support nodes created outside Angular; use Angular APIs or add `ngSkipHydration`.
- **Reaching for dynamic rendering when `@defer` would do** — for plain lazy loading, `@defer` is simpler and code-splits automatically.
- **Forgetting cleanup** — manually created components/views and appended host elements must be destroyed/removed.
