# Data Resolvers (Functional)

Source: https://angular.dev/guide/routing/data-resolvers

A data resolver implements the `ResolveFn` function. It runs **before a route activates** and can fetch data from APIs, stores, or other sources so the component renders with data already available.

Modern Angular uses **functional resolvers** — plain functions typed `ResolveFn<T>` that use `inject()`.

## Creating a resolver

```typescript
import {inject} from '@angular/core';
import {UserStore, SettingsStore} from './user-store';
import type {ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot} from '@angular/router';
import type {User, Settings} from './types';

export const userResolver: ResolveFn<User> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const userStore = inject(UserStore);
  const userId = route.paramMap.get('id')!;
  return userStore.getUser(userId);
};

export const settingsResolver: ResolveFn<Settings> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const settingsStore = inject(SettingsStore);
  const userId = route.paramMap.get('id')!;
  return settingsStore.getUserSettings(userId);
};
```

## Configuring routes with resolvers

Attach resolvers via the `resolve` property. Each key becomes available under that name.

```typescript
import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'user/:id',
    component: UserDetail,
    resolve: {
      user: userResolver,
      settings: settingsResolver,
    },
  },
];
```

## Accessing resolved data

### Via ActivatedRoute.data

```typescript
import {Component, inject, computed} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import type {User, Settings} from './types';

@Component({
  template: `
    <h1>{{ user().name }}</h1>
    <p>{{ user().email }}</p>
    <div>Theme: {{ settings().theme }}</div>
  `,
})
export class UserDetail {
  private route = inject(ActivatedRoute);
  private data = toSignal(this.route.data);
  user = computed(() => this.data().user as User);
  settings = computed(() => this.data().settings as Settings);
}
```

### Via withComponentInputBinding (preferred)

Enable input binding when configuring the router:

```typescript
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {routes} from './app.routes';

bootstrapApplication(App, {
  providers: [provideRouter(routes, withComponentInputBinding())],
});
```

Resolved data then binds directly to inputs whose names match the `resolve` keys:

```typescript
import {Component, input} from '@angular/core';
import type {User, Settings} from './types';

@Component({
  template: `
    <h1>{{ user().name }}</h1>
    <p>{{ user().email }}</p>
    <div>Theme: {{ settings().theme }}</div>
  `,
})
export class UserDetail {
  user = input.required<User>();
  settings = input.required<Settings>();
}
```

## Error handling

### Centralized: withNavigationErrorHandler

```typescript
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter, withNavigationErrorHandler, Router} from '@angular/router';
import {inject} from '@angular/core';
import {routes} from './app.routes';

bootstrapApplication(App, {
  providers: [
    provideRouter(
      routes,
      withNavigationErrorHandler((error) => {
        const router = inject(Router);
        if (error?.message) {
          console.error('Navigation error occurred:', error.message);
        }
        router.navigate(['/error']);
      }),
    ),
  ],
});
```

### In the resolver: RedirectCommand

```typescript
import {inject} from '@angular/core';
import {ResolveFn, RedirectCommand, Router} from '@angular/router';
import {catchError, of} from 'rxjs';
import {UserStore} from './user-store';
import type {User} from './types';

export const userResolver: ResolveFn<User | RedirectCommand> = (route) => {
  const userStore = inject(UserStore);
  const router = inject(Router);
  const userId = route.paramMap.get('id')!;

  return userStore.getUser(userId).pipe(
    catchError((error) => {
      console.error('Failed to load user:', error);
      return of(new RedirectCommand(router.parseUrl('/users')));
    }),
  );
};
```

## Parent-child resolver data sharing

Child resolvers read parent-resolved data via `route.parent?.data`:

```typescript
import {inject} from '@angular/core';
import {provideRouter, ActivatedRouteSnapshot} from '@angular/router';
import {userResolver} from './resolvers';
import {UserPosts} from './pages';
import {PostService} from './services';
import type {User} from './types';

provideRouter([
  {
    path: 'users/:id',
    resolve: {user: userResolver},
    children: [
      {
        path: 'posts',
        component: UserPosts,
        resolve: {
          posts: (route: ActivatedRouteSnapshot) => {
            const postService = inject(PostService);
            const user = route.parent?.data['user'] as User;
            return postService.getPostByUser(user.id);
          },
        },
      },
    ],
  },
]);
```

## Best practices

- Use functional `ResolveFn` with `inject()`; prefer `withComponentInputBinding()` + `input.required<T>()` to receive resolved data.
- Keep resolvers fast — they delay navigation until they complete. For slow data, prefer loading inside the component (e.g., with a loading state) over a resolver.
- Handle errors explicitly: return a `RedirectCommand` from the resolver or use `withNavigationErrorHandler` globally.
- Share parent data with children through `route.parent?.data` instead of refetching.

## Common mistakes

- Doing heavy/slow work in a resolver, which blocks the route transition and makes the app feel frozen.
- Forgetting `withComponentInputBinding()` while expecting resolved data on `input()`s.
- Letting a resolver throw uncaught — the navigation is cancelled; catch and return a `RedirectCommand` or use the global error handler.
- Mismatching `resolve` keys and `input()` names — binding only works when names match.
