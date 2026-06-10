export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category_id: string;
  description: string;
  price: number;
  sale_price: number | null;
  images: string[];
  is_active: boolean;
  is_featured: boolean;
  stock_quantity: number;
  is_sold_out: boolean;
  available_sizes: (number | string)[];
  created_at: string;
  updated_at: string;
  category?: Category;
  inventory?: InventoryItem[];
}

export interface InventoryItem {
  id: string;
  product_id: string;
  size: string;
  stock_quantity: number;
}

export interface CartItem {
  id: string;
  session_id: string;
  product_id: string;
  size: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

export interface WishlistItem {
  id: string;
  session_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Order {
  id: string;
  session_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: ShippingAddress;
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  size: string;
  quantity: number;
  unit_price: number;
}

export interface ShippingAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Admin {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface FilterOptions {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'name';
}
