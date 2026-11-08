# Generate, Schematics, and `ng add`

A **schematic** is a template-based code generator: "a set of instructions for transforming a software project by generating or modifying code." Schematics are packaged into **collections** and distributed via npm. The Angular CLI runs schematics through `ng generate`. The default collection is `@schematics/angular`, and `ng generate`'s sub-commands are shorthand for the schematics in that collection.

## `ng generate`

```bash
# Long form and alias
ng generate component user-profile
ng g component user-profile

# Available built-in schematics (sub-commands)
#   ai-config, app-shell, application, class, component, config,
#   directive, enum, environments, guard, interceptor, interface,
#   library, module, pipe, resolver, service, service-worker, web-worker
ng g service data
ng g directive highlight
ng g pipe currency-format
ng g guard auth
ng g interceptor logging
ng g resolver user
ng g interface user
ng g pipe truncate
```

### Options common to `ng generate`

- `--defaults` — Disable interactive input prompts for options that have a default.
- `--dry-run` (`-d`) — Run through and report activity without writing out results.
- `--force` — Force overwriting of existing files.
- `--interactive` — Enable/disable interactive prompts (enabled by default).
- `--help` — Show a help message for the command.

### Per-schematic options (example: `component`)

```bash
ng generate component user-card \
  --inline-template \
  --inline-style \
  --skip-tests \
  --change-detection OnPush \
  --style scss \
  --selector app-user-card
```

| Option | Alias | Description |
|--------|-------|-------------|
| `--inline-style` | `-s` | Include the component's styles directly in the `component.ts` file. |
| `--inline-template` | `-t` | Include the component's HTML template directly in the `component.ts` file. |
| `--skip-tests` | — | Skip generation of unit test `spec.ts` files. |
| `--prefix` | `-p` | A prefix to be added to the component's selector. |
| `--style` | — | The stylesheet type to create, or `none` to skip. |
| `--change-detection` | `-c` | The change detection strategy for the component. |
| `--export` | — | Automatically export the component from the specified NgModule. |
| `--standalone` | — | Generate a standalone component. |
| `--flat` | — | Create the files directly in `src/app` rather than a subdirectory. |
| `--type` | — | Append a custom type to the component's filename. |
| `--selector` | — | The HTML selector to use for this component. |

Each schematic has its own options; inspect them with `ng generate <schematic> --help`.

### Choosing a specific schematic / collection

A JSON schema (`schema.json`) associated with each schematic tells the CLI what options are available and what the defaults are. To run a schematic from a non-default collection:

```bash
ng generate my-collection:my-schematic
# or
ng generate my-schematic --collection my-collection
```

## `ng add`

`ng add` "adds the npm package for a published library to your workspace, and configures the project in the current working directory to use that library." Libraries ship an **add schematic** that installs dependencies and runs initialization.

```bash
ng add <collection> [options]

ng add @angular/material
ng add @angular/pwa
ng add @angular/fire
```

| Option | Description |
|--------|-------------|
| `--defaults` | Disable interactive prompts for options with a default. |
| `--dry-run` / `-d` | Report activity without writing results. |
| `--force` | Force overwriting of existing files. |
| `--interactive` | Enable interactive prompts (default `true`). |
| `--registry` | The npm registry to use. |
| `--skip-confirmation` | Skip the confirmation prompt before installing/executing the package. |
| `--verbose` | Display additional details about internal operations. |

## Three schematic types a library can ship

- **Add schematics** — enable installation via `ng add`, handling dependencies and initialization.
- **Generation schematics** — tell `ng generate` how to scaffold artifacts, e.g. `ng generate @angular/material:table <component-name>`.
- **Update schematics** — support `ng update`, automatically resolving breaking changes during upgrades.

## Authoring custom builders (basics)

A **builder** is a handler function (run by Architect) that performs a process such as bundling or testing. Create one with `createBuilder()` from `@angular-devkit/architect`:

```ts
import {BuilderContext, BuilderOutput, createBuilder} from '@angular-devkit/architect';
import {JsonObject} from '@angular-devkit/core';

interface Options extends JsonObject {
  source: string;
  destination: string;
}

export default createBuilder(copyFileBuilder);

async function copyFileBuilder(options: Options, context: BuilderContext): Promise<BuilderOutput> {
  // ...do work, log via context.logger / report via context.reportStatus()
  return {success: true};
}
```

The handler receives `options` (a `JsonObject` from the user's config) and `context` (a `BuilderContext`). It returns a `BuilderOutput` with a boolean `success` and optional `error`. Register builders in a `builders.json` and link it from `package.json`:

```json
{
  "builders": {
    "copy": {
      "implementation": "./dist/my-builder.js",
      "schema": "./src/schema.json",
      "description": "Copies a file."
    }
  }
}
```

```json
{
  "name": "@example/copy-file",
  "builders": "builders.json"
}
```

This yields the builder name `@example/copy-file:copy`. Inputs are validated against the builder's `schema.json` before execution. The `BuilderContext` API includes `context.logger`, `context.reportProgress()`, `context.reportStatus()`, and `context.scheduleTarget()` (to run another builder).

## Best practices

- Always generate components/services/etc. with schematics so file naming, selectors, and structure follow project conventions.
- Preview generation with `--dry-run` before applying, especially in an existing project.
- Set defaults once in `angular.json` (schematics defaults) rather than passing the same flags on every command.
- Prefer `ng add <lib>` over `npm install <lib>` so the library's setup schematic configures the project.
- For reusable code generators across teams, package schematics into a collection and distribute via npm.

## Common mistakes

- Running `npm install` for a library that has an `ng add` schematic, then missing the required configuration the schematic would have applied.
- Passing component-specific flags (e.g. `--inline-template`) to the base `ng generate` command instead of to the schematic sub-command.
- Forgetting `--skip-tests` / spec preferences and then deleting generated spec files manually.
- Overwriting files with `--force` without first inspecting the change via `--dry-run`.
- Assuming every option exists on every schematic — check `ng generate <schematic> --help`.
