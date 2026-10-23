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
      src: 'images/carousel/slide-1.jpg',
      alt: 'Café en grano recién tostado',
      title: 'Tueste artesanal',
      description: 'Granos seleccionados y tostados en pequeños lotes para una taza con carácter.',
    },
    {
      src: 'images/carousel/slide-2.jpg',
      alt: 'Taza de café servida en mesa rústica',
      title: 'Sabor de origen',
      description: 'Notas dulces y achocolatadas que resaltan la esencia del café de montaña.',
    },
    {
      src: 'images/carousel/slide-3.jpg',
      alt: 'Caficultores recolectando café',
      title: 'Manos caficultoras',
      description: 'Trabajo directo con productores locales para asegurar calidad y comercio justo.',
    },
    {
      src: 'images/carousel/slide-4.jpg',
      alt: 'Caficultores recolectando café',
      title: 'Del cafetal a tu mesa',
      description: 'Trazabilidad completa desde la cosecha hasta el empaque final.',
    }
    ,
    {
      src: 'images/carousel/slide-5.jpg',
      alt: 'Caficultores recolectando café',
      title: 'Del cafetal a tu mesa',
      description: 'Trazabilidad completa desde la cosecha hasta el empaque final.',
    }
    ,
    {
      src: 'images/carousel/slide-6.jpg',
      alt: 'Caficultores recolectando café',
      title: 'Del cafetal a tu mesa',
      description: 'Trazabilidad completa desde la cosecha hasta el empaque final.',
    }
  ];

  readonly currentIndex = signal(0);

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  // Calculamos cuántos pasos máximos puede dar el carrusel manteniendo 3 elementos visibles
  get maxIndex(): number {
    return Math.max(this.images.length - 3, 0);
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
    this.stopAutoSlide();
  }

  resumeAutoSlide(): void {
    this.startAutoSlide();
  }

  private startAutoSlide(): void {
    this.stopAutoSlide();

    if (this.maxIndex === 0) {
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
