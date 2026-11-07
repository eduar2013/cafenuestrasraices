import { DecimalPipe } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartDrawerComponent } from './cart-drawer/cart-drawer';
import { CartService } from './cart';
import { CatalogService, ProductVariant, ShopProduct } from './catalog';
import { ProductCardComponent } from './product-card/product-card';

const TOAST_DURATION = 4000;
const MAX_ZOOM = 4;
const ZOOM_STEP = 1.25;

/** Scale and offset (px) of the enlarged photo inside its frame. */
interface ImageZoom {
  readonly scale: number;
  readonly x: number;
  readonly y: number;
}

const NO_ZOOM: ImageZoom = { scale: 1, x: 0, y: 0 };

@Component({
  selector: 'app-shop',
  imports: [CartDrawerComponent, DecimalPipe, ProductCardComponent, RouterLink],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class ShopComponent implements OnDestroy {
  readonly cart = inject(CartService);
  readonly catalog = inject(CatalogService);
  readonly category = signal<string>('todos');
  readonly products = computed(() =>
    this.category() === 'todos'
      ? this.catalog.products()
      : this.catalog.products().filter((product) => product.category.id === this.category()),
  );
  readonly message = signal('');
  readonly cartOpen = signal(false);
  readonly zoomedProduct = signal<ShopProduct | undefined>(undefined);
  readonly zoomedImage = signal<string | undefined>(undefined);
  readonly zoom = signal<ImageZoom>(NO_ZOOM);
  readonly maxZoom = MAX_ZOOM;
  readonly zoomStep = ZOOM_STEP;
  readonly imageTransform = computed(
    () => `translate(${this.zoom().x}px, ${this.zoom().y}px) scale(${this.zoom().scale})`,
  );
  readonly panning = signal(false);
  private panStart?: {
    readonly pointerX: number;
    readonly pointerY: number;
    readonly zoom: ImageZoom;
  };

  private readonly imageDialog = viewChild.required<ElementRef<HTMLDialogElement>>('imageDialog');

  private toastTimer?: ReturnType<typeof setTimeout>;

  openImage(product: ShopProduct, image: string): void {
    this.zoomedProduct.set(product);
    this.zoomedImage.set(image);
    this.zoom.set(NO_ZOOM);
    this.imageDialog().nativeElement.showModal();
  }

  onImageWheel(event: WheelEvent, frame: HTMLElement): void {
    event.preventDefault();
    const rect = frame.getBoundingClientRect();
    this.zoomAt(
      frame,
      event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP,
      event.clientX - rect.left,
      event.clientY - rect.top,
    );
  }

  /** Zoom buttons keep the centre of the visible area in place. */
  zoomBy(frame: HTMLElement, factor: number): void {
    this.zoomAt(frame, factor, frame.clientWidth / 2, frame.clientHeight / 2);
  }

  toggleZoom(event: MouseEvent, frame: HTMLElement): void {
    if (this.zoom().scale > 1) {
      this.zoom.set(NO_ZOOM);
      return;
    }
    const rect = frame.getBoundingClientRect();
    this.zoomAt(frame, ZOOM_STEP ** 3, event.clientX - rect.left, event.clientY - rect.top);
  }

  startPan(event: PointerEvent): void {
    if (this.zoom().scale === 1) {
      return;
    }
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.panStart = { pointerX: event.clientX, pointerY: event.clientY, zoom: this.zoom() };
    this.panning.set(true);
  }

  pan(event: PointerEvent, frame: HTMLElement): void {
    if (!this.panStart) {
      return;
    }
    const { pointerX, pointerY, zoom } = this.panStart;
    this.zoom.set(
      clampZoom(
        { ...zoom, x: zoom.x + event.clientX - pointerX, y: zoom.y + event.clientY - pointerY },
        frame,
      ),
    );
  }

  endPan(): void {
    this.panStart = undefined;
    this.panning.set(false);
  }

  /** Scales by `factor` keeping the point (x, y) of the frame under the cursor. */
  private zoomAt(frame: HTMLElement, factor: number, x: number, y: number): void {
    this.zoom.update((zoom) => {
      const scale = Math.min(MAX_ZOOM, Math.max(1, zoom.scale * factor));
      const ratio = scale / zoom.scale;
      return clampZoom({ scale, x: x - (x - zoom.x) * ratio, y: y - (y - zoom.y) * ratio }, frame);
    });
  }

  /** Clicks outside the photo land on the dialog element itself (its backdrop). */
  closeImageOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.imageDialog().nativeElement.close();
    }
  }

  onAdded(product: ShopProduct, variant: ProductVariant): void {
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

/** Keeps the zoomed photo covering its frame so no empty space shows at the edges. */
function clampZoom(zoom: ImageZoom, frame: HTMLElement): ImageZoom {
  const minX = frame.clientWidth * (1 - zoom.scale);
  const minY = frame.clientHeight * (1 - zoom.scale);
  return {
    scale: zoom.scale,
    x: Math.min(0, Math.max(minX, zoom.x)),
    y: Math.min(0, Math.max(minY, zoom.y)),
  };
}
