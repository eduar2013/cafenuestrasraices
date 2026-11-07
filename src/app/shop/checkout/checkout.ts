import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../cart';
import { PaymentBadgeComponent } from '../payment-badge/payment-badge';
import { PaymentResultComponent } from '../payment-result/payment-result';
import {
  CheckoutCustomer,
  CheckoutService,
  CheckoutShipping,
  Order,
  OrderStatus,
  WompiTransaction,
} from '../checkout';

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
  imports: [CurrencyPipe, PaymentBadgeComponent, PaymentResultComponent, ReactiveFormsModule],
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

  readonly form = inject(FormBuilder).nonNullable.group({
    full_name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(160)]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{7,10}$/)]],
    address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
    address_detail: ['', Validators.maxLength(120)],
    city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    department: ['', Validators.required],
  });

  private readonly checkout = inject(CheckoutService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private destroyed = false;

  showError(field: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[field];
    return control.invalid && control.touched;
  }

  async pay(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.host.nativeElement.querySelector<HTMLElement>('.ng-invalid:not(form)')?.focus();
      return;
    }
    const value = this.form.getRawValue();
    const customer: CheckoutCustomer = {
      full_name: value.full_name.trim(),
      email: value.email.trim(),
      phone: value.phone,
    };
    const shipping: CheckoutShipping = {
      address: value.address.trim(),
      address_detail: value.address_detail.trim() || null,
      city: value.city.trim(),
      department: value.department,
    };
    const items = this.cart
      .items()
      .map((item) => ({ sku: item.variant.id, quantity: item.quantity }));

    this.error.set('');
    this.step.set('creating');
    let created;
    try {
      created = await this.checkout.createOrder(items, customer, shipping);
    } catch (error) {
      this.step.set('form');
      this.error.set(orderErrorMessage(error));
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

function orderErrorMessage(error: unknown): string {
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
