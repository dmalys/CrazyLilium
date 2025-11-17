import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, AsyncPipe } from '@angular/common';
import { CartService } from './core/services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AsyncPipe, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Flower Shop';
  cartItemCount$ = this.cartService.totalItems$;

  constructor(private cartService: CartService) {}

  getCartCount(count: number | null): number {
    return count && count > 0 ? count : 0;
  }
}

