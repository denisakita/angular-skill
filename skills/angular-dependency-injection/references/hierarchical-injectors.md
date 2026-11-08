# Hierarchical Injectors

Source: https://angular.dev/guide/di/hierarchical-dependency-injection

Angular maintains two parallel injector hierarchies.

## EnvironmentInjector hierarchy

Configured with `@Service()` (v22+; `@Injectable({providedIn: 'root'})` on v21) or the `providers` array in `ApplicationConfig`. Handles application-wide dependencies. Using `@Service()` is preferable to the `ApplicationConfig` `providers` array because optimization tools can **tree-shake** unused services.

```typescript
import {Service} from '@angular/core';

@Service() // provides this service in the root EnvironmentInjector
export class ItemService {
  name = 'telephone';
}
```

## ElementInjector hierarchy

Created implicitly at each DOM element. An `ElementInjector` is empty by default unless you configure it via the `providers` property on `@Directive()` or `@Component()`. Each component instance gets its own `ElementInjector` with isolated provider scope.

## Hierarchy levels

- **Platform** — `platformBrowserDynamic()` creates an injector with platform-specific dependencies, shareable across multiple apps.
- **Root** — `bootstrapApplication()` creates a child of the platform injector configured by `ApplicationConfig`. This is the root `EnvironmentInjector`.
- **NullInjector** — at the top of the hierarchy; returns an error, or `null` when `@Optional()` is used, if a provider cannot be resolved.

## Resolution rules

When a component declares a dependency, Angular resolves in two phases:

1. **ElementInjector search** — the component's own `ElementInjector`, then up through parent components' `ElementInjector`s.
2. **EnvironmentInjector fallback** — then up through the `EnvironmentInjector` hierarchy.

If a provider for the same token is registered at multiple levels, **the first one Angular encounters wins**.

Example: with `CarService`/`EngineService`/`TiresService` at root, `CarService2`/`EngineService2` on component B, and `CarService3` on component C (a child of B), resolving `Car` at C yields a `Car` from C's injector, an `Engine` from B, and `Tires` from root.

## Resolution modifiers (options to `inject()`)

```typescript
// optional — resolve to null instead of throwing
public leaf = inject(LeafService, {optional: true});

// self — only look in the current component/directive's ElementInjector
public leaf = inject(LeafService, {optional: true, self: true});

// skipSelf — start the search in the parent ElementInjector
parent = inject(Person, {optional: true, skipSelf: true});

// host — make the host component the last stop in the search
flower = inject(FlowerService, {host: true, optional: true});
```

- **optional** — resolve `null` rather than error if not found.
- **self** — restrict the search to the current `ElementInjector` only.
- **skipSelf** — the opposite of self; begin at the parent injector.
- **host** — stop searching at the host component.

## `providers` vs `viewProviders`

```typescript
@Component({
  selector: 'app-child',
  providers: [{provide: FlowerService, useValue: {emoji: '🌻'}}],
})
export class Child {
  flower = inject(FlowerService);
}

@Component({
  selector: 'app-child',
  viewProviders: [{provide: AnimalService, useValue: {emoji: '🐶'}}],
})
export class Child2 {
  animal = inject(AnimalService);
}
```

`viewProviders` is like `providers` except providers in `viewProviders` are **only visible inside the component's own view** — content projected in via `<ng-content>` cannot see them. Projected content still resolves providers up the hierarchy based on where it was declared, not where it is rendered.

## Practical uses

Service isolation — provide a service only on a component so it (and its subtree) are the only consumers:

```typescript
@Component({
  selector: 'app-villains-list',
  providers: [VillainsService],
})
export class VillainsList {}
```

Per-instance state — providing a service at the component level gives every instance of that component its own private instance (e.g. independent edit sessions):

```typescript
@Component({
  selector: 'app-hero-tax-return',
  providers: [HeroTaxReturnService],
})
export class HeroTaxReturn {}
```

## Best practices

- Default to `@Service()` / `providedIn: 'root'` for app singletons; only drop to component `providers` when you need isolation or per-instance state.
- Use `viewProviders` to hide a service from projected content while keeping it for the component's own view.
- Always pair `self`/`skipSelf`/`host` with `optional` when the provider might not be present.

## Common mistakes

- Providing a service on a component expecting one shared instance — each component instance gets its own.
- Assuming projected content sees the host's `viewProviders` — it does not; use `providers` for that.
- Relying on resolution order without realizing the nearest provider in the ElementInjector chain shadows root-level ones.
