# Component Patterns

Grounded in:
- https://angular.dev/guide/components
- https://angular.dev/guide/components/inputs
- https://angular.dev/guide/components/outputs
- https://angular.dev/guide/components/host-elements
- https://angular.dev/guide/signals

## Standalone component baseline

Components are standalone by default (v19+). Import dependencies directly via `imports`.
Do not set `standalone: true` and do not declare components in NgModules.

```typescript
import {Component, ChangeDetectionStrategy} from '@angular/core';
import {ProfilePhoto} from './profile-photo';

@Component({
  selector: 'user-profile',
  imports: [ProfilePhoto],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<profile-photo [url]="photoUrl()" />`,
})
export class UserProfile {
  /* ... */
}
```

## Signal inputs: `input()` and `input.required()`

`input()` returns a read-only `InputSignal`. Read it by calling it like any signal.

```typescript
import {Component, input, computed, booleanAttribute} from '@angular/core';

@Component({ selector: 'custom-slider', /* ... */ })
export class CustomSlider {
  // Optional with default -> InputSignal<number>
  value = input(0);

  // Required (must be set in template) -> InputSignal<number>
  max = input.required<number>();

  // Optional, no default -> InputSignal<string | undefined>
  hint = input<string>();

  // Alias: template uses [sliderValue], class uses step()
  step = input(1, {alias: 'sliderValue'});

  // Transform: coerce boolean/number attributes, or run a pure function
  disabled = input(false, {transform: booleanAttribute});
  label = input('', {transform: trimString});

  // Derive view state from inputs with computed()
  display = computed(() => `Value is ${this.value()} / ${this.max()}`);
}

function trimString(v: string | undefined): string {
  return v?.trim() ?? '';
}
```

Constraints: input signals are read-only; transform functions must be pure and statically
analyzable at build time; inputs are fixed at compile time (not addable at runtime).

## Signal outputs: `output()`

`output()` creates an emitter; call `.emit()` to dispatch. Outputs do not bubble the DOM.

```typescript
import {Component, output} from '@angular/core';

@Component({ selector: 'expandable-panel', /* ... */ })
export class ExpandablePanel {
  panelClosed = output<void>();
  valueChanged = output<number>();
  changed = output<number>({alias: 'valueChanged'}); // optional alias

  close() {
    this.panelClosed.emit();
    this.valueChanged.emit(7);
  }
}
```

```html
<expandable-panel (panelClosed)="savePanelState()" (valueChanged)="logValue($event)" />
```

Guidelines: camelCase names, no `on` prefix, avoid colliding with native DOM event names.

## Container / presentational (smart / dumb) pattern

**Recommended pattern synthesized from official guidance.** Split components by responsibility:

- **Presentational (dumb):** pure UI. Receives data via `input()`, reports via `output()`,
  has no service dependencies, derives display state with `computed()`, uses `OnPush`.
- **Container (smart):** orchestrates. Injects services/state, loads data, passes inputs down
  and reacts to outputs. Holds little to no template markup of its own beyond composition.

```typescript
// Presentational: no DI, signal IO only
@Component({
  selector: 'user-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article (click)="selected.emit(user().id)">
      <h3>{{ fullName() }}</h3>
      <button (click)="remove.emit(user().id); $event.stopPropagation()">Remove</button>
    </article>
  `,
})
export class UserCard {
  user = input.required<User>();
  selected = output<string>();
  remove = output<string>();
  fullName = computed(() => `${this.user().firstName} ${this.user().lastName}`);
}

// Container: injects state, wires data + events
@Component({
  selector: 'user-list-page',
  imports: [UserCard],
  template: `
    @for (u of store.users(); track u.id) {
      <user-card [user]="u" (selected)="store.select($event)" (remove)="store.remove($event)" />
    }
  `,
})
export class UserListPage {
  protected readonly store = inject(UserStore);
}
```

## Derived view state with `computed()`

Push display logic out of templates into memoized `computed()` signals. They are lazily
evaluated, cached, and track only the signals actually read.

```typescript
items = input.required<Item[]>();
query = signal('');
visibleItems = computed(() =>
  this.items().filter(i => i.name.includes(this.query())),
);
itemCount = computed(() => this.visibleItems().length);
```

## Host bindings via `host` metadata

Bind classes, attributes, styles, and listeners on the host element through the `host`
object. Prefer this over `@HostBinding` / `@HostListener` (kept only for back-compat).

```typescript
@Component({
  selector: 'custom-slider',
  host: {
    'role': 'slider',
    '[attr.aria-valuenow]': 'value()',
    '[class.active]': 'isActive()',
    '[style.--my-background]': 'color()',
    '[tabIndex]': 'disabled() ? -1 : 0',
    '(keydown)': 'updateValue($event)',
  },
})
export class CustomSlider {
  value = input(0);
  disabled = input(false);
  isActive = signal(false);
  color = signal('lightgreen');
  updateValue(event: KeyboardEvent) { /* ... */ }
}
```

## DO / DON'T

DO:
- Use `input()` / `output()` and read inputs as signals.
- Mark required inputs with `input.required()`.
- Use `OnPush`; signals mark the component for check automatically.
- Keep presentational components free of service injection.
- Use native control flow with a `track` expression in `@for`.
- Derive template values with `computed()`.

DON'T:
- Don't use `@Input()` / `@Output()` / `@HostBinding` / `@HostListener` in new code.
- Don't set `standalone: true` (it is the default).
- Don't put heavy logic or method calls with side effects in templates.
- Don't mutate input objects; treat inputs as read-only.
- Don't reach into child components imperatively when an `output()` event suffices.
