
import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, NgForOf } from '@angular/common';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [NgForOf, AsyncPipe, CurrencyPipe],
  templateUrl: './cart.component.html'
})
export class CartComponent {
  cart = inject(CartService);
}
