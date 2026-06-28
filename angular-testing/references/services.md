# Testing Services

Source: https://angular.dev/guide/testing/services

Testing services in isolation verifies business logic independent of components or
templates. `TestBed` creates an isolated DI environment for each test.

## Basic service test

```typescript
import {TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it} from 'vitest';
import {Calculator} from './calculator';

describe('Calculator', () => {
  let service: Calculator;

  beforeEach(() => {
    service = TestBed.inject(Calculator);
  });

  it('adds two numbers', () => {
    expect(service.add(1, 2)).toBe(3);
  });
});
```

Using `beforeEach` gives every test a fresh service instance, preventing state from
leaking between tests. By default `TestBed` provides the *real* implementation, so tests
exercise actual application code paths.

## Services with dependencies — stubs

Replace complex, slow, or unpredictable dependencies with a controlled stub via
`{provide, useValue}`:

```typescript
import {TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it, vi, type Mocked} from 'vitest';
import {OrderTotal} from './order-total';
import {TaxCalculator} from './tax-calculator';

const taxCalculatorStub: Mocked<TaxCalculator> = {
  calculate: vi.fn(),
};

describe('OrderTotal', () => {
  let service: OrderTotal;

  beforeEach(() => {
    taxCalculatorStub.calculate.mockReturnValue(5);

    TestBed.configureTestingModule({
      providers: [{provide: TaxCalculator, useValue: taxCalculatorStub}],
    });
    service = TestBed.inject(OrderTotal);
  });

  it('adds tax to the subtotal', () => {
    expect(service.total(100)).toBe(105);
  });
});
```

With Jasmine/Karma the equivalent stub uses `jasmine.createSpyObj('TaxCalculator',
['calculate'])` and `taxCalculatorStub.calculate.and.returnValue(5)`.

## Verifying interactions — spies

Use a Vitest spy (`vi.fn()`) to assert how a dependency was called:

```typescript
it('calls the tax calculator', () => {
  service.total(100);
  expect(taxCalculatorStub.calculate).toHaveBeenCalledExactlyOnce();
});
```

Spies confirm that the interaction between services happened correctly — that methods
received the proper arguments the right number of times.

## HTTP services

Services that use `HttpClient` are tested with Angular's HTTP testing utilities:
`provideHttpClientTesting()` and `HttpTestingController`. The pattern:

```typescript
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';

describe('DataService', () => {
  let service: DataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify()); // assert no outstanding requests

  it('fetches data', () => {
    let result: Data | undefined;
    service.getData().subscribe((d) => (result = d));

    const req = httpMock.expectOne('/api/data');
    expect(req.request.method).toBe('GET');
    req.flush({value: 42});

    expect(result).toEqual({value: 42});
  });
});
```

`provideHttpClientTesting()` can be placed in a global `providersFile` (see fundamentals)
so it is available everywhere.

## Best practices

- Stub dependencies that are complex, slow, or unpredictable; keep real ones otherwise.
- Verify interactions with spies when the *behavior is the call itself*.
- Maintain isolation via `beforeEach` so each test starts fresh.
- For HTTP, always call `httpMock.verify()` in `afterEach` to catch unexpected requests.

## Common mistakes

- Injecting a service before configuring its providers — configure `TestBed` first.
- Sharing mutable stub state across tests without resetting it in `beforeEach`.
- Over-stubbing: replacing a dependency you could safely use for real, which weakens the test.
- Forgetting `httpMock.verify()`, allowing leaked or duplicate HTTP expectations.
