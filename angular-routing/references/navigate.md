# Navigating to Routes

Source: https://angular.dev/guide/routing/navigate-to-routes

Navigate declaratively with `RouterLink`, or programmatically with `Router.navigate` / `Router.navigateByUrl`.

## RouterLink (declarative)

Use the `routerLink` directive on anchors instead of `href` so navigation stays client-side.

```typescript
import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  template: `
    <nav>
      <a routerLink="/user-profile">User profile</a>
      <a routerLink="/settings">Settings</a>
    </nav>
  `,
  imports: [RouterLink],
})
export class App {}
```

### Relative vs absolute links

```html
<!-- relative, string form -->
<a routerLink="dashboard">Dashboard</a>
<!-- relative, array form -->
<a [routerLink]="['dashboard']">Dashboard</a>

<!-- dynamic params -->
<a [routerLink]="['user', currentUserId]">Current User</a>

<!-- from /settings -> /settings/notifications -->
<a routerLink="notifications">Notifications</a>

<!-- absolute: /team/:teamId/user/:userId -->
<a [routerLink]="['/team', teamId, 'user', userId]">Current User</a>
```

A leading `/` makes the link absolute; no leading slash makes it relative to the current route.

## Programmatic navigation

### Router.navigate()

Takes a "link parameters array" (the same array form as `routerLink`).

```typescript
import {Router} from '@angular/router';

export class AppDashboard {
  private router = inject(Router);

  navigateToProfile() {
    this.router.navigate(['/profile']);
    this.router.navigate(['/users', userId]);

    // query params -> /search?category=books&sort=price
    this.router.navigate(['/search'], {
      queryParams: {category: 'books', sort: 'price'},
    });

    // matrix params on the segment
    this.router.navigate(['/products', {featured: true, onSale: true}]);
  }
}
```

### Relative navigation with relativeTo

```typescript
export class UserDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  navigateToEdit() {
    // /users/123 -> /users/123/edit
    this.router.navigate(['edit'], {relativeTo: this.route});
  }

  navigateToParent() {
    // /users/123 -> /users
    this.router.navigate(['..'], {relativeTo: this.route});
  }

  navigateToList() {
    // /users/123 -> /users/list
    this.router.navigate(['..', 'list'], {relativeTo: this.route});
  }
}
```

Rule: all `..` segments must come first in the commands array.

### Router.navigateByUrl()

Takes an absolute URL string. Use it when you already have a full URL (e.g., from a redirect).

```typescript
router.navigateByUrl('/products');
router.navigateByUrl('/products/featured');
router.navigateByUrl('/products/123?view=details#reviews');
router.navigateByUrl('/search?category=books&sortBy=price');
router.navigateByUrl('/sales-awesome;isOffer=true;showModal=false');
```

Replace the current history entry instead of pushing a new one:

```typescript
router.navigateByUrl('/checkout', {replaceUrl: true});
```

## Showing a different URL in the address bar (browserUrl)

Navigate to one route while the address bar displays another URL:

```typescript
router.navigateByUrl('/not-found', {browserUrl: '/products/missing-item'});
```

```html
<a [routerLink]="['/dashboard']" [browserUrl]="'/home'">Go to Dashboard</a>
```

With a `UrlTree`:

```typescript
displayUrl: UrlTree = this.router.createUrlTree(['/products', 'widget']);
```

## Highlighting the active link: RouterLinkActive

```html
<a routerLink="/about" routerLinkActive="active-button" ariaCurrentWhenActive="page">
  About
</a>

<a
  [routerLink]="['/user/jane']"
  routerLinkActive="active-link"
  [routerLinkActiveOptions]="{exact: true}"
>
  User
</a>
```

(See `read-route-state.md` for the `isActive` signal API.)

## Best practices

- Use `routerLink` for user-clickable navigation; reserve `Router.navigate` for logic-driven navigation (after a save, guard redirect, etc.).
- Prefer the array form `[routerLink]="[...]"` when any segment is dynamic.
- Use `relativeTo: this.route` for navigation within a feature so links survive refactors of the parent path.
- Use `replaceUrl: true` after flows where back-navigation to the previous page is undesirable (e.g., post-login).

## Common mistakes

- Using `href` instead of `routerLink`, which triggers a full page reload.
- Forgetting to import `RouterLink` (and `RouterLinkActive`) into the component's `imports`.
- Mixing `..` segments into the middle of a commands array — they must all be first.
- Passing a link parameters array to `navigateByUrl` (it takes a string) or a URL string to `navigate` (it takes an array).
