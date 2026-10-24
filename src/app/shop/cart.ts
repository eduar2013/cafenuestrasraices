import { Injectable, computed, signal } from '@angular/core';
import { CoffeeVariant, ShopProduct } from './catalog';

interface CartItem {
  readonly product: ShopProduct;
  readonly variant: CoffeeVariant;
  readonly quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly state = signal<readonly CartItem[]>([]);
  readonly items = this.state.asReadonly();
  readonly count = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));
  readonly total = computed(() =>
    this.items().reduce((sum, item) => sum + item.variant.price * item.quantity, 0),
  );

  add(product: ShopProduct, variant: CoffeeVariant): void {
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
