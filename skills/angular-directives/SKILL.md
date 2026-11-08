---
name: angular-directives
description: Use when building or reviewing Angular attribute & structural directives, sharing behavior via directive composition (hostDirectives), or optimizing images with NgOptimizedImage.
license: MIT
metadata:
  source: https://angular.dev/guide/directives
  angularVersion: '21-22'
  version: '1.0'
---

# Angular Directives

Directives are classes that add behavior to elements in Angular applications. Angular has three kinds of directives:

1. **Components** — directives with a template (the most common kind).
2. **Attribute directives** — change the appearance or behavior of an element, component, or another directive.
3. **Structural directives** — change the DOM layout by adding and removing DOM elements.

This skill covers attribute and structural directives, the directive composition API for reusing behavior across components and directives, and the `NgOptimizedImage` directive for image performance. All guidance targets modern Angular (v21/v22) idioms: standalone directives, `inject()`, signal inputs (`input()` / `input.required()`), the `host` metadata object, and `hostDirectives`.

## Reference files

Read the relevant reference before writing code:

- `references/attribute-directives.md` — building attribute directives: `@Directive`, selectors, `ElementRef` + `inject()`, the `host` object for events and bindings, signal inputs, passing values, `ngNonBindable`.
- `references/structural-directives.md` — structural directives: the `*` shorthand and its desugaring, `TemplateRef` + `ViewContainerRef`, building a custom structural directive, template type checking with `ngTemplateGuard_*` and `ngTemplateContextGuard`, microsyntax.
- `references/directive-composition.md` — the directive composition API: `hostDirectives`, exposing and aliasing inputs/outputs, composing directives, execution order, de-duplication rules.
- `references/image-optimization.md` — `NgOptimizedImage`: `ngSrc`, required `width`/`height` or `fill`, `priority` for LCP, placeholders, `srcset`/`sizes`, loaders, configuration.

## Core rules

- **Always make directives standalone.** Standalone is the default in modern Angular; never set `standalone: false`. Directives used in `hostDirectives` must be standalone.
- **Use `inject()` for dependencies** such as `ElementRef`, `TemplateRef`, and `ViewContainerRef` instead of constructor parameters.
- **Use signal inputs** (`input()` and `input.required<T>()`) instead of the `@Input()` decorator. Read values by calling the signal: `this.appHighlight()`.
- **Bind host events and properties through the `host` object** in the `@Directive` metadata rather than the `@HostListener` / `@HostBinding` decorators.
- **Prefer single class/style bindings over `NgClass`/`NgStyle`.** To add or remove a single class or style, use `[class.foo]` / `[style.color]` binding; reserve `ngClass`/`ngStyle` for managing several at once.
- **Only one structural directive per element** in shorthand (`*`) form. Wrap with `<ng-container>` to layer multiple.
- **Provide template type guards** (`ngTemplateContextGuard`, `ngTemplateGuard_*`) for custom structural directives so templates are type-checked.
- **Use `NgOptimizedImage` for static images.** Always supply `width`/`height` (or `fill`), and mark the LCP image with `priority`.
- **Prefer the directive composition API to inheritance** when reusing behavior across components and directives.
