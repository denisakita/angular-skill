import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root component. Standalone, OnPush. Keep it thin — it just hosts the router outlet.
 * Filename has no type suffix (modern Style Guide): `app.ts`, class `App`.
 *
 * Bootstrap (src/main.ts):
 *   import { bootstrapApplication } from '@angular/platform-browser';
 *   import { App } from './app/app';
 *   import { appConfig } from './app/app.config';
 *   bootstrapApplication(App, appConfig).catch((err) => console.error(err));
 */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App {}
