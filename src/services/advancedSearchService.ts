import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AdvancedProductFilters {
  search?: string;
  categories?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  stores?: string[];
  ratings?: number[];
  availability?: 'in_stock' | 'out_of_stock' | 'all';
  sortBy?: 'relevance' | 'price_low' | 'price_high' | 'newest' | 'rating';
  tags?: string[];
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'trending' | 'recent' | 'category' | 'brand';
  count?: number;
}

export interface SearchAnalytics {
  query: string;
  timestamp: number;
  resultCount: number;
  filters: AdvancedProductFilters;
  sessionId: string;
}

export class AdvancedSearchService {
  private static readonly SEARCH_HISTORY_KEY = 'search_history';
  private static readonly SEARCH_ANALYTICS_KEY = 'search_analytics';
  private static readonly MAX_HISTORY_ITEMS = 10;

  // Get search history
  static async getSearchHistory(): Promise<string[]> {
    try {
      const history = await AsyncStorage.getItem(this.SEARCH_HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }

  // Add search to history
  static async addToSearchHistory(query: string): Promise<void> {
    try {
      const history = await this.getSearchHistory();
      const filteredHistory = history.filter(item => item !== query);
      const newHistory = [query, ...filteredHistory].slice(0, this.MAX_HISTORY_ITEMS);
      await AsyncStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error adding to search history:', error);
    }
  }

  // Get search suggestions
  static async getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
    try {
      const suggestions: SearchSuggestion[] = [];
      
      // Get trending searches
      const trendingSearches = await this.getTrendingSearches();
      suggestions.push(...trendingSearches);

      // Get recent searches
      const recentHistory = await this.getSearchHistory();
      const recentSuggestions = recentHistory
        .filter(item => item.toLowerCase().includes(query.toLowerCase()))
        .map(item => ({
          id: `recent_${item}`,
          text: item,
          type: 'recent' as const
        }));
      suggestions.push(...recentSuggestions);

      // Get category suggestions
      const categorySuggestions = await this.getCategorySuggestions(query);
      suggestions.push(...categorySuggestions);

      // Get brand suggestions
      const brandSuggestions = await this.getBrandSuggestions(query);
      suggestions.push(...brandSuggestions);

      return suggestions.slice(0, 8); // Limit to 8 suggestions
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  // Get trending searches
  static async getTrendingSearches(): Promise<SearchSuggestion[]> {
    try {
      // In a real app, this would come from analytics
      const trending = [
        { id: 'trend_1', text: 'wireless headphones', type: 'trending' as const, count: 1250 },
        { id: 'trend_2', text: 'smart watch', type: 'trending' as const, count: 890 },
        { id: 'trend_3', text: 'organic cotton', type: 'trending' as const, count: 650 },
        { id: 'trend_4', text: 'leather bag', type: 'trending' as const, count: 420 }
      ];
      return trending;
    } catch (error) {
      console.error('Error getting trending searches:', error);
      return [];
    }
  }

  // Get category suggestions
  static async getCategorySuggestions(query: string): Promise<SearchSuggestion[]> {
    try {
      const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Beauty', 'Books'];
      return categories
        .filter(cat => cat.toLowerCase().includes(query.toLowerCase()))
        .map(cat => ({
          id: `category_${cat}`,
          text: cat,
          type: 'category' as const
        }));
    } catch (error) {
      console.error('Error getting category suggestions:', error);
      return [];
    }
  }

  // Get brand suggestions
  static async getBrandSuggestions(query: string): Promise<SearchSuggestion[]> {
    try {
      const brands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG'];
      return brands
        .filter(brand => brand.toLowerCase().includes(query.toLowerCase()))
        .map(brand => ({
          id: `brand_${brand}`,
          text: brand,
          type: 'brand' as const
        }));
    } catch (error) {
      console.error('Error getting brand suggestions:', error);
      return [];
    }
  }

  // Advanced product search with filters
  static async searchProductsWithFilters(filters: AdvancedProductFilters): Promise<any[]> {
    try {
      console.log('Advanced search with filters:', filters);

      // Build Supabase query
      let query = supabase
        .from('products')
        .select(`
          *,
          stores(name, logo_url),
          product_images(image_url, is_primary)
        `)
        .eq('is_active', true);

      // Apply search filter
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Apply category filter
      if (filters.categories && filters.categories.length > 0) {
        query = query.in('category_id', filters.categories);
      }

      // Apply price range filter
      if (filters.priceRange) {
        query = query.gte('price', filters.priceRange.min);
        if (filters.priceRange.max > 0) {
          query = query.lte('price', filters.priceRange.max);
        }
      }

      // Apply store filter
      if (filters.stores && filters.stores.length > 0) {
        query = query.in('store_id', filters.stores);
      }

      // Apply availability filter
      if (filters.availability && filters.availability !== 'all') {
        if (filters.availability === 'in_stock') {
          query = query.gt('stock_quantity', 0);
        } else if (filters.availability === 'out_of_stock') {
          query = query.eq('stock_quantity', 0);
        }
      }

      // Apply sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price_low':
            query = query.order('price', { ascending: true });
            break;
          case 'price_high':
            query = query.order('price', { ascending: false });
            break;
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'rating':
            // Note: This would require a ratings table
            query = query.order('created_at', { ascending: false });
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error searching products:', error);
        return this.getMockProductsWithFilters(filters);
      }

      // Add search to history if there's a search query
      if (filters.search) {
        await this.addToSearchHistory(filters.search);
      }

      // Track search analytics
      await this.trackSearchAnalytics(filters, data?.length || 0);

      return data || [];
    } catch (error) {
      console.error('Error in advanced search:', error);
      return this.getMockProductsWithFilters(filters);
    }
  }

  // Search for seller profiles
  static async searchSellerProfiles(query: string): Promise<any[]> {
    try {
      // Mock seller profiles for testing
      const mockSellers = [
        {
          id: 'seller1',
          name: 'TechStore',
          username: '@techstore',
          avatar: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=100&q=80',
          bio: 'Premium tech gadgets and electronics store. Quality products at competitive prices.',
          type: 'seller',
          category: 'Electronics',
          rating: 4.8,
          productsCount: 156,
          followers: 2847,
          isVerified: true,
        },
        {
          id: 'seller2',
          name: 'FashionHub',
          username: '@fashionhub',
          avatar: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=100&q=80',
          bio: 'Trendy fashion and lifestyle products. Stay stylish with our latest collections.',
          type: 'seller',
          category: 'Fashion',
          rating: 4.6,
          productsCount: 89,
          followers: 1892,
          isVerified: true,
        },
        {
          id: 'seller3',
          name: 'HomeDecor Plus',
          username: '@homedecorplus',
          avatar: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=100&q=80',
          bio: 'Beautiful home decor and furniture. Transform your space with our curated collection.',
          type: 'seller',
          category: 'Home & Garden',
          rating: 4.9,
          productsCount: 234,
          followers: 3456,
          isVerified: true,
        },
        {
          id: 'seller4',
          name: 'Beauty Essentials',
          username: '@beautyessentials',
          avatar: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=100&q=80',
          bio: 'Premium beauty and skincare products. Enhance your natural beauty with our products.',
          type: 'seller',
          category: 'Beauty',
          rating: 4.7,
          productsCount: 67,
          followers: 1234,
          isVerified: false,
        },
        {
          id: 'seller5',
          name: 'Sports Gear Pro',
          username: '@sportsgearpro',
          avatar: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=100&q=80',
          bio: 'Professional sports equipment and athletic wear. Gear up for your next adventure.',
          type: 'seller',
          category: 'Sports',
          rating: 4.5,
          productsCount: 123,
          followers: 987,
          isVerified: true,
        },
      ];

      // Filter sellers based on search query
      const searchLower = query.toLowerCase();
      const filteredSellers = mockSellers.filter(seller =>
        seller.name.toLowerCase().includes(searchLower) ||
        seller.username.toLowerCase().includes(searchLower) ||
        seller.bio.toLowerCase().includes(searchLower) ||
        seller.category.toLowerCase().includes(searchLower)
      );

      return filteredSellers;
    } catch (error) {
      console.error('Error searching seller profiles:', error);
      return [];
    }
  }

  // Get mock products with filters (fallback)
  private static getMockProductsWithFilters(filters: AdvancedProductFilters): any[] {
    const mockProducts = [
      {
        id: 1,
        name: "Wireless Bluetooth Headphones",
        description: "Premium wireless headphones with noise cancellation",
        price: 199.99,
        image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
        store_id: 1,
        category_id: 1,
        stock_quantity: 50,
        is_active: true,
        created_at: new Date().toISOString(),
        stores: { name: "TechStore", logo_url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=100&q=80" }
      },
      {
        id: 2,
        name: "Smart Fitness Watch",
        description: "Advanced fitness tracking with heart rate monitor",
        price: 299.99,
        image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80",
        store_id: 1,
        category_id: 1,
        stock_quantity: 25,
        is_active: true,
        created_at: new Date().toISOString(),
        stores: { name: "TechStore", logo_url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=100&q=80" }
      },
      {
        id: 3,
        name: "Organic Cotton T-Shirt",
        description: "Comfortable organic cotton t-shirt",
        price: 29.99,
        image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80",
        store_id: 2,
        category_id: 2,
        stock_quantity: 100,
        is_active: true,
        created_at: new Date().toISOString(),
        stores: { name: "FashionStore", logo_url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=100&q=80" }
      }
    ];

    // Apply filters to mock data
    let filteredProducts = mockProducts;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters.priceRange) {
      filteredProducts = filteredProducts.filter(product =>
        product.price >= filters.priceRange!.min &&
        (filters.priceRange!.max === 0 || product.price <= filters.priceRange!.max)
      );
    }

    if (filters.availability === 'in_stock') {
      filteredProducts = filteredProducts.filter(product => product.stock_quantity > 0);
    } else if (filters.availability === 'out_of_stock') {
      filteredProducts = filteredProducts.filter(product => product.stock_quantity === 0);
    }

    return filteredProducts;
  }

  // Track search analytics
  static async trackSearchAnalytics(filters: AdvancedProductFilters, resultCount: number): Promise<void> {
    try {
      const analytics: SearchAnalytics = {
        query: filters.search || '',
        timestamp: Date.now(),
        resultCount,
        filters,
        sessionId: `session_${Date.now()}`
      };

      const existingAnalytics = await AsyncStorage.getItem(this.SEARCH_ANALYTICS_KEY);
      const analyticsArray = existingAnalytics ? JSON.parse(existingAnalytics) : [];
      analyticsArray.push(analytics);

      // Keep only last 100 analytics entries
      if (analyticsArray.length > 100) {
        analyticsArray.splice(0, analyticsArray.length - 100);
      }

      await AsyncStorage.setItem(this.SEARCH_ANALYTICS_KEY, JSON.stringify(analyticsArray));
    } catch (error) {
      console.error('Error tracking search analytics:', error);
    }
  }

  // Get search analytics
  static async getSearchAnalytics(): Promise<SearchAnalytics[]> {
    try {
      const analytics = await AsyncStorage.getItem(this.SEARCH_ANALYTICS_KEY);
      return analytics ? JSON.parse(analytics) : [];
    } catch (error) {
      console.error('Error getting search analytics:', error);
      return [];
    }
  }

  // Get popular searches
  static async getPopularSearches(): Promise<SearchSuggestion[]> {
    try {
      const analytics = await this.getSearchAnalytics();
      const searchCounts: { [key: string]: number } = {};

      analytics.forEach(entry => {
        if (entry.query) {
          searchCounts[entry.query] = (searchCounts[entry.query] || 0) + 1;
        }
      });

      return Object.entries(searchCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([query, count]) => ({
          id: `popular_${query}`,
          text: query,
          type: 'trending' as const,
          count
        }));
    } catch (error) {
      console.error('Error getting popular searches:', error);
      return [];
    }
  }

  // Clear search history
  static async clearSearchHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }

  // Clear search analytics
  static async clearSearchAnalytics(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.SEARCH_ANALYTICS_KEY);
    } catch (error) {
      console.error('Error clearing search analytics:', error);
    }
  }
} 