---
name: angular-code-rules
description: Use when writing or reviewing Angular (v21/v22) code to apply the official Angular Style Guide — naming, file/folder structure, and modern component/service/template coding rules.
license: MIT
metadata:
  source: https://angular.dev/style-guide
  angularVersion: '21-22'
  version: '1.0'
---

# Angular Code Rules

Guidance for writing idiomatic, modern Angular (v21/v22) code that follows the
official Angular Style Guide. All rules here are grounded strictly in the
official Style Guide pages (`https://angular.dev/style-guide` and the latest
`https://next.angular.dev/style-guide`, which agree). Apply these rules when
authoring new code, refactoring legacy code, or reviewing pull requests. Favor
modern idioms: signals, standalone components, the `@if`/`@for`/`@switch`
control flow, `inject()`, `input()`/`output()`/`model()`, and `OnPush` change
detection.

The single most important meta-rule from the guide: **when a rule contradicts
the existing style of a particular file, prioritize consistency within that
file.**

## Reference files

- `references/naming-conventions.md` — File naming, class/symbol naming, and
  selector naming. Note the modern guide drops the old `.component`/`.service`
  filename suffixes. Read this when creating or renaming files and symbols.
- `references/file-structure.md` — Project/folder layout, `src` + `main.ts`,
  feature-based (not type-based) organization, one-concept-per-file, and
  co-locating tests. Read this when scaffolding projects or placing new files.
- `references/coding-rules.md` — Single responsibility, component/service/
  directive rules, dependency injection, template rules, member ordering, and
  access modifiers. Read this when writing or reviewing class and template code.

## Core rules

- **Filenames**: separate words with hyphens (`user-profile.ts`); do not add
  type suffixes like `.component`/`.service`. Tests end in `.spec.ts`. Avoid
  generic names like `utils.ts`, `helpers.ts`, `common.ts`.
- **Co-locate** a component's `.ts`, `.html`, and `.css` under the same base name.
- **One concept per file** — typically one component, directive, or service.
- **Organize by feature area**, not by file type. Avoid `components/`,
  `services/`, `directives/` folders. All UI code lives under `src`; bootstrap in
  `main.ts`.
- **Co-locate unit tests** next to the code under test; no central `tests/` dir.
- **Prefer `inject()`** over constructor parameter injection.
- **Group Angular members** (injected deps, inputs, outputs, queries) near the
  top of the class; declare properties before methods.
- **Mark Angular-initialized properties `readonly`** (`input`, `model`,
  `output`, queries).
- **Use `protected`** for members read only from the template.
- **Prefer `class`/`style` bindings** over `NgClass`/`NgStyle`.
- **Name event handlers for the action** (`saveUserData()`), not the event
  (`handleClick()`).
- **Keep templates and lifecycle hooks simple**; move complex logic into
  TypeScript, typically `computed()` signals or well-named methods.
- **Implement lifecycle interfaces** (e.g. `OnInit`) to guarantee correct hook
  method names.
