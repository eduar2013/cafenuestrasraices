import { CurrencyPipe, DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { CartService, FREE_SHIPPING_FROM, SHIPPING_COST } from '../cart';

@Component({
  selector: 'app-cart-drawer',
  imports: [CurrencyPipe],
  templateUrl: './cart-drawer.html',
  styleUrl: './cart-drawer.css',
  host: { '(document:keydown.escape)': 'close()' },
})
export class CartDrawerComponent implements OnDestroy {
  readonly open = model(false);
  readonly closed = output<void>();

  readonly cart = inject(CartService);
  readonly freeShippingFrom = FREE_SHIPPING_FROM;
  readonly shippingCost = SHIPPING_COST;
  readonly checkoutNotice = signal(false);
  readonly shippingProgress = computed(() =>
    Math.min(100, Math.round((this.cart.total() / FREE_SHIPPING_FROM) * 100)),
  );

  private readonly document = inject(DOCUMENT);
  private readonly closeButton = viewChild.required<ElementRef<HTMLButtonElement>>('cartClose');

  constructor() {
    effect(() => {
      const open = this.open();
      // Lock page scroll while the drawer is open.
      this.document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        // Wait for the drawer to stop being inert before moving focus into it.
        setTimeout(() => {
          if (this.open()) {
            this.closeButton().nativeElement.focus();
          }
        });
      }
    });
  }

  close(): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    this.checkoutNotice.set(false);
    this.closed.emit();
  }

  ngOnDestroy(): void {
    this.document.body.style.overflow = '';
  }
}
