import { Component } from '@angular/core';
import { CafeInfoComponent } from '../cafe-info/cafe-info';

@Component({
  imports: [CafeInfoComponent],
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent {}
