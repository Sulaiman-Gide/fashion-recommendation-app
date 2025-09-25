export interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  matchScore?: number;
  description?: string;
  sizes?: string[];
  colors?: string[];
  stock?: number;
  brand?: string;
}
