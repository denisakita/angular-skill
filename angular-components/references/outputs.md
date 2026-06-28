# Outputs (custom events)

Source: https://angular.dev/guide/components/outputs

Outputs let a component emit custom events to its parent. Modern Angular uses the `output()` function, which returns an `OutputEmitterRef`. Use it instead of `@Output` + `EventEmitter`.

## Declaring and emitting

```typescript
import {Component, output} from '@angular/core';

@Component({
  selector: 'expandable-panel',
  template: `<button (click)="close()">Close</button>`,
})
export class ExpandablePanel {
  panelClosed = output<void>();

  close() {
    this.panelClosed.emit();
  }
}
```

Listen with the parenthesis syntax in the parent template:

```html
<expandable-panel (panelClosed)="savePanelState()" />
```

## Emitting data

Pass a value or object to `emit()` and read it via `$event`:

```typescript
@Component({/* ... */})
export class CustomSlider {
  valueChanged = output<number>();
  thumbDropped = output<{pointerX: number; pointerY: number}>();

  onDrag(x: number, y: number) {
    this.valueChanged.emit(7);
    this.thumbDropped.emit({pointerX: x, pointerY: y});
  }
}
```

```html
<custom-slider (valueChanged)="logValue($event)" />
```

## Aliases

Rename the public event without renaming the property. The alias only affects template usage.

```typescript
@Component({/* ... */})
export class CustomSlider {
  changed = output<number>({alias: 'valueChanged'});
}
```

```html
<custom-slider (valueChanged)="logValue($event)" />
```

## Creating outputs from observables

`outputFromObservable` exposes an RxJS observable as a component output.

```typescript
import {Component} from '@angular/core';
import {outputFromObservable} from '@angular/core/rxjs-interop';
import {Subject} from 'rxjs';

@Component({/* ... */})
export class CustomSlider {
  private pointerMoves$ = new Subject<number>();
  pointerMove = outputFromObservable(this.pointerMoves$);
}
```

There is also `outputToObservable` (from `@angular/core/rxjs-interop`) to consume an output as an observable.

## Programmatic subscription

When a component is created dynamically, subscribe directly to its outputs:

```typescript
const componentRef = viewContainerRef.createComponent(SomeComponent);
const sub = componentRef.instance.someEventProperty.subscribe((data) => {
  console.log(data);
});
// Unsubscribe manually when no longer needed
sub.unsubscribe();
```

## Key characteristics

- Custom events **do not bubble** up the DOM.
- Output names are **case-sensitive**.
- Subclasses **inherit** parent outputs.
- `output()` may only be used in component/directive property initializers (it is compiler-special).

## Best practices

- Prefer `output()` over `@Output`/`EventEmitter` for all new code.
- Use camelCase names that describe what happened (e.g. `valueChanged`, `panelClosed`).
- For value-editing scenarios with two-way binding, prefer `model()` over a manual input + output pair.

## Common mistakes

- **Adding an `on` prefix** to output names (`onClose`) — name the event for the occurrence (`close`/`closed`).
- **Naming an output the same as a native DOM event** — causes confusing collisions.
- **Adding component-style prefixes** to output names — unnecessary, since an element hosts only one component.
- **Expecting events to bubble** — Angular custom events do not propagate up the DOM tree.
