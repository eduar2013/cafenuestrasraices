import { Component } from '@angular/core';
import { NavbarComponent } from './navbar/navbar';
import { CarouselComponent } from './carousel/carousel';
import { ContactBarComponent } from './contact-bar/contact-bar';


@Component({
  imports: [NavbarComponent, CarouselComponent, ContactBarComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
