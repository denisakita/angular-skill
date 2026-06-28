# Template variables (`@let` and `#ref`)

Angular templates support two kinds of variables: local variables declared with `@let`, and template reference variables declared with `#`.

## `@let` — local template variables

`@let` declares a local variable from a template expression. Its value stays synchronized with the expression, just like a binding.

```html
@let name = user.name;
@let greeting = 'Hello, ' + name;
@let data = data$ | async;
@let pi = 3.14159;
@let coordinates = {x: 50, y: 100};
```

Rules:

- Each `@let` declares exactly one variable (no comma-separated declarations).
- The declaration is terminated by `;`.
- The variable cannot be reassigned, but its value auto-updates when the expression's dependencies change.
- Scope: the current view and its descendants. `@let` is NOT hoisted — it is not accessible to parent views or to siblings declared before it.

Usage example:

```html
@let user = user$ | async;

@if (user) {
  <h1>Hello, {{ user.name }}</h1>
  <user-avatar [photo]="user.photo" />

  @for (snack of user.favoriteSnacks; track snack.id) {
    <li>{{ snack.name }}</li>
  }
}
```

## Template reference variables (`#name`)

A `#` variable references a DOM element, an Angular component, a directive, or a `TemplateRef` from an `<ng-template>`.

```html
<!-- references the DOM input element -->
<input #taskInput placeholder="Enter task name" />

<!-- references the component instance -->
<my-datepicker #startDate />

<!-- references a TemplateRef -->
<ng-template #myFragment>...</ng-template>

<!-- assign a specific directive exported as 'dropZone' -->
<section dropZone #firstZone="dropZone">...</section>
```

By default a reference variable points to the host element (or component on it). Use `#var="exportName"` to reference a specific directive by its `exportAs` name.

Scope: a reference variable is scoped to its template and is accessible in nested templates created by structural blocks, but not from a parent template.

```html
<input #taskInput placeholder="Enter task name" />
<button (click)="addTask(taskInput.value)">Add</button>
```

## Best practices

- Use `@let` to compute a value once (e.g. `@let user = user$ | async;`) and reuse it, avoiding repeated `| async` subscriptions.
- Combine `@let` with `@if`/`@for` to unwrap and narrow nullable async values.
- Use `#ref` to read native element values (e.g. `taskInput.value`) or to call a child component/directive's public API.

## Common mistakes

- Trying to declare multiple variables in one `@let` (`@let a = 1, b = 2;`) — not allowed; use separate `@let` statements.
- Expecting `@let` to be hoisted or visible in a parent/sibling view — it is scoped to its declaration's view and descendants only.
- Reassigning a `@let` variable — it is read-only; only its expression-driven value updates.
- Referencing a `#var` from outside its scope (e.g. a parent template).
