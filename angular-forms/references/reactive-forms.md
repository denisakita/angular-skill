# Reactive Forms

Source: https://angular.dev/guide/forms/reactive-forms

Reactive forms provide a **model-driven** approach to handling form inputs whose values
change over time. You define the form model explicitly in the component class, giving
direct, synchronous, immutable access to the underlying form object model. They are more
scalable, reusable, and testable than template-driven forms.

## Building blocks

- **`FormControl`** — tracks the value and validation status of a single control.
- **`FormGroup`** — tracks value and status of a group of named controls.
- **`FormArray`** — tracks value and status of a numerically indexed list of controls.
- **`FormBuilder`** — injectable service with factory methods (`control()`, `group()`,
  `array()`) to reduce boilerplate.
- **`NonNullableFormBuilder`** — builds controls that are non-nullable by default.
- **`ControlValueAccessor`** — bridges `FormControl` instances and native DOM elements.

To use reactive forms, import `ReactiveFormsModule` into the standalone component.

## A single control

```typescript
import {Component} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-name-editor',
  imports: [ReactiveFormsModule],
  template: `
    <label for="name">Name: </label>
    <input id="name" type="text" [formControl]="name" />
    <p>Value: {{ name.value }}</p>
  `,
})
export class NameEditorComponent {
  name = new FormControl('');
}
```

## Form groups (and nested groups)

```typescript
import {Component} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-profile-editor',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
      <input formControlName="firstName" />
      <input formControlName="lastName" />

      <div formGroupName="address">
        <input formControlName="street" />
        <input formControlName="city" />
      </div>

      <button type="submit" [disabled]="!profileForm.valid">Submit</button>
    </form>
  `,
})
export class ProfileEditorComponent {
  profileForm = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    address: new FormGroup({
      street: new FormControl(''),
      city: new FormControl(''),
    }),
  });

  onSubmit() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    console.log(this.profileForm.value);
  }
}
```

- Bind the form with `[formGroup]`, controls with `formControlName`, nested groups with
  `formGroupName`.

## FormBuilder and NonNullableFormBuilder

```typescript
import {Component, inject} from '@angular/core';
import {FormBuilder, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-profile-editor',
  imports: [ReactiveFormsModule],
  template: `...`,
})
export class ProfileEditorComponent {
  private fb = inject(FormBuilder);

  profileForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: [''],
    address: this.fb.group({
      street: [''],
      city: [''],
    }),
  });
}
```

The array syntax `['initialValue', syncValidators, asyncValidators]` replaces manual
`new FormControl()` construction.

For non-nullable controls, either inject `NonNullableFormBuilder` or use `fb.nonNullable`:

```typescript
private fb = inject(NonNullableFormBuilder);
login = this.fb.group({
  email: '',     // FormControl<string>, never null
  password: '',
});
```

## Reading and updating values

- Read: `control.value`, or subscribe to `control.valueChanges`.
- `setValue(value)` — replaces the entire value; strictly validates structure (every
  control must be provided).
- `patchValue(partialValue)` — partially updates; silently ignores structural mismatches.

```typescript
updateName() {
  this.name.setValue('Nancy');
}
```

## FormArray (dynamic lists)

```typescript
import {Component, inject} from '@angular/core';
import {FormArray, FormBuilder, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-profile-editor',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="profileForm">
      <div formArrayName="aliases">
        @for (alias of aliases.controls; track $index; let i = $index) {
          <input [formControlName]="i" />
        }
      </div>
      <button type="button" (click)="addAlias()">+ Add another alias</button>
    </form>
  `,
})
export class ProfileEditorComponent {
  private fb = inject(FormBuilder);

  profileForm = this.fb.group({
    aliases: this.fb.array([this.fb.control('')]),
  });

  get aliases() {
    return this.profileForm.get('aliases') as FormArray;
  }

  addAlias() {
    this.aliases.push(this.fb.control(''));
  }
}
```

Bind the array container with `formArrayName` and each control by index with `[formControlName]="i"`.

## Control state and status

- Status: `control.status` is one of `VALID`, `INVALID`, `PENDING`, `DISABLED`
  (helpers: `valid`, `invalid`, `pending`, `disabled`).
- Interaction: `markAsTouched()`, `markAsDirty()`, `markAsPristine()`,
  `markAllAsTouched()` (cascades touched to all descendants — useful before showing
  errors on submit).

## Listening to changes

- `valueChanges` / `statusChanges` — observables for value and status changes.
- `events` — a unified observable emitting `ValueChangeEvent`, `StatusChangeEvent`,
  `PristineChangeEvent`, `TouchedChangeEvent`, `FormResetEvent`, `FormSubmittedEvent`.

```typescript
import {ValueChangeEvent} from '@angular/forms';

this.profileForm.events.subscribe((e) => {
  if (e instanceof ValueChangeEvent) {
    console.log('Value:', e.value);
  }
});
```

Suppress emissions / scope updates with options:

```typescript
this.profileForm.setValue(savedDraft, {emitEvent: false});
this.control.setValue(v, {onlySelf: true}); // don't update parent
```

## Type narrowing utilities

`isFormControl()`, `isFormGroup()`, `isFormArray()`, `isFormRecord()` safely narrow an
`AbstractControl`:

```typescript
import {isFormArray} from '@angular/forms';

if (isFormArray(control)) {
  const hasNegative = control.controls.some((c) => c.value < 0);
}
```

## Best practices

- Use `inject(FormBuilder)` / `inject(NonNullableFormBuilder)` instead of constructor injection.
- Prefer `NonNullableFormBuilder` (or `{ nonNullable: true }`) so `reset()` doesn't null values.
- Use `setValue` when you have the full shape (catches typos); `patchValue` for partial updates.
- On submit, guard with `if (form.invalid) { form.markAllAsTouched(); return; }`.
- Use `@for` with `track` (e.g. `track $index`) when rendering a `FormArray`.
- Pass `{ emitEvent: false }` when programmatically setting values you don't want to react to.

## Common mistakes

- Forgetting to import `ReactiveFormsModule` in the standalone component.
- Mixing `[formControl]` with `formControlName` — use `formControlName` inside a `[formGroup]`,
  `[formControl]` for a standalone control.
- Using `setValue` with a partial object (it throws); use `patchValue` instead.
- Mutating `FormArray.controls` directly instead of using `push`/`removeAt`/`insert`/`clear`.
- Subscribing to `valueChanges` without unsubscribing (leaks); prefer `takeUntilDestroyed()`
  or the `async` pipe.
- Expecting `value` to include disabled controls — it omits them; use `getRawValue()` to include them.
