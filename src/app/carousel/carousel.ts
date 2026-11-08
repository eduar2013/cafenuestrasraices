import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CarouselImage {
  src: string;
  alt: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.html',
  styleUrls: ['./carousel.css']
})
export class CarouselComponent implements OnInit, OnDestroy {
  private autoSlideId: ReturnType<typeof setInterval> | undefined;
  private readonly autoSlideMs = 4000;

  readonly images: CarouselImage[] = [
    {
      src: 'images/carousel/slide-1.webp',
      alt: 'Café en grano',
      title: 'En grano o molido',
      description: 'Llévalo a casa en grano o molido, en varias presentaciones.',
    },
    {
      src: 'images/carousel/slide-2.webp',
      alt: 'Taza de café servida en mesa rústica',
      title: 'Cafés de varias regiones',
      description: 'Orígenes de distintas regiones de Colombia, cada uno con sus propias notas.',
    },
    {
      src: 'images/carousel/slide-3.jpg',
      alt: 'Taza de café espresso sobre granos de café',
      title: 'Prueba antes de elegir',
      description: 'En nuestra barra puedes probar distintos cafés y encontrar el tuyo.',
    },
    {
      src: 'images/carousel/slide-4.webp',
      alt: 'Ilustraciones de tazas, una cafetera y granos de café',
      title: 'Métodos de preparación',
      description: 'Prueba un mismo café en distintos métodos y descubre cómo cambia la taza.',
    },
    {
      src: 'images/carousel/slide-6.webp',
      alt: 'Taza de café humeante sobre granos de café',
      title: 'Para llevar a casa',
      description: 'Pide en la tienda online y recíbelo en casa o recógelo en nuestro local.',
    },
  ];

  readonly currentIndex = signal(0);
  /** Cards visible at once: 3 on wide screens, 2 on tablets, 1 on phones. */
  readonly perView = signal(3);
  /** Visitors can stop the automatic slide (WCAG 2.2.2); reduced motion starts it stopped. */
  readonly paused = signal(false);
  private hovering = false;
  private mediaQueries: MediaQueryList[] = [];
  private readonly onResize = () => this.updatePerView();

  ngOnInit(): void {
    if (typeof matchMedia !== 'undefined') {
      this.mediaQueries = ['(max-width: 639px)', '(max-width: 1023px)'].map((q) => matchMedia(q));
      this.mediaQueries.forEach((mq) => mq.addEventListener?.('change', this.onResize));
      this.updatePerView();
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.paused.set(true);
      }
    }
    this.startAutoSlide();
  }

  togglePause(): void {
    this.paused.update((paused) => !paused);
    this.startAutoSlide();
  }

  private updatePerView(): void {
    const [phone, tablet] = this.mediaQueries.map((mq) => mq.matches);
    this.perView.set(phone ? 1 : tablet ? 2 : 3);
    this.currentIndex.update((index) => Math.min(index, this.maxIndex));
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
    this.mediaQueries.forEach((mq) => mq.removeEventListener?.('change', this.onResize));
  }

  // Steps the carousel can take while keeping perView cards visible.
  get maxIndex(): number {
    return Math.max(this.images.length - this.perView(), 0);
  }

  prev(): void {
    if (this.currentIndex() > 0) {
      this.currentIndex.update((index) => index - 1);
    } else {
      this.currentIndex.set(this.maxIndex); // Regresa al final de forma cíclica
    }
  }

  next(): void {
    if (this.currentIndex() < this.maxIndex) {
      this.currentIndex.update((index) => index + 1);
    } else {
      this.currentIndex.set(0); // Regresa al inicio de forma cíclica
    }
  }

  pauseAutoSlide(): void {
    this.hovering = true;
    this.stopAutoSlide();
  }

  resumeAutoSlide(): void {
    this.hovering = false;
    this.startAutoSlide();
  }

  private startAutoSlide(): void {
    this.stopAutoSlide();

    if (this.maxIndex === 0 || this.paused() || this.hovering) {
      return;
    }

    this.autoSlideId = setInterval(() => {
      this.next();
    }, this.autoSlideMs);
  }

  private stopAutoSlide(): void {
    if (this.autoSlideId) {
      clearInterval(this.autoSlideId);
      this.autoSlideId = undefined;
    }
  }
}
