import { supabase } from '../config/supabase';

export interface FollowedSeller {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  followers: number;
  products: number;
  isVerified: boolean;
  lastActive: string;
  followedAt: string;
}

class FollowService {
  private static instance: FollowService;

  private constructor() {}

  public static getInstance(): FollowService {
    if (!FollowService.instance) {
      FollowService.instance = new FollowService();
    }
    return FollowService.instance;
  }

  // Follow a seller
  async followSeller(sellerId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: sellerId,
        });

      if (error) {
        console.error('Error following seller:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Follow service error:', error);
      return false;
    }
  }

  // Unfollow a seller
  async unfollowSeller(sellerId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', sellerId);

      if (error) {
        console.error('Error unfollowing seller:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unfollow service error:', error);
      return false;
    }
  }

  // Check if user is following a seller
  async isFollowing(sellerId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return false;
      }

      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', sellerId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking follow status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Is following service error:', error);
      return false;
    }
  }

  // Get user's followed sellers
  async getFollowedSellers(): Promise<FollowedSeller[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('user_following')
        .select(`
          following_id,
          following_name,
          following_username,
          following_avatar,
          following_verified,
          following_bio,
          followed_at
        `)
        .eq('follower_id', user.id)
        .order('followed_at', { ascending: false });

      if (error) {
        console.error('Error getting followed sellers:', error);
        return [];
      }

      // Transform data to match interface
      return data.map(item => ({
        id: item.following_id,
        name: item.following_name,
        username: item.following_username,
        avatar: item.following_avatar,
        bio: item.following_bio,
        isVerified: item.following_verified,
        followers: 0, // This would need to be fetched separately
        products: 0, // This would need to be fetched separately
        lastActive: '2 hours ago', // This would need to be calculated
        followedAt: item.followed_at,
      }));
    } catch (error) {
      console.error('Get followed sellers service error:', error);
      return [];
    }
  }

  // Get seller's followers count
  async getFollowersCount(sellerId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id', { count: 'exact' })
        .eq('following_id', sellerId);

      if (error) {
        console.error('Error getting followers count:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Get followers count service error:', error);
      return 0;
    }
  }

  // Get seller's following count
  async getFollowingCount(sellerId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id', { count: 'exact' })
        .eq('follower_id', sellerId);

      if (error) {
        console.error('Error getting following count:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Get following count service error:', error);
      return 0;
    }
  }

  // Get seller's followers (for seller profile)
  async getSellerFollowers(sellerId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_followers')
        .select(`
          follower_id,
          follower_name,
          follower_username,
          follower_avatar,
          follower_verified,
          follower_bio,
          followed_at
        `)
        .eq('following_id', sellerId)
        .order('followed_at', { ascending: false });

      if (error) {
        console.error('Error getting seller followers:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Get seller followers service error:', error);
      return [];
    }
  }

  // Get seller's following (for seller profile)
  async getSellerFollowing(sellerId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_following')
        .select(`
          following_id,
          following_name,
          following_username,
          following_avatar,
          following_verified,
          following_bio,
          followed_at
        `)
        .eq('follower_id', sellerId)
        .order('followed_at', { ascending: false });

      if (error) {
        console.error('Error getting seller following:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Get seller following service error:', error);
      return [];
    }
  }

  // Search sellers to follow
  async searchSellers(query: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          username,
          avatar_url,
          bio,
          is_verified
        `)
        .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
        .eq('role', 'seller')
        .limit(20);

      if (error) {
        console.error('Error searching sellers:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Search sellers service error:', error);
      return [];
    }
  }

  // Get suggested sellers to follow
  async getSuggestedSellers(): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return [];
      }

      // Get sellers that the user is not following
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          username,
          avatar_url,
          bio,
          is_verified
        `)
        .eq('role', 'seller')
        .neq('id', user.id)
        .limit(10);

      if (error) {
        console.error('Error getting suggested sellers:', error);
        return [];
      }

      // Filter out already followed sellers
      const followedSellers = await this.getFollowedSellers();
      const followedIds = followedSellers.map(seller => seller.id);
      
      return data.filter(seller => !followedIds.includes(seller.id));
    } catch (error) {
      console.error('Get suggested sellers service error:', error);
      return [];
    }
  }
}

export default FollowService.getInstance(); 