import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product, Category } from '../../core/models/product.model';
import { CartItem } from '../../core/models/cart-item.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  categories: Category[] = [];
  filteredProducts: Product[] = [];
  searchTerm: string = '';
  selectedCategoryId?: number;
  selectedType: string = '';
  cartItems: CartItem[] = [];
  private cartSubscription?: Subscription;

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.cartSubscription = this.cartService.items$.subscribe(items => {
      this.cartItems = items;
    });
    this.loadCategories();
    this.loadProducts();
  }

  ngOnDestroy() {
    this.cartSubscription?.unsubscribe();
  }

  loadCategories() {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  loadProducts() {
    this.productService.getProducts(this.searchTerm, this.selectedCategoryId, this.selectedType || undefined).subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
      },
      error: (err) => console.error('Error loading products:', err)
    });
  }

  onSearch() {
    this.loadProducts();
  }

  onCategoryChange() {
    this.loadProducts();
  }

  onTypeChange() {
    this.loadProducts();
  }

  addToCart(product: Product) {
    this.cartService.add(product, 1);
  }

  updateQuantity(product: Product, change: number) {
    const item = this.cartItems.find(i => i.product.id === product.id);
    const currentQty = item?.qty || 0;
    const newQty = currentQty + change;
    if (newQty > 0) {
      this.cartService.setQty(product.id, newQty);
    } else {
      this.cartService.remove(product.id);
    }
  }

  getQuantity(product: Product): number {
    const item = this.cartItems.find(i => i.product.id === product.id);
    return item?.qty || 0;
  }
}

