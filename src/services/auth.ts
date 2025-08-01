import { supabase } from './supabase';
import { User, Session, AuthError } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  role: 'user' | 'seller' | 'admin';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  preferences: {
    notifications: {
      orders: boolean;
      promotions: boolean;
      products: boolean;
      messages: boolean;
      system: boolean;
      marketing: boolean;
    };
    privacy: {
      profile_visible: boolean;
      show_email: boolean;
      show_phone: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
  stats: {
    total_orders: number;
    total_spent: number;
    member_since: string;
    level: 'bronze' | 'silver' | 'gold' | 'platinum';
    points: number;
  };
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  username?: string;
  role: 'user' | 'seller';
  phone?: string;
  date_of_birth?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  full_name?: string;
  username?: string;
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
}

class AuthService {
  private currentUser: User | null = null;
  private currentProfile: UserProfile | null = null;
  private currentSession: Session | null = null;

  // Initialize auth service
  async initialize(): Promise<AuthState> {
    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return this.getAuthState();
      }

      if (session) {
        console.log('🔐 Found existing session:', session.user.email);
        this.currentSession = session;
        this.currentUser = session.user;
        
        // Get user profile
        const profile = await this.getUserProfile(session.user.id);
        this.currentProfile = profile;
        
        console.log('🔐 Session restored successfully');
      } else {
        console.log('🔐 No existing session found');
      }

      return this.getAuthState();
    } catch (error) {
      console.error('Error initializing auth service:', error);
      return this.getAuthState();
    }
  }

  // Sign up user
  async signUp(data: SignUpData): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      // Check if username is available (if provided)
      if (data.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('username', data.username)
          .single();

        if (existingUser) {
          return { success: false, error: 'Username already taken' };
        }
      }

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            role: data.role,
          },
        },
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (authData.user) {
        // Create user profile
        const profileData: Partial<UserProfile> = {
          id: authData.user.id,
          email: data.email,
          full_name: data.full_name,
          username: data.username,
          phone: data.phone,
          date_of_birth: data.date_of_birth,
          gender: data.gender,
          role: data.role,
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          preferences: {
            notifications: {
              orders: true,
              promotions: true,
              products: true,
              messages: true,
              system: true,
              marketing: false,
            },
            privacy: {
              profile_visible: true,
              show_email: false,
              show_phone: false,
            },
            theme: 'auto',
            language: 'en',
          },
          stats: {
            total_orders: 0,
            total_spent: 0,
            member_since: new Date().toISOString(),
            level: 'bronze',
            points: 0,
          },
        };

        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert(profileData);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Don't fail signup if profile creation fails
        }

        // Update internal state immediately
        this.currentUser = authData.user;
        this.currentSession = authData.session;
        
        // Get the created profile
        const profile = await this.getUserProfile(authData.user.id);
        this.currentProfile = profile;

        return { success: true, user: authData.user };
      }

      return { success: false, error: 'Failed to create user account' };
    } catch (error) {
      console.error('Error in signUp:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Sign in user
  async signIn(data: SignInData): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (authData.user) {
        // Update internal state immediately
        this.currentUser = authData.user;
        this.currentSession = authData.session;
        
        // Get user profile
        const profile = await this.getUserProfile(authData.user.id);
        this.currentProfile = profile;

        return { success: true, user: authData.user };
      }

      return { success: false, error: 'Failed to sign in' };
    } catch (error) {
      console.error('Error in signIn:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Sign out user
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error: error.message };
      }

      // Clear local state
      this.currentUser = null;
      this.currentProfile = null;
      this.currentSession = null;

      return { success: true };
    } catch (error) {
      console.error('Error in signOut:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error getting user profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  }

  // Update user profile
  async updateProfile(userId: string, data: UpdateProfileData): Promise<{ success: boolean; error?: string; profile?: UserProfile }> {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Update local state
      this.currentProfile = data as UserProfile;

      return { success: true, profile: data as UserProfile };
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Update user preferences
  async updatePreferences(userId: string, preferences: Partial<UserProfile['preferences']>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          preferences: preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      // Update local state
      if (this.currentProfile) {
        this.currentProfile.preferences = {
          ...this.currentProfile.preferences,
          ...preferences,
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updatePreferences:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'socialspark://reset-password',
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in resetPassword:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Change password
  async changePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in changePassword:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Check if username is available
  async checkUsernameAvailability(username: string): Promise<{ available: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (error && error.code !== 'PGRST116') {
        return { available: false, error: error.message };
      }

      return { available: !data };
    } catch (error) {
      console.error('Error in checkUsernameAvailability:', error);
      return { available: false, error: 'An unexpected error occurred' };
    }
  }

  // Get current auth state
  getAuthState(): AuthState {
    return {
      user: this.currentUser,
      profile: this.currentProfile,
      session: this.currentSession,
      loading: false,
      error: null,
    };
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Get current profile
  getCurrentProfile(): UserProfile | null {
    return this.currentProfile;
  }

  // Get current session
  getCurrentSession(): Session | null {
    return this.currentSession;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.currentUser && !!this.currentSession;
  }

  // Check if user is seller
  isSeller(): boolean {
    return this.currentProfile?.role === 'seller';
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.currentProfile?.role === 'admin';
  }

  // Update local state (called when auth state changes)
  updateLocalState(user: User | null, session: Session | null, profile: UserProfile | null) {
    this.currentUser = user;
    this.currentSession = session;
    this.currentProfile = profile;
  }
}

export const authService = new AuthService(); 