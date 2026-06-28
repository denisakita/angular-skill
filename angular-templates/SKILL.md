---
name: angular-templates
description: Use when writing or reviewing Angular template syntax — text interpolation, property/attribute/class/style bindings, event listeners, two-way binding, @if/@for/@switch control flow, @let and template reference variables, @defer deferred loading, pipes, and template expression syntax (Angular v21/v22 modern idioms only).
license: MIT
metadata:
  source: https://angular.dev/guide/templates
  angularVersion: '21-22'
  version: '1.0'
---

# Angular Templates

Angular templates are chunks of HTML that define the DOM a component renders. They are compiled to JavaScript so Angular can update the page automatically as data changes and apply rendering optimizations. Templates live either in a component's `template` property or in an external `*.html` file referenced by `templateUrl`.

This skill covers the modern, current template authoring model for Angular v21 (LTS) and v22 (latest stable): built-in control flow (`@if`/`@for`/`@switch`), `@let`, `@defer`, signal reads in templates, and the bracket/parenthesis binding syntax. Legacy structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`, `ngClass`, `ngStyle`) are NOT used here.

## Reference files

- `references/binding.md` — text interpolation `{{ }}`, property binding `[prop]`, attribute binding `[attr.*]`, class binding `[class.*]`/`[class]`, style binding `[style.*]`/`[style]`, ARIA.
- `references/event-listeners.md` — event binding `(event)`, `$event`, key modifiers (`keyup.enter`, `.shift`, `.code`), global targets, prevention.
- `references/two-way-binding.md` — banana-in-a-box `[()]`, `[(ngModel)]` with `FormsModule`, component two-way binding with `model()`.
- `references/control-flow.md` — `@if`/`@else if`/`@else`, `@for` (`track`, contextual variables, `@empty`), `@switch`/`@case`/`@default`.
- `references/pipes.md` — what pipes are, built-in pipes, parameters, chaining, precedence, custom pipes, pure vs impure.
- `references/variables.md` — `@let` local variables and `#var` template reference variables, scope rules.
- `references/defer.md` — `@defer`/`@placeholder`/`@loading`/`@error`, triggers (idle, viewport, interaction, hover, immediate, timer, when), prefetch, constraints.
- `references/expression-syntax.md` — what is and isn't allowed in template expressions; whitespace handling.

## Core rules

1. **Use built-in control flow, never legacy structural directives.** Write `@if`/`@for`/`@switch`, not `*ngIf`/`*ngFor`/`*ngSwitch`. Built-in control flow needs no imports.
2. **`@for` always requires a `track` expression.** Track a stable unique id (e.g. `track item.id`); only use `track $index` when items have no stable identity. Tracking ties data to DOM nodes for fast updates.
3. **Read signals in templates by calling them.** A signal value is read with `()`, e.g. `{{ count() }}` and `[disabled]="isFormValid()"`. Values that change over time should come from signals.
4. **Use binding syntax for dynamic values.** `[prop]` for property/input binding, `(event)` for events, `[(prop)]` for two-way binding. Use `[attr.name]` only for attributes that have no corresponding DOM property (e.g. SVG, `role`).
5. **Prefer `@let` for derived template values** instead of repeating expressions; it stays synchronized with its expression and is scoped to its view and descendants.
6. **Use `@defer` to lazy-load heavy, non-critical UI.** Only standalone components/directives/pipes can be deferred; do not defer content in the initial viewport (causes layout shift).
7. **Template expressions are a restricted subset of JavaScript.** No `new`, no destructuring, no most globals (`Number`, `parseInt`, etc.), no bitwise operators, no assignments outside event handlers. Use pipes for transformation.
8. **Components/directives support self-closing tags** (e.g. `<UserProfile />`). The `@` character signals Angular blocks; a literal `@` must be escaped as `&commat;` or `&#64;`. `<script>` is not allowed in templates.
