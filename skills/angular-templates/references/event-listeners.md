# Event listeners

Bind to events by wrapping the event name in parentheses `()` and giving a handler statement that runs when the event fires. Any native event works: `click`, `keyup`, `keydown`, `mouseover`, `input`, etc.

```typescript
@Component({
  template: `<input type="text" (keyup)="updateField()" />`,
})
export class App {
  updateField(): void {
    console.log('Field is updated!');
  }
}
```

## The `$event` variable

Angular provides `$event` inside the handler statement, containing the event object.

```typescript
@Component({
  template: `<input type="text" (keyup)="updateField($event)" />`,
})
export class App {
  updateField(event: KeyboardEvent): void {
    console.log(`The user pressed: ${event.key}`);
  }
}
```

## Key modifiers

Filter to specific keys with period-separated modifiers instead of inspecting the event manually:

```html
<input type="text" (keyup.enter)="updateField($event)" />
```

Combine multiple modifiers:

```html
<input type="text" (keyup.shift.enter)="updateField($event)" />
```

Supported modifiers: `alt`, `control`, `meta`, `shift`. Use the `code` suffix to match physical keyboard positions (useful for cross-platform/cross-layout consistency), e.g. `(keyup.code.enter)`.

## Global event targets

You can listen to events on `window`, `document`, or `body` via host bindings (the `host` property of `@Component`/`@Directive`).

## Preventing default behavior

Call `event.preventDefault()` inside the handler to override the browser's default behavior:

```typescript
onSubmit(event: Event): void {
  event.preventDefault();
  // ...
}
```

## Custom event plugins

Extend `EventManagerPlugin` and register it with the `EVENT_MANAGER_PLUGINS` token to add custom event handling (for example, a debounced event).

## Best practices

- Pass `$event` only when you need the event object; type the handler parameter (e.g. `KeyboardEvent`, `MouseEvent`).
- Prefer key modifiers (`keyup.enter`) over manual `if (event.key === 'Enter')` checks.
- Keep handler statements small — call a component method rather than embedding logic in the template.

## Common mistakes

- Writing pipes or destructuring assignments in an event handler statement — these are not allowed in event expressions (assignment operators ARE allowed).
- Using `(keyup)` with a manual key check when `(keyup.enter)` is clearer.
- Forgetting `event.preventDefault()` on form submit / anchor click handlers when you mean to suppress navigation/reload.
