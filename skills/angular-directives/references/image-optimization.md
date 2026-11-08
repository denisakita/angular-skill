# Image Optimization with NgOptimizedImage

Source: https://angular.dev/guide/image-optimization

`NgOptimizedImage` is a standalone directive that enforces image best practices: it prioritizes the LCP image, lazy-loads other images by default, generates `srcset`, prevents layout shift via required dimensions, and warns about common mistakes.

## Importing

```typescript
import {NgOptimizedImage} from '@angular/common';

@Component({
  // ...
  imports: [NgOptimizedImage],
})
export class MyComponent {}
```

## Required attributes

### `ngSrc`

Replace `src` with `ngSrc` to activate the directive:

```html
<img ngSrc="cat.jpg" />
```

### `width` and `height`

Required (unless using `fill`) to prevent layout shift. Use the intrinsic image size for responsive images, or the rendered size for fixed images:

```html
<img ngSrc="cat.jpg" width="400" height="200" />
```

### `fill` (alternative to width/height)

When dimensions are unknown, use `fill` so the image fills its parent. The parent must have `position: relative`, `fixed`, or `absolute`. Control fit with the CSS `object-fit` property:

```html
<img ngSrc="cat.jpg" fill />
```

## Priority and LCP

Mark the Largest Contentful Paint image with `priority`:

```html
<img ngSrc="cat.jpg" width="400" height="200" priority />
```

`priority` sets `fetchpriority="high"` and `loading="eager"`, and emits a preload link for SSR. Angular warns in development if the LCP element lacks `priority`. Priority images also use `decoding="sync"`.

## Placeholders

Blurred low-res placeholder while loading (requires an image loader):

```html
<img ngSrc="cat.jpg" width="400" height="200" placeholder />
```

Data-URL placeholder (no loader needed, keep under 4KB):

```html
<img ngSrc="cat.jpg" width="400" height="200"
     placeholder="data:image/png;base64,iVBORw0K..." />
```

Disable the blur:

```html
<img ngSrc="cat.jpg" width="400" height="200"
     placeholder [placeholderConfig]="{blur: false}" />
```

Configure placeholder resolution via `IMAGE_CONFIG`:

```typescript
providers: [
  {provide: IMAGE_CONFIG, useValue: {placeholderResolution: 40}},
],
```

## Responsive images: srcset and sizes

For fixed-size images, `srcset` is generated automatically (e.g. `image-400w.jpg 1x, image-800w.jpg 2x`).

For responsive images, add `sizes`:

```html
<img ngSrc="cat.jpg" width="400" height="200" sizes="100vw" />
<img ngSrc="sidebar-img.jpg" width="400" height="200" sizes="50vw" />
<img ngSrc="cat.jpg" width="400" height="200"
     sizes="(max-width: 768px) 100vw, 50vw" />
```

Manual widths/densities with `ngSrcset`:

```html
<img ngSrc="hero.jpg" ngSrcset="100w, 200w, 300w" sizes="50vw" />
```

Disable automatic `srcset`:

```html
<img ngSrc="about.jpg" disableOptimizedSrcset />
```

Customize breakpoints (defaults: `[16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840]`):

```typescript
providers: [
  {provide: IMAGE_CONFIG, useValue: {breakpoints: [16, 48, 96, 128, 384, 640, 750, 828, 1080, 1200, 1920]}},
],
```

## Loading and decoding

`loading` overrides the default (`lazy` for non-priority images); accepts `eager`, `auto`, `lazy`:

```html
<img ngSrc="cat.jpg" width="400" height="200" loading="eager" />
```

`decoding` controls decode timing (default `auto`); accepts `auto`, `async`, `sync`:

```html
<img ngSrc="gallery/preview.jpg" width="600" height="400" decoding="async" />
```

## Loaders

The default generic loader returns URLs unmodified. Built-in loaders for CDNs:

| Service | Provider |
|---|---|
| Cloudflare Image Resizing | `provideCloudflareLoader` |
| Cloudinary | `provideCloudinaryLoader` |
| ImageKit | `provideImageKitLoader` |
| Imgix | `provideImgixLoader` |
| Netlify | `provideNetlifyLoader` |

```typescript
providers: [
  provideImgixLoader('https://my.base.url/'),
],
```

With a built-in loader, omit the base URL from `ngSrc`:

```html
<img ngSrc="cat.jpg" width="400" height="200" />
```

Custom loader via the `IMAGE_LOADER` token (receives `ImageLoaderConfig` with `src`, optional `width`, `height`, `loaderParams`):

```typescript
providers: [
  {
    provide: IMAGE_LOADER,
    useValue: (config: ImageLoaderConfig) =>
      `https://example.com/images?src=${config.src}&width=${config.width}&height=${config.height}`,
  },
],
```

Pass extra data with `loaderParams`, or apply CDN transforms (Cloudinary, Cloudflare, ImageKit, Imgix):

```html
<img ngSrc="profile.jpg" width="300" height="300" [loaderParams]="{roundedCorners: true}" />
<img ngSrc="my-image.jpg" width="400" height="300" [loaderParams]="{transform: 'e_grayscale,r_10'}" />
<img ngSrc="my-image.jpg" width="400" height="300" [loaderParams]="{transform: {e: 'grayscale', r: 10}}" />
```

## Background image migration

1. Remove the `background-image` CSS.
2. Give the container `position: relative` (or `fixed`/`absolute`).
3. Add a child `<img>` with `ngSrc`.
4. Add `fill` (omit `width`/`height`).
5. Add `priority` if it might be the LCP.

```html
<div style="position: relative;">
  <img ngSrc="background.jpg" fill priority />
</div>
```

## Resource hints

Preconnect links are auto-generated for configured loader domains. Add manually if needed:

```html
<link rel="preconnect" href="https://my.cdn.origin" />
```

Silence preconnect warnings:

```typescript
providers: [
  {provide: PRECONNECT_CHECK_BLOCKLIST, useValue: 'https://your-domain.com'},
],
```

## Best practices

- Always supply `width` and `height`, or use `fill`, to prevent cumulative layout shift.
- Mark exactly the LCP image with `priority`; leave others to lazy-load by default.
- Use `sizes` for responsive images so Angular generates an appropriate `srcset`.
- Configure a CDN loader to serve correctly sized, optimized images automatically.
- Keep data-URL placeholders under 4KB to avoid bloating the bundle.

## Common mistakes

- Using `src` instead of `ngSrc`, so the directive never engages.
- Omitting `width`/`height` without `fill` (causes layout shift and errors).
- Using `fill` on a parent without `position: relative`/`fixed`/`absolute`.
- Marking many images `priority`, which defeats prioritization of the true LCP image.
- Including the loader base URL in `ngSrc` when a built-in loader already supplies it.
- Forgetting to add `NgOptimizedImage` to the component's `imports`.
