# Image Optimization (NgOptimizedImage)

`NgOptimizedImage` is a directive that enforces image best practices automatically: it prevents layout shift, prioritizes the LCP image, generates responsive `srcset`s, lazy-loads non-critical images, and integrates with image CDNs.

## Importing the directive

`NgOptimizedImage` is a standalone directive imported from `@angular/common`. Add it to a component's `imports`.

```ts
import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-gallery',
  imports: [NgOptimizedImage],
  templateUrl: './gallery.html',
})
export class Gallery {}
```

## Core attributes

### ngSrc

Use `ngSrc` instead of `src` to activate the directive. This prevents the browser from eagerly downloading the image before Angular processes it.

```html
<img ngSrc="cat.jpg" width="400" height="200" />
```

### width and height

Always set `width` and `height` (the intrinsic dimensions) to prevent layout shift. For responsive images use the intrinsic image dimensions; for fixed-size images use the desired rendered dimensions.

```html
<img ngSrc="cat.jpg" width="400" height="200" />
```

### priority

Mark the Largest Contentful Paint (LCP) image as `priority`. Priority images receive `fetchpriority=high`, `loading=eager`, and an automatic preload link for SSR.

```html
<img ngSrc="hero.jpg" width="1600" height="900" priority />
```

### fill

Use `fill` when the image should fill its parent container without explicit dimensions. The parent must have `position: relative`, `fixed`, or `absolute`. Control rendering with CSS `object-fit` and `object-position`.

```html
<div style="position: relative; width: 300px; height: 200px;">
  <img ngSrc="cat.jpg" fill />
</div>
```

## Placeholders

Request a low-resolution, blurred placeholder from a CDN loader:

```html
<img ngSrc="cat.jpg" width="400" height="200" placeholder />
```

Or provide an inline base64 data URL (keep it under 4KB):

```html
<img ngSrc="cat.jpg" width="400" height="200"
     placeholder="data:image/png;base64,iVBORw0K..." />
```

Disable the blur effect:

```html
<img ngSrc="cat.jpg" width="400" height="200"
     placeholder [placeholderConfig]="{ blur: false }" />
```

Adjust the default placeholder resolution via `IMAGE_CONFIG`:

```ts
import { IMAGE_CONFIG } from '@angular/common';

providers: [
  { provide: IMAGE_CONFIG, useValue: { placeholderResolution: 40 } },
];
```

## Responsive images

For fixed-size images, a density `srcset` is generated automatically. For responsive images, add `sizes`:

```html
<img ngSrc="cat.jpg" width="400" height="200" sizes="100vw" />
<img ngSrc="cat.jpg" width="400" height="200"
     sizes="(max-width: 768px) 100vw, 50vw" />
```

Define width descriptors manually with `ngSrcset`:

```html
<img ngSrc="hero.jpg" ngSrcset="100w, 200w, 300w" sizes="50vw" />
```

Disable automatic `srcset` generation when needed:

```html
<img ngSrc="about.jpg" width="400" height="200" disableOptimizedSrcset />
```

## Loaders

`NgOptimizedImage` ships with loaders for common image CDNs. Configure one in `providers`:

```ts
import { provideImgixLoader } from '@angular/common';

providers: [
  provideImgixLoader('https://my.base.url/'),
];
```

Built-in loaders: `provideCloudflareLoader`, `provideCloudinaryLoader`, `provideImageKitLoader`, `provideImgixLoader`, `provideNetlifyLoader`.

Provide a custom loader with the `IMAGE_LOADER` token:

```ts
import { IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';

providers: [
  {
    provide: IMAGE_LOADER,
    useValue: (config: ImageLoaderConfig) =>
      `https://example.com/images?src=${config.src}&width=${config.width}`,
  },
];
```

Pass extra CDN options per image via `loaderParams`:

```html
<img ngSrc="profile.jpg" width="300" height="300"
     [loaderParams]="{ roundedCorners: true }" />
```

## Best practices

- Use `ngSrc` for every content image and always set `width`/`height` (or `fill`) to eliminate layout shift.
- Mark exactly one above-the-fold LCP image as `priority`; do not mark many images priority.
- Provide `sizes` for responsive images so the browser downloads the right resolution.
- Configure a CDN loader to get automatic resizing and format optimization.
- Add a `preconnect` resource hint for the image origin so the connection is warm.

## Common mistakes

- Keeping `src` instead of switching to `ngSrc` (the directive does nothing without `ngSrc`).
- Omitting `width`/`height` and not using `fill`, which triggers a console error and causes layout shift.
- Using `fill` without setting `position: relative|fixed|absolute` on the parent.
- Marking too many images as `priority`, which competes for bandwidth and hurts LCP.
- Using a data-URL placeholder larger than 4KB, bloating the bundle.
