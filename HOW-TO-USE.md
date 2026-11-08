# How to Use This Skill Library

This folder (`angular-skill`) is a library of **Agent Skills** for building modern
**Angular v21/v22** apps. This guide explains how to reuse it in any project, every time.

> What's here: 23 skills in `skills/`, each a folder named `angular-*` containing a `SKILL.md`
> plus `references/*.md`. See [`README.md`](README.md) for the full index.

---

## Quick start (per project)

1. **Create / open your Angular project** (modern setup the skills assume):
   ```bash
   ng new my-app --ssr --style=scss --zoneless --ai-config
   cd my-app
   ```

2. **Install the plugin** in Claude Code:
   ```
   /plugin marketplace add denisakita/angular-skill
   /plugin install angular-skill@angular-skill
   ```

3. **Code as usual.** The agent reads each `SKILL.md` description and auto-loads the
   relevant skill (ask "add a login form" → `angular-forms`; "make this route lazy" →
   `angular-routing`). You can also call one by name, e.g. `/angular-skill:angular-signals`.

That's it. You install the plugin once and it works in every project.

---

## Installation options

The plugin is the easiest way. To manage the files yourself, first clone this repo:

```bash
git clone https://github.com/denisakita/angular-skill.git
```

Then pick whichever fits how you work. The commands assume the clone sits next to your project:

| Option | Command | When to use |
| --- | --- | --- |
| **Plugin** (recommended) | see Quick start | Claude Code; install once, works everywhere |
| **Per-project** | `mkdir -p .claude/skills && cp -r ../angular-skill/skills/angular-* .claude/skills/` | Skills travel with the repo; safe to commit |
| **Global (all projects)** | `mkdir -p ~/.claude/skills && cp -r ../angular-skill/skills/angular-* ~/.claude/skills/` | You want them everywhere without the plugin |
| **Symlink (one source of truth)** | see below | Edit once, every project gets the update |

Symlink example (Windows PowerShell, run as admin or with Developer Mode on):
```powershell
New-Item -ItemType Directory -Force .claude\skills
Get-ChildItem "..\angular-skill\skills" -Directory -Filter "angular-*" |
  ForEach-Object {
    New-Item -ItemType SymbolicLink -Path ".claude\skills\$($_.Name)" -Target $_.FullName
  }
```

---

## Recommended order when building from scratch

1. `angular-new-app` — scaffold structure, `app.config.ts`, first component
2. `angular-principles` + `angular-code-rules` — set the rules up front
3. Feature skills as you build:
   - `angular-components`, `angular-templates`, `angular-directives`
   - `angular-signals` (state), `angular-dependency-injection` (services)
   - `angular-routing`, `angular-forms`, `angular-http`
4. `angular-testing` — write/maintain tests
5. `angular-performance` + `angular-security` + `angular-accessibility` — before shipping
6. `angular-ssr`, `angular-i18n`, `angular-animations`, `angular-zoneless` — as needed
7. `angular-best-practices` + `angular-design-patterns` — for reviews/refactors

---

## How the skills work (so you know what to expect)

- The agent first reads only the **frontmatter** (`name` + `description`) of each `SKILL.md`
  to decide which skill is relevant.
- It then loads the **specific `references/*.md`** it needs for your task — not all files —
  to keep things fast and focused.
- Content is grounded in the official [angular.dev](https://angular.dev) docs and uses
  **modern idioms only**: standalone components, signals, `@if`/`@for`/`@switch`, `inject()`,
  `input()`/`output()`/`model()`, OnPush/zoneless, functional guards/interceptors.

---

## Use with other tools

The `SKILL.md` + `references/` layout follows the open Agent Skills format, so it also works
with Gemini CLI and other agentic tools that support skills — point them at the `skills/`
folder or copy the `angular-*` folders from it into their skills directory.

---

## Updating the skills

These target Angular **v21/v22** (current as of June 2026). When a new Angular major lands:
- Re-check the affected `references/*.md` against the matching angular.dev page.
- Bump `version` in the relevant `SKILL.md` frontmatter.
- Update version notes in [`README.md`](README.md).
