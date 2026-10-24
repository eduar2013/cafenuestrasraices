import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contact-bar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './contact-bar.html',
  styleUrl: './contact-bar.css',
})
export class ContactBarComponent {}
