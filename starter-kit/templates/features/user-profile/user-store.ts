import { Injectable, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import type { User } from './user-profile';

/**
 * Recommended `data-access` pattern: a root-provided service that owns the
 * reactive state and exposes read-only signals to components. Components stay
 * thin and presentational; the store is the single source of truth.
 *
 * In v22 you can use the shorthand `@Service()` instead of
 * `@Injectable({ providedIn: 'root' })`.
 */
@Injectable({ providedIn: 'root' })
export class UserStore {
  /** Writable signal driving the request; set it to load a different user. */
  private readonly selectedId = signal<string | undefined>(undefined);

  /** Re-fetches whenever `selectedId()` changes; idle until an id is set. */
  private readonly userResource = httpResource<User>(() => {
    const id = this.selectedId();
    return id ? `/api/users/${id}` : undefined; // undefined url ⇒ no request
  });

  // Read-only signals exposed to components (`value` is a writable signal).
  readonly user = this.userResource.value.asReadonly();
  readonly isLoading = this.userResource.isLoading;
  readonly error = this.userResource.error;

  select(id: string): void {
    this.selectedId.set(id);
  }

  reload(): void {
    this.userResource.reload();
  }
}
