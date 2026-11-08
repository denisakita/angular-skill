# App configuration and bootstrapping

A modern Angular app is configured with an `ApplicationConfig` object and started with `bootstrapApplication()`. There are no NgModules involved.

## `main.ts` — bootstrapping

The entry point bootstraps the root standalone component with the application configuration:

```ts
// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
```

## `app.config.ts` — ApplicationConfig and providers

`ApplicationConfig` holds a `providers` array. Each provider is added with a `provide*` function:

```ts
// src/app/app.config.ts
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
  ],
};
```

### Common provider functions

- **`provideZonelessChangeDetection()`** (from `@angular/core`) — runs change detection without Zone.js, scheduled through Angular's own APIs. This is the default for new apps in Angular v21+.
- **`provideRouter(routes)`** (from `@angular/router`) — registers the application's routes for navigation between views.
- **`provideHttpClient()`** (from `@angular/common/http`) — makes `HttpClient` available for HTTP requests.

A minimal example bootstrapping zoneless change detection inline:

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { App } from './app/app';

bootstrapApplication(App, {
  providers: [provideZonelessChangeDetection()],
});
```

## `app.routes.ts` — routes

```ts
// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  // { path: '', component: Home },
];
```

## Best practices

- Keep all application-wide providers in `app.config.ts` so configuration lives in one place.
- Use the dedicated `provide*` functions rather than raw provider objects when one exists.
- Add `provideRouter(routes)` only when the app actually navigates; keep the route table in `app.routes.ts`.
- Add `provideHttpClient()` once, at the application level, instead of per component.
- Embrace zoneless change detection (the v21+ default) and rely on signals to drive UI updates.

## Common mistakes

- Trying to bootstrap with an NgModule — new apps use `bootstrapApplication`, not `platformBrowserDynamic().bootstrapModule`.
- Forgetting to register `provideRouter` and then finding `<router-outlet>` renders nothing.
- Importing `HttpClient` without calling `provideHttpClient()` in the config.
- Putting application-wide providers in a component's `providers` array, creating unintended separate instances.
- Mismatching the bootstrapped root component in `main.ts` with the selector used in `index.html`.
