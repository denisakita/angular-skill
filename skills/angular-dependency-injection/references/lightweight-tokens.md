# Lightweight Injection Tokens

Source: https://angular.dev/guide/di/lightweight-injection-tokens

A design pattern for **library authors**: designing your library with lightweight injection tokens helps optimize the bundle size of client applications.

## The problem

A component used directly as an injection token prevents tree-shaking. This happens when the token appears in a content query's value position, or is used with `inject()`. In those cases the compiler retains the reference at runtime, blocking tree-shaking even if the component is never used.

## The solution

Use a small **abstract class** as the injection token, and provide the real component via `useExisting`. The heavy implementation can then be tree-shaken when unused.

```typescript
abstract class LibHeaderToken {}

@Component({
  selector: 'lib-header',
  providers: [{provide: LibHeaderToken, useExisting: LibHeader}],
})
class LibHeader extends LibHeaderToken {}

@Component({
  selector: 'lib-card',
})
class LibCard {
  readonly header = contentChild(LibHeaderToken);
}
```

Key pieces:

1. **Abstract token class** — a lightweight placeholder retained at runtime.
2. **Implementation component** — extends the abstract class; can be tree-shaken.
3. **Content query** — references the token, not the concrete component.
4. **Provider mapping** — connects token to implementation via `useExisting`.

## Type-safe parent/child API

Declare abstract methods on the token so consumers communicate through the token without referencing the concrete class:

```typescript
abstract class LibHeaderToken {
  abstract doSomething(): void;
}

@Component({
  selector: 'lib-header',
  providers: [{provide: LibHeaderToken, useExisting: LibHeader}],
})
class LibHeader extends LibHeaderToken {
  doSomething(): void {
    // Concrete implementation
  }
}

@Component({
  selector: 'lib-card',
})
class LibCard implements AfterContentInit {
  readonly header = contentChild(LibHeaderToken);

  ngAfterContentInit(): void {
    if (this.header() !== undefined) {
      this.header()!.doSomething();
    }
  }
}
```

## Naming convention

Follow Angular style guidelines: name the token with the suffix **`Token`** (e.g. `LibHeaderToken`).

## Best practices

- In libraries, query and inject the abstract token, never the concrete component, in queries and `inject()` calls.
- Map the token to the implementation with `{provide: Token, useExisting: Impl}`.
- Keep the abstract class minimal — only the methods/properties consumers need.

## Common mistakes

- Using the concrete component class as the token, which pins it into the bundle and blocks tree-shaking.
- Forgetting the `useExisting` provider, so the token resolves to nothing.
- Omitting the `Token` suffix, reducing clarity for consumers.
