import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';
import { ContactBarComponent } from '../contact-bar/contact-bar';
import { CafeHistoryComponent } from '../cafe-history/cafe-history';
import { CoffeeOriginsComponent } from '../coffee-origins/coffee-origins';
import { CarouselComponent } from '../carousel/carousel';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    NavbarComponent,
    ContactBarComponent,
    CafeHistoryComponent,
    CoffeeOriginsComponent,
    CarouselComponent,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {}
