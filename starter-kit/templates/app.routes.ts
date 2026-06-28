import { Routes } from '@angular/router';

/**
 * Top-level routes. Lazy-load every feature with `loadComponent` / `loadChildren`
 * so each feature ships in its own chunk.
 */
export const routes: Routes = [
  {
    path: 'users/:id',
    title: 'User profile', // sets <title>; or provide a TitleStrategy
    // `:id` is bound to the component's `id = input.required<string>()`
    // because of withComponentInputBinding() in app.config.ts.
    loadComponent: () =>
      import('./features/user-profile/user-profile').then((m) => m.UserProfile),
  },

  { path: '', redirectTo: 'users/1', pathMatch: 'full' },

  // Wildcard / 404 — point at a real standalone component when you add one:
  // { path: '**', loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound) },
];
