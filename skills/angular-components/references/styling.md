# Styling & View Encapsulation

Source: https://angular.dev/guide/components/styling

Component styles are scoped to the component by default. Angular embeds component styles with the JavaScript output so scoping works during lazy loading. Sass, Less, and Stylus preprocessors are supported.

## Defining styles

Inline:

```typescript
import {Component} from '@angular/core';

@Component({
  selector: 'profile-photo',
  template: `<img src="profile-photo.jpg" alt="Your profile photo" />`,
  styles: `
    img { border-radius: 50%; }
  `,
})
export class ProfilePhoto {}
```

External file:

```typescript
@Component({
  selector: 'profile-photo',
  templateUrl: 'profile-photo.html',
  styleUrl: 'profile-photo.css',
})
export class ProfilePhoto {}
```

(`styleUrls: [...]` accepts multiple files; `styleUrl` is the single-file form.)

## View encapsulation modes

Set via `encapsulation` in `@Component`.

```typescript
import {Component, ViewEncapsulation} from '@angular/core';

@Component({
  encapsulation: ViewEncapsulation.None,
})
export class MyComponent {}
```

### Emulated (default)

A component's styles only apply to elements in that component's template. Angular adds unique attributes to scope styles so they don't leak. Global styles can still affect the component. Supports `:host` and `:host-context()`.

### ShadowDom

Uses the native Shadow DOM API to attach a shadow root to the host. Styles inside the shadow tree cannot affect elements outside it. Note: it changes event propagation, interaction with the `<slot>` API, and how dev tools display the element.

### None

Disables encapsulation entirely — the component's styles behave as **global** styles.

## Host and context selectors

`:host` targets the component's own host element:

```css
:host {
  display: block;
  border: 1px solid #ccc;
}

:host(.active) {
  border-color: blue;
}
```

`:host-context()` styles the host based on an ancestor (e.g. a theme class on a parent). It is deprecated in browsers, but Angular's compiler fully supports it via attribute transformation:

```css
:host-context(.dark-theme) {
  background: black;
  color: white;
}
```

## `::ng-deep` (discouraged)

When a selector contains `::ng-deep`, Angular stops applying encapsulation boundaries after that point. It is discouraged for new code but kept for backwards compatibility.

```css
/* matches <a> inside <p> anywhere in the app */
::ng-deep p a {}

/* <p> from this template, but <a> anywhere */
p ::ng-deep a {}

/* both restricted to this host's descendants — preferred scoping if you must use it */
:host ::ng-deep p a {}
```

## Other styling options

- `<style>` elements inside a template respect the component's encapsulation mode. Angular does **not** support bindings inside `<style>` elements.
- External stylesheets loaded via `<link>` or CSS `@import` are **not** affected by emulated view encapsulation.

## Best practices

- Keep the default `Emulated` encapsulation unless you have a specific reason to change it.
- Use `:host` to style the component's own element rather than wrapping it in an extra `<div>`.
- Use `:host-context()` for theming based on ancestor classes.
- Set `:host { display: block }` (or appropriate) since custom elements are `display: inline` by default.

## Common mistakes

- **Reaching for `::ng-deep`** to style children — it's discouraged and global by default. If unavoidable, scope it with `:host ::ng-deep ...`.
- **Switching to `ViewEncapsulation.None`** casually — it makes all component styles global and prone to collisions.
- **Expecting `<link>`/`@import` stylesheets to be scoped** — emulated encapsulation does not apply to them.
- **Putting bindings inside `<style>`** — unsupported.
