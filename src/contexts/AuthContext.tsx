import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { userService } from '../services/userService';
import { User, UserProfile, AuthState } from '../types/user';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: any) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  becomeSeller: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user as User);
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user as User);
          await loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const response = await userService.getUserProfile(userId);
      if (response.success && response.profile) {
        setProfile(response.profile);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await userService.signIn(email, password);
      
      if (response.success && response.user) {
        setUser(response.user);
        await loadUserProfile(response.user.id);
        return { success: true };
      } else {
        setError(response.error || 'Sign in failed');
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = 'Sign in failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await userService.signUp(data);
      
      if (response.success && response.user) {
        setUser(response.user);
        await loadUserProfile(response.user.id);
        return { success: true };
      } else {
        setError(response.error || 'Sign up failed');
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = 'Sign up failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userService.signOut();
      
      if (response.success) {
        setUser(null);
        setProfile(null);
        return { success: true };
      } else {
        setError(response.error || 'Sign out failed');
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = 'Sign out failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  const becomeSeller = async () => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const response = await userService.becomeSeller(user.id);
      
      if (response.success) {
        await refreshProfile();
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error: 'Failed to become seller' };
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    becomeSeller,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 