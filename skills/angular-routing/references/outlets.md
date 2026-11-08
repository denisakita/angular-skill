# Showing Routes with Outlets

Source: https://angular.dev/guide/routing/show-routes-with-outlets

`RouterOutlet` is a directive that marks where the router renders the component for the current URL.

## Basic outlet

Import `RouterOutlet` into the component and place `<router-outlet />` in the template.

```typescript
import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
```

```html
<app-header />
<router-outlet />
<app-footer />
```

The router renders the active route's component immediately after the `<router-outlet />` element, not inside it.

## Nested outlets (child routes)

A routed component can host its own nav and `<router-outlet />` to render child routes:

```html
<h1>Settings</h1>
<nav>
  <ul>
    <li><a routerLink="profile">Profile</a></li>
    <li><a routerLink="security">Security</a></li>
  </ul>
</nav>
<router-outlet />
```

```typescript
const routes: Routes = [
  {
    path: 'settings',
    component: Settings,
    children: [
      {path: 'profile', component: Profile},
      {path: 'security', component: Security},
    ],
  },
];
```

## Named outlets (secondary routes)

Each outlet needs a unique name; the unnamed default outlet is named `'primary'`.

```html
<router-outlet />
<router-outlet name="read-more" />
<router-outlet name="additional-actions" />
```

Associate a route with a named outlet via the `outlet` property:

```typescript
{
  path: 'user/:id',
  component: UserDetails,
  outlet: 'additional-actions'
}
```

## Outlet events

`<router-outlet />` emits four events:

| Event        | Trigger                                   |
| ------------ | ----------------------------------------- |
| `activate`   | When a new component is instantiated       |
| `deactivate` | When a component is destroyed              |
| `attach`     | When `RouteReuseStrategy` attaches a route |
| `detach`     | When `RouteReuseStrategy` detaches a route |

```html
<router-outlet
  (activate)="onActivate($event)"
  (deactivate)="onDeactivate($event)"
  (attach)="onAttach($event)"
  (detach)="onDetach($event)"
/>
```

## Passing data to the outlet: routerOutletData

Provide contextual data to the routed component from the outlet:

```typescript
@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet],
  template: `
    <h2>Dashboard</h2>
    <router-outlet [routerOutletData]="{layout: 'sidebar'}" />
  `,
})
export class Dashboard {}
```

The routed component reads it as a signal via the `ROUTER_OUTLET_DATA` token:

```typescript
import {Component, inject, Signal} from '@angular/core';
import {ROUTER_OUTLET_DATA} from '@angular/router';

@Component({
  selector: 'app-stats',
  template: `<p>Stats view (layout: {{ outletData().layout }})</p>`,
})
export class Stats {
  outletData = inject(ROUTER_OUTLET_DATA) as Signal<{layout: string}>;
}
```

## Best practices

- Add a `<router-outlet />` to any component that has `children` routes.
- Use named outlets only when you genuinely need to render multiple independent views at once; they add URL complexity (secondary route segments).
- Prefer `routerOutletData` (a signal) for passing layout/context to routed components over ad-hoc shared services.
- Use `(activate)`/`(deactivate)` for lightweight cross-cutting concerns (analytics, scroll restoration hooks).

## Common mistakes

- Expecting routed content to render *inside* `<router-outlet />` — it renders as a sibling immediately after it.
- Forgetting to import `RouterOutlet` into the standalone component's `imports`.
- Giving two outlets the same name, or omitting `outlet` on the route that targets a named outlet.
- Treating `ROUTER_OUTLET_DATA` as a plain value — it is a `Signal`, so call it (`outletData()`).
