import { DOCUMENT } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ContactBarComponent } from '../../contact-bar/contact-bar';
import { CheckoutService, Order, OrderStatus } from '../checkout';
import { PaymentResultComponent } from '../payment-result/payment-result';

/**
 * Page Wompi sends the buyer back to after paying on its own page (phones). Wompi adds the
 * transaction as `?id=`; the order reference was saved before leaving the shop.
 */
@Component({
  selector: 'app-payment-return',
  imports: [ContactBarComponent, PaymentResultComponent, RouterLink],
  templateUrl: './payment-return.html',
  styleUrl: './payment-return.css',
})
export class PaymentReturnComponent implements OnInit, OnDestroy {
  readonly state = signal<'confirming' | 'result' | 'unknown'>('confirming');
  readonly status = signal<OrderStatus>('PENDING');
  readonly order = signal<Order | undefined>(undefined);

  private readonly checkout = inject(CheckoutService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private destroyed = false;

  async ngOnInit(): Promise<void> {
    const reference = this.checkout.pendingReference();
    const transactionId = this.transactionId();
    if (!reference || !transactionId) {
      this.state.set('unknown');
      return;
    }
    try {
      const result = await this.checkout.confirmPayment(
        reference,
        { id: transactionId },
        () => !this.destroyed,
      );
      if (!result) {
        return;
      }
      this.order.set(result.order);
      this.status.set(result.status);
    } catch {
      // The API could not be reached: the payment may still go through.
      this.status.set('PENDING');
    }
    this.state.set('result');
  }

  ngOnDestroy(): void {
    this.destroyed = true;
  }

  keepShopping(): void {
    void this.router.navigateByUrl('/tienda');
  }

  /** The cart is kept after a failed payment: back to the shop to try again. */
  retry(): void {
    void this.router.navigateByUrl('/tienda');
  }

  /** Wompi may add `?id=` inside the hash route or before it, depending on the URL it gets. */
  private transactionId(): string | null {
    const fromRoute = this.route.snapshot.queryParamMap.get('id');
    if (fromRoute) {
      return fromRoute;
    }
    const search = this.document.defaultView?.location.search ?? '';
    return new URLSearchParams(search).get('id');
  }
}
