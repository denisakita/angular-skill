# Dependency Providers

Source: https://angular.dev/guide/di/dependency-injection-providers (→ defining-dependency-providers)

Angular makes services available two ways: **automatic provision** with `providedIn` / `@Service()`, and **manual provision** with a `providers` array in components, directives, routes, or the application config.

A provider configuration has two parts:

1. **Provider identifier** — the unique key, set via `provide`.
2. **Value** — configured with one of: `useClass`, `useValue`, `useFactory`, `useExisting`.

## InjectionToken

An `InjectionToken` uniquely identifies a value for injection. Use it for any non-class dependency (config, primitives, functions, interface-typed values).

```typescript
import {InjectionToken} from '@angular/core';

export const API_URL = new InjectionToken<string>('api.url');
export const LOGGER = new InjectionToken<(msg: string) => void>('logger.function');

export interface Config {
  apiUrl: string;
  timeout: number;
}
export const CONFIG_TOKEN = new InjectionToken<Config>('app.config');
```

### Token with a tree-shakable factory (`providedIn: 'root'`)

```typescript
export interface AppConfig {
  apiUrl: string;
  version: string;
  features: Record<string, boolean>;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config', {
  providedIn: 'root',
  factory: () => ({
    apiUrl: 'https://api.example.com',
    version: '1.0.0',
    features: {darkMode: true, analytics: false},
  }),
});

@Component({
  selector: 'app-header',
  template: `<h1>Version: {{ config.version }}</h1>`,
})
export class Header {
  config = inject(APP_CONFIG);
}
```

A token factory runs in an injection context, so it can inject other tokens:

```typescript
export type LoggerFn = (level: string, message: string) => void;

export const LOGGER_FN = new InjectionToken<LoggerFn>('logger.function', {
  providedIn: 'root',
  factory: () => {
    const config = inject(APP_CONFIG);
    return (level: string, message: string) => {
      if (config.features.logging !== false) {
        console[level](`[${new Date().toISOString()}] ${message}`);
      }
    };
  },
});
```

Wrapping browser APIs makes them injectable and testable:

```typescript
export const LOCAL_STORAGE = new InjectionToken<Storage>('localStorage', {
  factory: () => window.localStorage,
});
```

### Interfaces cannot be tokens

TypeScript interfaces do not exist at runtime, so they cannot be provider identifiers. Use an `InjectionToken` typed by the interface instead:

```typescript
// ❌ Won't work
interface DataService { getData(): string[]; }
@Component({providers: [{provide: DataService, useClass: LocalDataService}]})

// ✅ Use InjectionToken
export const DATA_SERVICE_TOKEN = new InjectionToken<DataService>('DataService');
@Component({providers: [{provide: DATA_SERVICE_TOKEN, useClass: LocalDataService}]})
export class Example {
  private dataService = inject(DATA_SERVICE_TOKEN);
}
```

## useClass

Provides a class. The shorthand `providers: [DataService]` equals `{provide: DataService, useClass: DataService}`.

```typescript
// Shorthand
providers: [DataService];

// Full syntax
providers: [{provide: DataService, useClass: DataService}];

// Substitute a different implementation for the same token
providers: [{provide: DataService, useClass: MockDataService}];

// Choose at config time
providers: [
  {
    provide: StorageService,
    useClass: environment.production ? CloudStorageService : LocalStorageService,
  },
];
```

Substitution example with inheritance:

```typescript
@Injectable()
export class Logger {
  log(message: string) { console.log(message); }
}

@Injectable()
export class EvenBetterLogger extends Logger {
  private userService = inject(UserService);
  override log(message: string) {
    super.log(`Message to ${this.userService.user.name}: ${message}`);
  }
}

@Component({
  selector: 'app-example',
  providers: [UserService, {provide: Logger, useClass: EvenBetterLogger}],
})
export class Example {
  private logger = inject(Logger);
}
```

## useValue

Provides any static value:

```typescript
providers: [
  {provide: API_URL_TOKEN, useValue: 'https://api.example.com'},
  {provide: MAX_RETRIES_TOKEN, useValue: 3},
  {provide: FEATURE_FLAGS_TOKEN, useValue: {darkMode: true, beta: false}},
];
```

Common at bootstrap for app config:

```typescript
export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');

bootstrapApplication(AppComponent, {
  providers: [{provide: APP_CONFIG, useValue: appConfig}],
});
```

## useFactory

Provides a value produced by a function. Declare dependencies with `deps`, or call `inject()` inside the factory (it runs in an injection context).

```typescript
export const loggerFactory = (config: AppConfig) =>
  new LoggerService(config.logLevel, config.endpoint);

providers: [
  {provide: LoggerService, useFactory: loggerFactory, deps: [APP_CONFIG]},
];
```

Optional dependency via `deps`:

```typescript
import {Optional} from '@angular/core';

providers: [
  {
    provide: MyService,
    useFactory: (required: RequiredService, optional?: OptionalService) =>
      new MyService(required, optional || new DefaultService()),
    deps: [RequiredService, [new Optional(), OptionalService]],
  },
];
```

Factory using `inject()` instead of `deps`:

```typescript
const apiClientFactory = () => {
  const http = inject(HttpClient);
  const userService = inject(UserService);
  return new ApiClient(http, userService.getApiBaseUrl(), userService.getRateLimit());
};

export const apiClientProvider = {provide: ApiClient, useFactory: apiClientFactory};
```

## useExisting

Creates an **alias**: both tokens resolve to the **same** instance.

```typescript
providers: [
  NewLogger,
  {provide: OldLogger, useExisting: NewLogger},
];
```

Do not confuse `useExisting` with `useClass`: `useClass` creates a separate instance, `useExisting` returns the same singleton.

## Multi providers

`multi: true` lets several providers contribute to one token; injecting it yields an array.

```typescript
export const INTERCEPTOR_TOKEN = new InjectionToken<Interceptor[]>('interceptors');

providers: [
  {provide: INTERCEPTOR_TOKEN, useClass: AuthInterceptor, multi: true},
  {provide: INTERCEPTOR_TOKEN, useClass: LoggingInterceptor, multi: true},
  {provide: INTERCEPTOR_TOKEN, useClass: RetryInterceptor, multi: true},
];
```

## Provider scoping levels

```typescript
// Application bootstrap (main.ts)
bootstrapApplication(App, {
  providers: [
    {provide: API_BASE_URL, useValue: 'https://api.example.com'},
    {provide: INTERCEPTOR_TOKEN, useClass: AuthInterceptor, multi: true},
    LoggingService,
  ],
});

// Component / directive — one instance per component instance
@Component({
  selector: 'app-advanced-form',
  providers: [FormValidationService, {provide: FORM_CONFIG, useValue: {strictMode: true}}],
})
export class AdvancedForm {}

// Route — scoped to the lazy feature area
export const routes: Routes = [
  {
    path: 'admin',
    providers: [AdminService, {provide: FEATURE_FLAGS, useValue: {adminMode: true}}],
    loadChildren: () => import('./admin/admin.routes'),
  },
];
```

Providing a root service again at the component level creates an isolated, per-component instance.

## Library author pattern: `provide*()`

Expose a function returning `Provider[]`, optionally composed with `with*()` feature functions:

```typescript
import {InjectionToken, Provider, inject} from '@angular/core';

const ANALYTICS_CONFIG = new InjectionToken<AnalyticsConfig>('analytics.config');

export class AnalyticsService {
  private config = inject(ANALYTICS_CONFIG);
}

export function provideAnalytics(config: AnalyticsConfig): Provider[] {
  return [{provide: ANALYTICS_CONFIG, useValue: config}, AnalyticsService];
}

// Usage
bootstrapApplication(App, {
  providers: [provideAnalytics({trackingId: 'GA-12345'})],
});
```

## Best practices

- Use `InjectionToken` for every non-class value; type it with a generic and a descriptive description string.
- Prefer a tree-shakable token `factory` with `providedIn: 'root'` over a `useValue` at bootstrap when a default makes sense.
- Use `useExisting` to alias to a single instance; use `useClass` only when you want a distinct instance.
- For libraries, ship a `provide*()` function plus `with*()` features rather than asking consumers to wire raw providers.

## Common mistakes

- Using an interface as a provider token (it vanishes at runtime) — use an `InjectionToken`.
- Forgetting `deps` on a `useFactory` that takes parameters and does not use `inject()`.
- Expecting `useClass` to share an instance — it does not; use `useExisting`.
- Omitting `multi: true` on one entry of a multi-provider set, which overwrites the others instead of contributing.
