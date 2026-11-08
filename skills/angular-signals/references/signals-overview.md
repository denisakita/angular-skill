# Signals Overview

Source: https://angular.dev/guide/signals

A **signal** is a wrapper around a value that notifies interested consumers when
that value changes. Signals can hold any value, from primitives to complex data
structures. Reading a signal's value (by calling its getter function) lets Angular
track where the signal is used. Signals are either **writable** or **read-only**.

## Creating and using writable signals

Create a writable signal with `signal()`, passing the initial value:

```typescript
const count = signal(0);

// Read by calling the signal as a function:
console.log('The count is: ' + count());
```

Writable signals have the type `WritableSignal`.

- **Set** a new value directly with `.set()`:

  ```typescript
  count.set(3);
  ```

- **Update** a value from the previous one with `.update()`:

  ```typescript
  count.update((value) => value + 1);
  ```

## Read-only signals with `asReadonly()`

`WritableSignal` exposes `asReadonly()`, which returns a read-only view. The
read-only signal reflects changes to the original writable signal but cannot be
modified via `set()` or `update()`. (It does not protect against deep mutation of
the underlying value.)

```typescript
@Service() // v22+; on v21 use @Injectable({providedIn: 'root'})
export class CounterState {
  private readonly _count = signal(0);
  readonly count = this._count.asReadonly();

  increment() {
    this._count.update((v) => v + 1);
  }
}

@Component({})
export class AwesomeCounter {
  state = inject(CounterState);
  count = this.state.count; // can read but not modify

  increment() {
    this.state.increment();
  }
}
```

This pattern keeps mutation private to a service while exposing a safe read-only
signal to consumers.

## Reactive contexts

A **reactive context** is a runtime state in which Angular monitors signal reads
to establish dependencies. Angular automatically enters a reactive context when:

- Executing an `effect()` or `afterRenderEffect()` callback
- Evaluating a `computed()` signal
- Evaluating a `linkedSignal`
- Evaluating a `resource`'s params or loader function
- Rendering a component template (including host bindings)

While in a reactive context, Angular creates a live connection: if any tracked
signal changes, Angular re-runs the consumer.

### Asserting you are NOT in a reactive context

Use `assertNotInReactiveContext()` to guard code that must not run reactively
(e.g. one-time subscription setup):

```typescript
import {assertNotInReactiveContext} from '@angular/core';

function subscribeToEvents() {
  assertNotInReactiveContext(subscribeToEvents);
  // Safe to proceed - subscription logic here
}
```

## Reading without tracking: `untracked()`

Use `untracked()` to read signals inside a reactive function without creating a
dependency on them:

```typescript
effect(() => {
  console.log(`User set to ${currentUser()} and counter is ${untracked(counter)}`);
});
```

The effect above runs only when `currentUser` changes, not when `counter`
changes. `untracked()` is also useful to run external code that should not become
a dependency:

```typescript
effect(() => {
  const user = currentUser();
  untracked(() => {
    this.loggingService.log(`User set to ${user}`);
  });
});
```

## Async boundaries are NOT tracked

The reactive context is only active for synchronous code. Signal reads after an
`await` (or other async boundary) are not tracked.

Avoid:

```typescript
effect(async () => {
  const data = await fetchUserData();
  console.log(`User: ${data.name}, Theme: ${theme()}`); // theme() NOT tracked
});
```

Prefer reading needed signals before the first `await`:

```typescript
effect(async () => {
  const currentTheme = theme(); // Read before await
  const data = await fetchUserData();
  console.log(`User: ${data.name}, Theme: ${currentTheme}`);
});
```

Reading a signal as a function argument also works, because arguments are
evaluated synchronously:

```typescript
effect(async () => {
  await renderContent(docContent());
});
```

## Equality functions

Provide a custom `equal` function to decide whether a new value differs from the
previous one. By default signals use referential equality (`Object.is()`).

```typescript
import isEqual from 'lodash/isEqual';

const data = signal(['test'], {equal: isEqual});

// Different array instance, but deep equality considers them equal:
data.set(['test']); // Signal won't trigger updates
```

Equality functions work with both writable signals and `computed` signals.

## Type-checking helpers

```typescript
const count = signal(0);
const doubled = computed(() => count() * 2);

isSignal(count);   // true
isSignal(doubled); // true
isSignal(42);      // false

isWritableSignal(count);   // true
isWritableSignal(doubled); // false
```

## Signals and OnPush change detection

When a signal is read in an `OnPush` component's template, Angular tracks it as a
dependency. When the signal changes, Angular automatically marks the component for
update on the next change detection cycle.

## Signal-based component APIs

Modern Angular components expose inputs, outputs, and queries as signals.

### Inputs — `input()` / `input.required()`

```typescript
import {Component, input} from '@angular/core';

@Component({/*...*/})
export class CustomSlider {
  value = input(0); // type inferred from default; undefined included if no default
}
```

Template: `<custom-slider [value]="50" />`

Required inputs are enforced at build time and do **not** include `undefined`:

```typescript
@Component({/*...*/})
export class CustomSlider {
  value = input.required<number>();
}
```

**Transforms** modify the value when set:

```typescript
@Component({selector: 'custom-slider', /*...*/})
export class CustomSlider {
  label = input('', {transform: trimString});
}

function trimString(value: string | undefined): string {
  return value?.trim() ?? '';
}
```

Built-in transforms:

```typescript
import {Component, input, booleanAttribute, numberAttribute} from '@angular/core';

@Component({/*...*/})
export class CustomSlider {
  disabled = input(false, {transform: booleanAttribute});
  value = input(0, {transform: numberAttribute});
}
```

**Aliases** rename the template-facing binding only:

```typescript
@Component({/*...*/})
export class CustomSlider {
  value = input(0, {alias: 'sliderValue'});
}
```

Inputs are signals, so derive from them with `computed`:

```typescript
fullName = computed(() => `${this.firstName()} ${this.lastName()}`);
```

### Two-way binding — `model()`

```typescript
@Component({/* ... */})
export class CustomSlider {
  value = model(0);

  increment() {
    this.value.update((oldValue) => oldValue + 10);
  }
}
```

```typescript
@Component({
  /* ... */
  template: `<custom-slider [(value)]="volume" />`,
})
export class MediaControls {
  volume = signal(0);
}
```

Model inputs automatically create a corresponding output named with a `Change`
suffix and support `required`/`alias`, but **not** transforms.

### Outputs — `output()`

```typescript
@Component({/*...*/})
export class ExpandablePanel {
  panelClosed = output<void>();
}
```

```html
<expandable-panel (panelClosed)="savePanelState()" />
```

`output()` returns an `OutputEmitterRef`; emit values via `.emit()`:

```typescript
this.valueChanged.emit(7);
this.thumbDropped.emit({pointerX: 123, pointerY: 456});
```

Alias an output (template name only):

```typescript
@Component({/*...*/})
export class CustomSlider {
  changed = output({alias: 'valueChanged'});
}
```

Custom events do not bubble; output names are case-sensitive and are inherited by
subclasses.

### Queries — `viewChild` / `viewChildren` / `contentChild` / `contentChildren`

All query functions return signals and are readable in reactive contexts like
`computed` and `effect`.

```typescript
@Component({
  selector: 'custom-card',
  template: '<custom-card-header>Visit sunny California!</custom-card-header>',
})
export class CustomCard {
  header = viewChild(CustomCardHeader);
  headerText = computed(() => this.header()?.text);
}
```

Multiple results (array):

```typescript
@Component({/*...*/})
export class CustomCard {
  actions = viewChildren(CustomCardAction);
  actionsTexts = computed(() => this.actions().map((action) => action.text));
}
```

Content queries reach into projected content:

```typescript
@Component({/* ... */})
export class CustomExpando {
  toggle = contentChild(CustomToggle);
  toggleText = computed(() => this.toggle()?.text);
}
```

**Required** queries error if no match is found and exclude `undefined`:

```typescript
@Component({/*...*/})
export class CustomCard {
  header = viewChild.required(CustomCardHeader);
  body = contentChild.required(CustomCardBody);
}
```

The `read` option retrieves a different token from the matched element:

```typescript
@Component({/*...*/})
export class CustomExpando {
  toggle = contentChild(ExpandoContent, {read: TemplateRef});
}
```

## Best practices

- Expose mutable state through `asReadonly()` so only the owning service/component
  can change it.
- Provide an `equal` function for object/array signals to avoid unnecessary
  recomputation and re-renders.
- Read all needed signals synchronously, before any `await`.
- Derive from inputs and queries with `computed`, not by copying into a plain
  signal in an effect.

## Common mistakes

- Forgetting to call the signal (`count` vs `count()`) — reading the getter
  reference instead of the value.
- Mutating an object inside a signal in place and calling `.set()` with the same
  reference — referential equality will suppress the update.
- Reading signals after `await` and expecting them to be tracked.
- Copying derived data into a writable signal via an effect instead of using
  `computed` or `linkedSignal`.
