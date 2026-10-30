import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { CatalogService, ProductVariant, ShopProduct } from './catalog';

export interface CartItem {
  readonly product: ShopProduct;
  readonly variant: ProductVariant;
  readonly quantity: number;
}

/** Simulated shipping rules (COP). */
export const SHIPPING_COST = 9000;
export const FREE_SHIPPING_FROM = 120000;

const STORAGE_KEY = 'cnr-cart';

interface CartEntry {
  readonly id: string;
  readonly quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly catalog = inject(CatalogService);
  private readonly state = signal<readonly CartEntry[]>(loadEntries());
  // Items are rebuilt from the catalog loaded from the API, so prices and names are
  // always current. Saved entries are kept while the catalog is still loading.
  readonly items = computed(() =>
    this.state().flatMap((entry): CartItem[] => {
      const match = this.catalog.findVariant(entry.id);
      return match ? [{ ...match, quantity: entry.quantity }] : [];
    }),
  );
  readonly count = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));
  readonly total = computed(() =>
    this.items().reduce((sum, item) => sum + item.variant.price * item.quantity, 0),
  );
  readonly shipping = computed(() =>
    this.total() === 0 || this.total() >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST,
  );
  readonly grandTotal = computed(() => this.total() + this.shipping());
  readonly freeShippingRemaining = computed(() => Math.max(0, FREE_SHIPPING_FROM - this.total()));

  constructor() {
    effect(() => saveEntries(this.state()));
  }

  add(_product: ShopProduct, variant: ProductVariant): void {
    this.state.update((entries) =>
      entries.some((entry) => entry.id === variant.id)
        ? entries.map((entry) =>
            entry.id === variant.id ? { ...entry, quantity: entry.quantity + 1 } : entry,
          )
        : [...entries, { id: variant.id, quantity: 1 }],
    );
  }

  increase(id: string): void {
    this.state.update((entries) =>
      entries.map((entry) =>
        entry.id === id ? { ...entry, quantity: entry.quantity + 1 } : entry,
      ),
    );
  }

  decrease(id: string): void {
    this.state.update((entries) =>
      entries
        .map((entry) => (entry.id === id ? { ...entry, quantity: entry.quantity - 1 } : entry))
        .filter((entry) => entry.quantity > 0),
    );
  }

  remove(id: string): void {
    this.state.update((entries) => entries.filter((entry) => entry.id !== id));
  }

  clear(): void {
    this.state.set([]);
  }
}

function loadEntries(): readonly CartEntry[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(saved)) {
      return [];
    }
    return saved.flatMap((entry) => {
      const quantity = Number(entry?.quantity);
      return typeof entry?.id === 'string' && Number.isInteger(quantity) && quantity > 0
        ? [{ id: entry.id, quantity }]
        : [];
    });
  } catch {
    return [];
  }
}

function saveEntries(entries: readonly CartEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage unavailable (private mode, blocked cookies): the cart still works in memory.
  }
}
