# Component Harnesses

Sources:
- https://angular.dev/guide/testing/component-harnesses-overview
- https://angular.dev/guide/testing/using-component-harnesses
- https://angular.dev/guide/testing/creating-component-harnesses

## What harnesses are and why

A component harness is a class that lets tests interact with a component the way an end
user would, through a supported API. They solve three problems:

1. **Brittle tests** — they hide implementation details (DOM structure, CSS classes), so
   internal refactors don't break tests.
2. **Maintainability** — tests use a user-centric, readable API.
3. **Environment fragmentation** — the same harness works in both unit and e2e tests.

Harnesses are built on the **Angular CDK** (`@angular/cdk`). **Angular Material provides a
harness for every component**, so prefer Material/CDK harnesses over querying Material's
internal DOM. Install the CDK with:

```
ng add @angular/cdk
```

Example of the user-centric API:

```javascript
it('should load button with exact text', async () => {
  const button = await loader.getHarness(MyButtonComponentHarness);
  expect(await button.getText()).toBe('Confirm');
});
```

---

## Using harnesses in tests

### Environments and loaders

- **Unit tests** — `TestbedHarnessEnvironment` (with `TestBed`).
- **End-to-end tests** — `SeleniumWebDriverHarnessEnvironment`.

Create a `HarnessLoader` from a fixture:

```typescript
const fixture = TestBed.createComponent(MyComponent);
const loader = TestbedHarnessEnvironment.loader(fixture);
```

For elements rendered outside the fixture (overlays, floating dialogs appended to the
document body):

```typescript
const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
```

Create a harness directly at the fixture root:

```typescript
const harness = await TestbedHarnessEnvironment.harnessForFixture(
  fixture,
  MyComponentHarness,
);
```

### `HarnessLoader` methods

- `getHarness(query)` — first matching harness.
- `getAllHarnesses(query)` — all matching harnesses.
- `getHarnessAtIndex(query, index)` — harness at an index.
- `countHarnesses(query)` — number of matches.
- `hasHarness(query)` — whether any match exists.

```typescript
const harness = await loader.getHarness(MyComponent);
const allHarnesses = await loader.getAllHarnesses(MyComponent);
```

### Filtering harnesses

With a `HarnessPredicate`:

```typescript
const disabledButtonPredicate = new HarnessPredicate(
  MyButtonComponentHarness,
  {selector: '[disabled]'},
);
const disabledButton = await loader.getHarness(disabledButtonPredicate);
```

Or the static `with()` method most harnesses provide:

```typescript
const button = await loader.getHarness(
  MyButtonComponentHarness.with({selector: 'btn'}),
);
```

### Child loaders

```typescript
const childLoader = await myComponentHarness.getLoader('.child');
const allChildLoaders = await myComponentHarness.getAllChildLoaders('.child');
```

### Calling harness APIs

```typescript
it('should get value of slider thumb', async () => {
  const slider = await loader.getHarness(MatSliderHarness);
  const thumb = await slider.getEndThumb();
  expect(await thumb.getValue()).toBe(50);
});
```

### Change detection control

Handled automatically by default. For manual control:

```typescript
it('checks state while async action is in progress', async () => {
  const buttonHarness = loader.getHarness(MyButtonHarness);
  await manualChangeDetection(async () => {
    await buttonHarness.click();
    fixture.detectChanges();
    expect(isProgressSpinnerVisible()).toBe(true);
    await fixture.whenStable();
    expect(isProgressSpinnerVisible()).toBe(false);
  });
});
```

### Parallel reads

```typescript
const [checked, indeterminate] = await parallel(() => [
  checkboxHarness.isChecked(),
  checkboxHarness.isIndeterminate(),
]);
```

---

## Creating harnesses

Create harnesses for reusable widget-library components, not single-use page components.

### Extend `ComponentHarness` + `hostSelector`

```typescript
class MyPopupHarness extends ComponentHarness {
  static hostSelector = 'my-popup';
}
```

`hostSelector` identifies matching DOM elements and usually matches the component's
selector.

### Locating elements

`locatorFor`, `locatorForOptional`, and `locatorForAll` return *functions* (not cached
references), so tests always read current DOM state.

```typescript
class MyPopupHarness extends ComponentHarness {
  static hostSelector = 'my-popup';

  getTriggerElement = this.locatorFor('button');
  getContentElement = this.locatorForOptional('.my-popup-content');
}
```

### `TestElement` and action methods

`TestElement` abstracts DOM interaction across environments (methods like `blur()`,
`click()`, `getAttribute()`, `text()`). Use it instead of `document.querySelector`.
**Never expose `TestElement` for internal elements** — expose high-level, action-focused
methods:

```typescript
class MyPopupHarness extends ComponentHarness {
  protected getTriggerElement = this.locatorFor('button');
  protected getContentElement = this.locatorForOptional('.my-popup-content');

  async toggle() {
    const trigger = await this.getTriggerElement();
    return trigger.click();
  }

  async isOpen() {
    const content = await this.getContentElement();
    return !!content;
  }
}
```

### Sub-harnesses

Pass a harness class to a locator to reference nested components:

```typescript
class MyMenuHarness extends ComponentHarness {
  static hostSelector = 'my-menu';

  protected getPopupHarness = this.locatorFor(MyPopupHarness);
  getItems = this.locatorForAll(MyMenuItemHarness);

  async toggle() {
    const popupHarness = await this.getPopupHarness();
    return popupHarness.toggle();
  }
}
```

### Filtering with `HarnessPredicate`

```typescript
interface MyMenuHarnessFilters extends BaseHarnessFilters {
  triggerText?: string | RegExp;
}

class MyMenuHarness extends ComponentHarness {
  static hostSelector = 'my-menu';

  static with(options: MyMenuHarnessFilters): HarnessPredicate<MyMenuHarness> {
    return new HarnessPredicate(MyMenuHarness, options).addOption(
      'trigger text',
      options.triggerText,
      (harness, text) => HarnessPredicate.stringMatches(harness.getTriggerText(), text),
    );
  }

  async getTriggerText(): Promise<string> {
    const popupHarness = await this.getPopupHarness();
    return popupHarness.getTriggerText();
  }
}
```

Usage: `loader.getHarness(MyMenuHarness.with({triggerText: 'File'}))`.

### Content projection

For components with `<ng-content>`, extend `ContentContainerComponentHarness` or use
`harnessLoaderFor()` for scoped loaders:

```typescript
class MyPopupHarness extends ContentContainerComponentHarness<string> {
  static hostSelector = 'my-popup';
}
```

### Elements outside the host

```typescript
class MyPopupHarness extends ComponentHarness {
  async getHarnessLoaderForContent(): Promise<HarnessLoader> {
    const rootLocator = this.documentRootLocatorFactory();
    return rootLocator.harnessLoaderFor('my-popup-content');
  }
}
```

### Async/stabilization

`TestElement` methods automatically trigger change detection and wait for NgZone tasks.
For complex animations call `forceStabilize()` for extra cycles; for tasks outside NgZone
use `waitForTasksOutsideAngular()`.

---

## Best practices

- Prefer existing harnesses (Material/CDK) over querying internal DOM/CSS.
- `await` harness calls for readability.
- Use `documentRootLoader()` for overlays/dialogs appended to `document.body`.
- Use `parallel()` to read multiple properties at once and optimize change detection.
- When authoring: expose narrow action methods, never raw `TestElement`s; provide `with()`
  filters; mirror component composition in harness structure; build harnesses for
  reusable, heavily-tested components.

## Common mistakes

- Querying Material's internal DOM/classes instead of using its harness (brittle tests).
- Exposing `TestElement` for private internals, leaking implementation details.
- Forgetting `documentRootLoader()` for floating content, so the harness can't find it.
- Caching located elements instead of using the locator functions, leading to stale refs.
