import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../core/models/cart-item.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  totalPrice = 0;
  private subscription?: Subscription;

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.subscription = this.cartService.items$.subscribe(items => {
      this.cartItems = items;
      this.totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  updateQuantity(productId: number, qty: number) {
    this.cartService.setQty(productId, qty);
  }

  removeItem(productId: number) {
    this.cartService.remove(productId);
  }

  clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clear();
    }
  }
}

