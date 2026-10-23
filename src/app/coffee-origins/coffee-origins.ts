import { Component, signal } from '@angular/core';

interface Coffee {
  readonly id: string;
  readonly name: string;
  readonly image?: string;
  readonly imageAlt?: string;
  readonly variety: string;
  readonly process: string;
  readonly roast: string;
  readonly notes: readonly string[];
  readonly description: string;
  readonly isExample?: boolean;
  readonly altitude?: number;
  readonly presentations?: readonly number[];
}

interface CoffeeOrigin {
  readonly id: string;
  readonly name: string;
  readonly location: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly coffees: readonly [Coffee, ...Coffee[]];
}

@Component({
  selector: 'app-coffee-origins',
  standalone: true,
  templateUrl: './coffee-origins.html',
  styleUrl: './coffee-origins.css',
})
export class CoffeeOriginsComponent {
  readonly origins: readonly [CoffeeOrigin, ...CoffeeOrigin[]] = [
    {
      id: 'heliconia',
      name: 'Heliconia, Antioquia',
      location: 'Heliconia, Antioquia',
      latitude: 6.21,
      longitude: -75.73,
      coffees: [{
        id: 'labralma',
        name: 'LabrAlma',
        variety: 'Bourbon Papayo',
        process: 'Lavado',
        roast: 'Por confirmar',
        notes: ['Chocolate', 'Cítricos'],
        description: 'Café cultivado en Heliconia, Antioquia, a 1740 m s. n. m., con notas de chocolate y cítricos.',
        altitude: 1740,
        presentations: [250, 340],
        image: 'images/cafe/labralma.JPG',
        imageAlt: 'Café LabrAlma Bourbon Papayo de Heliconia'
      }],
    },
    {
      id: 'antioquia',
      name: 'Antioquia',
      location: 'Andes, Antioquia',
      latitude: 5.66,
      longitude: -75.88,
      coffees: [
        {
          id: 'antioquia-lavado',
          isExample: true,
          name: 'Raíces de Antioquia',
          variety: 'Castillo',
          process: 'Lavado',
          roast: 'Medio',
          notes: ['Chocolate', 'Panela', 'Naranja'],
          description: 'Un perfil de ejemplo dulce y equilibrado, pensado para disfrutar sin prisa.',
        },
        {
          id: 'antioquia-honey',
          isExample: true,
          name: 'Dulce montaña',
          variety: 'Caturra',
          process: 'Honey',
          roast: 'Medio',
          notes: ['Miel', 'Caramelo', 'Frutos amarillos'],
          description: 'Un segundo café de ejemplo para explorar distintos procesos de un mismo origen.',
        },
      ],
    },
    {
      id: 'huila',
      name: 'Huila',
      location: 'Pitalito, Huila',
      latitude: 1.85,
      longitude: -76.05,
      coffees: [{
        id: 'huila-lavado',
        isExample: true,
        name: 'Esencia del Huila',
        variety: 'Colombia',
        process: 'Lavado',
        roast: 'Medio claro',
        notes: ['Cítricos', 'Caramelo', 'Flores'],
        description: 'Una propuesta de ejemplo con notas delicadas y una sensación fresca en cada taza.',
      }],
    },
    {
      id: 'santander',
      name: 'Santander',
      location: 'San Gil, Santander',
      latitude: 6.55,
      longitude: -73.13,
      coffees: [{
        id: 'santander-natural',
        isExample: true,
        name: 'Senderos de Santander',
        variety: 'Castillo',
        process: 'Natural',
        roast: 'Medio',
        notes: ['Cacao', 'Frutos rojos', 'Nueces'],
        description: 'Un perfil de ejemplo de cuerpo envolvente y dulzor prolongado.',
      }],
    },
    {
      id: 'sierra-nevada',
      name: 'Sierra Nevada',
      location: 'Minca, Magdalena',
      latitude: 11.14,
      longitude: -74.12,
      coffees: [{
        id: 'sierra-lavado',
        isExample: true,
        name: 'Brisa de la Sierra',
        variety: 'Típica',
        process: 'Lavado',
        roast: 'Medio',
        notes: ['Chocolate', 'Almendra', 'Especias'],
        description: 'Una combinación de ejemplo cálida y suave que invita a descubrir nuevos sabores.',
      }],
    },
  ];

  readonly selectedOrigin = signal<CoffeeOrigin>(this.origins[0]);
  readonly selectedCoffee = signal<Coffee>(this.origins[0].coffees[0]);

  selectOrigin(origin: CoffeeOrigin): void {
    this.selectedOrigin.set(origin);
    this.selectedCoffee.set(origin.coffees[0]);
  }

  mapLeft(origin: CoffeeOrigin): number {
    return (((origin.longitude + 80) * 26 + 20) / 400) * 100;
  }

  mapTop(origin: CoffeeOrigin): number {
    return (((13.5 - origin.latitude) * 26 + 20) / 520) * 100;
  }
}
