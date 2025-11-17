import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { ProductService } from '../../core/services/product.service';
import { Category } from '../../core/models/product.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  categories: Category[] = [];
  
  categoryForm = {
    name: '',
    description: ''
  };
  
  productForm = {
    name: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    imageUrl: '',
    categoryId: 0,
    type: 'Flower'
  };
  
  isSubmittingCategory = false;
  isSubmittingProduct = false;
  categoryMessage = '';
  productMessage = '';
  
  productTypes = ['Flower', 'Bouquet', 'Composition'];

  constructor(
    private adminService: AdminService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: () => {
        this.categoryMessage = 'Error loading categories.';
      }
    });
  }

  onSubmitCategory() {
    if (!this.categoryForm.name.trim()) {
      this.categoryMessage = 'Category name is required.';
      return;
    }

    this.isSubmittingCategory = true;
    this.categoryMessage = '';

    this.adminService.createCategory({
      name: this.categoryForm.name.trim(),
      description: this.categoryForm.description.trim() || undefined
    }).subscribe({
      next: (category) => {
        this.categoryMessage = `Category "${category.name}" created successfully!`;
        this.categoryForm = { name: '', description: '' };
        this.loadCategories(); // Reload categories list
        this.isSubmittingCategory = false;
      },
      error: (error) => {
        this.categoryMessage = error.error?.message || 'Error creating category. Please try again.';
        this.isSubmittingCategory = false;
      }
    });
  }

  onSubmitProduct() {
    if (!this.productForm.name.trim()) {
      this.productMessage = 'Product name is required.';
      return;
    }

    if (this.productForm.price <= 0) {
      this.productMessage = 'Price must be greater than 0.';
      return;
    }

    if (this.productForm.stockQuantity < 0) {
      this.productMessage = 'Stock quantity cannot be negative.';
      return;
    }

    if (!this.productForm.categoryId) {
      this.productMessage = 'Please select a category.';
      return;
    }

    this.isSubmittingProduct = true;
    this.productMessage = '';

    this.adminService.createProduct({
      name: this.productForm.name.trim(),
      description: this.productForm.description.trim() || undefined,
      price: this.productForm.price,
      stockQuantity: this.productForm.stockQuantity,
      imageUrl: this.productForm.imageUrl.trim() || undefined,
      categoryId: this.productForm.categoryId,
      type: this.productForm.type
    }).subscribe({
      next: (product) => {
        this.productMessage = `Product "${product.name}" created successfully!`;
        this.productForm = {
          name: '',
          description: '',
          price: 0,
          stockQuantity: 0,
          imageUrl: '',
          categoryId: 0,
          type: 'Flower'
        };
        this.isSubmittingProduct = false;
      },
      error: (error) => {
        this.productMessage = error.error?.message || 'Error creating product. Please try again.';
        this.isSubmittingProduct = false;
      }
    });
  }
}

