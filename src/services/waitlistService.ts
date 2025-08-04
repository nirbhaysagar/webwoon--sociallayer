import { supabase } from './supabase';

export interface WaitlistItem {
  id: string;
  user_id: string;
  product_id: string;
  store_id: string;
  status: 'waiting' | 'notified' | 'purchased' | 'cancelled';
  notified_at?: string;
  product_name?: string;
  product_image?: string;
  store_name?: string;
  created_at: string;
  updated_at: string;
}

export class WaitlistService {
  // Get user's waitlist
  static async getUserWaitlist(userId: string): Promise<WaitlistItem[]> {
    try {
      const { data, error } = await supabase
        .from('waitlist')
        .select(`
          *,
          products(name),
          stores(name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching waitlist:', error);
        return [];
      }

      return data?.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        product_id: item.product_id,
        store_id: item.store_id,
        status: item.status,
        notified_at: item.notified_at,
        product_name: item.products?.name,
        store_name: item.stores?.name,
        created_at: item.created_at,
        updated_at: item.updated_at,
      })) || [];
    } catch (error) {
      console.error('Error in getUserWaitlist:', error);
      return [];
    }
  }

  // Add product to waitlist
  static async addToWaitlist(userId: string, productId: string, storeId: string): Promise<boolean> {
    try {
      // Check if already in waitlist
      const { data: existing, error: checkError } = await supabase
        .from('waitlist')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing waitlist item:', checkError);
        return false;
      }

      if (existing) {
        console.log('Product already in waitlist');
        return true; // Already in waitlist
      }

      // Add to waitlist
      const { error } = await supabase
        .from('waitlist')
        .insert({
          user_id: userId,
          product_id: productId,
          store_id: storeId,
          status: 'waiting',
        });

      if (error) {
        console.error('Error adding to waitlist:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in addToWaitlist:', error);
      return false;
    }
  }

  // Remove from waitlist
  static async removeFromWaitlist(userId: string, productId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('waitlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) {
        console.error('Error removing from waitlist:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in removeFromWaitlist:', error);
      return false;
    }
  }

  // Update waitlist item status
  static async updateWaitlistStatus(waitlistId: string, status: WaitlistItem['status']): Promise<boolean> {
    try {
      const updateData: any = { status };
      
      if (status === 'notified') {
        updateData.notified_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('waitlist')
        .update(updateData)
        .eq('id', waitlistId);

      if (error) {
        console.error('Error updating waitlist status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateWaitlistStatus:', error);
      return false;
    }
  }

  // Check if product is in user's waitlist
  static async isInWaitlist(userId: string, productId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('waitlist')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking waitlist status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in isInWaitlist:', error);
      return false;
    }
  }

  // Get waitlist count for a product
  static async getProductWaitlistCount(productId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId)
        .eq('status', 'waiting');

      if (error) {
        console.error('Error getting waitlist count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getProductWaitlistCount:', error);
      return 0;
    }
  }

  // Get waitlist items for a store (for sellers)
  static async getStoreWaitlist(storeId: string): Promise<WaitlistItem[]> {
    try {
      const { data, error } = await supabase
        .from('waitlist')
        .select(`
          *,
          products(name),
          users(full_name, email)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching store waitlist:', error);
        return [];
      }

      return data?.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        product_id: item.product_id,
        store_id: item.store_id,
        status: item.status,
        notified_at: item.notified_at,
        product_name: item.products?.name,
        created_at: item.created_at,
        updated_at: item.updated_at,
      })) || [];
    } catch (error) {
      console.error('Error in getStoreWaitlist:', error);
      return [];
    }
  }

  // Notify users when product is back in stock
  static async notifyWaitlistUsers(productId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('waitlist')
        .update({
          status: 'notified',
          notified_at: new Date().toISOString(),
        })
        .eq('product_id', productId)
        .eq('status', 'waiting');

      if (error) {
        console.error('Error notifying waitlist users:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in notifyWaitlistUsers:', error);
      return false;
    }
  }
} 