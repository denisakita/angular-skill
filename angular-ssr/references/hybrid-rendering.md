# Hybrid rendering & server routing

Hybrid rendering lets you pick a different render mode for each route in a single
application. You declare these choices in `app.routes.server.ts` as an array of
`ServerRoute` objects and register them with `provideServerRendering(withRoutes(...))`.

## `app.routes.server.ts`

```typescript
import {RenderMode, ServerRoute} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',                       // home
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'login',
    renderMode: RenderMode.Server,  // dynamic, per-request HTML
  },
  {
    path: 'dashboard',
    renderMode: RenderMode.Client,  // browser-only, no SSR
  },
  {
    path: '**',                     // everything else
    renderMode: RenderMode.Server,
  },
];
```

Register it (server config):

```typescript
import {provideServerRendering, withRoutes} from '@angular/ssr';
import {serverRoutes} from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes(serverRoutes))],
};
```

The `path` syntax matches the Angular Router (`:param`, `**` catch-all). Every
route in your client router should be reachable by a matching server route.

## `RenderMode`

| Mode | Meaning |
| --- | --- |
| `RenderMode.Server` | SSR — renders on the server **for each request**, sending fully populated HTML. Use for dynamic / personalized / frequently changing content. |
| `RenderMode.Client` | CSR — renders in the browser. Angular's default behavior; no server HTML for the route. |
| `RenderMode.Prerender` | SSG — renders at **build time**, producing static HTML files per route. Use for stable, public content. |

## Prerendering parameterized routes — `getPrerenderParams`

For `RenderMode.Prerender`, dynamic segments must be enumerated at build time via
`getPrerenderParams`, which returns the list of parameter sets to prerender. It
runs in an injection context, so you can `inject()` services:

```typescript
import {RenderMode, ServerRoute} from '@angular/ssr';
import {inject} from '@angular/core';
import {PostService} from './post-service';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'post/:id',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const posts = inject(PostService);
      const ids = await posts.getIds();      // e.g. ['1', '2', '3']
      return ids.map((id) => ({id}));        // -> /post/1, /post/2, /post/3
    },
  },
];
```

Catch-all (`**`) segments are supplied under the `'**'` key, and you can return
multiple parameters per object:

```typescript
async getPrerenderParams() {
  return [
    {id: '1', '**': 'foo/3'},   // -> /post/1/foo/3
    {id: '2', '**': 'bar/4'},   // -> /post/2/bar/4
  ];
}
```

## `PrerenderFallback`

When a prerendered route is requested for a parameter set that was **not**
generated at build time, the `fallback` property decides what happens:

```typescript
import {RenderMode, PrerenderFallback, ServerRoute} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'post/:id',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Server,  // default
    async getPrerenderParams() {
      return [{id: '1'}, {id: '2'}];
    },
  },
];
```

- `PrerenderFallback.Server` — fall back to server-side rendering. **Default.**
- `PrerenderFallback.Client` — fall back to client-side rendering.
- `PrerenderFallback.None` — no fallback (no page produced for unknown params).

## Custom headers and status codes

`RenderMode.Server` routes can set response `headers` and `status`:

```typescript
{
  path: 'profile',
  renderMode: RenderMode.Server,
  headers: {
    'X-My-Custom-Header': 'some-value',
  },
  status: 201,
}
```

## App engines

- `AngularNodeAppEngine` (`@angular/ssr/node`) — for Node/Express servers; use
  `.handle(req)` plus `writeResponseToNodeResponse` (see `ssr-setup.md`).
- `AngularAppEngine` (`@angular/ssr`) — runtime-agnostic (edge/serverless);
  `await angularApp.render(request)` returns a Web `Response | null`.

## Best practices

- Give every client route a matching server route; use a `**` route as the
  catch-all default render mode.
- Use `Prerender` for stable public pages (marketing, docs, blog), `Server` for
  dynamic/personalized pages, and `Client` for highly interactive,
  authenticated-only views where SEO/first paint do not matter.
- In `getPrerenderParams`, fetch the id list from the same source of truth the
  app uses, and keep it bounded — every returned entry becomes a built HTML file.
- Choose `fallback` deliberately: `Server` (default) keeps unknown ids working;
  `Client` offloads them to the browser; `None` only when the full set is known.

## Common mistakes

- Using `RenderMode.Prerender` on a parameterized route without
  `getPrerenderParams` (or returning an incomplete list) — unlisted params hit the
  `fallback` path, not a prerendered file.
- Returning an unbounded id list from `getPrerenderParams`, exploding build time
  and output size.
- Setting `headers`/`status` and expecting them to apply to `Prerender` routes —
  they apply to server-rendered responses.
- Deploying with `outputMode: 'static'` while keeping `RenderMode.Server` routes —
  static builds have no per-request server.
