import { supabase } from '../config/supabase';

// Types for recommendation functionality
export interface UserBehavior {
  id: number;
  user_id: number;
  product_id: number;
  behavior_type: 'view' | 'click' | 'add_to_cart' | 'purchase' | 'like' | 'share' | 'review';
  session_id?: string;
  timestamp: string;
  duration_seconds?: number;
  rating?: number;
  review_text?: string;
  metadata?: any;
}

export interface Recommendation {
  product_id: number;
  score: number;
  reason: string;
}

export interface UserPreference {
  id: number;
  user_id: number;
  category_id: number;
  preference_score: number;
  interaction_count: number;
  last_interaction: string;
}

export interface ProductSimilarity {
  id: number;
  product_id_1: number;
  product_id_2: number;
  similarity_score: number;
  similarity_type: string;
  features_compared: any;
}

export interface RecommendationFeedback {
  id: number;
  user_id: number;
  recommendation_id: number;
  feedback_type: 'click' | 'purchase' | 'dismiss' | 'report';
  feedback_score?: number;
  feedback_text?: string;
}

export interface RecommendationAnalytics {
  date: string;
  recommendation_type: string;
  total_recommendations: number;
  total_clicks: number;
  total_purchases: number;
  click_through_rate: number;
  conversion_rate: number;
  revenue_generated: number;
  avg_recommendation_score: number;
}

class RecommendationService {
  // Track user behavior
  async trackUserBehavior(params: {
    userId: number;
    productId: number;
    behaviorType: string;
    sessionId?: string;
    durationSeconds?: number;
    rating?: number;
    reviewText?: string;
    metadata?: any;
  }): Promise<number | null> {
    try {
      const { data, error } = await supabase.rpc('track_user_behavior', {
        p_user_id: params.userId,
        p_product_id: params.productId,
        p_behavior_type: params.behaviorType,
        p_session_id: params.sessionId,
        p_duration_seconds: params.durationSeconds,
        p_rating: params.rating,
        p_review_text: params.reviewText,
        p_metadata: params.metadata ? JSON.stringify(params.metadata) : null
      });

      if (error) {
        console.error('Track user behavior error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Track user behavior service error:', error);
      return null;
    }
  }

  // Get collaborative filtering recommendations
  async getCollaborativeRecommendations(userId: number, limit: number = 10): Promise<Recommendation[]> {
    try {
      const { data, error } = await supabase.rpc('get_collaborative_recommendations', {
        p_user_id: userId,
        p_limit: limit
      });

      if (error) {
        console.error('Get collaborative recommendations error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get collaborative recommendations service error:', error);
      return [];
    }
  }

  // Get content-based recommendations
  async getContentBasedRecommendations(userId: number, limit: number = 10): Promise<Recommendation[]> {
    try {
      const { data, error } = await supabase.rpc('get_content_based_recommendations', {
        p_user_id: userId,
        p_limit: limit
      });

      if (error) {
        console.error('Get content-based recommendations error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get content-based recommendations service error:', error);
      return [];
    }
  }

  // Get hybrid recommendations
  async getHybridRecommendations(userId: number, limit: number = 10): Promise<Recommendation[]> {
    try {
      const { data, error } = await supabase.rpc('get_hybrid_recommendations', {
        p_user_id: userId,
        p_limit: limit
      });

      if (error) {
        console.error('Get hybrid recommendations error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get hybrid recommendations service error:', error);
      return [];
    }
  }

  // Cache recommendations
  async cacheRecommendations(userId: number, recommendationType: string, expiresHours: number = 24): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('cache_recommendations', {
        p_user_id: userId,
        p_recommendation_type: recommendationType,
        p_expires_hours: expiresHours
      });

      if (error) {
        console.error('Cache recommendations error:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Cache recommendations service error:', error);
      return 0;
    }
  }

  // Get cached recommendations
  async getCachedRecommendations(userId: number, recommendationType: string, limit: number = 10): Promise<Recommendation[]> {
    try {
      const { data, error } = await supabase.rpc('get_cached_recommendations', {
        p_user_id: userId,
        p_recommendation_type: recommendationType,
        p_limit: limit
      });

      if (error) {
        console.error('Get cached recommendations error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get cached recommendations service error:', error);
      return [];
    }
  }

  // Calculate product similarity
  async calculateProductSimilarity(productId1: number, productId2: number): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('calculate_product_similarity', {
        p_product_id_1: productId1,
        p_product_id_2: productId2
      });

      if (error) {
        console.error('Calculate product similarity error:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Calculate product similarity service error:', error);
      return 0;
    }
  }

  // Get user preferences
  async getUserPreferences(userId: number): Promise<UserPreference[]> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .order('preference_score', { ascending: false });

      if (error) {
        console.error('Get user preferences error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get user preferences service error:', error);
      return [];
    }
  }

  // Get user behavior history
  async getUserBehaviorHistory(userId: number, limit: number = 50): Promise<UserBehavior[]> {
    try {
      const { data, error } = await supabase
        .from('user_behavior')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Get user behavior history error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get user behavior history service error:', error);
      return [];
    }
  }

  // Get product similarity matrix
  async getProductSimilarity(productId: number, limit: number = 10): Promise<ProductSimilarity[]> {
    try {
      const { data, error } = await supabase
        .from('product_similarity')
        .select('*')
        .or(`product_id_1.eq.${productId},product_id_2.eq.${productId}`)
        .order('similarity_score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Get product similarity error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get product similarity service error:', error);
      return [];
    }
  }

  // Provide feedback on recommendations
  async provideRecommendationFeedback(params: {
    userId: number;
    recommendationId: number;
    feedbackType: string;
    feedbackScore?: number;
    feedbackText?: string;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('recommendation_feedback')
        .insert({
          user_id: params.userId,
          recommendation_id: params.recommendationId,
          feedback_type: params.feedbackType,
          feedback_score: params.feedbackScore,
          feedback_text: params.feedbackText
        });

      if (error) {
        console.error('Provide recommendation feedback error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Provide recommendation feedback service error:', error);
      return false;
    }
  }

  // Get recommendation analytics
  async getRecommendationAnalytics(startDate: string, endDate: string): Promise<RecommendationAnalytics[]> {
    try {
      const { data, error } = await supabase
        .from('recommendation_analytics')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) {
        console.error('Get recommendation analytics error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get recommendation analytics service error:', error);
      return [];
    }
  }

  // Update recommendation analytics
  async updateRecommendationAnalytics(date: string, recommendationType: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('update_recommendation_analytics', {
        p_date: date,
        p_recommendation_type: recommendationType
      });

      if (error) {
        console.error('Update recommendation analytics error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Update recommendation analytics service error:', error);
      return false;
    }
  }

  // Get AI recommendation settings
  async getAIRecommendationSettings(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('ai_recommendation_settings')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Get AI recommendation settings error:', error);
        return {};
      }

      // Convert to key-value object
      const settings: any = {};
      data?.forEach(setting => {
        settings[setting.setting_name] = setting.setting_value;
      });

      return settings;
    } catch (error) {
      console.error('Get AI recommendation settings service error:', error);
      return {};
    }
  }

  // Update AI recommendation setting
  async updateAIRecommendationSetting(settingName: string, settingValue: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ai_recommendation_settings')
        .update({ setting_value: settingValue })
        .eq('setting_name', settingName);

      if (error) {
        console.error('Update AI recommendation setting error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Update AI recommendation setting service error:', error);
      return false;
    }
  }

  // Get trending products
  async getTrendingProducts(limit: number = 10): Promise<Recommendation[]> {
    try {
      const { data, error } = await supabase
        .from('user_behavior')
        .select(`
          product_id,
          COUNT(*) as interaction_count,
          AVG(CASE WHEN behavior_type = 'purchase' THEN 1 ELSE 0 END) as purchase_rate
        `)
        .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .group('product_id')
        .order('interaction_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Get trending products error:', error);
        return [];
      }

      return data?.map(item => ({
        product_id: item.product_id,
        score: item.interaction_count,
        reason: 'Trending product'
      })) || [];
    } catch (error) {
      console.error('Get trending products service error:', error);
      return [];
    }
  }

  // Get personalized recommendations (main function)
  async getPersonalizedRecommendations(userId: number, type: 'collaborative' | 'content' | 'hybrid' | 'trending' = 'hybrid', limit: number = 10): Promise<Recommendation[]> {
    try {
      // First try to get cached recommendations
      const cachedRecommendations = await this.getCachedRecommendations(userId, type, limit);
      
      if (cachedRecommendations.length >= limit) {
        return cachedRecommendations;
      }

      // If cache is empty or insufficient, generate new recommendations
      let recommendations: Recommendation[] = [];

      switch (type) {
        case 'collaborative':
          recommendations = await this.getCollaborativeRecommendations(userId, limit);
          break;
        case 'content':
          recommendations = await this.getContentBasedRecommendations(userId, limit);
          break;
        case 'hybrid':
          recommendations = await this.getHybridRecommendations(userId, limit);
          break;
        case 'trending':
          recommendations = await this.getTrendingProducts(limit);
          break;
      }

      // Cache the new recommendations
      if (recommendations.length > 0) {
        await this.cacheRecommendations(userId, type);
      }

      return recommendations;
    } catch (error) {
      console.error('Get personalized recommendations service error:', error);
      return [];
    }
  }

  // Track product view
  async trackProductView(userId: number, productId: number, sessionId?: string, durationSeconds?: number): Promise<boolean> {
    try {
      const behaviorId = await this.trackUserBehavior({
        userId,
        productId,
        behaviorType: 'view',
        sessionId,
        durationSeconds
      });

      return behaviorId !== null;
    } catch (error) {
      console.error('Track product view service error:', error);
      return false;
    }
  }

  // Track product click
  async trackProductClick(userId: number, productId: number, sessionId?: string): Promise<boolean> {
    try {
      const behaviorId = await this.trackUserBehavior({
        userId,
        productId,
        behaviorType: 'click',
        sessionId
      });

      return behaviorId !== null;
    } catch (error) {
      console.error('Track product click service error:', error);
      return false;
    }
  }

  // Track add to cart
  async trackAddToCart(userId: number, productId: number, sessionId?: string): Promise<boolean> {
    try {
      const behaviorId = await this.trackUserBehavior({
        userId,
        productId,
        behaviorType: 'add_to_cart',
        sessionId
      });

      return behaviorId !== null;
    } catch (error) {
      console.error('Track add to cart service error:', error);
      return false;
    }
  }

  // Track purchase
  async trackPurchase(userId: number, productId: number, sessionId?: string): Promise<boolean> {
    try {
      const behaviorId = await this.trackUserBehavior({
        userId,
        productId,
        behaviorType: 'purchase',
        sessionId
      });

      return behaviorId !== null;
    } catch (error) {
      console.error('Track purchase service error:', error);
      return false;
    }
  }

  // Track product like
  async trackProductLike(userId: number, productId: number, sessionId?: string): Promise<boolean> {
    try {
      const behaviorId = await this.trackUserBehavior({
        userId,
        productId,
        behaviorType: 'like',
        sessionId
      });

      return behaviorId !== null;
    } catch (error) {
      console.error('Track product like service error:', error);
      return false;
    }
  }

  // Track product review
  async trackProductReview(userId: number, productId: number, rating: number, reviewText?: string, sessionId?: string): Promise<boolean> {
    try {
      const behaviorId = await this.trackUserBehavior({
        userId,
        productId,
        behaviorType: 'review',
        sessionId,
        rating,
        reviewText
      });

      return behaviorId !== null;
    } catch (error) {
      console.error('Track product review service error:', error);
      return false;
    }
  }

  // Get recommendation insights
  async getRecommendationInsights(userId: number): Promise<any> {
    try {
      const [preferences, behaviorHistory, analytics] = await Promise.all([
        this.getUserPreferences(userId),
        this.getUserBehaviorHistory(userId, 20),
        this.getRecommendationAnalytics(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        )
      ]);

      return {
        preferences: preferences.slice(0, 5),
        recentBehavior: behaviorHistory.slice(0, 10),
        analytics: analytics[0] || null,
        totalInteractions: behaviorHistory.length,
        topCategories: preferences.slice(0, 3).map(p => p.category_id)
      };
    } catch (error) {
      console.error('Get recommendation insights service error:', error);
      return {};
    }
  }
}

export const recommendationService = new RecommendationService(); 