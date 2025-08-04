import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { scale, verticalScale, moderateScale } from '../../lib/scale';

interface ForgotPasswordScreenProps {
  navigation: any;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const { resetPassword, authState, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Clear errors when auth state changes
  useEffect(() => {
    if (authState.error) {
      clearError();
    }
  }, [authState.error]);

  // Validate email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Handle password reset
  const handleResetPassword = async () => {
    // Clear previous errors
    setEmailError('');

    // Validate email
    const isEmailValid = validateEmail(email);

    if (!isEmailValid) {
      return;
    }

    try {
      await resetPassword(email);
      setIsSuccess(true);
    } catch (error) {
      // Error is handled by AuthContext
      console.error('Password reset error:', error);
    }
  };

  // Navigate back to login
  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  // Reset form
  const handleResetForm = () => {
    setEmail('');
    setEmailError('');
    setIsSuccess(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToLogin}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            {isSuccess 
              ? 'Check your email for reset instructions'
              : 'Enter your email address and we\'ll send you a link to reset your password'
            }
          </Text>
        </View>

        {/* Success State */}
        {isSuccess ? (
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={60} color={colors.success} />
            </View>
            <Text style={styles.successTitle}>Email Sent!</Text>
            <Text style={styles.successMessage}>
              We've sent a password reset link to {email}. Please check your email and follow the instructions to reset your password.
            </Text>
            
            <View style={styles.successActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleResetForm}
              >
                <Text style={styles.secondaryButtonText}>Send Another Email</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleBackToLogin}
              >
                <Text style={styles.primaryButtonText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Form */
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputWrapper, emailError ? styles.inputError : null]}>
                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email address"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) validateEmail(text);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>What happens next?</Text>
              <View style={styles.instructionItem}>
                <Ionicons name="mail-outline" size={16} color={colors.primary} />
                <Text style={styles.instructionText}>We'll send you an email with a reset link</Text>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="time-outline" size={16} color={colors.primary} />
                <Text style={styles.instructionText}>The link will expire in 1 hour</Text>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="lock-closed-outline" size={16} color={colors.primary} />
                <Text style={styles.instructionText}>Click the link to create a new password</Text>
              </View>
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              style={[styles.resetButton, authState.loading && styles.resetButtonDisabled]}
              onPress={handleResetPassword}
              disabled={authState.loading}
            >
              {authState.loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.resetButtonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={handleBackToLogin}
            >
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: verticalScale(60),
    paddingBottom: verticalScale(40),
  },
  header: {
    marginBottom: verticalScale(40),
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
    padding: spacing.sm,
  },
  title: {
    fontSize: moderateScale(32),
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: moderateScale(24),
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: verticalScale(50),
    ...shadows.sm,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: moderateScale(16),
    color: colors.text,
  },
  errorText: {
    fontSize: moderateScale(12),
    color: colors.error,
    marginTop: spacing.xs,
  },
  instructionsContainer: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  instructionsTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  instructionText: {
    fontSize: moderateScale(14),
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  resetButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    height: verticalScale(50),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  resetButtonDisabled: {
    opacity: 0.7,
  },
  resetButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: colors.white,
  },
  backToLoginButton: {
    alignItems: 'center',
  },
  backToLoginText: {
    fontSize: moderateScale(14),
    color: colors.primary,
    fontWeight: '500',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  successIcon: {
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: moderateScale(16),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: moderateScale(24),
    marginBottom: spacing.xl,
  },
  successActions: {
    width: '100%',
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    height: verticalScale(50),
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  primaryButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: colors.white,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    height: verticalScale(50),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '500',
    color: colors.text,
  },
});

export default ForgotPasswordScreen; 