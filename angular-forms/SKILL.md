---
name: angular-forms
description: Use when building or reviewing Angular forms (v21/v22) — covers reactive forms, template-driven forms, strictly typed forms, validation, dynamic (metadata-driven) forms, and the new Signal Forms API.
license: MIT
metadata:
  source: https://angular.dev/guide/forms
  angularVersion: '21-22'
  version: '1.0'
---

# Angular Forms

Authoritative guidance for building forms in Angular v21/v22, grounded strictly in
the official Angular documentation (https://angular.dev/guide/forms). Angular offers
three approaches that share a common base (`FormControl`, `FormGroup`, `FormArray`,
`ControlValueAccessor`):

1. **Reactive forms** — model-driven, explicit form model in the component class.
2. **Template-driven forms** — directive-driven (`ngModel`), logic lives in the template.
3. **Signal Forms** — the newest API (`@angular/forms/signals`), built on signals.
   Requires Angular v21+; stable in v22.

All examples use modern idioms: standalone components, `inject()`, the `@for`/`@if`
control flow, signals, and strictly typed forms.

## Reference files

Read the relevant reference before writing code. Each file contains an explanation,
correct modern code, Best practices, and Common mistakes.

- `references/reactive-forms.md` — `FormControl`/`FormGroup`/`FormArray`, `FormBuilder`,
  `NonNullableFormBuilder`, nested groups, `setValue`/`patchValue`, `valueChanges`/`events`.
- `references/template-driven-forms.md` — `FormsModule`, `ngModel`, `ngForm`, `ngModelGroup`,
  two-way binding, state CSS classes.
- `references/typed-forms.md` — strictly typed controls, nullability/`nonNullable`,
  `FormRecord`, optional controls, `Untyped*` migration, builder typing.
- `references/validation.md` — built-in `Validators`, custom sync/async validators,
  cross-field validation, validator directives, displaying errors, dynamic validators.
- `references/dynamic-forms.md` — metadata-driven forms (`QuestionBase`,
  `QuestionControlService`, building a `FormGroup` from metadata).
- `references/signal-forms.md` — `@angular/forms/signals`: `form()`, `schema()`, the
  `[formField]`/`FormRoot` directives, validators, form logic, field state, custom
  controls, async validation, submission. **Read this for any signals-based work.**

## Core rules

### Choosing an approach

- **Reactive forms** — default for anything non-trivial. Choose when forms are central
  to the app, when you need scalability, reusability, testability, immutable/synchronous
  state, or dynamic forms. The model is explicit and lives in the component class.
- **Template-driven forms** — only for simple forms whose logic fits entirely in the
  template. The model is implicit (created by directives) and mutable; data flow is
  asynchronous. Does not scale as well as reactive forms.
- **Signal Forms** (v21+, stable v22) — the modern signals-based approach. Choose when
  the app already embraces signals and you want type-safe field access, automatic
  two-way binding, and schema-based validation derived from a single source-of-truth
  signal model. Validation and field logic are declared in a schema function.

### Typed forms

- Reactive forms are **strictly typed by default since Angular 14**. Do not use
  `UntypedFormControl`/`UntypedFormGroup` except for incremental migration of legacy code.
- A `FormControl` is **nullable by default** (`FormControl<string | null>`) because
  `reset()` sets it to `null`. Use `{ nonNullable: true }` (or `NonNullableFormBuilder` /
  `fb.nonNullable`) when the value should never become `null`.
- When initializing with `null`, specify the type explicitly: `new FormControl<string | null>(null)`.

### Modern idioms (apply everywhere)

- Standalone components: import `ReactiveFormsModule` (reactive) or `FormsModule`
  (template-driven) directly in the component `imports` array; import the `FormField`
  directive for Signal Forms.
- Use `inject(FormBuilder)` / `inject(NonNullableFormBuilder)` rather than constructor params.
- Prefer `FormBuilder`/`NonNullableFormBuilder` to reduce `new FormControl(...)` boilerplate.
- Use `@for` (with `track`) and `@if` instead of `*ngFor`/`*ngIf` in templates.
- Submit via `(ngSubmit)` on reactive/template-driven forms; use `FormRoot` + `submit()`
  for Signal Forms.

### Validation essentials

- Built-in validators come from the `Validators` class (reactive) or HTML attributes +
  directives (template-driven). Signal Forms use schema validator functions
  (`required()`, `email()`, `min()`, ...).
- Sync validators run on change and return `ValidationErrors | null`; async validators
  run only after sync validators pass and put the control into the `pending` state.
- Display errors only after `touched`/`dirty` to avoid premature messages.
- Cross-field validation belongs on the parent `FormGroup` (reactive) or via
  `validate()`/`validateTree()` in a Signal Forms schema.
