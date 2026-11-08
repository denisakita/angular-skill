# Component Selectors

Source: https://angular.dev/guide/components/selectors

Every component defines a CSS selector that determines how it is used in templates. Angular matches selectors **statically at compile-time**, so they cannot depend on runtime values.

## Supported selector types

Angular supports three basic CSS selector types.

### Type (element) selector — the default and recommended choice

Matches by HTML tag name. The name must contain a hyphen per the custom-element spec.

```typescript
@Component({
  selector: 'profile-photo',
  template: `<img src="profile-photo.jpg" alt="Your profile photo" />`,
})
export class ProfilePhoto {}
```

```html
<profile-photo />
```

### Attribute selector

Matches elements that have a given attribute. Useful for enhancing a native element rather than introducing a new tag.

```typescript
@Component({
  selector: '[dropzone]',
  template: `<ng-content />`,
})
export class DropZone {}
```

Match a specific attribute value with the `=` operator (only `=` is supported):

```typescript
@Component({
  selector: '[type="reset"]',
  template: `...`,
})
export class ResetButton {}
```

### Class selector

Matches elements carrying a CSS class.

```typescript
@Component({
  selector: '.menu-item',
  template: `...`,
})
export class MenuItem {}
```

## Combining selectors

**Concatenate** to require all conditions on one element:

```typescript
@Component({
  selector: 'button[type="reset"]',
})
export class ResetButton {}
```

**Comma-separate** to match any of several selectors:

```typescript
@Component({
  selector: 'drop-zone, [dropzone]',
})
export class DropZone {}
```

## The `:not` pseudo-class

`:not` is the only pseudo-class Angular allows in selectors. Use it to narrow matches:

```typescript
@Component({
  selector: '[dropzone]:not(textarea)',
})
export class DropZone {}
```

## Limitations

- Selectors are matched **statically at compile-time** only.
- Only the `=` operator is supported for attribute matching (no `^=`, `*=`, etc.).
- Combinators (descendant ` `, child `>`, sibling `+`/`~`) are **not** supported.
- CSS namespaces are **not** supported.
- `:not` is the **only** allowed pseudo-class.

## Enhancing native elements with attribute selectors

Attribute selectors let you add behavior to a standard element without changing its tag:

```typescript
@Component({
  selector: 'button[yt-upload]',
  template: `<ng-content />`,
})
export class YouTubeUploadButton {}
```

```html
<button yt-upload>Upload</button>
```

## Best practices

- **Prefer element (type) selectors** for components; reserve attribute selectors for augmenting native elements.
- **Use a short, consistent custom prefix** (e.g. `app-`, `yt-`) so your components are easy to identify and don't collide with third-party tags.
- **Use dash-case** for element names and lowercase dash-case for attribute selectors.
- Apply the same prefixing convention to attribute selectors (e.g. `button[yt-upload]`).

## Common mistakes

- **Using the `ng` prefix** — it is reserved for Angular's own framework APIs. Pick your own prefix.
- **Omitting the hyphen** in an element selector — custom element names must contain a dash.
- **Expecting combinators or extra attribute operators** — they are unsupported; restructure with concatenation, comma lists, or `:not`.
- **Assuming dynamic matching** — selectors are resolved at compile time, not based on runtime data.
