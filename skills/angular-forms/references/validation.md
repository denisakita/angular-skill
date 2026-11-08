# Form Validation

Source: https://angular.dev/guide/forms/form-validation

Angular runs validators automatically whenever a control changes; each validator returns
either a `ValidationErrors` object or `null`. This page covers validation for reactive and
template-driven forms (for Signal Forms validation see `signal-forms.md`).

## Built-in validators

The `Validators` class provides function-based validators mirroring the HTML attributes:

- `Validators.required`
- `Validators.requiredTrue`
- `Validators.min(n)` / `Validators.max(n)`
- `Validators.minLength(n)` / `Validators.maxLength(n)`
- `Validators.pattern(regex)`
- `Validators.email`

## Reactive forms validation

Pass sync validators as the second argument and async validators as the third:

```typescript
import {FormControl, Validators} from '@angular/forms';

name = new FormControl('', [Validators.required, Validators.minLength(4)]);
```

With `FormBuilder`:

```typescript
profileForm = this.fb.group({
  firstName: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]],
});
```

Status is available via `control.status` (`VALID` | `INVALID` | `PENDING` | `DISABLED`)
and `control.errors`.

## Custom synchronous validators

A validator factory returns a `ValidatorFn` that accepts an `AbstractControl` and returns
errors or `null`:

```typescript
import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export function forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const forbidden = nameRe.test(control.value);
    return forbidden ? {forbiddenName: {value: control.value}} : null;
  };
}
```

Apply it: `new FormControl('', [Validators.required, forbiddenNameValidator(/bob/i)])`.

## Cross-field validation

Apply a validator to the parent `FormGroup` so it can read sibling controls:

```typescript
import {AbstractControl, FormControl, FormGroup, ValidatorFn} from '@angular/forms';

export const unambiguousRoleValidator: ValidatorFn = (control: AbstractControl) => {
  const name = control.get('name');
  const role = control.get('role');
  return name && role && name.value === role.value ? {unambiguousRole: true} : null;
};

const actorForm = new FormGroup(
  {name: new FormControl(), role: new FormControl()},
  {validators: unambiguousRoleValidator},
);
```

## Asynchronous validators

Implement `AsyncValidatorFn` (or the `AsyncValidator` interface) returning a `Promise` or
`Observable`. The observable must complete (pipe through `first`, `last`, `take`, or
`takeUntil`). Async validators run only after sync validators pass; the control is
`pending` while they run.

```html
@if (model.pending) {
  <app-spinner />
}
```

To reduce async work, change `updateOn` from `'change'` (default) to `'blur'` or `'submit'`:

- Reactive: `new FormControl('', {updateOn: 'blur'})`
- Template-driven: `[ngModelOptions]="{updateOn: 'blur'}"`

## Template-driven validation

Use HTML validation attributes plus custom validator directives, and export `NgModel` to
read state:

```html
<input name="name" required minlength="4" [(ngModel)]="actor.name" #name="ngModel" />

@if (name.invalid && (name.dirty || name.touched)) {
  <div class="alert">
    @if (name.errors?.['required']) { <div>Name is required.</div> }
    @if (name.errors?.['minlength']) { <div>At least 4 characters.</div> }
  </div>
}
```

### Custom validator directive

Create a directive implementing `Validator` and register it with the `NG_VALIDATORS`
multi-provider:

```typescript
import {Directive, forwardRef} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator} from '@angular/forms';

@Directive({
  selector: '[appForbiddenName]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ForbiddenValidatorDirective),
      multi: true,
    },
  ],
})
export class ForbiddenValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return forbiddenNameValidator(/bob/i)(control);
  }
}
```

## Dynamic validator management

On `AbstractControl` at runtime:

- `addValidators()` / `removeValidators()` / `setValidators()` / `clearValidators()`
- `addAsyncValidators()` / `removeAsyncValidators()` / `setAsyncValidators()` / `clearAsyncValidators()`

**Always call `updateValueAndValidity()`** afterward to recompute status.

## Control status CSS classes

`.ng-valid` / `.ng-invalid`, `.ng-pristine` / `.ng-dirty`, `.ng-untouched` / `.ng-touched`,
`.ng-pending`, `.ng-submitted` (form only).

## Native HTML validation

Angular adds `novalidate` to forms by default (disabling native browser validation).
Re-enable it alongside Angular's with the `ngNativeValidate` directive.

## Best practices

- Reuse logic by writing validator **factories** (`(args) => ValidatorFn`).
- Put cross-field validators on the `FormGroup`, not individual controls.
- Gate error display on `dirty || touched` (and on submit, `markAllAsTouched()`).
- Use `updateOn: 'blur'`/`'submit'` to throttle expensive async validators.
- After mutating validators dynamically, call `updateValueAndValidity()`.

## Common mistakes

- Returning `false`/`undefined` from a validator instead of `null` (valid) or an errors object.
- Forgetting to complete the async validator's observable (it stays `pending` forever).
- Changing validators with `setValidators()` but not calling `updateValueAndValidity()`.
- Showing errors immediately (before `touched`/`dirty`), annoying the user.
- Forgetting the `multi: true` flag on the `NG_VALIDATORS` provider for directives.
