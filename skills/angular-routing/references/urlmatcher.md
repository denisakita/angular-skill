# Routing with a Custom UrlMatcher

Source: https://angular.dev/guide/routing/routing-with-urlmatcher

When `path`/`:param` syntax isn't expressive enough, use a custom `matcher` function for full control over URL matching (e.g., matching a Twitter-style `@handle`).

## How a matcher works

The `matcher` is a function on the route definition. Given the URL segments, it:

- Verifies the segment array fits the expected shape (e.g., exactly one segment).
- Uses a regular expression (or any logic) to validate the format.
- On match, returns a `UrlMatchResult` describing what was consumed and any positional parameters.
- On no match, returns `null`, and the router continues checking other routes.

## Example: matching `@username`

```typescript
{
  matcher: (url) => {
    if (url.length === 1 && url[0].path.match(/^@[\w]+$/gm)) {
      return {
        consumed: url,
        posParams: {username: new UrlSegment(url[0].path.slice(1), {})},
      };
    }
    return null;
  },
  component: Profile,
}
```

## Key pieces

- **`matcher` property** — a function receiving the array of `UrlSegment`s for the URL. Replaces `path` on the route.
- **`UrlMatchResult`** — the return object:
  - `consumed` — the `UrlSegment[]` this route consumed.
  - `posParams` — a map of parameter name to `UrlSegment`, exposed like normal route params.
- **`UrlSegment`** — constructed with `new UrlSegment(path, parameters)` to represent a matched path segment.

A custom URL matcher behaves like any other route definition: it supports `children` and lazy-loaded routes.

## Best practices

- Reach for `matcher` only when static/parameterized paths can't express the pattern; otherwise prefer plain `path`.
- Keep the regex anchored and specific so the matcher doesn't accidentally swallow unrelated URLs.
- Strip prefix characters (like `@`) when building `posParams` so components receive clean values.
- Place matcher routes carefully in the array — first-match-wins still applies.

## Common mistakes

- Returning an empty object or wrong shape instead of `null` on no match, which can break the matching chain.
- Forgetting to set `consumed`, so the router doesn't know which segments were handled.
- Over-broad regexes that match more URLs than intended, shadowing later routes.
- Using both `path` and `matcher` on the same route — use one or the other.
