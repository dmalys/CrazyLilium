
export interface Product {
  id: number;
  name: string;
  category: string;
  categoryName: string;
  description?: string;
  price: number;
  stockQty: number;
  imageUrl?: string;
}
