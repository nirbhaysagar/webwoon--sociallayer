import { supabase } from '../config/supabase';

// Types for cart recovery functionality
export interface AbandonedCart {
  id: number;
  user_id: number;
  session_id: string;
  cart_data: any;
  total_amount: number;
  item_count: number;
  abandoned_at: string;
  recovery_status: 'pending' | 'recovered' | 'failed' | 'expired';
  recovery_revenue: number;
  created_at: string;
}

export interface RecoveryCampaign {
  id: number;
  name: string;
  description: string;
  campaign_type: 'email' | 'sms' | 'push' | 'multi_channel';
  is_active: boolean;
  ai_optimization_enabled: boolean;
  created_at: string;
}

export interface RecoveryAttempt {
  id: number;
  cart_id: number;
  campaign_id: number;
  attempt_number: number;
  channel: 'email' | 'sms' | 'push' | 'webhook';
  message_template_id: number;
  personalized_content: any;
  sent_at: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  conversion_at?: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'converted' | 'failed';
  revenue_generated: number;
}

export interface PersonalizedOffer {
  id: number;
  cart_id: number;
  offer_type: 'discount' | 'free_shipping' | 'gift_card' | 'bundle';
  offer_value: number;
  offer_percentage?: number;
  offer_code: string;
  offer_description: string;
  ai_generated: boolean;
  conversion_rate: number;
  revenue_impact: number;
  is_active: boolean;
  expires_at?: string;
}

export interface RecoveryAnalytics {
  date: string;
  total_attempts: number;
  total_converted: number;
  conversion_rate: number;
  total_revenue: number;
  avg_revenue_per_conversion: number;
}

export interface AITimingOptimization {
  id: number;
  user_id: number;
  user_segment: string;
  optimal_send_time: string;
  timezone: string;
  day_of_week: number;
  success_rate: number;
  sample_size: number;
}

class CartRecoveryService {
  // Detect abandoned carts
  async detectAbandonedCarts(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('detect_abandoned_carts');
      
      if (error) {
        console.error('Detect abandoned carts error:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Detect abandoned carts service error:', error);
      return 0;
    }
  }

  // Get abandoned carts for a user
  async getUserAbandonedCarts(userId: number): Promise<AbandonedCart[]> {
    try {
      const { data, error } = await supabase
        .from('abandoned_carts')
        .select('*')
        .eq('user_id', userId)
        .order('abandoned_at', { ascending: false });

      if (error) {
        console.error('Get user abandoned carts error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get user abandoned carts service error:', error);
      return [];
    }
  }

  // Get all abandoned carts (admin)
  async getAllAbandonedCarts(limit: number = 50): Promise<AbandonedCart[]> {
    try {
      const { data, error } = await supabase
        .from('abandoned_carts')
        .select('*')
        .order('abandoned_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Get all abandoned carts error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get all abandoned carts service error:', error);
      return [];
    }
  }

  // Get recovery campaigns
  async getRecoveryCampaigns(): Promise<RecoveryCampaign[]> {
    try {
      const { data, error } = await supabase
        .from('cart_recovery_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get recovery campaigns error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get recovery campaigns service error:', error);
      return [];
    }
  }

  // Create recovery campaign
  async createRecoveryCampaign(campaign: {
    name: string;
    description: string;
    campaign_type: string;
    ai_optimization_enabled?: boolean;
  }): Promise<RecoveryCampaign | null> {
    try {
      const { data, error } = await supabase
        .from('cart_recovery_campaigns')
        .insert({
          name: campaign.name,
          description: campaign.description,
          campaign_type: campaign.campaign_type,
          ai_optimization_enabled: campaign.ai_optimization_enabled ?? true
        })
        .select()
        .single();

      if (error) {
        console.error('Create recovery campaign error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Create recovery campaign service error:', error);
      return null;
    }
  }

  // Send recovery attempt
  async sendRecoveryAttempt(params: {
    cartId: number;
    campaignId: number;
    channel: string;
    templateId: number;
  }): Promise<number | null> {
    try {
      const { data, error } = await supabase.rpc('send_recovery_attempt', {
        p_cart_id: params.cartId,
        p_campaign_id: params.campaignId,
        p_channel: params.channel,
        p_template_id: params.templateId
      });

      if (error) {
        console.error('Send recovery attempt error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Send recovery attempt service error:', error);
      return null;
    }
  }

  // Track recovery conversion
  async trackRecoveryConversion(attemptId: number, revenue: number): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('track_recovery_conversion', {
        p_attempt_id: attemptId,
        p_revenue: revenue
      });

      if (error) {
        console.error('Track recovery conversion error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Track recovery conversion service error:', error);
      return false;
    }
  }

  // Get personalized offer for cart
  async getPersonalizedOffer(cartId: number): Promise<PersonalizedOffer | null> {
    try {
      const { data, error } = await supabase
        .from('personalized_offers')
        .select('*')
        .eq('cart_id', cartId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Get personalized offer error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Get personalized offer service error:', error);
      return null;
    }
  }

  // Generate personalized offer
  async generatePersonalizedOffer(cartId: number): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('generate_personalized_offer', {
        p_cart_id: cartId
      });

      if (error) {
        console.error('Generate personalized offer error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Generate personalized offer service error:', error);
      return null;
    }
  }

  // Get optimal send time for user
  async getOptimalSendTime(userId: number): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('get_optimal_send_time', {
        p_user_id: userId
      });

      if (error) {
        console.error('Get optimal send time error:', error);
        return '10:00:00'; // Default time
      }

      return data || '10:00:00';
    } catch (error) {
      console.error('Get optimal send time service error:', error);
      return '10:00:00';
    }
  }

  // Get recovery analytics
  async getRecoveryAnalytics(startDate: string, endDate: string): Promise<RecoveryAnalytics[]> {
    try {
      const { data, error } = await supabase.rpc('get_recovery_analytics', {
        p_start_date: startDate,
        p_end_date: endDate
      });

      if (error) {
        console.error('Get recovery analytics error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get recovery analytics service error:', error);
      return [];
    }
  }

  // Get recovery attempts for cart
  async getRecoveryAttempts(cartId: number): Promise<RecoveryAttempt[]> {
    try {
      const { data, error } = await supabase
        .from('recovery_attempts')
        .select('*')
        .eq('cart_id', cartId)
        .order('sent_at', { ascending: false });

      if (error) {
        console.error('Get recovery attempts error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get recovery attempts service error:', error);
      return [];
    }
  }

  // Update recovery attempt status
  async updateRecoveryAttemptStatus(
    attemptId: number,
    status: string,
    additionalData?: any
  ): Promise<boolean> {
    try {
      const updateData: any = { status };
      
      if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      } else if (status === 'opened') {
        updateData.opened_at = new Date().toISOString();
      } else if (status === 'clicked') {
        updateData.clicked_at = new Date().toISOString();
      } else if (status === 'converted') {
        updateData.conversion_at = new Date().toISOString();
        if (additionalData?.revenue) {
          updateData.revenue_generated = additionalData.revenue;
        }
      }

      const { error } = await supabase
        .from('recovery_attempts')
        .update(updateData)
        .eq('id', attemptId);

      if (error) {
        console.error('Update recovery attempt status error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Update recovery attempt status service error:', error);
      return false;
    }
  }

  // Get AI timing optimization for user
  async getAITimingOptimization(userId: number): Promise<AITimingOptimization | null> {
    try {
      const { data, error } = await supabase
        .from('ai_timing_optimization')
        .select('*')
        .eq('user_id', userId)
        .order('success_rate', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Get AI timing optimization error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Get AI timing optimization service error:', error);
      return null;
    }
  }

  // Update AI timing optimization
  async updateAITimingOptimization(optimization: {
    user_id: number;
    optimal_send_time: string;
    timezone: string;
    day_of_week: number;
    success_rate: number;
    sample_size: number;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ai_timing_optimization')
        .upsert({
          user_id: optimization.user_id,
          optimal_send_time: optimization.optimal_send_time,
          timezone: optimization.timezone,
          day_of_week: optimization.day_of_week,
          success_rate: optimization.success_rate,
          sample_size: optimization.sample_size,
          last_updated: new Date().toISOString()
        });

      if (error) {
        console.error('Update AI timing optimization error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Update AI timing optimization service error:', error);
      return false;
    }
  }

  // Get recovery performance metrics
  async getRecoveryPerformance(cartId: number): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('recovery_performance')
        .select('*')
        .eq('cart_id', cartId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Get recovery performance error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Get recovery performance service error:', error);
      return null;
    }
  }

  // Update recovery performance
  async updateRecoveryPerformance(performance: {
    cart_id: number;
    attempt_id: number;
    performance_metrics: any;
    ai_score: number;
    predicted_conversion: boolean;
    actual_conversion: boolean;
    revenue_prediction: number;
    actual_revenue: number;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('recovery_performance')
        .insert(performance);

      if (error) {
        console.error('Update recovery performance error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Update recovery performance service error:', error);
      return false;
    }
  }

  // Get AI recovery settings
  async getAIRecoverySettings(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('ai_recovery_settings')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Get AI recovery settings error:', error);
        return {};
      }

      // Convert to key-value object
      const settings: any = {};
      data?.forEach(setting => {
        settings[setting.setting_name] = setting.setting_value;
      });

      return settings;
    } catch (error) {
      console.error('Get AI recovery settings service error:', error);
      return {};
    }
  }

  // Update AI recovery setting
  async updateAIRecoverySetting(settingName: string, settingValue: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ai_recovery_settings')
        .update({ setting_value: settingValue })
        .eq('setting_name', settingName);

      if (error) {
        console.error('Update AI recovery setting error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Update AI recovery setting service error:', error);
      return false;
    }
  }

  // Get recovery templates
  async getRecoveryTemplates(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('recovery_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get recovery templates error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get recovery templates service error:', error);
      return [];
    }
  }

  // Create recovery template
  async createRecoveryTemplate(template: {
    name: string;
    template_type: string;
    subject_line?: string;
    content: string;
    variables: any;
  }): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('recovery_templates')
        .insert(template)
        .select()
        .single();

      if (error) {
        console.error('Create recovery template error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Create recovery template service error:', error);
      return null;
    }
  }

  // Process abandoned cart recovery (main function)
  async processAbandonedCartRecovery(): Promise<{
    detected: number;
    processed: number;
    revenue: number;
  }> {
    try {
      // 1. Detect new abandoned carts
      const detectedCount = await this.detectAbandonedCarts();
      
      // 2. Get AI settings
      const settings = await this.getAIRecoverySettings();
      
      // 3. Get active campaigns
      const campaigns = await this.getRecoveryCampaigns();
      const activeCampaigns = campaigns.filter(c => c.is_active);
      
      // 4. Get recent abandoned carts
      const abandonedCarts = await this.getAllAbandonedCarts(100);
      const pendingCarts = abandonedCarts.filter(c => c.recovery_status === 'pending');
      
      let processedCount = 0;
      let totalRevenue = 0;

      // 5. Process each pending cart
      for (const cart of pendingCarts) {
        const attempts = await this.getRecoveryAttempts(cart.id);
        
        // Check if we should send another attempt
        const maxAttempts = settings.timing_optimization?.max_attempts || 3;
        if (attempts.length < maxAttempts) {
          // Get optimal send time
          const optimalTime = await this.getOptimalSendTime(cart.user_id);
          
          // Check if it's time to send
          const now = new Date();
          const optimalDateTime = new Date();
          const [hours, minutes] = optimalTime.split(':');
          optimalDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          
          const timeDiff = Math.abs(now.getTime() - optimalDateTime.getTime()) / (1000 * 60 * 60);
          
          if (timeDiff < 1) { // Within 1 hour of optimal time
            // Send recovery attempt
            const attemptId = await this.sendRecoveryAttempt({
              cartId: cart.id,
              campaignId: activeCampaigns[0]?.id || 1,
              channel: 'email',
              templateId: 1
            });
            
            if (attemptId) {
              processedCount++;
            }
          }
        }
      }

      return {
        detected: detectedCount,
        processed: processedCount,
        revenue: totalRevenue
      };
    } catch (error) {
      console.error('Process abandoned cart recovery error:', error);
      return { detected: 0, processed: 0, revenue: 0 };
    }
  }
}

export const cartRecoveryService = new CartRecoveryService(); 