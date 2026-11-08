# Build Environments

Angular supports environment-specific configuration by swapping a base environment file for an alternate at build time, driven by `fileReplacements` and build configurations in `angular.json`.

## Generating environment files

```bash
ng generate environments
```

This creates a `src/environments/` directory with files such as:

- `environment.ts` — the default/production environment.
- `environment.development.ts` — development overrides.
- `environment.staging.ts` — staging overrides (if applicable).

## Environment file structure

Base/production environment (`src/environments/environment.ts`):

```ts
export const environment = {
  production: true,
  apiUrl: 'http://my-prod-url',
};
```

Development override (`src/environments/environment.development.ts`):

```ts
export const environment = {
  production: false,
  apiUrl: 'http://my-dev-url',
};
```

## File replacements in `angular.json`

The build configuration uses `fileReplacements` to swap the base file for an environment-specific one:

```json
"configurations": {
  "development": {
    "fileReplacements": [
      {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.development.ts"
      }
    ]
  }
}
```

## Using environment values

Always import the **base** environment file. The build system substitutes the correct file based on the active configuration:

```ts
import {environment} from './../environments/environment';

fetch(environment.apiUrl);
```

## Building with a configuration

```bash
ng build --configuration development
ng build --configuration staging
ng build --configuration production
```

`ng build` uses the production configuration by default. For local work, `ng serve` typically runs with the development configuration via its serve target.

## Best practices

- Import only the base `environment.ts` in application code; let `fileReplacements` substitute the right file per configuration instead of importing environment-specific files directly.
- Keep every environment object the same shape (same keys) so code that reads a property works under all configurations.
- Add a new `configurations` entry plus a matching `fileReplacements` block whenever you introduce a new target like staging.
- Use environment values for non-secret, build-time settings such as feature flags and public API base URLs.

## Common mistakes

- **Storing secrets** (API keys, credentials) in environment files — they are bundled into client-side code and shipped to users.
- Importing `environment.development.ts` directly, which defeats the `fileReplacements` substitution.
- Adding a key to one environment file but not the others, causing `undefined` values under some configurations.
- Forgetting to register the `fileReplacements` for a new configuration, so the wrong environment file ships.
- Expecting `ng build` to use development settings — it defaults to production.
