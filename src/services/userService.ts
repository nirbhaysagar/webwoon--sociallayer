import { supabase } from './supabase';
import { User, UserProfile, UserAddress, UserPreferences } from '../types/user';

export interface CreateUserData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  username?: string;
}

export interface UpdateUserProfileData {
  first_name?: string;
  last_name?: string;
  display_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  avatar_url?: string;
  bio?: string;
  website_url?: string;
  language?: string;
  timezone?: string;
  currency?: string;
  is_public_profile?: boolean;
  allow_marketing_emails?: boolean;
  allow_notifications?: boolean;
}

export interface CreateAddressData {
  address_type: 'shipping' | 'billing' | 'both';
  is_default?: boolean;
  first_name: string;
  last_name: string;
  company?: string;
  phone?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  instructions?: string;
}

export interface UpdatePreferencesData {
  preferred_categories?: string[];
  preferred_brands?: string[];
  price_range_min?: number;
  price_range_max?: number;
  email_notifications?: any;
  push_notifications?: any;
  sms_notifications?: any;
  theme?: 'light' | 'dark';
  compact_mode?: boolean;
}

class UserService {
  // =============================================
  // AUTHENTICATION METHODS
  // =============================================

  async signUp(data: CreateUserData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.first_name,
            last_name: data.last_name,
            username: data.username,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, user: authData.user as User };
    } catch (error) {
      return { success: false, error: 'Failed to sign up' };
    }
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Update last login
      if (data.user) {
        await this.updateLastLogin(data.user.id);
      }

      return { success: true, user: data.user as User };
    } catch (error) {
      return { success: false, error: 'Failed to sign in' };
    }
  }

  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to sign out' };
    }
  }

  async getCurrentUser(): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, user: user as User };
    } catch (error) {
      return { success: false, error: 'Failed to get current user' };
    }
  }

  // =============================================
  // USER PROFILE METHODS
  // =============================================

  async getUserProfile(userId: string): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, profile: data as UserProfile };
    } catch (error) {
      return { success: false, error: 'Failed to get user profile' };
    }
  }

  async updateUserProfile(userId: string, data: UpdateUserProfileData): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, profile: profile as UserProfile };
    } catch (error) {
      return { success: false, error: 'Failed to update user profile' };
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    try {
      await supabase.rpc('update_last_login', { p_user_id: userId });
    } catch (error) {
      console.error('Failed to update last login:', error);
    }
  }

  // =============================================
  // SELLER METHODS (Integrating with existing system)
  // =============================================

  async becomeSeller(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.rpc('update_seller_status', {
        p_user_id: userId,
        p_is_seller: true,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to become seller' };
    }
  }

  async createStore(userId: string, storeData: any): Promise<{ success: boolean; storeId?: string; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('create_seller_store', {
        p_owner_id: userId,
        p_store_data: storeData,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, storeId: data };
    } catch (error) {
      return { success: false, error: 'Failed to create store' };
    }
  }

  async getUserStores(userId: string): Promise<{ success: boolean; stores?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, stores: data };
    } catch (error) {
      return { success: false, error: 'Failed to get user stores' };
    }
  }

  // =============================================
  // ADDRESS METHODS
  // =============================================

  async getUserAddresses(userId: string): Promise<{ success: boolean; addresses?: UserAddress[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, addresses: data as UserAddress[] };
    } catch (error) {
      return { success: false, error: 'Failed to get user addresses' };
    }
  }

  async createAddress(userId: string, data: CreateAddressData): Promise<{ success: boolean; address?: UserAddress; error?: string }> {
    try {
      const { data: address, error } = await supabase
        .from('user_addresses')
        .insert({
          user_id: userId,
          ...data,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, address: address as UserAddress };
    } catch (error) {
      return { success: false, error: 'Failed to create address' };
    }
  }

  async updateAddress(addressId: string, data: Partial<CreateAddressData>): Promise<{ success: boolean; address?: UserAddress; error?: string }> {
    try {
      const { data: address, error } = await supabase
        .from('user_addresses')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', addressId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, address: address as UserAddress };
    } catch (error) {
      return { success: false, error: 'Failed to update address' };
    }
  }

  async deleteAddress(addressId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete address' };
    }
  }

  // =============================================
  // PREFERENCES METHODS
  // =============================================

  async getUserPreferences(userId: string): Promise<{ success: boolean; preferences?: UserPreferences; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        return { success: false, error: error.message };
      }

      return { success: true, preferences: data as UserPreferences };
    } catch (error) {
      return { success: false, error: 'Failed to get user preferences' };
    }
  }

  async updateUserPreferences(userId: string, data: UpdatePreferencesData): Promise<{ success: boolean; preferences?: UserPreferences; error?: string }> {
    try {
      // Try to update existing preferences
      let { data: preferences, error } = await supabase
        .from('user_preferences')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      // If no preferences exist, create them
      if (error && error.code === 'PGRST116') {
        const { data: newPreferences, error: createError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: userId,
            ...data,
          })
          .select()
          .single();

        if (createError) {
          return { success: false, error: createError.message };
        }

        preferences = newPreferences;
      } else if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, preferences: preferences as UserPreferences };
    } catch (error) {
      return { success: false, error: 'Failed to update user preferences' };
    }
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  async isSeller(userId: string): Promise<{ success: boolean; isSeller: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_seller')
        .eq('id', userId)
        .single();

      if (error) {
        return { success: false, isSeller: false, error: error.message };
      }

      return { success: true, isSeller: data.is_seller };
    } catch (error) {
      return { success: false, isSeller: false, error: 'Failed to check seller status' };
    }
  }

  async getUserStats(userId: string): Promise<{ success: boolean; stats?: any; error?: string }> {
    try {
      // Get user profile
      const profileResponse = await this.getUserProfile(userId);
      if (!profileResponse.success) {
        return { success: false, error: profileResponse.error };
      }

      // Get user stores (if seller)
      const storesResponse = await this.getUserStores(userId);
      const stores = storesResponse.success ? storesResponse.stores : [];

      // Get user addresses
      const addressesResponse = await this.getUserAddresses(userId);
      const addresses = addressesResponse.success ? addressesResponse.addresses : [];

      const stats = {
        profile: profileResponse.profile,
        isSeller: profileResponse.profile?.is_seller || false,
        storeCount: stores.length,
        addressCount: addresses.length,
        lastLogin: profileResponse.profile?.last_login_at,
        accountAge: profileResponse.profile?.created_at,
      };

      return { success: true, stats };
    } catch (error) {
      return { success: false, error: 'Failed to get user stats' };
    }
  }
}

export const userService = new UserService(); 