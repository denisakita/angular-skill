# Angular v21/v22 Starter Kit — setup recipe

Copy-paste steps to start a new project with the skills + conventions + strict tooling wired in.
Steps 1 to 5b and 7 were run end to end with Angular CLI 22.2 in November 2026. The optional
micro-frontend step is based on the Native Federation docs.

---

## 1. Scaffold the app

```bash
# Modern defaults: standalone + signals + zoneless, SSR, strict, SCSS, app prefix.
ng new my-app \
  --ssr \
  --zoneless \
  --strict \
  --style=scss \
  --routing \
  --prefix=app \
  --ai-config=claude-code \
  --package-manager=npm
cd my-app
```

Using CLI 21? Change it to `--ai-config=claude`.

Verified `ng new` flags (source: https://angular.dev/cli/new):

| Flag | Effect |
| --- | --- |
| `--ssr` | Server-side rendering + hydration wired up |
| `--zoneless` | No Zone.js; signals drive change detection |
| `--strict` | Stricter type checking **and** stricter bundle budgets |
| `--style` | `css` \| `scss` \| `sass` \| `less` \| `tailwind` |
| `--routing` | Adds `app.routes.ts` + `provideRouter` |
| `--prefix` | Selector prefix (keep in sync with `eslint.config.js`) |
| `--ai-config` | Generates AI-tool config files. CLI 22: `claude-code`, `gemini-cli`, `vscode`, `cursor`, `open-ai-codex`. CLI 21: `claude`, `gemini`, `copilot`, `cursor`, `jetbrains`, `windsurf`, `agents` |
| `--package-manager` | `npm` \| `pnpm` \| `yarn` \| `bun` |

> `--server-routing` is **not** a real flag — server render modes live in `app.routes.server.ts`.

---

## 2. Install the Angular skills

In Claude Code, run:

```
/plugin marketplace add denisakita/angular-skill
/plugin install angular-skill@angular-skill
```

Or copy the files into this project from a clone of this repo that sits next to it:

```bash
mkdir -p .claude/skills
cp -r ../angular-skill/skills/angular-* .claude/skills/
```

PowerShell:
```powershell
New-Item -ItemType Directory -Force .claude\skills
Copy-Item "..\angular-skill\skills\angular-*" ".claude\skills\" -Recurse
```

---

## 3. Drop in the conventions + config

Run these from your project root. They copy files from `starter-kit/` in a clone of this repo,
so clone it next to your project first if you haven't
(`git clone https://github.com/denisakita/angular-skill.git ../angular-skill`):

```bash
SK=../angular-skill/starter-kit      # where your clone's starter-kit folder is
cp "$SK/CLAUDE.md" .                 # standing instructions Claude auto-reads
cp "$SK/.prettierrc.json" .
cp "$SK/CODEOWNERS" .                 # then edit @your-org/* to real teams
# eslint + strict tsconfig: see steps 4–5
```

---

## 4. Lint + format

```bash
ng add angular-eslint          # installs eslint v9 + angular-eslint, generates flat config
cp "$SK/eslint.config.js" .    # replace with the stricter starter config (edit `prefix`)
npm i -D prettier
echo ".claude/" >> .prettierignore   # don't format the copied skills
```

Add scripts to `package.json`:
```json
{
  "scripts": {
    "lint": "ng lint",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

---

## 5. Maximize strictness

`--strict` already set most flags. Merge the extra `[ADD]` flags from
`starter-kit/tsconfig.strict.json` into your root `tsconfig.json` `compilerOptions` and
`angularCompilerOptions` (notably `strictStandalone`, `strictInputAccessModifiers`,
`noUnusedLocals`/`noUnusedParameters`). Do not replace the whole file.

---

## 5b. (Optional) Use the sample templates

`starter-kit/templates/` contains ready, idiomatic v21/v22 code you can adapt:

- `app.config.ts` — providers (zoneless is automatic, router + input binding + view transitions, `provideHttpClient()`, hydration)
- `app.routes.ts` — lazy-loaded routes with route-param input binding
- `app.routes.server.ts` — renders every route on the server, which the `users/:id` route needs
- `app.ts` — thin standalone root component (router outlet) + bootstrap snippet
- `app.spec.ts` — the test that matches this `app.ts`
- `features/user-profile/` — a first component using `input.required()`, `httpResource()`,
  `computed()`, `output()`, native control flow, plus a signal-based `user-store.ts`
  (`data-access`) showing the recommended state pattern

Copy what you need into `src/app/`, matching the no-type-suffix filenames. Copy these pairs
together: `app.routes.ts` with `app.routes.server.ts`, because the generated server routes try
to prerender `users/:id` and fail the build, and `app.ts` with `app.spec.ts`, because the
generated test expects the default page.

## 6. (Optional) Micro-frontends

Only if you genuinely need independently deployed remotes — read the
`angular-architecture-at-scale` skill first.

```bash
ng add @angular-architects/native-federation --project my-app
cp "$SK/federation.config.js" .   # then adjust name/exposes (remote) or use the host variant
```

---

## 7. Verify

```bash
npm run format     # once, after copying everything, so every file matches Prettier
npm run lint && npm run format:check
ng build
ng test --watch=false   # Vitest by default in v21/v22
ng serve
```

---

## What you end up with

- Standalone + signals + **zoneless** app, SSR + hydration ready
- `CLAUDE.md` so the agent applies modern conventions consistently
- All 23 Angular skills available on demand
- ESLint (flat config, a11y rules, modern-idiom rules) + Prettier
- Maximum-strict TypeScript + Angular templates
- `CODEOWNERS` for review governance
- Optional Native Federation for micro-frontends

Result: opening the project and asking Claude to build a feature yields **correct, current,
consistent Angular v21/v22 code** — without re-explaining the rules each time.
