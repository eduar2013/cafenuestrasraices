import { CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartDrawerComponent } from './cart-drawer/cart-drawer';
import { CartService } from './cart';
import { PRODUCT_CATEGORIES, ProductCategory, SHOP_PRODUCTS, ShopProduct } from './catalog';

const TOAST_DURATION = 4000;

@Component({
  selector: 'app-shop',
  imports: [CartDrawerComponent, CurrencyPipe, RouterLink],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class ShopComponent implements OnDestroy {
  readonly cart = inject(CartService);
  readonly categories = PRODUCT_CATEGORIES;
  readonly category = signal<ProductCategory | 'todos'>('todos');
  readonly products = computed(() =>
    this.category() === 'todos'
      ? SHOP_PRODUCTS
      : SHOP_PRODUCTS.filter((product) => product.category === this.category()),
  );
  readonly selectedVariants = signal<Readonly<Record<string, string>>>({});
  readonly message = signal('');
  readonly cartOpen = signal(false);

  private toastTimer?: ReturnType<typeof setTimeout>;

  categoryLabel(id: ProductCategory): string {
    return this.categories.find((category) => category.id === id)?.label ?? '';
  }

  variant(product: ShopProduct) {
    return (
      product.variants.find((variant) => variant.id === this.selectedVariants()[product.id]) ??
      product.variants[0]
    );
  }

  selectVariant(product: ShopProduct, variantId: string): void {
    this.selectedVariants.update((variants) => ({ ...variants, [product.id]: variantId }));
  }

  add(product: ShopProduct): void {
    const variant = this.variant(product);
    this.cart.add(product, variant);
    this.showMessage(
      `${product.name}, ${variant.label}, añadido al carrito. ${this.cart.count()} unidades en total.`,
    );
  }

  openCart(): void {
    this.message.set('');
    this.cartOpen.set(true);
  }

  ngOnDestroy(): void {
    clearTimeout(this.toastTimer);
  }

  private showMessage(text: string): void {
    this.message.set(text);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.message.set(''), TOAST_DURATION);
  }
}
