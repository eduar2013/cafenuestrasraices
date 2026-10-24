import { Injectable, computed, effect, signal } from '@angular/core';
import { ProductVariant, ShopProduct, findVariant } from './catalog';

export interface CartItem {
  readonly product: ShopProduct;
  readonly variant: ProductVariant;
  readonly quantity: number;
}

/** Simulated shipping rules (COP). */
export const SHIPPING_COST = 9000;
export const FREE_SHIPPING_FROM = 120000;

const STORAGE_KEY = 'cnr-cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly state = signal<readonly CartItem[]>(loadItems());
  readonly items = this.state.asReadonly();
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
    effect(() => saveItems(this.items()));
  }

  add(product: ShopProduct, variant: ProductVariant): void {
    this.state.update((items) => {
      const exists = items.some((item) => item.variant.id === variant.id);
      return exists
        ? items.map((item) =>
            item.variant.id === variant.id ? { ...item, quantity: item.quantity + 1 } : item,
          )
        : [...items, { product, variant, quantity: 1 }];
    });
  }

  increase(id: string): void {
    this.state.update((items) =>
      items.map((item) =>
        item.variant.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }

  decrease(id: string): void {
    this.state.update((items) =>
      items
        .map((item) => (item.variant.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    );
  }

  remove(id: string): void {
    this.state.update((items) => items.filter((item) => item.variant.id !== id));
  }

  clear(): void {
    this.state.set([]);
  }
}

// The cart is stored as variant ids + quantities and rebuilt from the catalog,
// so price or name changes in the catalog are always reflected.
function loadItems(): readonly CartItem[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(saved)) {
      return [];
    }
    return saved.flatMap((entry) => {
      const match = typeof entry?.id === 'string' ? findVariant(entry.id) : undefined;
      const quantity = Number(entry?.quantity);
      return match && Number.isInteger(quantity) && quantity > 0 ? [{ ...match, quantity }] : [];
    });
  } catch {
    return [];
  }
}

function saveItems(items: readonly CartItem[]): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items.map((item) => ({ id: item.variant.id, quantity: item.quantity }))),
    );
  } catch {
    // Storage unavailable (private mode, blocked cookies): the cart still works in memory.
  }
}
