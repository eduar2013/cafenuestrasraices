import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from './cart';
import { SHOP_PRODUCTS, ShopProduct } from './catalog';

@Component({
  selector: 'app-shop',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class ShopComponent {
  readonly products = SHOP_PRODUCTS;
  readonly cart = inject(CartService);
  readonly selectedVariants = signal<Readonly<Record<string, string>>>({});
  readonly message = signal('');

  variant(product: ShopProduct) {
    return (
      product.variants.find((variant) => variant.id === this.selectedVariants()[product.id]) ??
      product.variants[0]
    );
  }

  selectVariant(product: ShopProduct, event: Event): void {
    const select = event.target;
    if (select instanceof HTMLSelectElement) {
      this.selectedVariants.update((variants) => ({ ...variants, [product.id]: select.value }));
    }
  }

  add(product: ShopProduct): void {
    const variant = this.variant(product);
    this.cart.add(product, variant);
    this.message.set(
      `${product.name}, ${variant.weight} g, añadido al carrito. ${this.cart.count()} unidades en total.`,
    );
  }
}
