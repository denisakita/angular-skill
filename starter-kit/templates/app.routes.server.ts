import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Server render modes. Every route renders on the server, because routes with parameters such
 * as `users/:id` can't be prerendered without `getPrerenderParams`.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
