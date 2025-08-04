import { supabase } from './supabase';

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url: string;
  store_id: number;
  category_id?: number;
  tags?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  store?: {
    id: number;
    name: string;
    logo_url?: string;
  };
}

export interface ProductFilters {
  category?: string;
  price_min?: number;
  price_max?: number;
  store_id?: number;
  search?: string;
}

// Mock products for fallback
const mockProducts: Product[] = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    description: "Premium wireless headphones with noise cancellation",
    price: 199.99,
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
    store_id: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    store: {
      id: 1,
      name: "TechStore",
      logo_url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=100&q=80"
    }
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    description: "Advanced fitness tracking with heart rate monitor",
    price: 299.99,
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80",
    store_id: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    store: {
      id: 1,
      name: "TechStore",
      logo_url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=100&q=80"
    }
  },
  {
    id: 3,
    name: "Organic Cotton T-Shirt",
    description: "Comfortable organic cotton t-shirt",
    price: 29.99,
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80",
    store_id: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    store: {
      id: 1,
      name: "FashionStore",
      logo_url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=100&q=80"
    }
  },
  {
    id: 4,
    name: "Leather Crossbody Bag",
    description: "Stylish leather crossbody bag",
    price: 89.99,
    image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80",
    store_id: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    store: {
      id: 1,
      name: "FashionStore",
      logo_url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=100&q=80"
    }
  }
];

export class ProductService {
  // Get all products with optional filters
  static async getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          store:stores(
            id,
            name,
            logo_url
          )
        `)
        .eq('is_active', true);

      // Apply filters
      if (filters?.price_min !== undefined) {
        query = query.gte('price', filters.price_min);
      }
      if (filters?.price_max !== undefined) {
        query = query.lte('price', filters.price_max);
      }
      if (filters?.store_id) {
        query = query.eq('store_id', filters.store_id);
      }
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        // Return mock products as fallback
        return this.filterMockProducts(mockProducts, filters);
      }

      // If no products found, return mock products
      if (!data || data.length === 0) {
        console.log('No products found in database, using mock data');
        return this.filterMockProducts(mockProducts, filters);
      }

      return data;
    } catch (error) {
      console.error('ProductService.getProducts error:', error);
      return this.filterMockProducts(mockProducts, filters);
    }
  }

  // Filter mock products based on filters
  private static filterMockProducts(products: Product[], filters?: ProductFilters): Product[] {
    if (!filters) return products;

    return products.filter(product => {
      if (filters.price_min && product.price < filters.price_min) return false;
      if (filters.price_max && product.price > filters.price_max) return false;
      if (filters.store_id && product.store_id !== filters.store_id) return false;
      if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }

  // Get product by ID
  static async getProductById(productId: number): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          store:stores(
            id,
            name,
            logo_url
          )
        `)
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        // Return mock product as fallback
        return mockProducts.find(p => p.id === productId) || null;
      }

      return data;
    } catch (error) {
      console.error('ProductService.getProductById error:', error);
      return mockProducts.find(p => p.id === productId) || null;
    }
  }

  // Get products by store
  static async getProductsByStore(storeId: number): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          store:stores(
            id,
            name,
            logo_url
          )
        `)
        .eq('store_id', storeId)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching store products:', error);
        return this.filterMockProducts(mockProducts, { store_id: storeId });
      }

      if (!data || data.length === 0) {
        return this.filterMockProducts(mockProducts, { store_id: storeId });
      }

      return data;
    } catch (error) {
      console.error('ProductService.getProductsByStore error:', error);
      return this.filterMockProducts(mockProducts, { store_id: storeId });
    }
  }

  // Search products
  static async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          store:stores(
            id,
            name,
            logo_url
          )
        `)
        .eq('is_active', true)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

      if (error) {
        console.error('Error searching products:', error);
        return this.filterMockProducts(mockProducts, { search: searchTerm });
      }

      if (!data || data.length === 0) {
        return this.filterMockProducts(mockProducts, { search: searchTerm });
      }

      return data;
    } catch (error) {
      console.error('ProductService.searchProducts error:', error);
      return this.filterMockProducts(mockProducts, { search: searchTerm });
    }
  }

  // Get product categories (using mock categories since database doesn't have category column)
  static async getProductCategories(): Promise<string[]> {
    try {
      // Since the database doesn't have a category column, return mock categories
      return ['Electronics', 'Clothing', 'Accessories', 'Home & Garden', 'Sports'];
    } catch (error) {
      console.error('ProductService.getProductCategories error:', error);
      return ['Electronics', 'Clothing', 'Accessories', 'Home & Garden', 'Sports'];
    }
  }

  // Get featured products
  static async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          store:stores(
            id,
            name,
            logo_url
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching featured products:', error);
        return mockProducts.slice(0, limit);
      }

      if (!data || data.length === 0) {
        return mockProducts.slice(0, limit);
      }

      return data;
    } catch (error) {
      console.error('ProductService.getFeaturedProducts error:', error);
      return mockProducts.slice(0, limit);
    }
  }

  // Get trending products (based on cart additions)
  static async getTrendingProducts(limit: number = 10): Promise<Product[]> {
    try {
      // Get products that have been added to cart recently
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          product_id,
          products(
            *,
            store:stores(
              id,
              name,
              logo_url
            )
          )
        `)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching trending products:', error);
        return mockProducts.slice(0, limit);
      }

      if (!data || data.length === 0) {
        return mockProducts.slice(0, limit);
      }

      // Count occurrences and get unique products
      const productCounts = new Map();
      data?.forEach(item => {
        if (item.products) {
          const count = productCounts.get(item.product_id) || 0;
          productCounts.set(item.product_id, count + 1);
        }
      });

      // Sort by count and get top products
      const sortedProducts = Array.from(productCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([productId]) => {
          const item = data?.find(d => d.product_id === productId);
          return item?.products;
        })
        .filter(Boolean);

      return sortedProducts.length > 0 ? sortedProducts : mockProducts.slice(0, limit);
    } catch (error) {
      console.error('ProductService.getTrendingProducts error:', error);
      return mockProducts.slice(0, limit);
    }
  }

  // Create product (for sellers)
  static async createProduct(productData: Partial<Product>): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select(`
          *,
          store:stores(
            id,
            name,
            logo_url
          )
        `)
        .single();

      if (error) {
        console.error('Error creating product:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('ProductService.createProduct error:', error);
      return null;
    }
  }

  // Update product (for sellers)
  static async updateProduct(productId: number, updates: Partial<Product>): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId)
        .select(`
          *,
          store:stores(
            id,
            name,
            logo_url
          )
        `)
        .single();

      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('ProductService.updateProduct error:', error);
      return null;
    }
  }

  // Delete product (for sellers)
  static async deleteProduct(productId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('Error deleting product:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('ProductService.deleteProduct error:', error);
      return false;
    }
  }
} 