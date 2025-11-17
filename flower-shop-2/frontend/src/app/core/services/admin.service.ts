import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, Category } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  createCategory(category: { name: string; description?: string }): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, category);
  }

  createProduct(product: {
    name: string;
    description?: string;
    price: number;
    stockQuantity: number;
    imageUrl?: string;
    categoryId: number;
    type: string;
  }): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, product);
  }
}

