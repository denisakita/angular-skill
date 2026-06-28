# Marking text for translation

Angular marks translatable content in three places: template text (`i18n`), element attributes (`i18n-<attr>`), and TypeScript strings (`$localize`).

## The `i18n` attribute (template text)

Place `i18n` on every element that contains fixed text you want translated:

```html
<h1 i18n>Hello i18n!</h1>
```

To translate text without emitting an extra DOM element, use `<ng-container>`:

```html
<ng-container i18n>I don't output any element</ng-container>
```

## Translating element attributes

Use `i18n-<attribute_name>` to mark an attribute value for translation:

```html
<img [src]="logo" i18n-title title="Angular logo" alt="Angular logo" />
```

This marks the `title` attribute. Add a separate `i18n-alt` to also translate `alt`.

## Metadata: meaning, description, and custom ID

The value of the `i18n` attribute carries optional metadata in the form:

```
{meaning}|{description}@@{customId}
```

- **meaning** — the intent/context, so identical phrases with different meanings translate consistently per context.
- **description** — extra guidance for the translator.
- **customId** — a manual, stable ID for the translation unit.

Examples (each part is optional, but order is fixed):

```html
<!-- description only -->
<h1 i18n="An introduction header for this sample">Hello i18n!</h1>

<!-- meaning | description -->
<h1 i18n="site header|An introduction header for this sample">Hello i18n!</h1>

<!-- custom id only -->
<h1 i18n="@@introductionHeader">Hello i18n!</h1>

<!-- meaning | description @@ custom id -->
<h1 i18n="site header|An introduction header for this sample@@introductionHeader">
  Hello i18n!
</h1>
```

Custom IDs **must be unique**. If two elements share an ID, the extraction tool extracts only the first, and both render the same translation:

```html
<!-- WRONG: same id for different text -->
<h3 i18n="@@myId">Hello</h3>
<p i18n="@@myId">Good bye</p>
```

## Named interpolation placeholders

Give interpolations meaningful placeholder names so translators understand them. In templates, use an inline `//i18n(ph="...")` comment:

```html
<p i18n>Hello, {{ username //i18n(ph="name") }}!</p>
```

The equivalent in component code uses `:name:`:

```typescript
$localize`Hello, ${username}:name:!`;
```

## ICU expressions

ICU expressions handle text that varies with a value. They live inside `i18n`-marked elements.

### `plural`

```html
<span i18n>Updated {minutes, plural,
  =0 {just now}
  =1 {one minute ago}
  other {{{ minutes }} minutes ago}}</span>
```

### `select`

```html
<span i18n>The author is {gender, select,
  male {male}
  female {female}
  other {other}}</span>
```

### Nested ICU (plural + select)

```html
<span i18n>Updated: {minutes, plural,
  =0 {just now}
  =1 {one minute ago}
  other {{{ minutes }} minutes ago by {gender, select,
    male {male}
    female {female}
    other {other}}}}</span>
```

## `$localize` in component code

Mark strings in TypeScript with the `$localize` tagged template literal. Metadata is prefixed with a leading colon block:

```typescript
import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  readonly toggle = signal(false);

  // meaning|description form
  readonly toggleAriaLabel = computed(() =>
    this.toggle()
      ? $localize`:Toggle Button|A button to toggle status:Show`
      : $localize`:Toggle Button|A button to toggle status:Hide`,
  );

  // custom id form
  readonly intro = $localize`:@@introductionHeader:Hello i18n!`;

  // named placeholder
  greet(username: string) {
    return $localize`Hello, ${username}:name:!`;
  }
}
```

`$localize` is globally available once `@angular/localize` is set up (it is referenced via the triple-slash directive in `main.ts`).

## Best practices

- Add `i18n` (or `i18n-<attr>`) to every element holding user-visible static text, including `aria-label`, `title`, `alt`, and `placeholder`.
- Use ICU `plural`/`select` instead of string concatenation so each language can apply its own grammar rules.
- Add a `meaning` whenever the same source phrase could be translated differently in different contexts.
- Give interpolations descriptive placeholder names so translators have context.
- Use `<ng-container i18n>` to translate text without polluting the DOM.

## Common mistakes

- Forgetting `i18n-` on an attribute (only the element's text gets translated, not the attribute).
- Reusing a custom `@@id` for different text — only the first occurrence is extracted.
- Putting metadata parts out of order; the format is always `meaning|description@@id`.
- Concatenating sentence fragments around interpolations instead of using one marked string or ICU expression.
- Leaving interpolations unnamed, giving translators opaque placeholders.
