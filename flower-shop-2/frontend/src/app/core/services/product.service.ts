import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, Category } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getProducts(search?: string, categoryId?: number, type?: string): Observable<Product[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (categoryId) params = params.set('categoryId', categoryId.toString());
    if (type) params = params.set('type', type);

    return this.http.get<Product[]>(`${this.apiUrl}/products`, { params });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }
}


