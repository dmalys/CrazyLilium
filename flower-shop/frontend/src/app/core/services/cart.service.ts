
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product.model';

const KEY = 'flower-cart-v2';

@Injectable({ providedIn: 'root' })
export class CartService {
  private items: CartItem[] = this.load();
  private itemsSub = new BehaviorSubject<CartItem[]>(this.items);
  items$ = this.itemsSub.asObservable();
  totalItems$ = this.itemsSub.asObservable().pipe(map(items => items.reduce((a, c) => a + c.qty, 0)));

  private save() { localStorage.setItem(KEY, JSON.stringify(this.items)); this.itemsSub.next([...this.items]); }
  private load(): CartItem[] { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } }

  add(product: Product, qty: number) {
    if (qty <= 0) return;
    const existing = this.items.find(i => i.product.id === product.id);
    if (existing) existing.qty = Math.min(existing.qty + qty, product.stockQty);
    else this.items.push({ product, qty: Math.min(qty, product.stockQty) });
    this.save();
  }
  setQty(productId: number, qty: number) {
    const item = this.items.find(i => i.product.id === productId);
    if (!item) return;
    item.qty = Math.max(0, Math.min(qty, item.product.stockQty));
    if (item.qty === 0) this.items = this.items.filter(i => i.product.id !== productId);
    this.save();
  }
  clear() { this.items = []; this.save(); }
}
