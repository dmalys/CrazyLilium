export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  categoryId: number;
  category?: Category;
  type: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}


