import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CartService } from './cart';
import { CatalogService } from './catalog';

export const ORDERS_API_URL = new InjectionToken<string>('ORDERS_API_URL', {
  providedIn: 'root',
  factory: () => 'http://127.0.0.1:8000/orders',
});

export const SHIPPING_API_URL = new InjectionToken<string>('SHIPPING_API_URL', {
  providedIn: 'root',
  factory: () => 'http://127.0.0.1:8000/shipping',
});

/** Id of the "pick up at the shop" option in the API. */
export const PICKUP_OPTION_ID = 'tienda:retiro';

const WIDGET_SCRIPT = 'https://checkout.wompi.co/widget.js';
const WEB_CHECKOUT = 'https://checkout.wompi.co/p/';
/** Route Wompi sends the buyer back to after paying on its page. */
export const PAYMENT_RETURN_ROUTE = 'pago/resultado';
/** Order being paid on Wompi's page, kept while the buyer is away from the shop. */
const PENDING_ORDER_KEY = 'cnr-pending-order';
/** While the API has not heard from Wompi yet, ask again this many times. */
const POLL_ATTEMPTS = 10;
const POLL_INTERVAL = 3000;

export type OrderStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';

export interface CheckoutCustomer {
  readonly full_name: string;
  readonly email: string;
  /** Colombian number without the +57 prefix. */
  readonly phone: string;
}

/**
 * The buyer's express authorization (Ley 1581 de 2012) and acceptance of the terms, one
 * checkbox each, with the version of each text they saw. The API records when and from where
 * they were given, and rejects the order unless both are true.
 */
export interface CheckoutConsent {
  readonly privacy_accepted: boolean;
  readonly privacy_policy_version: string;
  readonly terms_accepted: boolean;
  readonly terms_version: string;
}

export interface CheckoutShipping {
  readonly address: string;
  readonly address_detail: string | null;
  readonly city: string;
  readonly department: string;
}

/** A way to ship the order, quoted by the API (Envia.com or the shop's flat rate). */
export interface ShippingOption {
  /** What the order sends back, e.g. "coordinadora:ground". */
  readonly id: string;
  readonly carrier: string;
  readonly service: string;
  readonly description: string;
  readonly delivery_estimate: string | null;
  readonly price: number;
}

/** Free pickup at the shop, with where and when. */
export interface PickupInfo {
  readonly option: ShippingOption;
  readonly address: string;
  readonly hours: string;
}

export interface ShippingQuote {
  readonly options: readonly ShippingOption[];
  readonly free_shipping: boolean;
}

export interface Order {
  readonly reference: string;
  readonly status: OrderStatus;
  readonly subtotal: number;
  readonly shipping_cost: number;
  readonly total: number;
  readonly payment_method: string | null;
  /** Store pickup only, once paid: the code the buyer shows at the shop (e.g. "K7P4QX"). */
  readonly pickup_code?: string | null;
  /** When the shop handed the pickup order over (ISO date), or null. */
  readonly picked_up_at?: string | null;
}

/** "K7P4QX" -> "K7P-4QX", easier to read aloud. */
export function formatPickupCode(code: string): string {
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

/** Values the API signs for the Wompi widget. */
export interface WompiCheckout {
  readonly public_key: string;
  readonly currency: string;
  readonly amount_in_cents: number;
  readonly reference: string;
  readonly signature: string;
}

export interface CheckoutResponse {
  readonly order: Order;
  readonly wompi: WompiCheckout;
}

/** What the widget reports when the buyer finishes; it is only a hint, the API confirms. */
export interface WompiTransaction {
  readonly id: string;
  readonly status?: OrderStatus;
}

export interface PaymentOutcome {
  readonly order: Order;
  /** What to tell the buyer. */
  readonly status: OrderStatus;
}

/** Wompi Web Checkout URL: the same fields as the widget, as query parameters. */
export function webCheckoutUrl(
  checkout: WompiCheckout,
  customer: CheckoutCustomer,
  shipping: CheckoutShipping | null,
  redirectUrl: string,
): string {
  const params = new URLSearchParams({
    'public-key': checkout.public_key,
    currency: checkout.currency,
    'amount-in-cents': `${checkout.amount_in_cents}`,
    reference: checkout.reference,
    'signature:integrity': checkout.signature,
    'redirect-url': redirectUrl,
    'customer-data:email': customer.email,
    'customer-data:full-name': customer.full_name,
    'customer-data:phone-number': customer.phone,
    'customer-data:phone-number-prefix': '+57',
  });
  if (shipping) {
    params.set('shipping-address:address-line-1', shipping.address);
    params.set('shipping-address:country', 'CO');
    params.set('shipping-address:city', shipping.city);
    params.set('shipping-address:region', shipping.department);
    params.set('shipping-address:phone-number', customer.phone);
    if (shipping.address_detail) {
      params.set('shipping-address:address-line-2', shipping.address_detail);
    }
  }
  return `${WEB_CHECKOUT}?${params}`;
}

// Global defined by https://checkout.wompi.co/widget.js
declare const WidgetCheckout: new (options: object) => {
  open(callback: (result: { transaction?: WompiTransaction }) => void): void;
};

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly http = inject(HttpClient);
  private readonly url = inject(ORDERS_API_URL);
  private readonly shippingUrl = inject(SHIPPING_API_URL);
  private readonly document = inject(DOCUMENT);
  private readonly cart = inject(CartService);
  private readonly catalog = inject(CatalogService);
  private widgetScript?: Promise<void>;

  /** Small or touch screens pay on Wompi's own page: its floating window is cramped there. */
  prefersRedirect(): boolean {
    const view = this.document.defaultView;
    return !!view?.matchMedia?.('(max-width: 760px), (pointer: coarse)').matches;
  }

  /** Sends the buyer to Wompi's payment page; they come back to {@link PAYMENT_RETURN_ROUTE}. */
  redirectToWompi(
    checkout: WompiCheckout,
    customer: CheckoutCustomer,
    shipping: CheckoutShipping | null,
  ): void {
    try {
      sessionStorage.setItem(PENDING_ORDER_KEY, checkout.reference);
    } catch {
      // Without storage the return page asks the buyer to check their email.
    }
    // Hash routing: the shop's routes live after "#/".
    const returnUrl = new URL(`#/${PAYMENT_RETURN_ROUTE}`, this.document.baseURI).href;
    this.document.defaultView!.location.assign(
      webCheckoutUrl(checkout, customer, shipping, returnUrl),
    );
  }

  /** Reference of the order paid on Wompi's page, if the buyer is coming back from it. */
  pendingReference(): string | null {
    try {
      return sessionStorage.getItem(PENDING_ORDER_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Asks the API to confirm a transaction, waiting a while for Wompi if needed. When the order
   * exists (approved or still processing) the cart is emptied and the stock refreshed.
   * Returns undefined if `isActive` turns false while waiting.
   */
  async confirmPayment(
    reference: string,
    transaction: WompiTransaction,
    isActive: () => boolean = () => true,
  ): Promise<PaymentOutcome | undefined> {
    let order = await this.syncOrder(reference, transaction.id).catch(() =>
      this.getOrder(reference),
    );
    // Without the private key the API waits for Wompi's event: ask again for a while.
    for (let attempt = 0; order.status === 'PENDING' && attempt < POLL_ATTEMPTS; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      if (!isActive()) {
        return undefined;
      }
      order = await this.getOrder(reference).catch(() => order);
    }
    // The widget's answer is only trusted for failures; an approval must come from the API.
    const failed: (OrderStatus | undefined)[] = ['DECLINED', 'VOIDED', 'ERROR'];
    const status =
      order.status === 'PENDING' && failed.includes(transaction.status)
        ? transaction.status!
        : order.status;
    if (status === 'APPROVED' || status === 'PENDING') {
      // The order exists: clear the cart so it is not bought twice, and refresh the stock.
      this.cart.clear();
      this.catalog.reload();
    }
    try {
      sessionStorage.removeItem(PENDING_ORDER_KEY);
    } catch {
      // Nothing to clean up.
    }
    return { order, status };
  }

  /** Creates a pending order; the API computes prices, shipping and the payment signature. */
  createOrder(
    items: readonly { sku: string; quantity: number }[],
    customer: CheckoutCustomer,
    /** Null when the buyer picks the order up at the shop. */
    shipping: CheckoutShipping | null,
    shippingOption: string | null,
    consent: CheckoutConsent,
  ): Promise<CheckoutResponse> {
    return firstValueFrom(
      this.http.post<CheckoutResponse>(this.url, {
        items,
        customer,
        shipping,
        shipping_option: shippingOption,
        consent,
      }),
    );
  }

  /** Shipping options for the cart and address, from the cheapest. */
  quoteShipping(
    items: readonly { sku: string; quantity: number }[],
    shipping: CheckoutShipping,
    customer: CheckoutCustomer | null,
  ): Promise<ShippingQuote> {
    return firstValueFrom(
      this.http.post<ShippingQuote>(`${this.shippingUrl}/quote`, { items, shipping, customer }),
    );
  }

  /** Pickup at the shop, or null if the shop does not offer it. */
  getPickup(): Promise<PickupInfo | null> {
    return firstValueFrom(this.http.get<PickupInfo>(`${this.shippingUrl}/pickup`)).catch(
      () => null,
    );
  }

  getOrder(reference: string): Promise<Order> {
    return firstValueFrom(this.http.get<Order>(`${this.url}/${reference}`));
  }

  /** Asks the API to confirm the transaction with Wompi. */
  syncOrder(reference: string, transactionId: string): Promise<Order> {
    return firstValueFrom(
      this.http.post<Order>(`${this.url}/${reference}/sync`, { transaction_id: transactionId }),
    );
  }

  /**
   * Opens the Wompi payment window. Resolves with the transaction when the buyer finishes;
   * it never resolves if they close the window without paying.
   */
  async openWidget(
    checkout: WompiCheckout,
    customer: CheckoutCustomer,
    shipping: CheckoutShipping | null,
  ): Promise<WompiTransaction | undefined> {
    await this.loadWidget();
    const widget = new WidgetCheckout({
      currency: checkout.currency,
      amountInCents: checkout.amount_in_cents,
      reference: checkout.reference,
      publicKey: checkout.public_key,
      signature: { integrity: checkout.signature },
      customerData: {
        email: customer.email,
        fullName: customer.full_name,
        phoneNumber: customer.phone,
        phoneNumberPrefix: '+57',
      },
      ...(shipping && {
        shippingAddress: {
          addressLine1: shipping.address,
          addressLine2: shipping.address_detail ?? undefined,
          city: shipping.city,
          region: shipping.department,
          phoneNumber: customer.phone,
          country: 'CO',
        },
      }),
    });
    return new Promise((resolve) => widget.open((result) => resolve(result.transaction)));
  }

  private loadWidget(): Promise<void> {
    this.widgetScript ??= new Promise<void>((resolve, reject) => {
      const script = this.document.createElement('script');
      script.src = WIDGET_SCRIPT;
      script.onload = () => resolve();
      script.onerror = () => {
        this.widgetScript = undefined;
        reject(new Error('No se pudo cargar Wompi'));
      };
      this.document.head.appendChild(script);
    });
    return this.widgetScript;
  }
}
