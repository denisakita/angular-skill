---
name: angular-i18n
description: Use this skill when internationalizing or localizing an Angular (v21/v22) application — marking text for translation, extracting messages, managing translation files, formatting locale-aware data, and building/deploying per-locale builds.
license: MIT
metadata:
  source: https://angular.dev/guide/i18n
  angularVersion: '21-22'
  version: '1.0'
---

# Angular Internationalization (i18n)

Internationalization (i18n) is the process of designing and preparing an Angular project for use in different locales. Localization is the matching process of extracting text for translation and formatting data for a specific locale. A **locale** identifies a region (using a Unicode/CLDR/BCP 47 ID such as `en-US` or `fr-CA`) and determines how dates, numbers, currencies, and other values are formatted.

Angular's compile-time i18n marks text with the `i18n` attribute (templates) or the `$localize` tagged template literal (code), extracts it with `ng extract-i18n`, and produces one fully translated build per locale via `ng build --localize`.

This skill is grounded strictly in the official Angular docs. Use modern idioms: standalone components, signals, `@if`/`@for`, and `inject()`.

## Reference files

- **references/setup.md** — Read when starting i18n in a project: installing `@angular/localize` with `ng add`, what it changes, and configuring locales in `angular.json` (`i18n`, `sourceLocale`, `locales`).
- **references/mark-text-i18n.md** — Read when marking content for translation: the `i18n` attribute, `meaning|description@@id` metadata, `i18n-<attribute>`, ICU `plural`/`select` expressions, named placeholders, and `$localize` in TypeScript.
- **references/translation-files.md** — Read when extracting and creating translation files: `ng extract-i18n`, its options, file formats (XLIFF 1.2/2, XMB/XTB, JSON, ARB), and per-locale `messages.<locale>.xlf` files.
- **references/runtime-locales.md** — Read for runtime locale behavior: `LOCALE_ID`, `DEFAULT_CURRENCY_CODE`, `registerLocaleData` / global locale imports, and locale-aware pipes (`date`, `number`, `currency`, `percent`).
- **references/deploy.md** — Read when building and shipping localized apps: `localize` build option, per-locale configurations, `ng serve` for one locale, directory layout, and server redirect config (Nginx/Apache/SSR).

## Core rules

- Install `@angular/localize` with `ng add @angular/localize` before using any i18n features; building with i18n markup without it fails.
- Mark static template text with the `i18n` attribute; mark translatable HTML attributes with `i18n-<attribute>` (e.g. `i18n-title`); mark code strings with the `$localize` tagged template literal.
- Metadata syntax is `meaning|description@@customId`; all three parts are optional but must keep that order.
- Custom IDs (`@@id`) must be unique — if two elements share an ID, only the first is extracted and both get the same translation.
- Never edit the auto-generated `id` of a translation unit; it is derived from the text content plus meaning.
- Use ICU `plural` and `select` expressions for quantity- and grammar-dependent text instead of concatenating strings.
- Define locales under the project's `i18n` option in `angular.json` (`sourceLocale` defaults to `en-US`; `locales` maps each ID to its translation file).
- Build all locales with `ng build --localize` (or `"localize": true`); AOT is required for template localization.
- `ng serve` supports only one locale at a time — use a per-locale configuration.
- Override a pipe's locale inline (e.g. `currency:'USD':'symbol':'1.2-2':'en-US'`) when you need formatting different from `LOCALE_ID`.
