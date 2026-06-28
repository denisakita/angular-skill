# Native CSS animations in Angular

Angular animations are now built directly on standard CSS features — there is no dedicated
animation API to learn. You animate elements with CSS `transition`, `@keyframes`, and the
`@starting-style` rule, and you drive them from your component with class bindings on signals.
For elements that are added or removed by `@if`/`@for`, Angular provides two template attributes,
`animate.enter` and `animate.leave`, so the framework knows when to apply enter classes and how
long to keep a leaving element in the DOM.

## Transitions between states (class toggling)

Toggle a CSS class with a class binding and let CSS `transition` animate the change.

```ts
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-open-close',
  templateUrl: 'open-close.html',
  styleUrls: ['open-close.css'],
})
export class OpenClose {
  isOpen = signal(true);

  toggle() {
    this.isOpen.update((isOpen) => !isOpen);
  }
}
```

```html
<button type="button" (click)="toggle()">Toggle</button>
<div [class.open]="isOpen()">Content</div>
```

```css
.open {
  height: 200px;
  opacity: 1;
  background-color: yellow;
  transition: all 1s;
}

.closed {
  height: 100px;
  opacity: 0.8;
  background-color: blue;
  transition: all 1s;
}
```

## Keyframe animations

Define multi-step or reusable animations with `@keyframes` and apply them with the `animation`
property. Keyframes can live in a shared stylesheet and be reused across components.

```css
@keyframes shared-animation {
  to {
    height: 0;
    opacity: 1;
  }
}

.animated-class {
  animation: shared-animation 1s;
}
```

### Timing and easing

```css
.example-element {
  animation-duration: 1s;
  animation-delay: 500ms;
  animation-timing-function: ease-in-out;
}
```

Shorthand for an animation: `animation: example-animation 1s ease-in-out 500ms;`

Shorthand for a transition: `transition: margin-right 1s ease-in-out 500ms;`

### Parallel animations

Apply more than one animation to an element by comma-separating them.

```css
.target-element {
  animation: rotate 3s, fade-in 2s;
}
```

## Entering elements: `animate.enter`

When an element is added to the DOM (for example inside an `@if` or `@for`), put the enter
animation class on it with `animate.enter`. Angular applies the class as the element enters.

```html
@if (isShown()) {
  <div class="insert-container" animate.enter="enter-animation">
    <p>The box is inserted</p>
  </div>
}
```

```css
.enter-animation {
  animation: slide-fade 1s;
}

@keyframes slide-fade {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

`animate.enter` accepts a class name (or names) to apply during entry. You can also bind it to a
signal/expression that returns the class name(s) when the class is computed dynamically.

### `@starting-style` for entry transitions

If you animate entry with a `transition` (rather than `@keyframes`), use the CSS `@starting-style`
rule to declare the "before it entered the DOM" state. The browser transitions from the
`@starting-style` values to the element's normal values on insertion.

```css
.insert-container {
  opacity: 1;
  transition: opacity 200ms ease-in;

  @starting-style {
    opacity: 0;
  }
}
```

## Leaving elements: `animate.leave`

When an element is removed, Angular must keep it in the DOM long enough to play an exit animation.
Mark it with `animate.leave` and Angular applies the class and waits for the animation to finish
before removing the element.

```html
@if (isShown()) {
  <div class="insert-container" animate.leave="deleting">
    <p>The box is inserted</p>
  </div>
}
```

```css
.deleting {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 500ms ease-out, transform 500ms ease-out;
}
```

## Staggered list animations with `@for`

Use a CSS custom property to give each item an incremental delay. Drive the variable from the
loop index.

```html
<ul class="items">
  @for (item of items(); track item; let i = $index) {
    <li class="item" [style.--index]="i">{{ item }}</li>
  }
</ul>
```

```css
.items .item {
  transition-property: opacity, transform;
  transition-duration: 500ms;
  transition-delay: calc(200ms * var(--index));

  @starting-style {
    opacity: 0;
    transform: translateX(-10px);
  }
}
```

## Animating to "auto" height (CSS grid trick)

CSS cannot transition to `height: auto`, so use a grid row that animates from `0fr` to `1fr`.

```css
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

## Reacting to animation lifecycle events

Native DOM events report animation progress. Listen for them on the element when you need to run
code at the start or end of an animation.

- Keyframe animations: `animationstart`, `animationend`, `animationiteration`, `animationcancel`
- Transitions: `transitionstart`, `transitionrun`, `transitionend`, `transitioncancel`

```ts
this.el()?.nativeElement.addEventListener('animationend', (ev: AnimationEvent) => {
  if (ev.animationName.endsWith('decrement')) {
    this.animationFinished();
  }
});
```

## Programmatic control (Web Animations API)

For imperative control, use the standard Web Animations API on the element.

```ts
const animations = element.getAnimations();
animations.forEach((anim) => anim.pause()); // or play(), reverse(), cancel()
```

## Disabling animations

```css
.no-animation {
  animation: none !important;
  transition: none !important;
}
```

## Best practices

- Drive state from **signals** and toggle classes with `[class.x]` bindings rather than mutating
  the DOM by hand.
- Prefer animating `opacity` and `transform` — they are GPU-accelerated and avoid layout reflow.
- Use `@keyframes` for reusable / multi-step motion and `transition` for simple state changes.
- Use `@starting-style` for transition-based enter animations; use `animate.enter` so Angular
  applies the class at the right moment for inserted elements.
- Always pair element removal animations with `animate.leave` so the element is not yanked from
  the DOM before the animation completes.
- Honor user preferences: wrap motion in `@media (prefers-reduced-motion: reduce)` and reduce or
  remove animations there.

## Common mistakes

- Forgetting `animate.leave`, so a removed element disappears instantly with no exit animation.
- Trying to `transition` to `height: auto` — use the `grid-template-rows: 0fr -> 1fr` technique.
- Animating an entering element without `@starting-style` or `animate.enter`, so there is no
  "from" state and nothing animates.
- Putting view-transition / global animation CSS inside component styles where view encapsulation
  can scope it away (keep cross-element animation CSS global).
- Reaching for `@angular/animations` (`trigger`/`state`/`transition`/`animate`) — it is deprecated
  as of v20.2; use native CSS instead.
