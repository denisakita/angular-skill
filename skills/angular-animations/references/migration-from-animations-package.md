# Migrating from @angular/animations to native CSS

## Why the package is deprecated

The `@angular/animations` package is **deprecated as of Angular v20.2**. Migrating to native CSS:

- **Reduces bundle size** — removing the package drops its JavaScript from your bundle.
- **Improves performance** — native CSS animations can use hardware acceleration.
- **Uses standard web features** — `transition`, `@keyframes`, `@starting-style`, and the Web
  Animations API instead of an Angular-specific DSL.

There is **no automated schematic** for this migration. You refactor the animation metadata in
your components into CSS by hand.

## High-level approach

1. Delete the `animations: [...]` array from `@Component` and remove `trigger`/`state`/`transition`
   imports from `@angular/animations`.
2. Remove `[@triggerName]` bindings from templates.
3. Recreate each state as a **CSS class**, toggled with `[class.x]` bindings driven by signals.
4. Recreate transitions/keyframes in the component's CSS (or a shared stylesheet).
5. For inserted/removed elements, use `animate.enter` / `animate.leave` with `@if`/`@for`.
6. Replace `AnimationPlayer` usage with the Web Animations API and animation DOM events.

## DSL → CSS mapping

### `trigger()` → CSS classes
A `trigger` wraps states and transitions. Replace it by toggling CSS classes via class binding
(`[class.className]="signal()"`).

### `state()` → CSS class with `transition`

```ts
// Before
state('open', style({height: '200px', opacity: 1, backgroundColor: 'yellow'}))
```

```css
/* After */
.open {
  height: 200px;
  opacity: 1;
  background-color: yellow;
  transition: all 1s;
}
```

### `animate()` → `transition-duration` / `animation-duration`

```ts
// Before
animate('1s')
```

```css
/* After (transition-driven) */
transition-duration: 1s;

/* After (keyframe-driven) */
animation-duration: 1s;
```

### `transition()` (e.g. `open => closed`, `* => void`) → presence of CSS classes
State-matching patterns are unnecessary. The animation runs based on which CSS class is present.

### `keyframes()` → `@keyframes`

```ts
// Before
keyframes([
  style({opacity: 0.1, offset: 0.1}),
  style({opacity: 1, offset: 0.5}),
])
```

```css
/* After — offsets become percentages */
@keyframes my-animation {
  10% { opacity: 0.1; }
  50% { opacity: 1; }
}
```

### `query()` → CSS selectors
Target sub-elements with normal CSS selectors and toggle classes; no `query()` needed.

### `stagger()` → `animation-delay` / `transition-delay` with a CSS variable

```ts
// Before
stagger(200, [animate('500ms')])
```

```html
<!-- After: pass the index as a custom property -->
@for (item of items(); track item; let i = $index) {
  <li class="item" [style.--index]="i">{{ item }}</li>
}
```

```css
.item {
  transition-delay: calc(200ms * var(--index));
}
```

### `group()` / `animateChild()` → comma-separated animations

```css
.target {
  animation: rotate 3s, fade-in 2s;
}
```

Note: there is **no automatic parent/child sequencing**. Coordinate dependent animations with the
`animationend` / `transitionend` events.

### `:enter` / `:leave` → `animate.enter` / `animate.leave`

```ts
// Before
trigger('myInsertRemoveTrigger', [
  transition(':enter', [style({opacity: 0}), animate('200ms', style({opacity: 1}))]),
  transition(':leave', [animate('200ms', style({opacity: 0}))]),
])
```

```html
<!-- After -->
@if (isShown()) {
  <div animate.enter="enter-animation" animate.leave="leave-animation">Content</div>
}
```

```css
.enter-animation {
  animation: slide-fade 1s;
}

@keyframes slide-fade {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

Use `@starting-style` when animating entry with a `transition` instead of `@keyframes`.

### `:increment` / `:decrement` → manual class toggling
There is no automatic numeric-change detection. Add the class yourself.

```ts
modify(n: number) {
  this.num.update((v) => v + n);
  this.el?.nativeElement.classList.add(n > 0 ? 'increment' : 'decrement');
}
```

### Wildcard / auto height (`style({height: '*'})`) → CSS grid trick

```ts
// Before
state('true', style({height: '*'}))
```

```css
/* After */
.container {
  display: grid;
  grid-template-rows: 0fr;
  overflow: hidden;
  transition: grid-template-rows 1s;
}
.container.open {
  grid-template-rows: 1fr;
}
```

## Full before/after example

```ts
// Before — @angular/animations
import {trigger, transition, style, animate} from '@angular/animations';

@Component({
  // ...
  animations: [
    trigger('myInsertRemoveTrigger', [
      transition(':enter', [style({opacity: 0}), animate('200ms', style({opacity: 1}))]),
      transition(':leave', [animate('200ms', style({opacity: 0}))]),
    ]),
  ],
})
export class InsertRemove {
  isShown = false;
}
```

```ts
// After — native CSS
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-insert',
  templateUrl: 'insert.html',
  styleUrls: ['insert.css'],
})
export class Insert {
  isShown = signal(false);
}
```

```html
@if (isShown()) {
  <div animate.enter="enter-animation">Content</div>
}
```

```css
.enter-animation {
  animation: slide-fade 1s;
}

@keyframes slide-fade {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

## Replacing callbacks and AnimationPlayer

The package's `(@trigger.start)` / `(@trigger.done)` callbacks map to native DOM events:

- Keyframes: `animationstart`, `animationend`, `animationiteration`, `animationcancel`
- Transitions: `transitionstart`, `transitionrun`, `transitionend`, `transitioncancel`

Be aware of **event bubbling**: when animating both children and parents, these events bubble from
children up to parents — check `event.target` / the animation name before reacting.

Replace `AnimationPlayer` with the Web Animations API:

```ts
const animations = element.getAnimations();
animations.forEach((anim) => anim.play()); // or pause(), reverse(), cancel()
```

## Caveats / features without a direct equivalent

- **No automatic parent/child sequencing** (`animateChild`) — orchestrate with `animationend` /
  `transitionend`.
- **No automatic state pattern matching** — toggle classes manually.
- **No `query()` complexity** — use plain CSS selectors.
- **`@starting-style`** is required to define the entry ("from") state for transition-based enter
  animations.
- **Disabling animations**: `.no-animation { animation: none !important; transition: none !important; }`.

## Best practices

- Migrate one trigger at a time and verify each animation visually before moving on.
- Move shared `@keyframes` into a global stylesheet so multiple components can reuse them.
- Prefer `transform`/`opacity` for smooth, GPU-accelerated motion.
- Use signals + `[class.x]` bindings to express state instead of the old `state()`/`transition()`.

## Common mistakes

- Expecting an `ng update`/schematic to do the migration — it must be done manually.
- Leaving `@angular/animations` imports or `provideAnimations()` in place after migrating.
- Forgetting `@starting-style`, so a transition-based enter animation has no starting state.
- Ignoring event bubbling and running completion logic for a child's animation on the parent.
- Removing elements without `animate.leave`, cutting off exit animations.
