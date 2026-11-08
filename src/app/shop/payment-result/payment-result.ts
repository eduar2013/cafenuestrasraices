import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { ORDERS_API_URL, Order, OrderStatus, formatPickupCode } from '../checkout';

/** Outcome of a payment: approved, still processing or not approved. */
@Component({
  selector: 'app-payment-result',
  imports: [CurrencyPipe],
  templateUrl: './payment-result.html',
  styleUrl: './payment-result.css',
})
export class PaymentResultComponent {
  readonly status = input.required<OrderStatus>();
  readonly order = input<Order>();
  /** The buyer keeps shopping (approved or processing). */
  readonly continue = output<void>();
  /** The buyer wants to try paying again (not approved). */
  readonly retry = output<void>();

  private readonly ordersUrl = inject(ORDERS_API_URL);

  /** Code and QR the buyer shows at the shop, only for a paid store pickup order. */
  readonly pickup = computed(() => {
    const order = this.order();
    if (this.status() !== 'APPROVED' || !order?.pickup_code) {
      return null;
    }
    return {
      code: formatPickupCode(order.pickup_code),
      qrUrl: `${this.ordersUrl}/${encodeURIComponent(order.reference)}/pickup-qr.png`,
    };
  });

  readonly orderExists = computed(
    () => this.status() === 'APPROVED' || this.status() === 'PENDING',
  );
}
