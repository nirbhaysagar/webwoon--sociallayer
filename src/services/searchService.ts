import { supabase } from '../config/supabase';

// Types for search functionality
export interface SearchResult {
  content_id: number;
  content_type: string;
  title: string;
  description: string;
  relevance_score: number;
  popularity_score: number;
  final_score: number;
}

export interface SearchSuggestion {
  suggestion: string;
  suggestion_type: string;
  search_count: number;
}

export interface SearchHistory {
  id: number;
  user_id: number;
  search_query: string;
  search_type: string;
  filters: any;
  results_count: number;
  search_duration_ms: number;
  clicked_result_id?: number;
  clicked_result_type?: string;
  created_at: string;
}

export interface SavedSearch {
  id: number;
  user_id: number;
  name: string;
  search_query: string;
  search_type: string;
  filters: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SearchAnalytics {
  id: number;
  date: string;
  search_type: string;
  total_searches: number;
  unique_searches: number;
  avg_results_count: number;
  avg_search_duration_ms: number;
  top_queries: any[];
  top_filters: any[];
}

export interface SearchFilters {
  category?: string;
  price_min?: number;
  price_max?: number;
  rating?: number;
  brand?: string;
  availability?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

class SearchService {
  // Perform full-text search
  async performSearch(
    query: string,
    searchType: 'product' | 'seller' | 'content' = 'product',
    filters?: SearchFilters,
    limit: number = 20,
    offset: number = 0
  ): Promise<SearchResult[]> {
    try {
      const startTime = Date.now();
      
      // Call the database function for search
      const { data, error } = await supabase.rpc('perform_search', {
        p_query: query,
        p_search_type: searchType,
        p_filters: filters ? JSON.stringify(filters) : null,
        p_limit: limit,
        p_offset: offset
      });

      if (error) {
        console.error('Search error:', error);
        return [];
      }

      const searchDuration = Date.now() - startTime;

      // Log search history
      await this.logSearchHistory({
        query,
        searchType,
        filters,
        resultsCount: data?.length || 0,
        searchDurationMs: searchDuration
      });

      return data || [];
    } catch (error) {
      console.error('Search service error:', error);
      return [];
    }
  }

  // Get search suggestions
  async getSearchSuggestions(query: string, limit: number = 10): Promise<SearchSuggestion[]> {
    try {
      const { data, error } = await supabase.rpc('get_search_suggestions', {
        p_query: query,
        p_limit: limit
      });

      if (error) {
        console.error('Search suggestions error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Search suggestions service error:', error);
      return [];
    }
  }

  // Get trending searches
  async getTrendingSearches(limit: number = 10): Promise<SearchSuggestion[]> {
    try {
      const { data, error } = await supabase
        .from('search_suggestions')
        .select('*')
        .eq('suggestion_type', 'trending')
        .order('search_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Trending searches error:', error);
        return [];
      }

      return data?.map(item => ({
        suggestion: item.query,
        suggestion_type: item.suggestion_type,
        search_count: item.search_count
      })) || [];
    } catch (error) {
      console.error('Trending searches service error:', error);
      return [];
    }
  }

  // Get popular searches
  async getPopularSearches(limit: number = 10): Promise<SearchSuggestion[]> {
    try {
      const { data, error } = await supabase
        .from('search_suggestions')
        .select('*')
        .eq('suggestion_type', 'popular')
        .order('search_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Popular searches error:', error);
        return [];
      }

      return data?.map(item => ({
        suggestion: item.query,
        suggestion_type: item.suggestion_type,
        search_count: item.search_count
      })) || [];
    } catch (error) {
      console.error('Popular searches service error:', error);
      return [];
    }
  }

  // Log search history
  async logSearchHistory(params: {
    query: string;
    searchType: string;
    filters?: any;
    resultsCount: number;
    searchDurationMs: number;
    clickedResultId?: number;
    clickedResultType?: string;
  }): Promise<void> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      await supabase.rpc('log_search_history', {
        p_user_id: user.data.user.id,
        p_query: params.query,
        p_search_type: params.searchType,
        p_filters: params.filters ? JSON.stringify(params.filters) : null,
        p_results_count: params.resultsCount,
        p_duration_ms: params.searchDurationMs,
        p_clicked_result_id: params.clickedResultId || null,
        p_clicked_result_type: params.clickedResultType || null
      });
    } catch (error) {
      console.error('Log search history error:', error);
    }
  }

  // Get user search history
  async getUserSearchHistory(limit: number = 20): Promise<SearchHistory[]> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return [];

      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', user.data.user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Get search history error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get search history service error:', error);
      return [];
    }
  }

  // Save search
  async saveSearch(params: {
    name: string;
    query: string;
    searchType: string;
    filters?: any;
  }): Promise<SavedSearch | null> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return null;

      const { data, error } = await supabase
        .from('saved_searches')
        .insert({
          user_id: user.data.user.id,
          name: params.name,
          search_query: params.query,
          search_type: params.searchType,
          filters: params.filters ? JSON.stringify(params.filters) : null
        })
        .select()
        .single();

      if (error) {
        console.error('Save search error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Save search service error:', error);
      return null;
    }
  }

  // Get user saved searches
  async getSavedSearches(): Promise<SavedSearch[]> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return [];

      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.data.user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get saved searches error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get saved searches service error:', error);
      return [];
    }
  }

  // Delete saved search
  async deleteSavedSearch(searchId: number): Promise<boolean> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return false;

      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', searchId)
        .eq('user_id', user.data.user.id);

      if (error) {
        console.error('Delete saved search error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete saved search service error:', error);
      return false;
    }
  }

  // Update search ranking weights (admin only)
  async updateSearchRankingWeights(
    searchType: string,
    weightName: string,
    weightValue: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('search_ranking_weights')
        .update({ weight_value: weightValue })
        .eq('search_type', searchType)
        .eq('weight_name', weightName);

      if (error) {
        console.error('Update ranking weights error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Update ranking weights service error:', error);
      return false;
    }
  }

  // Get search analytics (admin only)
  async getSearchAnalytics(
    date: string,
    searchType?: string
  ): Promise<SearchAnalytics[]> {
    try {
      let query = supabase
        .from('search_analytics')
        .select('*')
        .eq('date', date);

      if (searchType) {
        query = query.eq('search_type', searchType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Get search analytics error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get search analytics service error:', error);
      return [];
    }
  }

  // Update search index for a product
  async updateProductSearchIndex(productId: number, productData: {
    title: string;
    description: string;
    tags?: string[];
    categories?: string[];
    popularityScore?: number;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('search_index')
        .upsert({
          content_type: 'product',
          content_id: productId,
          title: productData.title,
          description: productData.description,
          tags: productData.tags || [],
          categories: productData.categories || [],
          popularity_score: productData.popularityScore || 0
        });

      if (error) {
        console.error('Update product search index error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Update product search index service error:', error);
      return false;
    }
  }

  // Update search index for a seller
  async updateSellerSearchIndex(sellerId: number, sellerData: {
    name: string;
    description: string;
    tags?: string[];
    categories?: string[];
    popularityScore?: number;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('search_index')
        .upsert({
          content_type: 'seller',
          content_id: sellerId,
          title: sellerData.name,
          description: sellerData.description,
          tags: sellerData.tags || [],
          categories: sellerData.categories || [],
          popularity_score: sellerData.popularityScore || 0
        });

      if (error) {
        console.error('Update seller search index error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Update seller search index service error:', error);
      return false;
    }
  }

  // Search with filters
  async searchWithFilters(
    query: string,
    filters: SearchFilters,
    searchType: 'product' | 'seller' | 'content' = 'product',
    limit: number = 20,
    offset: number = 0
  ): Promise<SearchResult[]> {
    try {
      const startTime = Date.now();
      
      // Build filter object
      const filterObject: any = {};
      if (filters.category) filterObject.category = filters.category;
      if (filters.price_min) filterObject.price_min = filters.price_min;
      if (filters.price_max) filterObject.price_max = filters.price_max;
      if (filters.rating) filterObject.rating = filters.rating;
      if (filters.brand) filterObject.brand = filters.brand;
      if (filters.availability) filterObject.availability = filters.availability;
      if (filters.sort_by) filterObject.sort_by = filters.sort_by;
      if (filters.sort_order) filterObject.sort_order = filters.sort_order;

      const { data, error } = await supabase.rpc('perform_search', {
        p_query: query,
        p_search_type: searchType,
        p_filters: JSON.stringify(filterObject),
        p_limit: limit,
        p_offset: offset
      });

      if (error) {
        console.error('Search with filters error:', error);
        return [];
      }

      const searchDuration = Date.now() - startTime;

      // Log search history
      await this.logSearchHistory({
        query,
        searchType,
        filters: filterObject,
        resultsCount: data?.length || 0,
        searchDurationMs: searchDuration
      });

      return data || [];
    } catch (error) {
      console.error('Search with filters service error:', error);
      return [];
    }
  }

  // Get search suggestions based on user history
  async getPersonalizedSuggestions(limit: number = 10): Promise<SearchSuggestion[]> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return [];

      // Get user's recent search history
      const { data: history, error: historyError } = await supabase
        .from('search_history')
        .select('search_query')
        .eq('user_id', user.data.user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (historyError || !history?.length) {
        return [];
      }

      // Get suggestions based on user's search patterns
      const suggestions: SearchSuggestion[] = [];
      for (const item of history) {
        const { data: related } = await supabase
          .from('search_suggestions')
          .select('*')
          .ilike('query', `%${item.search_query}%`)
          .limit(3);

        if (related) {
          suggestions.push(...related.map(s => ({
            suggestion: s.query,
            suggestion_type: 'personalized',
            search_count: s.search_count
          })));
        }
      }

      return suggestions.slice(0, limit);
    } catch (error) {
      console.error('Get personalized suggestions service error:', error);
      return [];
    }
  }
}

export const searchService = new SearchService(); 