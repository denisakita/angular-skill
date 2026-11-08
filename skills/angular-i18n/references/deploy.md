# Merging translations, building & deploying locales

Merging combines your compiled app with each translation file to produce one fully localized build per locale. There is no runtime language switch — each locale is a separate distributable.

## Build all locales

Set `"localize": true` in the build options, or pass `--localize`:

```json
"build": {
  "builder": "@angular/build:application",
  "options": {
    "localize": true
  }
}
```

```bash
ng build --localize
```

`localize` accepts:

- `true` — build every locale defined in the project `i18n` config.
- an array of locale IDs — build only those (e.g. `["fr", "de"]`).
- `false` — disable localization.

> AOT compilation is required for template localization. The CLI sets the `lang` attribute on the root HTML element and adjusts the `baseHref` for each variant.

## Per-locale configurations

Define a configuration that builds a single locale:

```json
"configurations": {
  "fr": {
    "localize": ["fr"]
  }
}
```

Build production for one locale:

```bash
ng build --configuration=production,fr
```

## Serving during development

The dev server supports only **one** locale at a time. Use a per-locale configuration:

```bash
ng serve --configuration=fr
```

## Missing-translation behavior

Control how missing translations are reported via `i18nMissingTranslation` in the build options:

```json
"options": {
  "i18nMissingTranslation": "error"
}
```

Allowed values: `error`, `warning` (default behavior varies), or `ignore`.

## Output directory structure

Each locale is emitted into its own subdirectory of the output folder, for example:

```
dist/myapp/fr/...
dist/myapp/es/...
```

The `subPath` (and `baseHref`) per locale is controlled in the `i18n` config:

```json
"i18n": {
  "sourceLocale": "en-US",
  "locales": {
    "fr": {
      "translation": "src/locale/messages.fr.xlf",
      "subPath": "fr"
    }
  }
}
```

When `localize` is `true` or an array, the CLI adjusts the base `href` for each version by adding the locale to the configured `subPath`.

## Server configuration

Servers typically inspect the `Accept-Language` header and redirect to the matching locale subdirectory, falling back to a default.

### Nginx

```nginx
map $http_accept_language $accept_language {
    ~*^de de;
    ~*^fr fr;
    ~*^en "";
}

server {
    listen 80;
    root /www/data;

    if ($accept_language ~ "^$") {
        set $accept_language "fr";
    }

    rewrite ^/$ /$accept_language permanent;

    location ~ ^/(fr|de|$) {
        try_files $uri /$1/index.html?$args;
    }
}
```

### Apache

```apache
<Directory "/www/data">
    RewriteEngine on
    RewriteBase /

    RewriteCond %{HTTP:Accept-Language} ^de [NC]
    RewriteRule ^$ /de/ [R]

    RewriteCond %{HTTP:Accept-Language} ^en [NC]
    RewriteRule ^$ /en/ [R]

    RewriteCond %{HTTP:Accept-Language} !^en [NC]
    RewriteCond %{HTTP:Accept-Language} !^de [NC]
    RewriteRule ^$ /fr/ [R]
</Directory>
```

### Server-side rendering

If you use server rendering with `outputMode` set to `server`, Angular automatically handles redirection based on the `Accept-Language` HTTP header — no manual rewrite rules required.

## Best practices

- Use `ng build --localize` to produce all locales in one pass for production.
- Use per-locale `configurations` for testing a single language quickly.
- Set `i18nMissingTranslation` to `error` in CI to catch untranslated strings before release.
- Let SSR (`outputMode: server`) handle redirection instead of hand-writing server rules where possible.
- Keep each locale's `subPath`/`baseHref` consistent with your hosting layout.

## Common mistakes

- Expecting a single build to switch languages at runtime — each locale is a separate build/directory.
- Running `ng serve --localize` for multiple locales (the dev server handles only one at a time).
- Forgetting to register a locale's `translation` file in `angular.json`, so the locale silently uses source text.
- Misconfiguring `baseHref`/`subPath`, breaking asset and route URLs in subdirectory deployments.
- Disabling AOT and expecting template localization to work.
