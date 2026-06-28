# Working with translation files

## Extract the source language file

Extract all marked text into a source-language file with the CLI:

```bash
ng extract-i18n
```

By default this generates `messages.xlf` (XLIFF 1.2) in the project root.

### Options

| Option | Purpose |
|--------|---------|
| `--format` | Set the output file format. |
| `--output-path` | Set the output directory path. |
| `--out-file` | Set the output file name. |

Examples:

```bash
# Put the file in src/locale
ng extract-i18n --output-path src/locale

# Choose a format
ng extract-i18n --format=xlf2
ng extract-i18n --format=xmb
ng extract-i18n --format=json
ng extract-i18n --format=arb

# Custom file name
ng extract-i18n --out-file source.xlf
```

## Supported formats

- **XLIFF 1.2** — extension `.xlf` (default).
- **XLIFF 2** — extension `.xlf` (use `--format=xlf2`).
- **XMB / XTB** — `.xmb` for the source, `.xtb` for translations.
- **JSON** — `.json`.
- **ARB** — `.arb`.

## Create a translation file per locale

1. Extract the source file (`messages.xlf`).
2. Copy it once per target locale.
3. Rename each copy using the pattern `messages.{locale}.xlf`.
4. Move them into a locale directory such as `src/locale`.
5. Send them to translators.

Example for French:

```
messages.xlf  →  messages.fr.xlf  →  src/locale/messages.fr.xlf
```

Then register each file under the project's `i18n.locales` map in `angular.json` (see `setup.md`).

## Translate the content

For each translation unit, translators add a `<target>` next to the existing `<source>`:

```xml
<trans-unit id="introductionHeader" datatype="html">
  <source>Hello i18n!</source>
  <target>Bonjour i18n !</target>
  <note priority="1" from="description">An introduction header for this sample</note>
  <note priority="1" from="meaning">User welcome</note>
</trans-unit>
```

**Never change the `id` of a translation unit.** Each auto-generated `id` is derived from the component text plus its assigned meaning; changing it breaks the link to the source.

### ICU expressions in translation files

- **Plurals** — translate each ICU match value (`=0`, `=1`, `other`, …) separately.
- **Select expressions** — Angular extracts these into separate translation units.
- **Nested expressions** — extracted like alternate expressions.
- Keep `<x id="ICU">` (and other `<x>`) placeholders intact; translate only the surrounding human text.

## Best practices

- Keep extraction reproducible: script `ng extract-i18n --output-path src/locale` and re-run it whenever marked text changes.
- Use stable custom IDs for long-lived strings so re-extraction does not churn IDs.
- Store all `messages.<locale>.xlf` files in version control.
- Preserve `<note>` description/meaning elements — they give translators context.
- Pick one format and stick to it across all locales.

## Common mistakes

- Editing or "tidying" generated `id` values, which detaches translations from their source.
- Forgetting to add a `<target>` (the unit then falls back to the source text or triggers a missing-translation warning).
- Removing `<x>` placeholders or ICU match values while translating.
- Registering the source file instead of the translated copy in `angular.json`.
- Mixing formats (e.g. extracting XLIFF 2 but referencing an XLIFF 1.2 file).
