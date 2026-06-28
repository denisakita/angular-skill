# Setup: localize package & locale configuration

## Add the `@angular/localize` package

Run the Angular CLI schematic before using any i18n feature:

```bash
ng add @angular/localize
```

This command:

- Updates `package.json` and the TypeScript configuration files.
- Adds `"types": ["@angular/localize"]` to the TypeScript config.
- Adds the triple-slash directive `/// <reference types="@angular/localize" />` to the top of `main.ts`.

Without the package, building an app that contains `i18n` markup throws an error with setup guidance.

### Options

| Option | Purpose | Default |
|--------|---------|---------|
| `--project` | Name of the project to target. | — |
| `--use-at-runtime` | Enables `$localize` at runtime and moves `@angular/localize` to `dependencies` (instead of `devDependencies`). | `false` |

Most apps localize at build time (one build per locale) and do **not** need `--use-at-runtime`.

## Refer to locales by ID

Angular uses Unicode locale identifiers based on BCP 47 / CLDR. The format is:

```
{language_id}-{locale_extension}
```

Examples: `en-US`, `en-CA`, `fr-FR`, `fr-CA`, `de-DE`.

The Angular repository ships common locales in `@angular/common/locales`.

## Configure the source locale

The default source locale (the language your source code is authored in) is `en-US`. Override it under the project's `i18n` option in `angular.json`:

```json
{
  "projects": {
    "your-project": {
      "i18n": {
        "sourceLocale": "en-US"
      }
    }
  }
}
```

`sourceLocale` may be a plain string, or an object with `code`, `baseHref`, and `subPath`.

## Define target locales

Add a `locales` map alongside `sourceLocale`. Each entry maps a locale ID to its translation file (and optional `baseHref` / `subPath`):

```json
{
  "projects": {
    "your-project": {
      "i18n": {
        "sourceLocale": "en-US",
        "locales": {
          "fr": {
            "translation": "src/locale/messages.fr.xlf"
          },
          "de": {
            "translation": "src/locale/messages.de.xlf"
          }
        }
      }
    }
  }
}
```

The `translation` property points to the translated file you create per locale (see `translation-files.md`). The `subPath` controls the URL segment / output directory used when deploying (see `deploy.md`).

## Best practices

- Run `ng add @angular/localize` once, early, and commit the resulting config changes.
- Choose specific locale IDs (`fr-CA` vs `fr-FR`) deliberately — regional differences affect grammar, punctuation, and formatting.
- Keep translation files in a dedicated directory such as `src/locale/`.
- Set `sourceLocale` explicitly if your source text is not `en-US`, so the default build is labeled correctly.

## Common mistakes

- Writing `i18n` markup before adding the package, then being surprised the build fails.
- Using `--use-at-runtime` unnecessarily — it ships the localize runtime in production for apps that only need build-time localization.
- Putting the `i18n` block at the workspace root instead of under the specific `projects.<name>` entry.
- Using invalid or non-CLDR locale codes (e.g. `french` instead of `fr` / `fr-FR`).
