---
name: angular-cli
description: Use this skill when scaffolding, building, serving, testing, deploying, generating code for, or updating Angular v21/v22 applications with the Angular CLI (`ng`).
license: MIT
metadata:
  source: https://angular.dev/tools/cli
  angularVersion: '21-22'
  version: '1.0'
---

# Angular CLI

The Angular CLI is the command-line tool (`ng`) for scaffolding, developing, testing, deploying, and maintaining Angular applications. It is distributed via npm as `@angular/cli` and is the primary entry point for every workflow on Angular v21/v22. This skill covers the CLI commands, the modern `@angular/build` (esbuild/Vite) builders, schematics, environments, updates/migrations, and the Angular CLI MCP server. All content is grounded in the official docs at https://angular.dev/tools/cli.

## Reference files

- `references/commands.md` — Overview of the core `ng` commands (`new`, `generate`, `build`, `serve`, `test`, `add`, `update`, `lint`, `e2e`, `deploy`) with documented usage and flags.
- `references/generate-schematics.md` — `ng generate` for components/services/etc., schematics collections, `ng add`, and the basics of authoring custom schematics and builders.
- `references/build-and-serve.md` — `ng build` and `ng serve`, the `@angular/build:application` (esbuild) builder and Vite dev server, production builds, watch mode, budgets, and output.
- `references/environments.md` — `ng generate environments`, environment files, `fileReplacements` in `angular.json`, and the production/development build configurations.
- `references/update-and-migrations.md` — `ng update`, automatic migration schematics, and keeping dependencies in sync across major versions.
- `references/mcp-server.md` — The Angular CLI MCP server (`ng mcp` / `npx @angular/cli mcp`): what it is, how to configure editors, the tools it exposes, and its flags.

## Core rules

- Require an active LTS or maintenance LTS version of Node.js; it ships with npm.
- Install the CLI globally with `npm install -g @angular/cli` (or the pnpm/yarn/bun equivalent) to get the `ng` binary.
- Create new workspaces with `ng new <name>`; never hand-roll the workspace layout.
- Prefer the modern `@angular/build:application` builder (the default for new apps) over the legacy webpack-based `@angular-devkit/build-angular:browser`.
- Use `ng serve` for development (Vite-based dev server, live reload) and `ng build` for output; `ng build` uses the production configuration by default.
- Generate code with schematics (`ng generate` / alias `ng g`) instead of writing boilerplate by hand, so naming and structure stay consistent.
- Use `ng update` (not manual `package.json` edits) to upgrade Angular packages so migration schematics run automatically.
- Never commit secrets (API keys, etc.) to environment files — they are bundled into client-side code.
- Follow CLI option conventions: boolean flags use `--flag` / `--no-flag`; preview any destructive generation with `--dry-run` (`-d`).
- Base every command and flag on the official docs or `ng <command> --help`; do not invent options.
