import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Alert } from 'react-native';
import { authService, AuthState, LoginCredentials, RegisterCredentials, UserProfile } from '../services/auth';

// Extended auth state with additional UI states
interface ExtendedAuthState extends AuthState {
  isInitialized: boolean;
  isEmailVerified: boolean;
}

// Auth context interface
interface AuthContextType {
  // State
  authState: ExtendedAuthState;
  
  // Actions
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: RegisterCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  
  // Social login
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  
  // Utilities
  clearError: () => void;
  refreshAuthState: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<ExtendedAuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
    isInitialized: false,
    isEmailVerified: false,
  });

  // Initialize auth service on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Initialize authentication
  const initializeAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const state = await authService.initialize();
      
      setAuthState({
        ...state,
        loading: false,
        isInitialized: true,
        isEmailVerified: authService.isEmailVerified(),
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication initialization failed',
        isInitialized: true,
      }));
    }
  };

  // Sign in
  const signIn = async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { user, profile } = await authService.signIn(credentials);
      
      setAuthState({
        user,
        profile,
        session: authService.getCurrentSession(),
        loading: false,
        error: null,
        isInitialized: true,
        isEmailVerified: authService.isEmailVerified(),
      });

      console.log('User signed in successfully:', user.email);
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      Alert.alert('Sign In Failed', errorMessage);
    }
  };

  // Sign up
  const signUp = async (credentials: RegisterCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { user, profile } = await authService.signUp(credentials);
      
      setAuthState({
        user,
        profile,
        session: authService.getCurrentSession(),
        loading: false,
        error: null,
        isInitialized: true,
        isEmailVerified: authService.isEmailVerified(),
      });

      console.log('User signed up successfully:', user.email);
      
      // For mock system, we don't need email verification alert
      // The user will be automatically logged in
    } catch (error) {
      console.error('Sign up error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      Alert.alert('Sign Up Failed', errorMessage);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      await authService.signOut();
      
      setAuthState({
        user: null,
        profile: null,
        session: null,
        loading: false,
        error: null,
        isInitialized: true,
        isEmailVerified: false,
      });

      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      Alert.alert('Sign Out Failed', errorMessage);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      await authService.resetPassword(email);
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: null,
      }));

      Alert.alert(
        'Password Reset',
        'If an account with that email exists, you will receive a password reset link.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Password reset error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      Alert.alert('Password Reset Failed', errorMessage);
    }
  };

  // Update password
  const updatePassword = async (newPassword: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      await authService.updatePassword(newPassword);
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: null,
      }));

      Alert.alert('Success', 'Password updated successfully');
    } catch (error) {
      console.error('Password update error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Password update failed';
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      Alert.alert('Password Update Failed', errorMessage);
    }
  };

  // Update profile
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const updatedProfile = await authService.updateProfile(profileData);
      
      setAuthState(prev => ({
        ...prev,
        profile: updatedProfile,
        loading: false,
        error: null,
      }));

      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      Alert.alert('Profile Update Failed', errorMessage);
    }
  };

  // Delete account
  const deleteAccount = async () => {
    try {
      Alert.alert(
        'Delete Account',
        'Are you sure you want to delete your account? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                setAuthState(prev => ({ ...prev, loading: true, error: null }));
                
                await authService.deleteAccount();
                
                setAuthState({
                  user: null,
                  profile: null,
                  session: null,
                  loading: false,
                  error: null,
                  isInitialized: true,
                  isEmailVerified: false,
                });

                Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
              } catch (error) {
                console.error('Account deletion error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Account deletion failed';
                
                setAuthState(prev => ({
                  ...prev,
                  loading: false,
                  error: errorMessage,
                }));

                Alert.alert('Account Deletion Failed', errorMessage);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Delete account error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Delete account failed';
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      Alert.alert('Delete Account Failed', errorMessage);
    }
  };

  // Social login - Google
  const signInWithGoogle = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { user, profile } = await authService.signInWithGoogle();
      
      setAuthState({
        user,
        profile,
        session: authService.getCurrentSession(),
        loading: false,
        error: null,
        isInitialized: true,
        isEmailVerified: authService.isEmailVerified(),
      });

      console.log('User signed in with Google successfully:', user.email);
    } catch (error) {
      console.error('Google sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Google sign in failed';
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      Alert.alert('Google Sign In Failed', errorMessage);
    }
  };

  // Social login - Apple
  const signInWithApple = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { user, profile } = await authService.signInWithApple();
      
      setAuthState({
        user,
        profile,
        session: authService.getCurrentSession(),
        loading: false,
        error: null,
        isInitialized: true,
        isEmailVerified: authService.isEmailVerified(),
      });

      console.log('User signed in with Apple successfully:', user.email);
    } catch (error) {
      console.error('Apple sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Apple sign in failed';
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      Alert.alert('Apple Sign In Failed', errorMessage);
    }
  };

  // Clear error
  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  // Refresh auth state
  const refreshAuthState = async () => {
    try {
      const state = authService.getAuthState();
      
      setAuthState({
        ...state,
        loading: false,
        isInitialized: true,
        isEmailVerified: authService.isEmailVerified(),
      });
    } catch (error) {
      console.error('Auth state refresh error:', error);
    }
  };

  // Context value
  const contextValue: AuthContextType = {
    authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    deleteAccount,
    signInWithGoogle,
    signInWithApple,
    clearError,
    refreshAuthState,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the context for direct access if needed
export { AuthContext }; 