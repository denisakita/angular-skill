# Component Testing Scenarios

Source: https://angular.dev/guide/testing/components-scenarios

`TestBed.createComponent()` instantiates a component but does **not** trigger change
detection synchronously. Use `await fixture.whenStable()` (or dispatch real DOM events)
to apply data binding before asserting.

```typescript
let component: Banner;
let fixture: ComponentFixture<Banner>;
let h1: HTMLElement;

beforeEach(() => {
  fixture = TestBed.createComponent(Banner);
  component = fixture.componentInstance;
  h1 = fixture.nativeElement.querySelector('h1');
});
```

## Inputs and outputs (signals)

### Setting signal inputs

```typescript
it('should display a different test title', async () => {
  component.title.set('Test Title');
  await fixture.whenStable();
  expect(h1.textContent).toContain('Test Title');
});
```

### Binding inputs/outputs at creation

```typescript
const fixture = TestBed.createComponent(ValueDisplay, {
  bindings: [
    inputBinding('value', value),
    outputBinding('valueChange', () => /* ... */),
  ],
});
```

### Testing outputs / event emitters

Subscribe directly to the output to verify emission:

```typescript
it('should raise selected event when clicked', () => {
  let selectedHero: Hero | undefined;
  comp.selected.subscribe((hero: Hero) => (selectedHero = hero));

  heroDe.triggerEventHandler('click');
  expect(selectedHero).toBe(expectedHero);
});
```

## Simulating user input

Change the value, then dispatch the DOM event so Angular notices:

```typescript
it('should convert hero name to Title Case', async () => {
  const nameInput: HTMLInputElement = hostElement.querySelector('input')!;
  const nameDisplay: HTMLElement = hostElement.querySelector('span')!;

  nameInput.value = 'quick BROWN  fOx';
  nameInput.dispatchEvent(new Event('input'));

  await fixture.whenStable();
  expect(nameDisplay.textContent).toBe('Quick Brown  Fox');
});
```

## Dependency injection / service doubles

Replace a real service with a stub in `configureTestingModule`:

```typescript
class TwainQuotesStub implements TwainQuotes {
  private testQuote = 'Test Quote';
  getQuote() {
    return of(this.testQuote);
  }
}

beforeEach(async () => {
  TestBed.configureTestingModule({
    providers: [{provide: TwainQuotes, useClass: TwainQuotesStub}],
  });
});
```

Retrieve injected services:

```typescript
// root-level providers
userAuth = TestBed.inject(UserAuthentication);

// component-level providers
userAuth = fixture.debugElement.injector.get(UserAuthentication);
```

## Async testing

### `whenStable()`

```typescript
it('should welcome the user', async () => {
  await fixture.whenStable();
  expect(el.textContent).toContain('Welcome');
});
```

### Vitest fake timers

Modern, preferred way to control `setTimeout`/Promises:

```typescript
it('should display error when service fails', async () => {
  vi.useFakeTimers();
  const fixture = TestBed.createComponent(TwainComponent);

  await vi.runAllTimersAsync();

  expect(fixture.nativeElement.querySelector('.error')!.textContent)
    .toMatch(/test failure/);

  vi.useRealTimers();
});
```

With classic Jasmine/Karma the equivalent is Angular's `fakeAsync(() => { ...; tick(); })`
and `waitForAsync` — these remain available but Vitest fake timers are preferred in the
default setup.

### Controlling observable emission with a Subject

```typescript
class MockTwainQuotes implements TwainQuotes {
  private subject = new Subject<string>();

  getQuote() {
    return this.subject.asObservable();
  }

  emit(val: string) {
    this.subject.next(val);
  }
}
```

## Router testing with `RouterTestingHarness`

```typescript
beforeEach(async () => {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{path: '**', component: Dashboard}]),
      provideHttpClientTesting(),
    ],
  });
  harness = await RouterTestingHarness.create();
  comp = await harness.navigateByUrl('/', Dashboard);
});

it('should navigate when hero clicked', async () => {
  const heroDe = harness.routeDebugElement!.query(By.css('dashboard-hero'));
  heroDe.triggerEventHandler('selected', comp.heroes[0]);

  expect(TestBed.inject(Router).url).toEqual(`/heroes/${comp.heroes[0].id}`);
});
```

Components read route params via `ActivatedRoute.paramMap`:

```typescript
constructor() {
  this.route.paramMap
    .pipe(takeUntilDestroyed())
    .subscribe((pmap) => this.getHero(pmap.get('id')));
}
```

## Triggering events

```typescript
heroDe.triggerEventHandler('click'); // Angular event binding on DebugElement
heroEl.click();                      // native DOM method
```

Reusable click helper:

```typescript
export function click(
  el: DebugElement | HTMLElement,
  eventObj: any = ButtonClickEvents.left,
): void {
  if (el instanceof HTMLElement) {
    el.click();
  } else {
    el.triggerEventHandler('click', eventObj);
  }
}
```

## Nested components

### Stub child components

```typescript
@Component({selector: 'app-banner', template: ''})
class BannerStub {}

TestBed.configureTestingModule({/* ... */}).overrideComponent(App, {
  set: {imports: [RouterLink, BannerStub, RouterOutletStub, WelcomeStub]},
});
```

### `NO_ERRORS_SCHEMA`

```typescript
TestBed.configureTestingModule({/* ... */}).overrideComponent(App, {
  set: {schemas: [NO_ERRORS_SCHEMA]},
});
```

### Find directives with `By.directive()`

```typescript
const linkDes = fixture.debugElement.queryAll(By.directive(RouterLink));
const routerLinks = linkDes.map((de) => de.injector.get(RouterLink));
```

## Page object pattern

```typescript
class Page {
  get buttons() {
    return this.queryAll<HTMLButtonElement>('button');
  }
  get nameInput() {
    return this.query<HTMLInputElement>('input');
  }
  private query<T>(selector: string): T {
    return harness.routeNativeElement!.querySelector(selector)! as T;
  }
}

async function createComponent(id: number) {
  harness = await RouterTestingHarness.create();
  component = await harness.navigateByUrl(`/heroes/${id}`, HeroDetail);
  page = new Page();
}
```

## Overriding component providers

```typescript
TestBed.configureTestingModule({
  providers: [provideRouter([/* ... */])],
}).overrideComponent(HeroDetail, {
  set: {providers: [{provide: HeroDetailService, useClass: HeroDetailServiceSpy}]},
});

// access the overridden service from the component's injector
const hdsSpy = harness.routeDebugElement!.injector.get(HeroDetailService);
```

## Best practices

1. Always `await fixture.whenStable()` before asserting on template bindings.
2. Test behavior and observable outcomes, not internal mechanics.
3. Use page objects to centralize DOM queries and improve maintainability.
4. Mock at the right level — HTTP testing for HTTP, service stubs for complex deps.
5. Keep stubs minimal so tests are not brittle.
6. Prefer Vitest fake timers for async control in the default setup.

## Common mistakes

- Forgetting to trigger change detection (`whenStable()` / dispatch events) so the DOM never updates.
- Injecting services before configuring providers.
- Over-using `NO_ERRORS_SCHEMA`, which hides real template errors — use sparingly.
- Testing implementation details instead of public behavior.
- Asserting before promises resolve or observables emit.
