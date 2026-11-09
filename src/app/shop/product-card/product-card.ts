import { CurrencyPipe } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ProductVariant, ShopProduct } from '../catalog';

const ADDED_FEEDBACK_DURATION = 1500;
/** Most units of one presentation that can be added at once. */
export const MAX_QUANTITY = 20;

export interface ProductAddition {
  readonly variant: ProductVariant;
  readonly quantity: number;
}

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCardComponent implements OnDestroy {
  readonly product = input.required<ShopProduct>();
  /** The visitor added units of the selected presentation; the shop updates the cart. */
  readonly added = output<ProductAddition>();
  /** The visitor wants to see this photo enlarged. */
  readonly zoom = output<string>();

  /** The add button briefly shows "Añadido". */
  readonly justAdded = signal(false);
  /** Units to add with the button. */
  readonly quantity = signal(1);
  readonly maxQuantity = MAX_QUANTITY;

  // `undefined` means "nothing chosen yet": the default variant applies.
  private readonly chosenImage = signal<string | undefined>(undefined);
  private readonly chosenPresentation = signal<string | null | undefined>(undefined);
  private readonly chosenWeight = signal<number | null | undefined>(undefined);
  /** Images that failed to load fall back to the placeholder. */
  private readonly brokenImages = signal<ReadonlySet<string>>(new Set());
  private addedTimer?: ReturnType<typeof setTimeout>;
  private readonly sheetDialog = viewChild<ElementRef<HTMLDialogElement>>('sheetDialog');

  readonly currentImage = computed(
    () => this.chosenImage() ?? this.product().images[0] ?? this.product().image,
  );
  readonly presentation = computed(() => {
    const chosen = this.chosenPresentation();
    return chosen !== undefined ? chosen : this.product().variants[0].presentation;
  });
  readonly weight = computed(() => {
    const chosen = this.chosenWeight();
    return chosen !== undefined ? chosen : this.product().variants[0].weight;
  });
  readonly variant = computed(() => {
    const { variants } = this.product();
    return (
      variants.find(
        (variant) =>
          variant.presentation === this.presentation() && variant.weight === this.weight(),
      ) ?? variants[0]
    );
  });
  readonly presentationOptions = computed(() =>
    Array.from(
      new Set(
        this.product().variants.flatMap((variant) =>
          variant.presentation ? [variant.presentation] : [],
        ),
      ),
    ),
  );
  /** Weights available for the selected presentation. */
  readonly weightOptions = computed(() =>
    Array.from(
      new Set(
        this.product()
          .variants.filter((variant) => variant.presentation === this.presentation())
          .flatMap((variant) => (variant.weight === null ? [] : [variant.weight])),
      ),
    ).sort((left, right) => left - right),
  );
  /** Up to three tasting notes are read on the card itself. */
  readonly leadNotes = computed(() => this.product().notes?.slice(0, 3) ?? []);
  /** Origin line: place and farm. */
  readonly originLine = computed(() =>
    [this.product().origin, this.product().farm].filter(Boolean).join(' · '),
  );
  readonly hasSheet = computed(
    () =>
      this.product().properties.length > 0 ||
      !!this.product().description ||
      (this.product().notes?.length ?? 0) > 3,
  );

  isBroken(image: string): boolean {
    return this.brokenImages().has(image);
  }

  imageFailed(image: string): void {
    this.brokenImages.update((images) => new Set(images).add(image));
  }

  selectImage(image: string): void {
    this.chosenImage.set(image);
  }

  // Changing one option keeps the other when that combination exists.
  selectPresentation(presentation: string): void {
    const { variants } = this.product();
    this.choose(
      variants.find(
        (option) => option.presentation === presentation && option.weight === this.weight(),
      ) ?? variants.find((option) => option.presentation === presentation)!,
    );
  }

  selectWeight(weight: number): void {
    const { variants } = this.product();
    this.choose(
      variants.find(
        (option) => option.presentation === this.presentation() && option.weight === weight,
      ) ?? variants.find((option) => option.weight === weight)!,
    );
  }

  changeQuantity(delta: number): void {
    this.quantity.update((quantity) => clampQuantity(quantity + delta));
  }

  /** Typed values are kept between 1 and the maximum, and written back to the field. */
  setQuantity(input: HTMLInputElement): void {
    const quantity = clampQuantity(input.valueAsNumber);
    this.quantity.set(quantity);
    input.value = `${quantity}`;
  }

  /** The full coffee sheet opens as a dialog, so neighbouring cards never move. */
  openSheet(): void {
    this.sheetDialog()?.nativeElement.showModal();
  }

  add(): void {
    const variant = this.variant();
    if (!variant.available) {
      return;
    }
    this.added.emit({ variant, quantity: this.quantity() });
    this.quantity.set(1);
    this.justAdded.set(true);
    clearTimeout(this.addedTimer);
    this.addedTimer = setTimeout(() => this.justAdded.set(false), ADDED_FEEDBACK_DURATION);
  }

  ngOnDestroy(): void {
    clearTimeout(this.addedTimer);
  }

  private choose(variant: ProductVariant): void {
    this.chosenPresentation.set(variant.presentation);
    this.chosenWeight.set(variant.weight);
  }
}

function clampQuantity(quantity: number): number {
  return Number.isFinite(quantity) ? Math.min(MAX_QUANTITY, Math.max(1, Math.round(quantity))) : 1;
}
