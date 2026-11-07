import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../shop/catalog';
import { CoffeeOrigin, toCoffeeOrigins } from './origins';

@Component({
  selector: 'app-coffee-origins',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './coffee-origins.html',
  styleUrl: './coffee-origins.css',
})
export class CoffeeOriginsComponent {
  readonly catalog = inject(CatalogService);
  readonly origins = computed(() => toCoffeeOrigins(this.catalog.apiProducts()));

  private readonly selectedOriginId = signal<string | undefined>(undefined);
  private readonly selectedCoffeeId = signal<string | undefined>(undefined);

  // Fall back to the first origin and coffee so the detail is filled as soon as data arrives.
  readonly selectedOrigin = computed(
    () =>
      this.origins().find((origin) => origin.id === this.selectedOriginId()) ?? this.origins()[0],
  );
  readonly selectedCoffee = computed(() => {
    const coffees = this.selectedOrigin()?.coffees;
    return coffees?.find((coffee) => coffee.id === this.selectedCoffeeId()) ?? coffees?.[0];
  });

  selectOrigin(origin: CoffeeOrigin): void {
    this.selectedOriginId.set(origin.id);
    this.selectedCoffeeId.set(undefined);
  }

  selectCoffee(id: string): void {
    this.selectedCoffeeId.set(id);
  }

  mapLeft(origin: CoffeeOrigin): number {
    return (((origin.longitude + 80) * 26 + 20) / 400) * 100;
  }

  mapTop(origin: CoffeeOrigin): number {
    return (((13.5 - origin.latitude) * 26 + 20) / 520) * 100;
  }
}
