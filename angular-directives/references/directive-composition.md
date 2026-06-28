# Directive Composition API

Source: https://angular.dev/guide/directives/directive-composition-api

The directive composition API lets you apply directives to a component's (or directive's) host element from within the TypeScript class, using the `hostDirectives` metadata property. This is Angular's preferred mechanism for reusing behavior — favor it over inheritance.

## Requirements

- Host directives must be **standalone**; a directive used in `hostDirectives` cannot specify `standalone: false`.
- Angular applies host directives **statically at compile time** — you cannot add them dynamically at runtime.
- Angular **ignores the `selector`** of directives applied via `hostDirectives`; they are applied unconditionally to the host.

## Adding host directives

```typescript
@Component({
  selector: 'admin-menu',
  templateUrl: './admin-menu.html',
  hostDirectives: [MenuBehavior],
})
export class AdminMenu {}
```

Every `AdminMenu` element now also runs `MenuBehavior`, including its host bindings and lifecycle.

## Exposing inputs and outputs

By default a host directive's inputs and outputs are **not** part of the host component's public API. Opt in explicitly:

```typescript
@Component({
  selector: 'admin-menu',
  templateUrl: './admin-menu.html',
  hostDirectives: [
    {
      directive: MenuBehavior,
      inputs: ['menuId'],
      outputs: ['menuClosed'],
    },
  ],
})
export class AdminMenu {}
```

```html
<admin-menu menuId="top-menu" (menuClosed)="logMenuClosed()"></admin-menu>
```

## Aliasing inputs and outputs

Rename the exposed inputs/outputs to shape your component's API:

```typescript
hostDirectives: [
  {
    directive: MenuBehavior,
    inputs: ['menuId: id'],
    outputs: ['menuClosed: closed'],
  },
],
```

```html
<admin-menu id="top-menu" (closed)="logMenuClosed()"></admin-menu>
```

## Composing directives

Apply `hostDirectives` to other directives to aggregate behavior transitively:

```typescript
@Directive({ /* ... */ })
export class Menu {}

@Directive({ /* ... */ })
export class Tooltip {}

@Directive({
  hostDirectives: [Tooltip, Menu],
})
export class MenuWithTooltip {}

@Directive({
  hostDirectives: [MenuWithTooltip],
})
export class SpecializedMenuWithTooltip {}
```

## Execution order

Host directives run **before** the component/directive they're applied to, allowing the consuming class to override their bindings:

1. `MenuBehavior` instantiated
2. `AdminMenu` instantiated
3. `MenuBehavior` receives inputs (`ngOnInit`)
4. `AdminMenu` receives inputs (`ngOnInit`)
5. `MenuBehavior` applies host bindings
6. `AdminMenu` applies host bindings

## De-duplication rules

- **Template match precedence:** if a directive also matches via a template selector, the template match takes priority and the full directive API is preserved.
- **Merging:** if the same directive is applied through multiple host-directive paths (the diamond problem), Angular merges it into a single instance combining all input/output mappings.
- **Conflicting aliases:** Angular throws a compile-time error (NG8024) if merged instances expose the same input/output under different aliases.

## Best practices

- Use composition instead of inheritance to share host behavior across components and directives.
- Keep each host directive focused on one concern (e.g. a `Tooltip`, a `MenuBehavior`) so they compose cleanly.
- Expose only the inputs/outputs that should be part of the host's public API; alias them to give your component a coherent API surface.
- Document which behaviors a component inherits via `hostDirectives` so consumers know which inputs/outputs exist.

## Common mistakes

- Trying to use a non-standalone directive (or one with `standalone: false`) as a host directive.
- Expecting host directive inputs/outputs to be available on the host without listing them in `inputs`/`outputs`.
- Relying on the host directive's `selector` to gate application — it is ignored.
- Creating conflicting aliases for the same merged directive, triggering NG8024.
- Attempting to add or remove host directives at runtime.
