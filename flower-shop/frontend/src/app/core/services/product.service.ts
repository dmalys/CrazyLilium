
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private http: HttpClient) {}
  getAll(params?: any): Observable<Product[]> {
    return this.http.get<Product[]>('/api/products', { params });
  }
  getCategories(): Observable<{slug:string, name:string}[]> {
    return this.http.get<{slug:string, name:string}[]>('/api/categories');
  }
}
