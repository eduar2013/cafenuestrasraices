import { Component } from '@angular/core';
import { NavbarComponent } from './navbar/navbar';
import { CarouselComponent } from './carousel/carousel';


@Component({
  imports: [NavbarComponent,CarouselComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
