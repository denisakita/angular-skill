# Lifecycle Hooks

Source: https://angular.dev/guide/components/lifecycle

A component's lifecycle is the sequence of steps between its creation and destruction. Hooks let you run code at specific points. Implement the matching TypeScript interface (named without the `ng` prefix) for type safety.

## Hooks at a glance

| Phase | Hook | When it runs |
|-------|------|--------------|
| Creation | `constructor` | When Angular instantiates the component |
| Change detection | `ngOnChanges` | Whenever inputs change (before `ngOnInit` on first run) |
| | `ngOnInit` | Once, after inputs are first set (before the template initializes) |
| | `ngDoCheck` | Before every change-detection run (very frequent) |
| | `ngAfterContentInit` | Once, after projected content initializes |
| | `ngAfterContentChecked` | After each check of projected content (frequent) |
| | `ngAfterViewInit` | Once, after the component's view (template children) initializes |
| | `ngAfterViewChecked` | After each check of the view (frequent) |
| Rendering | `afterNextRender` | Once, after the next render to the DOM |
| | `afterEveryRender` | After every render to the DOM |
| Destruction | `ngOnDestroy` | Once, just before the component is destroyed |

## Execution order

Initialization:

```
constructor
→ ngOnChanges
→ ngOnInit
→ ngDoCheck
→ ngAfterContentInit
→ ngAfterContentChecked
→ ngAfterViewInit
→ ngAfterViewChecked
→ afterNextRender
→ afterEveryRender
```

Subsequent updates:

```
ngOnChanges
→ ngDoCheck
→ ngAfterContentChecked
→ ngAfterViewChecked
→ afterEveryRender
```

## Common hooks

### ngOnInit

Runs once after Angular sets the initial input values, **before** the template is initialized — ideal for input-dependent setup.

```typescript
import {Component, input, OnInit} from '@angular/core';

@Component({/* ... */})
export class UserProfile implements OnInit {
  userId = input.required<string>();

  ngOnInit() {
    // safe to read inputs here
    console.log('init for', this.userId());
  }
}
```

### ngOnChanges

Runs whenever inputs change, receiving a `SimpleChanges` map of previous/current values. On the first run it executes before `ngOnInit`.

```typescript
import {Component, input, OnChanges, SimpleChanges} from '@angular/core';

@Component({/* ... */})
export class UserProfile implements OnChanges {
  name = input('');

  ngOnChanges(changes: SimpleChanges) {
    if (changes['name']) {
      console.log('Previous:', changes['name'].previousValue);
      console.log('Current:', changes['name'].currentValue);
    }
  }
}
```

Note: with signal inputs you can usually react with `effect()`/`computed()` instead of `ngOnChanges`.

### ngOnDestroy and DestroyRef

`ngOnDestroy` runs once before destruction (e.g. when removed by `@if` or navigation). Alternatively, register cleanup with `DestroyRef`.

```typescript
import {Component, DestroyRef, inject} from '@angular/core';

@Component({/* ... */})
export class UserProfile {
  constructor() {
    inject(DestroyRef).onDestroy(() => {
      console.log('Cleanup here');
    });
  }
}
```

### afterNextRender / afterEveryRender

Standalone functions (not class methods) for DOM-render callbacks. They run only in the browser — never during server-side rendering or build-time prerendering. Register them in an injection context (e.g. the constructor). Phases run in order: `earlyRead` → `write` → `mixedReadWrite` → `read`.

```typescript
import {Component, ElementRef, afterNextRender, inject} from '@angular/core';

@Component({/* ... */})
export class UserProfile {
  private elementRef = inject(ElementRef);
  private elementHeight = 0;

  constructor() {
    afterNextRender({
      write: () => {
        this.elementRef.nativeElement.style.padding = '8px';
      },
      read: () => {
        this.elementHeight = this.elementRef.nativeElement.getBoundingClientRect().height;
      },
    });
  }
}
```

## Constructor vs ngOnInit

- **constructor** — runs at instantiation; best for dependency injection (`inject()`). Inputs are not yet available.
- **ngOnInit** — runs after inputs are initialized; best for setup that depends on input values.

## Lifecycle interfaces

`OnInit`, `OnChanges`, `OnDestroy`, `DoCheck`, `AfterContentInit`, `AfterContentChecked`, `AfterViewInit`, `AfterViewChecked` — implement the relevant one(s) for type-checked hooks.

## Best practices

- Do input-dependent setup in `ngOnInit`, not the constructor.
- Prefer `DestroyRef.onDestroy()` for cleanup colocated with the code that needs it (e.g. subscriptions started in the constructor).
- Use `afterNextRender`/`afterEveryRender` for direct DOM measurement/manipulation instead of `ngAfterViewInit` where possible (SSR-safe by skipping on the server).
- With signal inputs, prefer `computed()`/`effect()` over `ngOnChanges`.

## Common mistakes

- **Reading inputs in the constructor** — they aren't set yet; use `ngOnInit`.
- **Modifying state in `ngAfterViewChecked`/`ngAfterContentChecked`/`*Init` after-checked hooks** — can trigger `ExpressionChangedAfterItHasBeenCheckedError`.
- **Doing heavy work in `ngDoCheck`/`*Checked` hooks** — they run extremely often and hurt performance.
- **Expecting render callbacks to run on the server** — `afterNextRender`/`afterEveryRender` are browser-only.
