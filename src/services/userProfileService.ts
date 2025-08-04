import { supabase } from '../config/supabase';
import { Platform } from 'react-native';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  phone: string;
  avatar_url: string;
  bio: string;
  website: string;
  location: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'non-binary' | 'prefer_not_to_say';
  interests: string[];
  social_media: Record<string, string>;
  preferences: Record<string, any>;
  role: 'user' | 'seller' | 'admin';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShippingAddress {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  address_type: 'home' | 'work' | 'other';
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdateData {
  full_name?: string;
  username?: string;
  bio?: string;
  website?: string;
  location?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer_not_to_say';
  interests?: string[];
  social_media?: Record<string, string>;
  avatar_url?: string;
}

export interface EmailChangeRequest {
  old_email: string;
  new_email: string;
  verification_token: string;
  expires_at: string;
  is_verified: boolean;
}

export interface PhoneVerificationCode {
  phone_number: string;
  verification_code: string;
  expires_at: string;
  is_used: boolean;
}

class UserProfileService {
  private static instance: UserProfileService;

  private constructor() {}

  public static getInstance(): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService();
    }
    return UserProfileService.instance;
  }

  // =============================================
  // PROFILE MANAGEMENT
  // =============================================

  // Get current user profile
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Update user profile
  async updateProfile(profileData: ProfileUpdateData): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate username if provided
      if (profileData.username) {
        const isAvailable = await this.isUsernameAvailable(profileData.username, user.id);
        if (!isAvailable) {
          throw new Error('Username is already taken');
        }
      }

      const { error } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }

  // Check if username is available
  async isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('users')
        .select('id')
        .eq('username', username);

      if (excludeUserId) {
        query = query.neq('id', excludeUserId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return !data || data.length === 0;
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  }

  // Upload profile image
  async uploadProfileImage(imageUri: string): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Convert image to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Generate unique filename
      const fileExt = imageUri.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      return null;
    }
  }

  // =============================================
  // EMAIL MANAGEMENT
  // =============================================

  // Request email change
  async requestEmailChange(newEmail: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if email is available
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', newEmail)
        .single();

      if (existingUser) {
        throw new Error('Email is already in use');
      }

      // Generate verification token
      const verificationToken = this.generateVerificationToken();

      // Create email change request
      const { error } = await supabase
        .from('email_change_requests')
        .insert({
          user_id: user.id,
          old_email: user.email,
          new_email: newEmail,
          verification_token: verificationToken,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        });

      if (error) throw error;

      // TODO: Send verification email
      console.log('Verification token:', verificationToken);

      return true;
    } catch (error) {
      console.error('Error requesting email change:', error);
      return false;
    }
  }

  // Verify email change
  async verifyEmailChange(token: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Find email change request
      const { data: request, error: findError } = await supabase
        .from('email_change_requests')
        .select('*')
        .eq('verification_token', token)
        .eq('user_id', user.id)
        .eq('is_verified', false)
        .single();

      if (findError || !request) {
        throw new Error('Invalid or expired verification token');
      }

      if (new Date(request.expires_at) < new Date()) {
        throw new Error('Verification token has expired');
      }

      // Update user email in auth
      const { error: authError } = await supabase.auth.updateUser({
        email: request.new_email
      });

      if (authError) throw authError;

      // Update user profile
      const { error: profileError } = await supabase
        .from('users')
        .update({ email: request.new_email })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Mark request as verified
      const { error: updateError } = await supabase
        .from('email_change_requests')
        .update({ is_verified: true })
        .eq('id', request.id);

      if (updateError) throw updateError;

      return true;
    } catch (error) {
      console.error('Error verifying email change:', error);
      return false;
    }
  }

  // =============================================
  // PASSWORD MANAGEMENT
  // =============================================

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      return false;
    }
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'socialspark://reset-password'
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error requesting password reset:', error);
      return false;
    }
  }

  // =============================================
  // PHONE VERIFICATION
  // =============================================

  // Send phone verification code
  async sendPhoneVerificationCode(phoneNumber: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Generate verification code
      const verificationCode = this.generateVerificationCode();

      // Store verification code
      const { error } = await supabase
        .from('phone_verification_codes')
        .insert({
          user_id: user.id,
          phone_number: phoneNumber,
          verification_code: verificationCode,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        });

      if (error) throw error;

      // TODO: Integrate with SMS service (Twilio, etc.)
      console.log('Verification code:', verificationCode);

      return true;
    } catch (error) {
      console.error('Error sending phone verification code:', error);
      return false;
    }
  }

  // Verify phone number
  async verifyPhoneNumber(phoneNumber: string, verificationCode: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Find verification code
      const { data: code, error: findError } = await supabase
        .from('phone_verification_codes')
        .select('*')
        .eq('user_id', user.id)
        .eq('phone_number', phoneNumber)
        .eq('verification_code', verificationCode)
        .eq('is_used', false)
        .single();

      if (findError || !code) {
        throw new Error('Invalid verification code');
      }

      if (new Date(code.expires_at) < new Date()) {
        throw new Error('Verification code has expired');
      }

      // Update user phone number
      const { error: updateError } = await supabase
        .from('users')
        .update({ phone: phoneNumber })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Mark code as used
      const { error: markError } = await supabase
        .from('phone_verification_codes')
        .update({ is_used: true })
        .eq('id', code.id);

      if (markError) throw markError;

      return true;
    } catch (error) {
      console.error('Error verifying phone number:', error);
      return false;
    }
  }

  // =============================================
  // SHIPPING ADDRESSES
  // =============================================

  // Get user's shipping addresses
  async getShippingAddresses(): Promise<ShippingAddress[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting shipping addresses:', error);
      return [];
    }
  }

  // Get default shipping address
  async getDefaultShippingAddress(): Promise<ShippingAddress | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting default shipping address:', error);
      return null;
    }
  }

  // Add shipping address
  async addShippingAddress(addressData: Omit<ShippingAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ShippingAddress | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('shipping_addresses')
        .insert({
          ...addressData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding shipping address:', error);
      return null;
    }
  }

  // Update shipping address
  async updateShippingAddress(addressId: string, addressData: Partial<ShippingAddress>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('shipping_addresses')
        .update(addressData)
        .eq('id', addressId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating shipping address:', error);
      return false;
    }
  }

  // Delete shipping address
  async deleteShippingAddress(addressId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('shipping_addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting shipping address:', error);
      return false;
    }
  }

  // Set default shipping address
  async setDefaultShippingAddress(addressId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // First, remove default from all addresses
      const { error: clearError } = await supabase
        .from('shipping_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      if (clearError) throw clearError;

      // Set new default
      const { error } = await supabase
        .from('shipping_addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error setting default shipping address:', error);
      return false;
    }
  }

  // =============================================
  // UTILITY FUNCTIONS
  // =============================================

  private generateVerificationToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Get user profile history
  async getProfileHistory(): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_profile_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting profile history:', error);
      return [];
    }
  }

  // Clean up expired tokens (called periodically)
  async cleanupExpiredTokens(): Promise<void> {
    try {
      // This would typically be done by a cron job on the server
      // For now, we'll just log that it should be done
      console.log('Cleaning up expired tokens...');
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
    }
  }
}

export default UserProfileService.getInstance(); 