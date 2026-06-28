# Strictly Typed Reactive Forms

Source: https://angular.dev/guide/forms/typed-forms

As of Angular 14, reactive forms are **strictly typed by default**. This gives type-safe
value access, IDE autocomplete, and compile-time errors for invalid usage (such as reading
a control that doesn't exist). Signal Forms are also fully typed; this page covers the
classic `FormControl`/`FormGroup`/`FormArray` typing.

## FormControl typing and nullability

A control infers its type from the initial value:

```typescript
const email = new FormControl('angularrox@gmail.com');
// Type: FormControl<string | null>
```

The value is **nullable by default** because `reset()` sets the control to `null`. Opt out
with `nonNullable`:

```typescript
const email = new FormControl('angularrox@gmail.com', {nonNullable: true});
email.reset();
console.log(email.value); // 'angularrox@gmail.com' (initial value, not null)
```

When initializing with `null`, specify the type explicitly:

```typescript
const email = new FormControl<string | null>(null);
email.setValue('angularrox@gmail.com');
```

## FormGroup and partial values

```typescript
const login = new FormGroup({
  email: new FormControl('', {nonNullable: true}),
  password: new FormControl('', {nonNullable: true}),
});
```

`login.value` is `Partial<{email: string; password: string}>` because disabled controls
are omitted from `value`. Use `login.getRawValue()` to get the full non-partial value
including disabled controls.

## Optional controls and dynamic groups

Declare the group's type with optional controls when controls may be added/removed:

```typescript
interface LoginForm {
  email: FormControl<string>;
  password?: FormControl<string>;
}

const login = new FormGroup<LoginForm>({
  email: new FormControl('', {nonNullable: true}),
  password: new FormControl('', {nonNullable: true}),
});

login.removeControl('password'); // allowed because password is optional
```

## FormRecord

For an open-ended group where all controls share one type but keys are dynamic:

```typescript
const addresses = new FormRecord<FormControl<string | null>>({});
addresses.addControl('Andrew', new FormControl('2340 Folsom St'));
```

Use `FormRecord` for homogeneous, dynamically keyed groups; use `FormArray` for ordered lists.

## FormArray typing

```typescript
const names = new FormArray([new FormControl('Alex')]);
names.push(new FormControl('Jess'));
// FormArray<FormControl<string | null>>
```

## FormBuilder and NonNullableFormBuilder

`NonNullableFormBuilder` removes boilerplate for non-nullable forms:

```typescript
const fb = new FormBuilder();
const login = fb.nonNullable.group({
  email: '',
  password: '',
});
// Both controls are FormControl<string> (non-nullable)
```

You can also inject `NonNullableFormBuilder` directly and call `.group(...)`/`.control(...)`/`.array(...)`.

## Untyped forms (migration only)

Backwards compatibility is provided by the `Untyped*` symbols. Use them only for
incremental migration of pre-v14 code:

```typescript
const login = new UntypedFormGroup({
  email: new UntypedFormControl(''),
  password: new UntypedFormControl(''),
});
```

## Best practices

- Let Angular infer types from initial values; add explicit type params only when needed
  (e.g. `FormControl<string | null>(null)`).
- Default to `nonNullable` (via `{ nonNullable: true }` or `NonNullableFormBuilder`) so
  `reset()` keeps the declared type.
- Define an interface for groups with optional/removable controls.
- Use `getRawValue()` when you need disabled controls included.

## Common mistakes

- Initializing with `null` but expecting a non-null type — declare `FormControl<T | null>`
  or use `{ nonNullable: true }` with a real initial value.
- Reaching for `UntypedFormGroup`/`UntypedFormControl` in new code instead of typed forms.
- Forgetting that `value` is `Partial<...>` and omits disabled controls (use `getRawValue()`).
- Calling `removeControl()` on a control not marked optional in the group's interface
  (type error).
