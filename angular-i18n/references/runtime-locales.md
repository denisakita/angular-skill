# Runtime locales & locale-aware data

This covers how Angular formats data at runtime according to the active locale: the `LOCALE_ID` token, registering locale data, and the locale-aware pipes.

## `LOCALE_ID`

`LOCALE_ID` is the injection token that tells Angular which locale rules to apply (for pipes and other locale-sensitive APIs).

- When you build with `ng build --localize`, the CLI sets `LOCALE_ID` automatically for each generated locale build.
- You can provide it manually for a single-locale app:

```typescript
import { LOCALE_ID } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }],
});
```

## `DEFAULT_CURRENCY_CODE`

Set a default currency for `CurrencyPipe` (otherwise it defaults to USD):

```typescript
import { DEFAULT_CURRENCY_CODE } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [{ provide: DEFAULT_CURRENCY_CODE, useValue: 'EUR' }],
});
```

## Registering locale data

Angular ships only English (US) locale data by default. Other locales need their CLDR data registered.

When you use `ng build --localize`, the CLI includes the correct locale data automatically — no manual step needed.

For apps that set `LOCALE_ID` manually (not using `--localize`), import the global locale variant. Locale data lives in `@angular/common/locales/global`:

```typescript
// src/main.ts (standalone apps)
import '@angular/common/locales/global/fr';
```

For NgModule-based apps, add the import in `app.module.ts` instead of `main.ts`.

## Locale-aware pipes

These pipes from `@angular/common` format values using `LOCALE_ID`:

| Pipe | Purpose |
|------|---------|
| `DatePipe` (`date`) | Formats a date value. |
| `DecimalPipe` (`number`) | Formats a number as a decimal string. |
| `CurrencyPipe` (`currency`) | Formats a number as a currency string. |
| `PercentPipe` (`percent`) | Formats a number as a percentage string. |

In standalone components, import the pipes you use:

```typescript
import { Component } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-prices',
  imports: [DatePipe, CurrencyPipe],
  template: `
    <p>{{ today | date }}</p>
    <p>{{ amount | currency }}</p>
  `,
})
export class PricesComponent {
  today = new Date();
  amount = 1234.5;
}
```

### Overriding the locale per pipe

Each pipe accepts a locale parameter that takes precedence over the app's `LOCALE_ID`. For example, force `CurrencyPipe` to format as US dollars regardless of the active locale:

```html
{{ amount | currency: 'USD' : 'symbol' : '1.2-2' : 'en-US' }}
```

The arguments are: currency code, display (`symbol`/`code`/`symbol-narrow`), digits info (`1.2-2`), and locale.

## Best practices

- Prefer `ng build --localize` so `LOCALE_ID` and locale data are configured for you.
- When setting `LOCALE_ID` manually, always import the matching `@angular/common/locales/global/<locale>` data, or pipes will fail/format incorrectly.
- Use the pipe's locale parameter only when a specific value must differ from the app locale (e.g. always show a price in USD).
- Set `DEFAULT_CURRENCY_CODE` instead of repeating the currency code on every `currency` pipe usage.

## Common mistakes

- Setting `LOCALE_ID` to a non-`en-US` value without registering that locale's data.
- Importing the non-global locale path and expecting pipes to pick it up automatically (use the `/global/` variant for side-effect registration).
- Assuming `CurrencyPipe` defaults to the app locale's currency — it defaults to USD unless `DEFAULT_CURRENCY_CODE` is provided or a code is passed.
- Hard-coding formatted strings instead of using locale-aware pipes.
