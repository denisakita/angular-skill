# Route Guards (Functional)

Source: https://angular.dev/guide/routing/route-guards

Guards are checkpoints that control navigation. **Never rely on client-side guards as the sole source of access control** — always enforce authorization on the server.

Modern Angular uses **functional guards**: plain functions typed with the guard signature that use `inject()` for dependencies. Prefer them over class-based (`CanActivate` interface) guards.

## CanActivateFn — can the route be entered?

Receives `ActivatedRouteSnapshot` and `RouterStateSnapshot`.

```typescript
import {CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {inject} from '@angular/core';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const authService = inject(AuthService);
  return authService.isAuthenticated();
};
```

## CanActivateChildFn — protect child routes

Runs for the children of the route it is attached to.

```typescript
export const adminChildGuard: CanActivateChildFn = (
  childRoute: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const authService = inject(AuthService);
  return authService.hasRole('admin');
};
```

## CanDeactivateFn — can the route be left?

Has access to the component instance plus current and next router states. Useful for unsaved-changes prompts.

```typescript
export const unsavedChangesGuard: CanDeactivateFn<Form> = (
  component: Form,
  currentRoute: ActivatedRouteSnapshot,
  currentState: RouterStateSnapshot,
  nextState: RouterStateSnapshot,
) => {
  return component.hasUnsavedChanges()
    ? confirm('You have unsaved changes. Are you sure you want to leave?')
    : true;
};
```

## CanMatchFn — should this route definition match at all?

Used for feature flags / A/B testing. If it returns `false`, the router does **not** block navigation — it skips this route and continues trying to match other routes.

```typescript
export const featureToggleGuard: CanMatchFn = (
  route: Route,
  segments: UrlSegment[],
  currentSnapshot: PartialMatchRouteSnapshot,
) => {
  const featureService = inject(FeatureService);
  return featureService.isFeatureEnabled('newDashboard');
};
```

## Return types

A guard may return:

- `boolean` — `true` allows navigation, `false` blocks (for `CanMatch`, `false` means "try other routes").
- `UrlTree` or `RedirectCommand` — cancel the navigation and redirect.
- `Promise<T>` or `Observable<T>` of the above — the router uses the first emitted value.

Redirect example using `UrlTree`:

```typescript
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? true : router.parseUrl('/login');
};
```

Redirect example using `RedirectCommand` (lets you pass `NavigationExtras`):

```typescript
import {RedirectCommand, Router} from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  return new RedirectCommand(router.parseUrl('/login'), {skipLocationChange: true});
};
```

## Attaching guards to routes

Guards attach as arrays and run in order. Each guard property uses its matching type.

```typescript
const routes: Routes = [
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    canActivateChild: [adminChildGuard],
    canMatch: [featureToggleGuard],
    loadComponent: () => import('./admin/admin-page'),
  },
  {
    path: 'edit/:id',
    component: Form,
    canDeactivate: [unsavedChangesGuard],
  },
];
```

## Best practices

- Use functional guards (`CanActivateFn` etc.) with `inject()`; they compose and tree-shake better than class guards.
- Return a `UrlTree`/`RedirectCommand` from a guard to redirect instead of navigating imperatively inside the guard.
- Use `CanMatch` (not `CanActivate`) for feature flags so the router can fall through to an alternative route or wildcard.
- Keep guards small and synchronous where possible; return an `Observable`/`Promise` only when you must await async checks.
- Always pair client guards with real server-side authorization.

## Common mistakes

- Using `CanActivate` for feature toggles — it blocks the navigation entirely instead of letting other routes match; use `CanMatch`.
- Calling `inject()` outside the guard function body (guards run in an injection context only while executing).
- Returning `false` and also navigating manually — return a `UrlTree`/`RedirectCommand` instead to avoid race conditions.
- Trusting guards for security — they are UX gates, not authorization.
