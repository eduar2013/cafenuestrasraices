import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ORDERS_API_URL, Order, formatPickupCode } from '../shop/checkout';

/** Where the shop device keeps the API key, so staff types it once. */
export const STAFF_KEY_STORAGE = 'cnr-staff-api-key';

export interface PickupOrderItem {
  readonly sku: string;
  readonly product_name: string;
  readonly variant_name: string;
  readonly unit_price: number;
  readonly quantity: number;
}

/** What the API returns to the shop staff for a pickup code. */
export interface PickupOrder extends Order {
  readonly customer_name: string;
  readonly customer_phone: string;
  readonly created_at: string;
  readonly items: readonly PickupOrderItem[];
}

type DeskState = 'needs-key' | 'idle' | 'loading' | 'found' | 'not-found' | 'error';

/** "k7p-4qx " -> "K7P4QX", as the API stores it. */
export function normalizePickupCode(code: string): string {
  return code.replace(/[\s-]/g, '').toUpperCase();
}

/**
 * Shop counter page. The pickup QR opens /retiro/<code>: staff checks the buyer's name and
 * marks the order as handed over. Needs the API key; without it nothing is shown.
 */
@Component({
  selector: 'app-pickup-desk',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './pickup-desk.html',
  styleUrl: './pickup-desk.css',
})
export class PickupDeskComponent implements OnInit {
  readonly state = signal<DeskState>('idle');
  readonly order = signal<PickupOrder | null>(null);
  readonly code = signal('');
  readonly message = signal('');
  readonly delivering = signal(false);
  readonly format = formatPickupCode;

  private readonly http = inject(HttpClient);
  private readonly ordersUrl = inject(ORDERS_API_URL);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private apiKey = readKey();

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.code.set(normalizePickupCode(params.get('code') ?? ''));
      this.order.set(null);
      this.message.set('');
      if (!this.apiKey) {
        this.state.set('needs-key');
      } else if (this.code()) {
        void this.lookup();
      } else {
        this.state.set('idle');
      }
    });
  }

  saveKey(key: string): void {
    this.apiKey = key.trim();
    if (!this.apiKey) {
      return;
    }
    try {
      localStorage.setItem(STAFF_KEY_STORAGE, this.apiKey);
    } catch {
      // Private window or blocked storage: the key lasts until the page is closed.
    }
    this.message.set('');
    if (this.code()) {
      void this.lookup();
    } else {
      this.state.set('idle');
    }
  }

  forgetKey(): void {
    this.apiKey = '';
    try {
      localStorage.removeItem(STAFF_KEY_STORAGE);
    } catch {
      // Nothing saved.
    }
    this.order.set(null);
    this.state.set('needs-key');
  }

  /** Code typed or dictated by the buyer (when the QR can't be scanned). */
  search(typed: string): void {
    const code = normalizePickupCode(typed);
    if (code) {
      void this.router.navigate(['/retiro', code]);
    }
  }

  async deliver(): Promise<void> {
    const order = this.order();
    if (!order || this.delivering()) {
      return;
    }
    this.delivering.set(true);
    try {
      const updated = await firstValueFrom(
        this.http.post<PickupOrder>(`${this.pickupUrl()}/deliver`, null, {
          headers: this.headers(),
        }),
      );
      this.order.set(updated);
      this.message.set('');
    } catch (error) {
      this.handleError(error);
      if (error instanceof HttpErrorResponse && error.status === 409) {
        // Show the current state (e.g. delivered from another device meanwhile).
        await this.lookup();
        this.message.set(errorDetail(error));
      }
    } finally {
      this.delivering.set(false);
    }
  }

  private async lookup(): Promise<void> {
    this.state.set('loading');
    try {
      const order = await firstValueFrom(
        this.http.get<PickupOrder>(this.pickupUrl(), { headers: this.headers() }),
      );
      this.order.set(order);
      this.state.set('found');
    } catch (error) {
      this.order.set(null);
      this.handleError(error);
    }
  }

  private handleError(error: unknown): void {
    const status = error instanceof HttpErrorResponse ? error.status : 0;
    if (status === 401) {
      this.forgetKey();
      this.message.set('La clave no es válida. Escríbela de nuevo.');
    } else if (status === 404) {
      this.state.set('not-found');
    } else if (status !== 409) {
      this.state.set('error');
    }
  }

  private pickupUrl(): string {
    return `${this.ordersUrl}/pickup/${encodeURIComponent(this.code())}`;
  }

  private headers(): HttpHeaders {
    return new HttpHeaders({ 'X-API-Key': this.apiKey });
  }
}

function readKey(): string {
  try {
    return localStorage.getItem(STAFF_KEY_STORAGE) ?? '';
  } catch {
    return '';
  }
}

function errorDetail(error: HttpErrorResponse): string {
  const detail: unknown = error.error?.detail;
  if (typeof detail === 'string' && detail.startsWith('Already picked up')) {
    return 'Este pedido ya fue entregado.';
  }
  if (detail === 'The order is not paid') {
    return 'Este pedido no está pagado: no lo entregues.';
  }
  return 'No se pudo marcar como entregado.';
}
