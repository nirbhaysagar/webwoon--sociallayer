import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../services/supabase';
import { authService, AuthState, SignUpData, SignInData, UpdateProfileData, UserProfile } from '../services/auth';

interface AuthContextType extends AuthState {
  // Auth methods
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  signIn: (data: SignInData) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  
  // Profile methods
  updateProfile: (data: UpdateProfileData) => Promise<{ success: boolean; error?: string }>;
  updatePreferences: (preferences: Partial<UserProfile['preferences']>) => Promise<{ success: boolean; error?: string }>;
  checkUsernameAvailability: (username: string) => Promise<{ available: boolean; error?: string }>;
  
  // Utility methods
  isAuthenticated: () => boolean;
  isSeller: () => boolean;
  isAdmin: () => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Initialize auth service
    initializeAuth();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              const profile = await authService.getUserProfile(session.user.id);
              authService.updateLocalState(session.user, session, profile);
              setAuthState({
                user: session.user,
                profile,
                session,
                loading: false,
                error: null,
              });
            }
            break;
            
          case 'SIGNED_OUT':
            authService.updateLocalState(null, null, null);
            setAuthState({
              user: null,
              profile: null,
              session: null,
              loading: false,
              error: null,
            });
            break;
            
          case 'TOKEN_REFRESHED':
            if (session) {
              authService.updateLocalState(session.user, session, authState.profile);
              setAuthState(prev => ({
                ...prev,
                user: session.user,
                session,
              }));
            }
            break;
            
          case 'USER_UPDATED':
            if (session?.user) {
              authService.updateLocalState(session.user, session, authState.profile);
              setAuthState(prev => ({
                ...prev,
                user: session.user,
                session,
              }));
            }
            break;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('🔐 Initializing authentication...');
      const state = await authService.initialize();
      
      console.log('🔐 Auth initialization result:', {
        user: state.user?.email,
        profile: state.profile?.full_name,
        session: !!state.session
      });
      
      setAuthState({
        ...state,
        loading: false,
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to initialize authentication',
      }));
    }
  };

  const signUp = async (data: SignUpData): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('🔐 Starting signup process...');
      const result = await authService.signUp(data);
      
      console.log('🔐 Signup result:', result);
      
      if (result.success && result.user) {
        console.log('🔐 Signup successful, getting user profile...');
        const profile = await authService.getUserProfile(result.user.id);
        console.log('🔐 User profile:', profile);
        console.log('🔐 User profile full_name:', profile?.full_name);
        console.log('🔐 User email:', result.user.email);
        
        authService.updateLocalState(result.user, authState.session, profile);
        
        const newAuthState = {
          user: result.user,
          profile,
          session: authState.session,
          loading: false,
          error: null,
        };
        
        console.log('🔐 Setting new auth state:', newAuthState);
        setAuthState(newAuthState);
        
        // Remove success alert - let auth state change handle navigation
        console.log('🔐 Sign up successful');
      } else {
        console.log('🔐 Signup failed:', result.error);
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Failed to create account',
        }));
        
        Alert.alert('Sign Up Failed', result.error || 'Failed to create account');
      }
      
      return result;
    } catch (error) {
      console.error('🔐 Error in signUp:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'An unexpected error occurred',
      }));
      
      Alert.alert('Error', 'An unexpected error occurred');
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signIn = async (data: SignInData): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await authService.signIn(data);
      
      if (result.success && result.user) {
        const profile = await authService.getUserProfile(result.user.id);
        authService.updateLocalState(result.user, authState.session, profile);
        
        setAuthState({
          user: result.user,
          profile,
          session: authState.session,
          loading: false,
          error: null,
        });
        
        // Remove success alert - let auth state change handle navigation
        console.log('Sign in successful');
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Failed to sign in',
        }));
        
        Alert.alert('Sign In Failed', result.error || 'Failed to sign in');
      }
      
      return result;
    } catch (error) {
      console.error('Error in signIn:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'An unexpected error occurred',
      }));
      
      Alert.alert('Error', 'An unexpected error occurred');
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signOut = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await authService.signOut();
      
      if (result.success) {
        setAuthState({
          user: null,
          profile: null,
          session: null,
          loading: false,
          error: null,
        });
        
        Alert.alert('Success', 'Signed out successfully!');
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Failed to sign out',
        }));
        
        Alert.alert('Error', result.error || 'Failed to sign out');
      }
      
      return result;
    } catch (error) {
      console.error('Error in signOut:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'An unexpected error occurred',
      }));
      
      Alert.alert('Error', 'An unexpected error occurred');
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await authService.resetPassword(email);
      
      if (result.success) {
        Alert.alert('Success', 'Password reset email sent! Check your email.');
      } else {
        Alert.alert('Error', result.error || 'Failed to send reset email');
      }
      
      setAuthState(prev => ({ ...prev, loading: false }));
      return result;
    } catch (error) {
      console.error('Error in resetPassword:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'An unexpected error occurred',
      }));
      
      Alert.alert('Error', 'An unexpected error occurred');
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const changePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await authService.changePassword(newPassword);
      
      if (result.success) {
        Alert.alert('Success', 'Password changed successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to change password');
      }
      
      setAuthState(prev => ({ ...prev, loading: false }));
      return result;
    } catch (error) {
      console.error('Error in changePassword:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'An unexpected error occurred',
      }));
      
      Alert.alert('Error', 'An unexpected error occurred');
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const updateProfile = async (data: UpdateProfileData): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!authState.user) {
        Alert.alert('Error', 'No user logged in');
        return { success: false, error: 'No user logged in' };
      }
      
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await authService.updateProfile(authState.user.id, data);
      
      if (result.success && result.profile) {
        setAuthState(prev => ({
          ...prev,
          profile: result.profile,
          loading: false,
        }));
        
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Failed to update profile',
        }));
        
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
      
      return result;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'An unexpected error occurred',
      }));
      
      Alert.alert('Error', 'An unexpected error occurred');
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const updatePreferences = async (preferences: Partial<UserProfile['preferences']>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!authState.user) {
        Alert.alert('Error', 'No user logged in');
        return { success: false, error: 'No user logged in' };
      }
      
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await authService.updatePreferences(authState.user.id, preferences);
      
      if (result.success) {
        // Update local profile with new preferences
        if (authState.profile) {
          const updatedProfile = {
            ...authState.profile,
            preferences: {
              ...authState.profile.preferences,
              ...preferences,
            },
          };
          
          setAuthState(prev => ({
            ...prev,
            profile: updatedProfile,
            loading: false,
          }));
        }
        
        Alert.alert('Success', 'Preferences updated successfully!');
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Failed to update preferences',
        }));
        
        Alert.alert('Error', result.error || 'Failed to update preferences');
      }
      
      return result;
    } catch (error) {
      console.error('Error in updatePreferences:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'An unexpected error occurred',
      }));
      
      Alert.alert('Error', 'An unexpected error occurred');
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const checkUsernameAvailability = async (username: string): Promise<{ available: boolean; error?: string }> => {
    try {
      const result = await authService.checkUsernameAvailability(username);
      return result;
    } catch (error) {
      console.error('Error in checkUsernameAvailability:', error);
      return { available: false, error: 'An unexpected error occurred' };
    }
  };

  const isAuthenticated = (): boolean => {
    const authenticated = authService.isAuthenticated();
    console.log('🔐 isAuthenticated check:', {
      authenticated,
      currentUser: authService.getCurrentUser(),
      currentSession: authService.getCurrentSession(),
      authStateUser: authState.user,
      authStateSession: authState.session
    });
    return authenticated;
  };

  const isSeller = (): boolean => {
    return authService.isSeller();
  };

  const isAdmin = (): boolean => {
    return authService.isAdmin();
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (authState.user) {
        const profile = await authService.getUserProfile(authState.user.id);
        setAuthState(prev => ({
          ...prev,
          profile,
        }));
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value: AuthContextType = {
    ...authState,
    signUp,
    signIn,
    signOut,
    resetPassword,
    changePassword,
    updateProfile,
    updatePreferences,
    checkUsernameAvailability,
    isAuthenticated,
    isSeller,
    isAdmin,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 