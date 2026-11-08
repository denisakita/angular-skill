# Template-Driven Forms

Source: https://angular.dev/guide/forms/template-driven-forms

Template-driven forms use Angular directives to bind form controls to a data model with
two-way data binding. The form model is **implicit** (created by directives) and mutable,
and data flow is **asynchronous**. Best for small to moderately complex forms whose logic
fits in the template. They don't scale as well as reactive forms.

Import `FormsModule` into the standalone component.

## Key directives

- **`NgModel`** — reconciles value changes between the form element and the data model;
  enables input validation and error handling.
- **`NgForm`** — creates a top-level `FormGroup` and automatically attaches to `<form>`
  elements when `FormsModule` is imported.
- **`NgModelGroup`** — creates and binds a `FormGroup` to a DOM element to organize
  related controls.

## Basic example

```typescript
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';

interface Actor {
  name: string;
  studio: string;
}

@Component({
  selector: 'app-actor-form',
  imports: [FormsModule],
  template: `
    <form #actorForm="ngForm" (ngSubmit)="onSubmit(actorForm)">
      <label for="name">Name</label>
      <input
        id="name"
        name="name"
        required
        [(ngModel)]="model.name"
        #name="ngModel"
      />
      @if (name.invalid && (name.dirty || name.touched)) {
        <div class="error">
          @if (name.errors?.['required']) {
            <span>Name is required.</span>
          }
        </div>
      }

      <label for="studio">Studio</label>
      <input id="studio" name="studio" [(ngModel)]="model.studio" />

      <button type="submit" [disabled]="actorForm.invalid">Submit</button>
    </form>
  `,
})
export class ActorFormComponent {
  model: Actor = {name: '', studio: ''};

  onSubmit(form: NgForm) {
    if (form.valid) {
      console.log(this.model);
    }
  }
}
```

- `[(ngModel)]="model.prop"` is two-way binding (banana-in-a-box).
- Every `ngModel` control **must have a unique `name` attribute** so `NgForm` can register it.
- `#actorForm="ngForm"` and `#name="ngModel"` export directive instances as template
  reference variables to read state (`valid`, `invalid`, `dirty`, `touched`, `errors`).

## Grouping controls

```html
<form #actorForm="ngForm">
  <div ngModelGroup="address">
    <input name="street" [(ngModel)]="model.address.street" />
    <input name="city" [(ngModel)]="model.address.city" />
  </div>
</form>
```

## Form state CSS classes

Angular applies classes reflecting control state, usable for styling:

- `ng-untouched` / `ng-touched` — whether the control has been focused/blurred.
- `ng-pristine` / `ng-dirty` — whether the value has been modified.
- `ng-valid` / `ng-invalid` — validation status.
- `ng-pending` — async validation in progress.
- `ng-submitted` — applied to the `<form>` element after submission.

## ngModelOptions

Tune update timing (useful for performance / async validators):

```html
<input name="email" [(ngModel)]="model.email" [ngModelOptions]="{updateOn: 'blur'}" />
```

`updateOn` can be `'change'` (default), `'blur'`, or `'submit'`.

## Best practices

- Reserve template-driven forms for simple cases; reach for reactive forms as complexity grows.
- Always give each `ngModel` a unique `name`.
- Show errors only after `dirty || touched` to avoid premature messages.
- Bind the submit button's `disabled` to the exported `ngForm`'s `invalid`.
- Use `(ngSubmit)` (not the native `submit`) so Angular controls the submit lifecycle.
- Use `@if`/`@for` control flow in the template.

## Common mistakes

- Forgetting to import `FormsModule`.
- Omitting the `name` attribute — the control won't register with `NgForm`.
- Reading control state before exporting it (`#x="ngModel"` / `#f="ngForm"`).
- Expecting synchronous updates — template-driven data flow is asynchronous (Angular runs
  a second change-detection pass to avoid `ExpressionChangedAfterItHasBeenChecked` errors),
  which also means tests often need `await fixture.whenStable()`.
- Using template-driven forms for large/dynamic forms where reactive (or signal) forms scale better.
