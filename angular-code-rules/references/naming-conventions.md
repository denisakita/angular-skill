# Naming Conventions

Grounded in the official Angular Style Guide (angular.dev / next.angular.dev).
Targets modern Angular (v21/v22).

## File naming

- **Separate words within a file name with hyphens (`-`).** A component named
  `UserProfile` has the file name `user-profile.ts`.
- **No type suffixes in filenames.** The modern Style Guide uses
  `user-profile.ts` — it does **not** use the old `user-profile.component.ts`,
  `*.service.ts`, or `*.directive.ts` patterns. (This is a deliberate change
  from older Angular style guidance.)
- **File names should describe the contents** of the code in the file and match
  the identifier they contain.
- **Unit test files end with `.spec.ts`.** The test for `UserProfile` is
  `user-profile.spec.ts`.
- **Avoid generic names** like `helpers.ts`, `utils.ts`, or `common.ts`; name
  files for the concept they hold.

### Component file grouping

A component typically consists of one TypeScript file, one template file, and
one style file. **These files share the same base name** with different
extensions:

```
user-profile.ts
user-profile.html
user-profile.css
user-profile.spec.ts
```

When a component needs **multiple style files**, append descriptive words:

```
user-profile-settings.css
user-profile-subscription.css
```

## Symbol / class naming

- **Class names use PascalCase**: `UserProfile`, `MovieReelService`.
- **File names (kebab-case) map to the identifier they contain**:
  `user-profile.ts` → `class UserProfile`.

```typescript
// File: user-profile.ts
@Component({ /* ... */ })
export class UserProfile { /* ... */ }
```

## Selector naming

- **Use an application-specific prefix** for your selectors (the guide uses
  `mr` for a "MovieReel" example app).
- **Directive selectors use attribute selectors in camelCase** with the prefix:
  e.g. `[mrTooltip]`.

```typescript
@Directive({
  selector: '[mrTooltip]',
})
export class Tooltip { /* ... */ }
```

(Component selector and input/output naming details live in the Components
guide; the Style Guide points there for specifics.)

## DO / DON'T

DO:
- Use hyphens to separate words in file names (`user-profile.ts`).
- Give a component's `.ts`/`.html`/`.css` files the same base name.
- End unit test files with `.spec.ts`.
- Match the file name to the class/identifier it contains.
- Prefix selectors with an app-specific prefix; use camelCase attribute
  selectors for directives.

DON'T:
- Add `.component`, `.service`, or `.directive` suffixes to file names.
- Use generic catch-all file names like `utils.ts`, `helpers.ts`, `common.ts`.
- Use file names that don't reflect their contents.
