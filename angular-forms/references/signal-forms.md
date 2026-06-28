# Signal Forms

Sources:
- https://angular.dev/guide/forms/signals/overview
- https://angular.dev/guide/forms/signals/models
- https://angular.dev/guide/forms/signals/validation
- https://angular.dev/guide/forms/signals/schemas
- https://angular.dev/guide/forms/signals/form-logic
- https://angular.dev/guide/forms/signals/cross-field-logic
- https://angular.dev/guide/forms/signals/field-state-management
- https://angular.dev/guide/forms/signals/async-operations
- https://angular.dev/guide/forms/signals/custom-controls
- https://angular.dev/guide/forms/signals/form-submission
- https://angular.dev/essentials/signal-forms

Signal Forms manage form state by building on signals. They are part of the
`@angular/forms` package and imported from **`@angular/forms/signals`**. They require
**Angular v21 or higher** (stable in v22). The model is a single writable `signal`; the
form is derived from it and provides automatic two-way binding, type-safe field access,
and schema-based validation.

## API surface (confirmed from docs)

All from `@angular/forms/signals` unless noted:

- **Core:** `form()`, `schema()`
- **Directives:** `FormField` (`[formField]`), `FormRoot` (`[formRoot]`)
- **Validators:** `required()`, `email()`, `min()`, `max()`, `minLength()`, `maxLength()`,
  `pattern()`, `validate()`, `validateTree()`, `validateAsync()`, `validateHttp()`,
  `validateStandardSchema()`
- **Field logic:** `disabled()`, `readonly()`, `hidden()`, `debounce()`, `metadata()`
- **Schema composition:** `apply()`, `applyWhen()`, `applyWhenValue()`, `applyEach()`
- **Submission:** `submit()`
- **Custom-control interfaces:** `FormValueControl<T>`, `FormCheckboxControl`, `FormUiControl`
- **Types:** `FieldTree`, `FieldState`, `FieldContext`, `Schema<T>`, `ValidationError`,
  `DisabledReason`, `WithOptionalFieldTree<T>`
- **From `@angular/core`:** `signal()`, `model()`, `input()`, `output()`, `linkedSignal()`,
  `computed()`

## The model and `form()`

The model is a writable signal containing plain JavaScript objects/arrays. Classes, `Map`,
and `Set` are not supported. `form()` accepts the model signal and returns a `FieldTree`
that mirrors the model structure (navigable by dot notation).

```typescript
import {Component, signal} from '@angular/core';
import {form, FormField} from '@angular/forms/signals';

@Component({
  selector: 'app-login',
  imports: [FormField],
  template: `
    <input type="email" [formField]="loginForm.email" />
    <input type="password" [formField]="loginForm.password" />
  `,
})
export class LoginComponent {
  loginModel = signal({email: '', password: ''});
  loginForm = form(this.loginModel);
}
```

## Field tree vs field state

- `loginForm.email` — a node in the **`FieldTree`** (used for binding and as a schema/path target).
- `loginForm.email()` — **calling** a field returns its **`FieldState`** object.
- `loginForm.email().value()` — reads the field's value (a `WritableSignal`).

```typescript
const value = this.loginForm.email().value();   // read
this.loginForm.email().value.set('a@b.com');     // write
```

## Binding inputs: `[formField]`

The `FormField` directive creates automatic two-way synchronization between the model,
form state, and the UI:

```html
<input type="email" [formField]="loginForm.email" />
```

## FieldState API

Calling a field returns a `FieldState` with reactive signals:

| Category | Members |
|----------|---------|
| Value | `value()` (a `WritableSignal`) |
| Validation | `valid()`, `invalid()`, `errors()`, `pending()` |
| Interaction | `touched()`, `dirty()` |
| Availability | `disabled()`, `hidden()`, `readonly()` |

Each error in `errors()` has `kind`, `message` (optional), and `fieldTree`.

Methods: `markAsTouched(options?)` (accepts `{skipDescendants: true}`), `reset(value?)`
(clears touched/dirty, optionally sets the model), `focusBoundControl(options?)`
(accepts `{preventScroll: true}`).

```html
@if (loginForm.email().touched() && loginForm.email().invalid()) {
  <ul>
    @for (error of loginForm.email().errors(); track error) {
      <li>{{ error.message }}</li>
    }
  </ul>
}
```

Note: while `pending()` is `true`, both `valid()` and `invalid()` return `false`,
`errors()` is empty, and `submit()` waits for completion. State aggregates upward to parent
groups and the root; hidden/disabled/readonly fields do not affect parent validity/touched/dirty.

## Validation via a schema function

Pass a schema function as the second argument to `form()`. It runs **once** during form
creation to declare validation/logic. It receives a path object; pass field paths to
validator functions. Validators re-run automatically when values change.

```typescript
import {Component, signal} from '@angular/core';
import {email, form, FormField, required} from '@angular/forms/signals';

interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [FormField],
  template: `...`,
})
export class LoginComponent {
  loginModel = signal<LoginData>({email: '', password: ''});

  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, {message: 'Email is required'});
    email(schemaPath.email, {message: 'Enter a valid email address'});
    required(schemaPath.password, {message: 'Password is required'});
  });
}
```

Built-in validators: `required()`, `email()`, `min()`, `max()`, `minLength()`,
`maxLength()`, `pattern()`. Each takes an optional options object (e.g. `{message}` and
`{when}`).

### Custom validation: `validate()`

Returns an error object (`{kind, message}`) or `null`:

```typescript
validate(schemaPath.website, ({value}) => {
  if (!value().startsWith('https://')) {
    return {kind: 'https', message: 'URL must start with https://'};
  }
  return null;
});
```

### Standard Schema integration

`validateStandardSchema()` integrates Standard Schema libraries (Zod, Valibot).

## Field logic (form-logic guide)

Rule functions controlling field behavior; most accept a `when` function that recomputes
like a `computed` and receives a `FieldContext`:

- `disabled(path, {when})` — field accepts no input; `when` may return a string reason
  (or `false`). Disabled fields skip validation and don't affect parent validity.
- `readonly(path, {when})` — display value but not editable (binds HTML `readonly`).
- `hidden(path, {when})` — programmatic hidden state; you control rendering (e.g. with `@if`).
- `debounce(path, ms | 'blur')` — delay model updates.
- `metadata(path, ...)` — attach reactive metadata to a field.

```typescript
disabled(schemaPath.couponCode, {
  when: ({valueOf}) =>
    valueOf(schemaPath.total) < 50
      ? 'Order must be $50 or more to use a coupon'
      : false,
});

hidden(schemaPath.publicUrl, {when: ({valueOf}) => !valueOf(schemaPath.isPublic)});

debounce(schemaPath.query, 300);
```

Hidden/disabled/readonly fields all skip validation.

## FieldContext (cross-field logic)

Every rule's callback receives a context with:

- `value` — signal of the current field's value
- `state` — the current field's `FieldState`
- `fieldTree` — programmatic access to child fields
- `valueOf(path)` — another field's raw value (most common; comparisons/calculations)
- `stateOf(path)` — another field's state (validity/touched/dirty)
- `fieldTreeOf(path)` — another field's tree (e.g. to push errors to a specific child)

```typescript
// Conditional requirement
required(schemaPath.companyName, {
  when: ({valueOf}) => valueOf(schemaPath.accountType) === 'business',
  message: 'Company name is required for business accounts',
});

// Cross-field compare (password confirmation)
validate(schemaPath.confirmPassword, ({value, valueOf, stateOf}) => {
  if (!stateOf(schemaPath.password).touched()) return null;
  if (value() !== valueOf(schemaPath.password)) {
    return {kind: 'passwordMismatch', message: 'Passwords do not match'};
  }
  return null;
});
```

### `validateTree()` — group-level validation

Use when the logic is inherently about a group of fields or needs to target multiple
child fields; attach errors to specific children via `fieldTreeOf(path)`:

```typescript
validateTree(schemaPath, ({value, fieldTreeOf}) => {
  const row = value();
  const entries = [
    {val: row.cell1, fieldTree: fieldTreeOf(schemaPath.cell1)},
    // ...
  ];
  const errors = entries
    .filter(({val}) => val !== 0 && isDuplicate(val))
    .map(({val, fieldTree}) => ({
      kind: 'duplicateInRow',
      message: `${val} already appears in this row`,
      fieldTree,
    }));
  return errors.length > 0 ? errors : null;
});
```

Use `validate()` when errors belong on individual fields; use `validateTree()` for
group-spanning logic / targeting multiple children.

## Reusable schemas and composition

`schema()` wraps a schema function into a reusable `Schema<T>`:

```typescript
import {minLength, required, schema} from '@angular/forms/signals';

const nameSchema = schema<{first: string; last: string}>((name) => {
  required(name.first);
  required(name.last);
  minLength(name.first, 2);
  minLength(name.last, 2);
});
```

Composition functions (structural layer — control which rules exist / are active):

- `apply(path, schema)` — apply a reusable schema at a path (schema sees the scoped sub-fields).
- `applyWhen(path, predicate, schema)` — conditionally apply; `predicate` receives the
  context and re-evaluates when referenced signals change.
- `applyWhenValue(path, predicate, schema)` — condition based only on the field's value
  (enables TypeScript type guards for discriminated unions).
- `applyEach(arrayPath, schema)` — apply a schema to each array item (supports items added later).

```typescript
applyWhen(
  schemaPath,
  ({valueOf}) => valueOf(schemaPath.country) === 'US',
  (schemaPath) => {
    required(schemaPath.zipCode);
    pattern(schemaPath.zipCode, /^\d{5}(-\d{4})?$/);
  },
);
```

## Async validation

Runs only after all synchronous validation passes; sets `pending()` to `true` while running.

- `validateHttp(path, {request, onSuccess, onError, debounce?})` — `request` returns a URL
  string or `HttpResourceRequest` (or `undefined` to skip); `onSuccess` maps the response
  to an error or `null`; `onError` maps a failure to an error.
- `validateAsync(path, {params, factory, onSuccess, onError})` — lower-level; `params`
  returns params (or `undefined` to skip), `factory` creates a resource from a params
  signal, `onSuccess`/`onError` map the result.

```typescript
validateHttp(schemaPath.username, {
  debounce: 300,
  request: ({value}) => {
    const username = value();
    return username.length >= 3 ? `/api/users/check?username=${username}` : undefined;
  },
  onSuccess: (response: {available: boolean}) =>
    response.available ? null : {kind: 'usernameTaken', message: 'Username is already taken'},
  onError: () => ({kind: 'serverError', message: 'Could not verify username availability'}),
});
```

```html
@if (registrationForm.username().pending()) {
  <span>Checking availability...</span>
}
```

## Submission: `FormRoot` + `submit()`

Pass a `submission` option with an `action` to `form()`, and bind `[formRoot]` on the
`<form>`. `FormRoot` disables native validation (`novalidate`), prevents default submit,
and calls `submit()`.

`submit()` (1) marks interactive fields touched, (2) checks validation and stops if it
fails, (3) runs the action while `submitting()` is `true`, (4) routes returned server
errors to fields or treats the result as success. It returns `Promise<boolean>`.

```typescript
import {Component, signal} from '@angular/core';
import {form, FormField, FormRoot, required} from '@angular/forms/signals';

@Component({
  selector: 'app-register',
  imports: [FormField, FormRoot],
  template: `
    <form [formRoot]="registrationForm">
      <input [formField]="registrationForm.email" />
      <button type="submit" [disabled]="registrationForm().submitting()">Submit</button>
    </form>
  `,
})
export class RegisterComponent {
  model = signal({email: ''});
  registrationForm = form(
    this.model,
    (path) => {
      required(path.email);
    },
    {
      submission: {
        action: async (form) => {
          // server call with form().value()...
          // return server errors to route to fields, or nothing on success
        },
      },
    },
  );
}
```

Other submission features: `onInvalid` callback (validation fails before action),
`ignoreValidators` option (`'pending'` default | `'none'` | `'all'`), and concurrent
protection (a second submit while one is running returns `false`). Server errors auto-clear
when the user edits the affected field. You can also call `submit()` manually
(`submit(form, action)`) for wizards/auto-save.

## Custom controls

Build reusable controls implementing one of two interfaces (both extend `FormUiControl`):

- `FormValueControl<T>` — value-based controls (text, number, select, date). Must **not**
  have a `checked` property; uses `value = model<T>()`.
- `FormCheckboxControl` — boolean controls (checkbox/toggle). Must **not** have a `value`
  property; uses `checked = model<boolean>()`.

```typescript
import {Component, model} from '@angular/core';
import {FormValueControl} from '@angular/forms/signals';

@Component({
  selector: 'app-basic-input',
  template: `
    <input
      type="text"
      [value]="value()"
      (input)="value.set($any($event.target).value)"
    />
  `,
})
export class BasicInput implements FormValueControl<string> {
  value = model('');
}
```

Optional state inputs the directive will wire up: `touched`, `dirty`, `errors`, `valid`,
`invalid`, `pending`, `disabled`, `disabledReasons`, `readonly`, `hidden`, `required`,
`min`, `max`, `minLength`, `maxLength`, `pattern`, `name`. Errors use
`WithOptionalFieldTree<ValidationError>[]`; disabled reasons use `DisabledReason[]`.
Emit a `touch` output on native `blur` (not focus) to support `debounce('blur')`. Use
`linkedSignal()` for display/storage format conversion.

```typescript
import {Component, input, model, output} from '@angular/core';
import {DisabledReason, FormValueControl, ValidationError, WithOptionalFieldTree} from '@angular/forms/signals';

@Component({
  selector: 'app-stateful-input',
  template: `
    @if (!hidden()) {
      <input
        [value]="value()"
        (input)="value.set($any($event.target).value)"
        [disabled]="disabled()"
        [readonly]="readonly()"
        (blur)="touch.emit()"
      />
      @if (invalid()) {
        @for (error of errors(); track error) {
          <span class="error">{{ error.message }}</span>
        }
      }
    }
  `,
})
export class StatefulInput implements FormValueControl<string> {
  value = model<string>('');
  touched = input<boolean>(false);
  touch = output<void>();
  disabled = input<boolean>(false);
  disabledReasons = input<readonly DisabledReason[]>([]);
  readonly = input<boolean>(false);
  hidden = input<boolean>(false);
  invalid = input<boolean>(false);
  errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);
}
```

## Best practices

- One writable `signal` is the single source of truth; read submitted data from `model()`.
- Keep the model as plain objects/arrays (no classes, `Map`, or `Set`).
- Declare all validation/logic in the schema function; it runs once at creation.
- Remember the call distinction: `form.field` (tree/path) vs `form.field()` (state).
- Gate error display on `touched() && invalid()`.
- Extract reusable rule sets with `schema()` and compose via `apply*`.
- Pair `validateHttp`/`validateAsync` with sync validators and a `debounce` to limit requests.
- Use `FormRoot` + `submission.action` for submit; show `submitting()` and return server
  errors from the action.

## Common mistakes

- Importing from `@angular/forms` instead of `@angular/forms/signals`.
- Forgetting to import the `FormField` (and `FormRoot`) directive into the component.
- Treating `form.field` as state — you must call it: `form.field()...`.
- Using classes/`Map`/`Set` in the model.
- Putting reactive logic outside the schema, expecting it to register validation.
- Adding a `value` to a `FormCheckboxControl` or `checked` to a `FormValueControl`.
- Emitting the custom-control `touch` output on focus instead of blur.
- Assuming `valid()` is `true` during async validation — it's `false` while `pending()`.
- Using Signal Forms below Angular v21.
