# Core `ng` Commands

The Angular CLI exposes its functionality through the `ng` binary (installed via the `@angular/cli` npm package). It follows Unix/POSIX option conventions:

- **Boolean options:** `--this-option` sets `true`; `--no-this-option` sets `false`. You can also write `--this-option=false` / `--this-option=true`.
- **Array options:** `--option value1 value2` or repeat the flag: `--option value1 --option value2`.
- **Key/value options:** `--define 'KEY_1="value1"' KEY_2=true` or repeat the flag.
- **Relative paths:** File options accept absolute or workspace-relative paths.

Get help for any command with `ng <command> --help`.

## Setup

Install the CLI globally, then scaffold and run an app:

```bash
# Install globally (pick one package manager)
npm install -g @angular/cli
pnpm install -g @angular/cli
yarn global add @angular/cli
bun install -g @angular/cli

# Create a workspace and starter application
ng new my-app
cd my-app

# Start the dev server and open the browser at http://localhost:4200/
ng serve --open
```

On Windows, if PowerShell blocks the CLI scripts, allow them for the current user:

```bash
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## Command reference

| Command | Alias | Description |
|---------|-------|-------------|
| `add` | — | Adds support for an external library to your project. |
| `analytics` | — | Configures the gathering of Angular CLI usage metrics. |
| `build` | `b` | Compiles an Angular application or library into an output directory named `dist/` at the given output path. |
| `cache` | — | Configure persistent disk cache and retrieve cache statistics. |
| `completion` | — | Set up Angular CLI autocompletion for your terminal. |
| `config` | — | Retrieves or sets Angular configuration values in the `angular.json` file. |
| `deploy` | — | Invokes the deploy builder for a specified project or the default project. |
| `e2e` | `e` | Builds and serves an Angular application, then runs end-to-end tests. |
| `extract-i18n` | — | Extracts i18n messages from source code. |
| `generate` | `g` | Generates and/or modifies files based on a schematic. |
| `lint` | — | Runs linting tools on Angular application code in a given project folder. |
| `new` | `n` | Creates a new Angular workspace. |
| `run` | — | Runs an Architect target with an optional custom builder configuration. |
| `serve` | `s`, `dev` | Builds and serves your application, rebuilding on file changes. |
| `test` | `t` | Runs unit tests in a project. |
| `update` | — | Updates your workspace and its dependencies. |
| `version` | `v` | Outputs Angular CLI version. |

## Common usage

```bash
# Scaffold a new workspace
ng new my-app

# Generate code (see generate-schematics.md)
ng generate component user-profile
ng g s data            # alias: g = generate, s = the service schematic shorthand

# Build (production configuration by default) and serve
ng build
ng serve

# Run unit tests and end-to-end tests
ng test
ng e2e

# Lint the project
ng lint

# Add a library and wire it up
ng add @angular/material

# Update Angular packages and run migrations
ng update @angular/cli @angular/core

# Deploy via a deploy builder
ng deploy

# Inspect or change workspace config
ng config
ng version
```

## Best practices

- Use the documented short aliases (`ng g`, `ng b`, `ng s`/`ng dev`, `ng t`) for speed, but spell commands out in scripts and docs for clarity.
- Run `ng <command> --help` to discover the exact, version-correct options instead of relying on memory.
- Use `--dry-run` (`-d`) with `generate`/`add` to preview file changes before committing them.
- Enable shell completion with `ng completion` so flags are easier to discover.
- Keep the globally installed CLI on the same major version as your project to avoid surprises; use `npx @angular/cli` to pin a specific version when needed.

## Common mistakes

- Editing files by hand that a schematic could generate consistently (drifting from project conventions).
- Confusing `ng new` (creates a whole workspace) with `ng generate application` (adds another app to an existing workspace).
- Forgetting that boolean flags can be negated with `--no-<flag>` and instead passing invalid values.
- Running an outdated global CLI against a newer project (or vice versa), causing mismatched schematics and builder errors.
- Assuming `ng build` is a debug build — it uses the production configuration by default.
