
import { Component, inject } from '@angular/core';
import { NgForOf, AsyncPipe, CurrencyPipe, NgIf } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [NgForOf, AsyncPipe, CurrencyPipe, ReactiveFormsModule, NgIf],
  templateUrl: './shop.component.html'
})
export class ShopComponent {
  private api = inject(ProductService);
  private cart = inject(CartService);
  private fb = inject(FormBuilder);

  filters = this.fb.group({
    q: [''],
    category: [''],
    sort: ['']
  });

  categories$ = this.api.getCategories();
  products$ = this.api.getAll(this.filters.value);

  apply() {
    const params: any = {};
    const v = this.filters.value;
    if (v.q) params.q = v.q;
    if (v.category) params.category = v.category;
    if (v.sort) params.sort = v.sort;
    this.products$ = this.api.getAll(params);
  }

  add(p: any, qtyInput: HTMLInputElement) {
    const qty = Math.max(1, qtyInput.valueAsNumber || 1);
    this.cart.add(p, qty);
    qtyInput.value = '1';
  }
}
