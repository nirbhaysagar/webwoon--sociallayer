import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: 'user' | 'seller' | 'admin';
  is_verified: boolean;
  push_token: string | null;
  notification_preferences: {
    order_updates: boolean;
    new_followers: boolean;
    sales_alerts: boolean;
    messages: boolean;
    promotions: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  email_confirmed_at?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  app_metadata?: any;
  user_metadata?: any;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  role?: 'user' | 'seller';
}

export interface AuthState {
  user: AuthUser | null;
  profile: UserProfile | null;
  session: any | null;
  loading: boolean;
  error: string | null;
}

export class AuthService {
  private static instance: AuthService;
  private currentSession: any = null;
  private currentUser: AuthUser | null = null;
  private currentProfile: UserProfile | null = null;

  private constructor() {
    this.setupAuthListener();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async initialize(): Promise<AuthState> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth initialization error:', error);
        return {
          user: null,
          profile: null,
          session: null,
          loading: false,
          error: error.message
        };
      }

      if (session?.user) {
        this.currentSession = session;
        this.currentUser = session.user as AuthUser;
        
        // Get user profile from users table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
        } else {
          this.currentProfile = profile;
        }
      }

      return {
        user: this.currentUser,
        profile: this.currentProfile,
        session: this.currentSession,
        loading: false,
        error: null
      };
    } catch (error) {
      console.error('Auth initialization error:', error);
      return {
        user: null,
        profile: null,
        session: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async signUp(credentials: RegisterCredentials): Promise<{ user: AuthUser; profile: UserProfile }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.full_name || '',
            phone: credentials.phone || '',
            role: credentials.role || 'user',
          },
        },
      });

      if (error) {
        console.error('Supabase signup error:', error);
        throw error;
      }

      if (data.user) {
        this.currentUser = data.user as AuthUser;
        this.currentSession = data.session;

        // Get user profile from users table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error after signup:', profileError);
        } else {
          this.currentProfile = profile;
        }

        console.log('Supabase signup successful:', data.user.email);
        return { user: data.user as AuthUser, profile: this.currentProfile as UserProfile };
      }
      throw new Error('Supabase signup failed: No user data returned');
    } catch (error) {
      console.error('Supabase signup error:', error);
      throw error;
    }
  }

  async signIn(credentials: LoginCredentials): Promise<{ user: AuthUser; profile: UserProfile }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        console.error('Supabase signin error:', error);
        throw error;
      }

      if (data.user) {
        this.currentUser = data.user as AuthUser;
        this.currentSession = data.session;

        // Get user profile from users table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error after signin:', profileError);
        } else {
          this.currentProfile = profile;
        }

        console.log('Supabase signin successful:', data.user.email);
        return { user: data.user as AuthUser, profile: this.currentProfile as UserProfile };
      }
      throw new Error('Supabase signin failed: No user data returned');
    } catch (error) {
      console.error('Supabase signin error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signout error:', error);
        throw error;
      }
      this.currentSession = null;
      this.currentUser = null;
      this.currentProfile = null;
      console.log('Supabase signout successful');
    } catch (error) {
      console.error('Supabase signout error:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.EXPO_PUBLIC_BASE_URL}/reset-password`,
    });
    if (error) {
      console.error('Supabase password reset error:', error);
      throw error;
    }
    console.log('Supabase password reset email sent to:', email);
  }

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      console.error('Supabase password update error:', error);
      throw error;
    }
    console.log('Supabase password updated successfully');
  }

  async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    if (!this.currentProfile) {
      throw new Error('No profile to update');
    }

    const { error } = await supabase
      .from('users')
      .update(profileData)
      .eq('id', this.currentProfile.id);

    if (error) {
      console.error('Supabase profile update error:', error);
      throw error;
    }

    const { data: updatedProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', this.currentProfile.id)
      .single();

    if (updatedProfile) {
      this.currentProfile = updatedProfile;
      console.log('Supabase profile updated:', updatedProfile);
      return updatedProfile;
    } else {
      throw new Error('Supabase profile update failed to fetch updated profile');
    }
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  getCurrentProfile(): UserProfile | null {
    return this.currentProfile;
  }

  getCurrentSession(): any | null {
    return this.currentSession;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  isEmailVerified(): boolean {
    return this.currentProfile?.is_verified || false;
  }

  getAuthState(): AuthState {
    return {
      user: this.currentUser,
      profile: this.currentProfile,
      session: this.currentSession,
      loading: false,
      error: null,
    };
  }

  async signInWithGoogle(): Promise<{ user: AuthUser; profile: UserProfile }> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.EXPO_PUBLIC_BASE_URL}/auth/callback`,
      },
    });

    if (error) {
      console.error('Supabase Google signin error:', error);
      throw error;
    }

    if (data.user) {
      this.currentUser = data.user as AuthUser;
      this.currentSession = data.session;

      // Get user profile from users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error after Google signin:', profileError);
      } else {
        this.currentProfile = profile;
      }

      console.log('Supabase Google signin successful:', data.user.email);
      return { user: data.user as AuthUser, profile: this.currentProfile as UserProfile };
    }
    throw new Error('Supabase Google signin failed: No user data returned');
  }

  async signInWithApple(): Promise<{ user: AuthUser; profile: UserProfile }> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${process.env.EXPO_PUBLIC_BASE_URL}/auth/callback`,
      },
    });

    if (error) {
      console.error('Supabase Apple signin error:', error);
      throw error;
    }

    if (data.user) {
      this.currentUser = data.user as AuthUser;
      this.currentSession = data.session;

      // Get user profile from users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error after Apple signin:', profileError);
      } else {
        this.currentProfile = profile;
      }

      console.log('Supabase Apple signin successful:', data.user.email);
      return { user: data.user as AuthUser, profile: this.currentProfile as UserProfile };
    }
    throw new Error('Supabase Apple signin failed: No user data returned');
  }

  async deleteAccount(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Supabase account deletion error:', error);
      throw error;
    }
    console.log('Supabase account deleted');
  }

  private setupAuthListener(): void {
    supabase.auth.onAuthStateChange((_event, session) => {
      this.currentSession = session;
      this.currentUser = session?.user as AuthUser;
      if (this.currentUser) {
        supabase
          .from('users')
          .select('*')
          .eq('id', this.currentUser.id)
          .single()
          .then(({ data }) => {
            this.currentProfile = data;
          })
          .catch(console.error);
      } else {
        this.currentProfile = null;
      }
    });
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

// Export types
export type { UserProfile, AuthUser, LoginCredentials, RegisterCredentials, AuthState }; 