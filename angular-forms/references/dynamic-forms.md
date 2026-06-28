# Dynamic Forms

Source: https://angular.dev/guide/forms/dynamic-forms

Dynamic forms build form structure **from metadata** rather than hardcoding controls in a
template. This is useful for questionnaire-style forms whose fields change frequently or
come from a backend. The pattern is built on reactive forms.

## Architecture

1. **`QuestionBase<T>`** — a base model describing a question (key, label, value, required,
   order, control type, options). Extend it for concrete types like `TextboxQuestion` and
   `DropdownQuestion`.
2. **`QuestionControlService`** — converts an array of questions into a `FormGroup`.
3. **`DynamicFormComponent`** — top-level container; builds the `FormGroup` and handles submit.
4. **`DynamicFormQuestionComponent`** — renders an individual question based on its `controlType`.
5. **`QuestionService`** — supplies the question metadata (often from a backend).

## QuestionBase model

```typescript
export class QuestionBase<T> {
  value: T | undefined;
  key: string;
  label: string;
  required: boolean;
  order: number;
  controlType: string;
  type: string;
  options: {key: string; value: string}[];

  constructor(options: {
    value?: T;
    key?: string;
    label?: string;
    required?: boolean;
    order?: number;
    controlType?: string;
    type?: string;
    options?: {key: string; value: string}[];
  } = {}) {
    this.value = options.value;
    this.key = options.key ?? '';
    this.label = options.label ?? '';
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType ?? '';
    this.type = options.type ?? '';
    this.options = options.options ?? [];
  }
}
```

Concrete questions:

```typescript
export class TextboxQuestion extends QuestionBase<string> {
  override controlType = 'textbox';
}

export class DropdownQuestion extends QuestionBase<string> {
  override controlType = 'dropdown';
}
```

## QuestionControlService

Transforms questions into a `FormGroup`, applying `Validators.required` when needed:

```typescript
import {Injectable} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {QuestionBase} from './question-base';

@Injectable({providedIn: 'root'})
export class QuestionControlService {
  toFormGroup(questions: QuestionBase<string>[]) {
    const group: any = {};
    questions.forEach((question) => {
      group[question.key] = question.required
        ? new FormControl(question.value || '', Validators.required)
        : new FormControl(question.value || '');
    });
    return new FormGroup(group);
  }
}
```

## DynamicFormComponent

Uses signals: takes the questions as an input signal and derives the `FormGroup` with `computed()`:

```typescript
import {Component, computed, inject, input} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {QuestionBase} from './question-base';
import {QuestionControlService} from './question-control.service';
import {DynamicFormQuestionComponent} from './dynamic-form-question.component';

@Component({
  selector: 'app-dynamic-form',
  imports: [ReactiveFormsModule, DynamicFormQuestionComponent],
  template: `
    <form (ngSubmit)="onSubmit()" [formGroup]="form()">
      @for (question of questions(); track question.key) {
        <app-question [question]="question" [form]="form()" />
      }
      <button type="submit" [disabled]="!form().valid">Save</button>
    </form>
  `,
})
export class DynamicFormComponent {
  private qcs = inject(QuestionControlService);

  questions = input<QuestionBase<string>[]>([]);
  form = computed(() => this.qcs.toFormGroup(this.questions()));

  onSubmit() {
    console.log(this.form().getRawValue());
  }
}
```

## DynamicFormQuestionComponent

Renders the right control by switching on `controlType`:

```typescript
import {Component, input} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {QuestionBase} from './question-base';

@Component({
  selector: 'app-question',
  imports: [ReactiveFormsModule],
  template: `
    <div [formGroup]="form()">
      <label [attr.for]="question().key">{{ question().label }}</label>

      @switch (question().controlType) {
        @case ('textbox') {
          <input
            [formControlName]="question().key"
            [id]="question().key"
            [type]="question().type"
          />
        }
        @case ('dropdown') {
          <select [id]="question().key" [formControlName]="question().key">
            @for (opt of question().options; track opt.key) {
              <option [value]="opt.key">{{ opt.value }}</option>
            }
          </select>
        }
      }

      @if (!isValid) {
        <div class="errorMessage">{{ question().label }} is required</div>
      }
    </div>
  `,
})
export class DynamicFormQuestionComponent {
  question = input.required<QuestionBase<string>>();
  form = input.required<FormGroup>();

  get isValid() {
    return this.form().controls[this.question().key].valid;
  }
}
```

## Best practices

- Keep question metadata as plain data so it can come from a backend/JSON.
- Sort questions by `order` before rendering.
- Derive the `FormGroup` with `computed()` so it rebuilds when metadata changes.
- Reuse `Validators` mapping logic in `QuestionControlService` for consistency.
- Use `@switch`/`@for` with `track` in the question renderer.

## Common mistakes

- Building the `FormGroup` imperatively in a way that doesn't update when inputs change
  (prefer `computed()` / signal inputs).
- Forgetting to bind `[formGroup]` on the question wrapper, so `formControlName` has no group.
- Mismatched `key` between the control and the metadata, causing "control not found" errors.
- Not handling all `controlType` values in the `@switch`.
