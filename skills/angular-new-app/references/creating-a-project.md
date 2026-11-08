# Creating a new Angular project

This covers everything from installing prerequisites to running the dev server for a brand-new Angular v21/v22 app.

## Prerequisites

- **Node.js** — `^22.22.3`, `^24.15.0` or `>=26.0.0` for Angular 22, and `^20.19.0`, `^22.12.0` or `>=24.0.0` for Angular 21. Installing Node.js also installs `npm`.
- **A text editor** — Visual Studio Code is recommended.
- **A terminal** — required for running Angular CLI commands.
- (Recommended) the **Angular Language Service** editor extension.

You should be comfortable with HTML, CSS, JavaScript, and ideally TypeScript.

## Installing the Angular CLI

Install the CLI globally with your package manager of choice:

```bash
npm install -g @angular/cli
```

Alternatives:

```bash
pnpm install -g @angular/cli
yarn global add @angular/cli
bun install -g @angular/cli
```

On **Windows**, PowerShell script execution is disabled by default. If global CLI commands are blocked, enable signed scripts:

```bash
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

On **Unix/Linux**, global installs may require elevated permissions — prepend `sudo` if needed.

## Creating a workspace with `ng new`

Generate a new workspace and starter application:

```bash
ng new my-app
```

The CLI asks a series of prompts about which features to include. Pressing Enter accepts the default for each. On success you'll see output similar to:

```
✔ Packages installed successfully.
Successfully initialized git.
```

### Documented `ng new` flags

You can answer prompts non-interactively by passing flags. These options are documented for `ng new`:

- `--ssr` — Configure the initial application for Server-Side Rendering (SSR) and Static Site Generation (SSG/Prerendering).
- `--zoneless` — Create an initial application that does not utilize zone.js.
- `--style` — The type of stylesheet files to be created for components in the initial project (e.g. `css`, `scss`).
- `--routing` — Enable routing in the initial application project; sets up the files needed for navigation between views.
- `--inline-style` — Include the root component's styles directly in `app.ts` instead of a separate stylesheet file (e.g. `app.css`).
- `--inline-template` — Include the root component's HTML template directly in `app.ts` instead of a separate template file (e.g. `app.html`).
- `--ai-config` — Specifies which AI tools to generate configuration files for; these files help AI tools follow best practices.
- `--standalone` — Create an application based on the standalone API, without NgModules.
- `--prefix` — The prefix applied to generated component selectors (e.g. with prefix `my-app`, a component `my-component` gets selector `my-app-my-component`).
- `--skip-tests` — Skip generation of `*.spec.ts` unit test files.
- `--package-manager` — The package manager used to install dependencies.

Example combining several flags:

```bash
ng new my-app --style=scss --ssr --routing
```

## Running the development server

Move into the workspace and start the dev server. Either of these works:

```bash
cd my-app
npm start
```

or, using the CLI directly with auto-open:

```bash
ng serve --open
```

The `--open` (alias `-o`) flag opens your browser automatically. The app runs at **http://localhost:4200/** with file watching and live reload enabled.

## Try it without local setup

Angular's online **Playground** is the fastest way to experiment with an app — no local installation required.

## Best practices

- Use a Node.js version inside the CLI's supported range, listed above.
- Accept the CLI prompt defaults unless you have a specific reason to change them — they reflect current recommended setup.
- Prefer passing flags for repeatable, scripted project creation (CI, templates).
- Choose your stylesheet format up front with `--style` to avoid migrating files later.
- Keep the globally installed CLI reasonably current so `ng new` scaffolds modern defaults.

## Common mistakes

- Installing the CLI without Node.js present, or with a Node version below the documented minimum.
- Forgetting the Windows execution-policy step and assuming the CLI install failed.
- Inventing flags that the docs don't document — stick to the documented options above.
- Running `ng serve` from outside the workspace directory.
- Expecting `npm start` and `ng serve` to differ — `npm start` runs `ng serve` under the hood for a new project.
