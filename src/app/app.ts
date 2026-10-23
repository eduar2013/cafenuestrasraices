import { Component } from '@angular/core';
import { NavbarComponent } from './navbar/navbar';
import { CarouselComponent } from './carousel/carousel';
import { ContactBarComponent } from './contact-bar/contact-bar';
import { CafeHistoryComponent } from './cafe-history/cafe-history';
import { SideNavComponent } from './side-nav/side-nav';
import { CoffeeOriginsComponent } from './coffee-origins/coffee-origins';
import { FooterComponent } from './footer/footer';


@Component({
  imports: [NavbarComponent, CarouselComponent, ContactBarComponent, CafeHistoryComponent, SideNavComponent, CoffeeOriginsComponent, FooterComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
