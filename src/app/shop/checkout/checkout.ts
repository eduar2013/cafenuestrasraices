import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, computed, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PRIVACY_POLICY_VERSION, TERMS_VERSION } from '../../legal/legal';
import { CartService } from '../cart';
import { PaymentBadgeComponent } from '../payment-badge/payment-badge';
import { PaymentResultComponent } from '../payment-result/payment-result';
import {
  CheckoutConsent,
  CheckoutCustomer,
  CheckoutService,
  CheckoutShipping,
  Order,
  OrderStatus,
  PICKUP_OPTION_ID,
  PickupInfo,
  ShippingQuote,
  WompiTransaction,
} from '../checkout';

const ADDRESS_FIELDS = ['address', 'address_detail', 'city', 'department'] as const;

export const DEPARTMENTS = [
  'Amazonas',
  'Antioquia',
  'Arauca',
  'Atlántico',
  'Bogotá D.C.',
  'Bolívar',
  'Boyacá',
  'Caldas',
  'Caquetá',
  'Casanare',
  'Cauca',
  'Cesar',
  'Chocó',
  'Córdoba',
  'Cundinamarca',
  'Guainía',
  'Guaviare',
  'Huila',
  'La Guajira',
  'Magdalena',
  'Meta',
  'Nariño',
  'Norte de Santander',
  'Putumayo',
  'Quindío',
  'Risaralda',
  'San Andrés y Providencia',
  'Santander',
  'Sucre',
  'Tolima',
  'Valle del Cauca',
  'Vaupés',
  'Vichada',
];

type Step = 'form' | 'creating' | 'paying' | 'redirecting' | 'confirming' | 'result';

@Component({
  selector: 'app-checkout',
  imports: [
    CurrencyPipe,
    PaymentBadgeComponent,
    PaymentResultComponent,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class CheckoutComponent implements OnDestroy {
  /** Back to the cart without paying. */
  readonly back = output<void>();
  /** The buyer closed the result and keeps shopping. */
  readonly finished = output<void>();
  /** Wompi's window is about to open: the cart gets out of its way. */
  readonly paymentOpened = output<void>();
  /** The buyer finished in Wompi's window: show the cart again with the result. */
  readonly paymentReturned = output<void>();

  readonly cart = inject(CartService);
  readonly departments = DEPARTMENTS;
  readonly step = signal<Step>('form');
  readonly error = signal('');
  readonly order = signal<Order | undefined>(undefined);
  /** Final outcome shown to the buyer. */
  readonly outcome = signal<OrderStatus>('PENDING');

  /** Shipping options for the current address; undefined until it is complete. */
  readonly quote = signal<ShippingQuote | undefined>(undefined);
  readonly quoting = signal(false);
  readonly quoteError = signal('');
  readonly shippingOptionId = signal<string | null>(null);
  /** Pickup at the shop, when offered by the API. */
  readonly pickup = signal<PickupInfo | null>(null);
  readonly deliveryMethod = signal<'delivery' | 'pickup'>('delivery');
  readonly shippingOption = computed(() =>
    this.deliveryMethod() === 'pickup'
      ? this.pickup()?.option
      : this.quote()?.options.find((option) => option.id === this.shippingOptionId()),
  );
  readonly total = computed(() => this.cart.total() + (this.shippingOption()?.price ?? 0));
  private quoteRequest = 0;

  readonly form = inject(FormBuilder).nonNullable.group({
    full_name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(160)]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{7,10}$/)]],
    address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
    address_detail: ['', Validators.maxLength(120)],
    city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    department: ['', Validators.required],
    /** Acceptance of the terms and conditions. */
    accept_terms: [false, Validators.requiredTrue],
    /** Express authorization to process personal data (Ley 1581 de 2012). */
    accept_privacy: [false, Validators.requiredTrue],
  });

  private readonly checkout = inject(CheckoutService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private destroyed = false;

  constructor() {
    void this.checkout.getPickup().then((pickup) => this.pickup.set(pickup));
  }

  /** Pickup orders need no address: its fields are left out of the form. */
  setDeliveryMethod(method: 'delivery' | 'pickup'): void {
    this.deliveryMethod.set(method);
    for (const field of ADDRESS_FIELDS) {
      const control = this.form.controls[field];
      if (method === 'pickup') {
        control.disable();
      } else {
        control.enable();
      }
    }
    this.error.set('');
  }

  showError(field: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[field];
    return control.invalid && control.touched;
  }

  /** Quotes shipping once address, city and department are filled in. */
  async refreshQuote(): Promise<void> {
    const { address, city, department } = this.form.controls;
    if (
      this.deliveryMethod() === 'pickup' ||
      address.invalid ||
      city.invalid ||
      department.invalid
    ) {
      return;
    }
    const request = ++this.quoteRequest;
    this.quoting.set(true);
    this.quoteError.set('');
    try {
      const quote = await this.checkout.quoteShipping(
        this.items(),
        this.shippingData(),
        // Name and phone go to the carrier's quote only once the buyer has authorized it.
        this.form.controls.accept_privacy.value &&
          this.form.controls.full_name.valid &&
          this.form.controls.phone.valid
          ? this.customerData()
          : null,
      );
      if (request !== this.quoteRequest) {
        return; // the address changed while waiting: a newer quote is on its way
      }
      this.quote.set(quote);
      const current = quote.options.some((option) => option.id === this.shippingOptionId());
      if (!current) {
        this.shippingOptionId.set(quote.options[0]?.id ?? null);
      }
    } catch (error) {
      if (request !== this.quoteRequest) {
        return;
      }
      this.quote.set(undefined);
      this.shippingOptionId.set(null);
      this.quoteError.set(
        error instanceof HttpErrorResponse && error.status === 422 && error.error?.detail
          ? String(error.error.detail)
          : 'No pudimos calcular el envío. Revisa tu conexión e intenta de nuevo.',
      );
    } finally {
      if (request === this.quoteRequest) {
        this.quoting.set(false);
      }
    }
  }

  async pay(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.host.nativeElement.querySelector<HTMLElement>('.ng-invalid:not(form)')?.focus();
      return;
    }
    if (!this.shippingOption()) {
      await this.refreshQuote();
      if (!this.shippingOption()) {
        this.error.set(this.quoteError() || 'Elige una opción de envío.');
        return;
      }
    }
    const customer = this.customerData();
    const shipping = this.deliveryMethod() === 'pickup' ? null : this.shippingData();

    this.error.set('');
    this.step.set('creating');
    let created;
    try {
      created = await this.checkout.createOrder(
        this.items(),
        customer,
        shipping,
        this.deliveryMethod() === 'pickup' ? PICKUP_OPTION_ID : this.shippingOptionId(),
        this.consentData(),
      );
    } catch (error) {
      this.step.set('form');
      this.error.set(orderErrorMessage(error));
      if (isShippingConflict(error)) {
        void this.refreshQuote();
      }
      return;
    }
    this.order.set(created.order);

    if (this.checkout.prefersRedirect()) {
      // Phones pay on Wompi's own page and come back to the payment result route.
      this.step.set('redirecting');
      this.checkout.redirectToWompi(created.wompi, customer, shipping);
      return;
    }

    this.step.set('paying');
    this.paymentOpened.emit();
    let transaction: WompiTransaction | undefined;
    try {
      transaction = await this.checkout.openWidget(created.wompi, customer, shipping);
    } catch {
      this.step.set('form');
      this.paymentReturned.emit();
      this.error.set('No pudimos abrir la ventana de pago. Revisa tu conexión e intenta de nuevo.');
      return;
    }
    if (!transaction || this.destroyed) {
      return;
    }
    this.paymentReturned.emit();
    await this.confirm(created.order.reference, transaction);
  }

  /** Back to the form after a failed payment, keeping what the buyer typed. */
  retry(): void {
    this.order.set(undefined);
    this.error.set('');
    this.step.set('form');
  }

  ngOnDestroy(): void {
    this.destroyed = true;
  }

  private items(): { sku: string; quantity: number }[] {
    return this.cart.items().map((item) => ({ sku: item.variant.id, quantity: item.quantity }));
  }

  private customerData(): CheckoutCustomer {
    const value = this.form.getRawValue();
    return { full_name: value.full_name.trim(), email: value.email.trim(), phone: value.phone };
  }

  private consentData(): CheckoutConsent {
    const value = this.form.getRawValue();
    return {
      privacy_accepted: value.accept_privacy,
      privacy_policy_version: PRIVACY_POLICY_VERSION,
      terms_accepted: value.accept_terms,
      terms_version: TERMS_VERSION,
    };
  }

  private shippingData(): CheckoutShipping {
    const value = this.form.getRawValue();
    return {
      address: value.address.trim(),
      address_detail: value.address_detail.trim() || null,
      city: value.city.trim(),
      department: value.department,
    };
  }

  private async confirm(reference: string, transaction: WompiTransaction): Promise<void> {
    this.step.set('confirming');
    try {
      const result = await this.checkout.confirmPayment(
        reference,
        transaction,
        () => !this.destroyed,
      );
      if (!result) {
        return;
      }
      this.order.set(result.order);
      this.outcome.set(result.status);
    } catch {
      // The API could not be reached: the payment may still go through.
      this.outcome.set('PENDING');
    }
    this.step.set('result');
  }
}

function isShippingConflict(error: unknown): boolean {
  return (
    error instanceof HttpErrorResponse &&
    error.status === 409 &&
    String(error.error?.detail ?? '').includes('shipping')
  );
}

function orderErrorMessage(error: unknown): string {
  if (isShippingConflict(error)) {
    return 'El precio del envío cambió. Revisa las opciones y elige de nuevo.';
  }
  const status = error instanceof HttpErrorResponse ? error.status : 0;
  switch (status) {
    case 409:
      return 'Algunos productos ya no tienen suficiente inventario. Revisa tu carrito.';
    case 422:
      return 'Revisa tus datos: hay algún campo que no pudimos validar.';
    case 503:
      return 'Los pagos no están disponibles en este momento. Intenta más tarde.';
    default:
      return 'No pudimos crear tu pedido. Revisa tu conexión e intenta de nuevo.';
  }
}
