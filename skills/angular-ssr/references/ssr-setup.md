# SSR setup (standalone, Angular v21/v22)

Server-side rendering generates HTML on the server (per request) or at build time,
then ships it to the browser where Angular hydrates it into a live application.
This file covers enabling SSR and the standard standalone file layout.

## Enable SSR

New project — enable SSR/SSG during scaffolding:

```bash
ng new --ssr
```

Existing project — add the SSR package and wiring:

```bash
ng add @angular/ssr
```

`ng add @angular/ssr` generates `server.ts`, `main.server.ts`,
`app.config.server.ts`, `app.routes.server.ts`, and adds `provideClientHydration()`
to your client config. Hydration is wired up automatically.

## File layout

A standalone SSR app uses two bootstrap entry points (browser and server) and two
application configs that are merged.

### `app.config.ts` (browser providers — always include hydration)

```typescript
import {ApplicationConfig, provideZonelessChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideClientHydration, withEventReplay} from '@angular/platform-browser';
import {routes} from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
  ],
};
```

### `app.config.server.ts` (server-only providers)

```typescript
import {mergeApplicationConfig, ApplicationConfig} from '@angular/core';
import {provideServerRendering, withRoutes} from '@angular/ssr';
import {appConfig} from './app.config';
import {serverRoutes} from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
```

### `main.ts` (browser entry point)

```typescript
import {bootstrapApplication} from '@angular/platform-browser';
import {App} from './app/app';
import {appConfig} from './app/app.config';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
```

### `main.server.ts` (server entry point)

```typescript
import {bootstrapApplication} from '@angular/platform-browser';
import {App} from './app/app';
import {config} from './app/app.config.server';

const bootstrap = () => bootstrapApplication(App, config);

export default bootstrap;
```

### `server.ts` (Node / Express request handler)

```typescript
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use('*', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => {
      if (response) {
        writeResponseToNodeResponse(response, res);
      } else {
        next();
      }
    })
    .catch(next);
});

export const reqHandler = createNodeRequestHandler(app);
```

For non-Node runtimes (edge/serverless) use `AngularAppEngine` from
`@angular/ssr` and its `render` method, which works with the Web `Request`/
`Response` APIs:

```typescript
import {AngularAppEngine} from '@angular/ssr';

const angularApp = new AngularAppEngine();
const res: Response | null = await angularApp.render(request);
```

## Accessing the request and response (DI tokens)

In server contexts Angular exposes the current request and response via injection
tokens (from `@angular/core`). They are `null` in the browser, so always
null-check:

- `REQUEST` — the incoming request object.
- `RESPONSE_INIT` — response init (set headers / status code).
- `REQUEST_CONTEXT` — extra context supplied to the engine.

```typescript
import {Component, inject, REQUEST} from '@angular/core';

@Component({
  selector: 'app-example',
  template: `<h1>Example</h1>`,
})
export class ExampleComponent {
  private readonly request = inject(REQUEST, {optional: true});

  constructor() {
    console.log(this.request?.url);
  }
}
```

## HTTP transfer cache

During SSR, `HttpClient` requests are cached and serialized into the HTML so the
browser does not re-fetch the same data after hydration. Tune it through
`provideClientHydration`:

```typescript
import {
  bootstrapApplication,
  provideClientHydration,
  withHttpTransferCacheOptions,
} from '@angular/platform-browser';

bootstrapApplication(App, {
  providers: [
    provideClientHydration(
      withHttpTransferCacheOptions({
        includeHeaders: ['ETag'],
        includePostRequests: true,
      }),
    ),
  ],
});
```

Disable the transfer cache globally with `withNoHttpTransferCache()`, or per
request with `{transferCache: false}` on the `HttpClient` call.

## Build & run

- `ng serve` — dev server with SSR active.
- `ng build` — produces the browser bundle plus a server bundle.
- `ng run <project>:serve-ssr` / running the built `server.mjs` — serves the
  production SSR app via Node.
- For a fully static (SSG-only) deployment with no Node server, set the build
  `outputMode` to `static` in `angular.json`:

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "outputMode": "static"
          }
        }
      }
    }
  }
}
```

## Best practices

- Keep `provideClientHydration()` in the **client** config (`app.config.ts`) so it
  applies in the browser; keep `provideServerRendering(withRoutes(...))` in the
  **server** config and merge with `mergeApplicationConfig`.
- Let the CLI scaffold SSR (`ng add @angular/ssr`) rather than hand-wiring files.
- Use the transfer cache so data fetched on the server is reused on the client
  instead of being re-requested.
- Always null-check `REQUEST`/`RESPONSE_INIT` — they are absent in the browser.

## Common mistakes

- Forgetting `provideClientHydration()` → server HTML is discarded and re-rendered
  (flicker, lost performance, possible `NG0505` "No hydration info" errors).
- Putting `provideServerRendering` in the browser config or `provideClientHydration`
  only in the server config.
- Calling `window`/`document`/`localStorage` at construction or field-initializer
  time — this throws on the server. Defer to `afterNextRender` (see
  `hydration.md`).
- Expecting `outputMode: 'static'` to support `RenderMode.Server` routes — static
  output has no server to render per request.
