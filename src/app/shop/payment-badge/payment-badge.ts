import { Component, input, signal } from '@angular/core';

/**
 * Official Wompi logo. Download it from Wompi (brand kit / commerce dashboard) and save it here;
 * until the file exists the badge shows the name as text.
 */
export const WOMPI_LOGO = 'images/pagos/wompi-logo.svg';

/** "Secure payment by Wompi" seal shown wherever the buyer is about to pay. */
@Component({
  selector: 'app-payment-badge',
  templateUrl: './payment-badge.html',
  styleUrl: './payment-badge.css',
  host: { '[class.is-compact]': 'compact()' },
})
export class PaymentBadgeComponent {
  /** Single line without the list of payment methods. */
  readonly compact = input(false);
  readonly logo = WOMPI_LOGO;
  readonly logoMissing = signal(false);
}
