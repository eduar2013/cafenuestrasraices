import { CurrencyPipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { Order, OrderStatus } from '../checkout';

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

  readonly orderExists = computed(
    () => this.status() === 'APPROVED' || this.status() === 'PENDING',
  );
}
