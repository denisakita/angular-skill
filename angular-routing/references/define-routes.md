# Defining Routes

Source: https://angular.dev/guide/routing/define-routes

A route maps a URL `path` to a `component`. Routes are typically collected in `src/app/app.routes.ts` (the CLI default) and registered with `provideRouter(routes)`.

## Basic route configuration

```typescript
import {Routes} from '@angular/router';
import {HomePage} from './home-page';
import {AdminPage} from './admin-page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'admin',
    component: AdminPage,
  },
];
```

Register it once at the application level:

```typescript
import {ApplicationConfig} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)],
};
```

## Path types

### Static paths

Fixed segments such as `admin` or `blog`.

### Parameterized paths

Use a `:` prefix to capture a dynamic segment. Parameter names must start with a letter and contain only letters, numbers, underscores, or hyphens. Multiple parameters are allowed.

```typescript
const routes: Routes = [{path: 'user/:id', component: UserProfile}];
```

```typescript
const routes: Routes = [
  {path: 'user/:id/:social-media', component: SocialMediaFeed},
  {path: 'user/:id/', component: UserProfile},
];
```

### Wildcard paths

`**` matches any URL that no earlier route matched. Used for 404 pages and placed last.

```typescript
const routes: Routes = [
  {path: 'home', component: Home},
  {path: 'user/:id', component: UserProfile},
  {path: '**', component: NotFound},
];
```

## Route matching order (first-match wins)

> Angular uses a first-match wins strategy. Once Angular matches a URL with a route `path`, it stops checking any further routes.

Order specific routes before general ones:

```typescript
const routes: Routes = [
  {path: '', component: Home},
  {path: 'users/new', component: NewUser},   // before :id
  {path: 'users/:id', component: UserDetail},
  {path: 'users', component: Users},
  {path: '**', component: NotFound},          // always last
];
```

## Redirects

```typescript
const routes: Routes = [
  {
    path: 'articles',
    redirectTo: '/blog',
  },
  {
    path: 'blog',
    component: Blog,
  },
];
```

For an empty-path redirect that must match the whole URL, add `pathMatch: 'full'`:

```typescript
const routes: Routes = [
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'home', component: Home},
];
```

## Page titles

Angular updates `document.title` automatically when the route activates.

```typescript
const routes: Routes = [
  {path: '', component: Home, title: 'Home Page'},
  {path: 'about', component: About, title: 'About Us'},
];
```

Titles can be computed with a `ResolveFn`:

```typescript
const titleResolver: ResolveFn<string> = (route) => route.queryParams['id'];

const routes: Routes = [
  {path: 'products', component: Products, title: titleResolver},
];
```

Customize global title behavior with `TitleStrategy`:

```typescript
@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot) || this.title.getTitle();
    this.title.setTitle(`MyAwesomeApp - ${pageTitle}`);
  }
}
```

```typescript
export const appConfig = {
  providers: [
    provideRouter(routes),
    {provide: TitleStrategy, useClass: AppTitleStrategy},
  ],
};
```

## Route-level providers

Scope dependency injection to a route and its children:

```typescript
export const ROUTES: Route[] = [
  {
    path: 'admin',
    providers: [AdminService, {provide: ADMIN_API_KEY, useValue: '12345'}],
    children: [
      {path: 'users', component: AdminUsers},
      {path: 'teams', component: AdminTeams},
    ],
  },
];
```

## Static route data

Attach arbitrary static data, readable via `ActivatedRoute.data`:

```typescript
const routes: Routes = [
  {path: 'about', component: About, data: {analyticsId: '456'}},
  {path: '', component: Home, data: {analyticsId: '123'}},
];
```

## Nested routes

Child routes render inside the parent component's `<router-outlet />`.

```typescript
const routes: Routes = [
  {
    path: 'product/:id',
    component: Product,
    children: [
      {path: 'info', component: ProductInfo},
      {path: 'reviews', component: ProductReviews},
    ],
  },
];
```

The `Product` template must include `<router-outlet />` for the child content to appear.

## Best practices

- Keep routes in a dedicated `app.routes.ts` file and export a typed `Routes` constant.
- Put the `**` wildcard route last; put specific paths before parameterized ones.
- Use `pathMatch: 'full'` for empty-path redirects.
- Use route-level `providers` to scope services to a feature area instead of global providers.
- Set `title` on every top-level route for accessibility and SEO.

## Common mistakes

- Placing `{path: '**'}` or a broad path before more specific routes — first-match-wins means later routes never run.
- Forgetting `<router-outlet />` in a parent component, so child routes never render.
- Omitting `pathMatch: 'full'` on an empty-path redirect, which can cause it to match unintentionally.
- Using leading slashes inconsistently in child `path` values (child paths are relative; do not prefix with `/`).
