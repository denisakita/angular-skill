# Updating and Migrations

`ng update` performs "a basic update to the current stable release of the core framework and CLI." Crucially, it does more than bump versions: libraries can ship **update schematics** (migrations) that automatically resolve breaking changes when you upgrade. Always use `ng update` instead of editing `package.json` by hand.

## Syntax

```bash
ng update [packages..] [options]
```

`packages` is the array of package name(s) to update.

## Common usage

```bash
# Update the core framework and CLI to the current stable release
ng update @angular/cli @angular/core

# Update to a specific major version
ng update @angular/cli@^22 @angular/core@^22

# Use prerelease (beta/RC) versions
ng update @angular/cli @angular/core --next

# Re-run only migrations (no version change) within a range
ng update @angular/core --migrate-only --from=20 --to=21
```

Running `ng update` with no package arguments analyzes the workspace and reports which packages can be updated.

## Options

| Flag | Alias | Default | Description |
|------|-------|---------|-------------|
| `--allow-dirty` | — | `false` | Allow updating when the repository has modified or untracked files. |
| `--create-commits` | `-C` | `false` | Create source-control commits for updates and migrations. |
| `--force` | — | `false` | Ignore peer dependency version mismatches. |
| `--from` | — | — | Version to migrate from. Only when a single package is updated, and only with `--migrate-only`. |
| `--migrate-only` | — | — | Only perform a migration; do not update the installed version. |
| `--name` | — | — | The name of the migration to run. Only when a single package is updated. |
| `--next` | — | `false` | Use the prerelease version, including betas and RCs. |
| `--to` | — | — | Version up to which to apply migrations. Only with `--migrate-only`; requires `--from`. |
| `--verbose` | — | `false` | Display additional details about internal operations. |
| `--help` | — | — | Show a help message for the command. |

## Recommended workflow

```bash
# 1. Make sure the working tree is clean (or use --allow-dirty deliberately)
git status

# 2. See what can be updated
ng update

# 3. Update the framework and CLI together, one major at a time
ng update @angular/cli@^22 @angular/core@^22

# 4. Update related Angular packages (e.g. Material) the same way
ng update @angular/material

# 5. Review the changes the migrations made, then build and test
ng build
ng test
```

The official, interactive **Update Guide** (https://angular.dev/update-guide) generates step-by-step instructions tailored to your from/to versions, app complexity, and extra dependencies (e.g. ngUpgrade, Angular Material, Windows).

## Best practices

- Update `@angular/cli` and `@angular/core` together so the CLI and framework stay compatible.
- Upgrade **one major version at a time** so the correct migration schematics run in sequence.
- Start from a clean git working tree; pair with `--create-commits` (`-C`) so each update/migration is a reviewable commit.
- Update Angular-ecosystem libraries (Material, etc.) with `ng update <lib>` too, so their update schematics run.
- Consult the interactive Update Guide for your exact version jump before starting a major upgrade.

## Common mistakes

- Bumping Angular versions manually in `package.json` and skipping the migrations that `ng update` would have applied.
- Jumping across multiple major versions in one step, bypassing intermediate migrations.
- Reaching for `--force` to push past peer-dependency mismatches instead of resolving the underlying incompatibility.
- Running on a dirty working tree without `--allow-dirty`, then being unable to tell which changes the migration made.
- Updating `@angular/core` without `@angular/cli` (or vice versa), leaving them out of sync.
