import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { httpResource } from '@angular/common/http';

export interface User {
  id: string;
  name: string;
  email: string;
}

/**
 * First-component template — demonstrates the modern Angular v21/v22 idioms:
 * standalone, OnPush, signal `input.required()` (bound from the route param),
 * `httpResource()` for reactive read data, `computed()` for derived state,
 * `output()` for events. No NgModule, no constructor injection, no decorators
 * for I/O, no `*ngIf`/`*ngFor`. Filename has no type suffix.
 */
@Component({
  selector: 'app-user-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile {
  /** Bound from the route's `:id` segment via `withComponentInputBinding()`. */
  readonly id = input.required<string>();

  /** Emits when the user clicks "contact". */
  readonly contact = output<User>();

  /**
   * Reactive GET. Re-fetches automatically whenever `id()` changes, and exposes
   * `value()`, `isLoading()`, `error()`, `hasValue()`, `reload()` as signals.
   * For non-trivial apps, move this into a `data-access` store (see user-store.ts).
   */
  protected readonly user = httpResource<User>(() => `/api/users/${this.id()}`);

  protected readonly heading = computed(() => {
    const u = this.user.value();
    return u ? `${u.name}'s profile` : 'User profile';
  });

  protected onContact(): void {
    const u = this.user.value();
    if (u) this.contact.emit(u);
  }
}
