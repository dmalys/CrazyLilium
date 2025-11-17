import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product.model';

const KEY = 'flower-shop-cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private items: CartItem[] = [];
  private itemsSub = new BehaviorSubject<CartItem[]>([]);
  items$ = this.itemsSub.asObservable();
  totalItems$ = this.itemsSub.asObservable().pipe(
    map(items => items.reduce((a, c) => a + c.qty, 0))
  );
  totalPrice$ = this.itemsSub.asObservable().pipe(
    map(items => items.reduce((a, c) => a + (c.product.price * c.qty), 0))
  );

  constructor() {
    // Initialize in constructor but safely
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        this.items = this.load();
        this.itemsSub.next([...this.items]);
      }
    } catch (e) {
      console.warn('Failed to initialize cart from localStorage', e);
      this.items = [];
      this.itemsSub.next([]);
    }
  }

  private save() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(KEY, JSON.stringify(this.items));
      }
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
    this.itemsSub.next([...this.items]);
  }

  private load(): CartItem[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(KEY);
        return stored ? JSON.parse(stored) : [];
      }
    } catch (e) {
      console.warn('Failed to load cart from localStorage', e);
    }
    return [];
  }

  add(product: Product, qty: number = 1) {
    if (qty <= 0) return;
    const existing = this.items.find(i => i.product.id === product.id);
    if (existing) {
      existing.qty = Math.min(existing.qty + qty, product.stockQuantity);
    } else {
      this.items.push({ product, qty: Math.min(qty, product.stockQuantity) });
    }
    this.save();
  }

  setQty(productId: number, qty: number) {
    const item = this.items.find(i => i.product.id === productId);
    if (!item) return;
    item.qty = Math.max(0, Math.min(qty, item.product.stockQuantity));
    if (item.qty === 0) {
      this.items = this.items.filter(i => i.product.id !== productId);
    }
    this.save();
  }

  remove(productId: number) {
    this.items = this.items.filter(i => i.product.id !== productId);
    this.save();
  }

  clear() {
    this.items = [];
    this.save();
  }
}

