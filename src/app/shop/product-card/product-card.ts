import { CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, computed, input, output, signal } from '@angular/core';
import { ProductVariant, ShopProduct } from '../catalog';

const ADDED_FEEDBACK_DURATION = 1500;

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCardComponent implements OnDestroy {
  readonly product = input.required<ShopProduct>();
  /** The visitor added the selected presentation; the shop updates the cart. */
  readonly added = output<ProductVariant>();
  /** The visitor wants to see this photo enlarged. */
  readonly zoom = output<string>();

  /** Turned over to show the description and tasting notes. */
  readonly flipped = signal(false);
  /** The add button briefly shows "Añadido". */
  readonly justAdded = signal(false);

  // `undefined` means "nothing chosen yet": the default variant applies.
  private readonly chosenImage = signal<string | undefined>(undefined);
  private readonly chosenPresentation = signal<string | null | undefined>(undefined);
  private readonly chosenWeight = signal<number | null | undefined>(undefined);
  /** Images that failed to load fall back to the placeholder. */
  private readonly brokenImages = signal<ReadonlySet<string>>(new Set());
  private addedTimer?: ReturnType<typeof setTimeout>;

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
  readonly hasStory = computed(() => {
    const product = this.product();
    return product.isCoffee && (!!product.description || !!product.notes?.length);
  });

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

  flip(): void {
    this.flipped.update((flipped) => !flipped);
  }

  add(): void {
    const variant = this.variant();
    if (!variant.available) {
      return;
    }
    this.added.emit(variant);
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
