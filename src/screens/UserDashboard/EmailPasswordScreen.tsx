import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import BackButton from '../../components/BackButton';
import { supabase } from '../../config/supabase';
import userProfileService from '../../services/userProfileService';

export default function EmailPasswordScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    currentEmail: 'jane.doe@email.com',
    newEmail: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    newEmail: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleUpdateEmail = async () => {
    try {
      setLoading(true);
      setErrors({ ...errors, newEmail: '' });

      if (!formData.newEmail.trim()) {
        setErrors({ ...errors, newEmail: 'New email is required' });
        return;
      }

      if (!validateEmail(formData.newEmail)) {
        setErrors({ ...errors, newEmail: 'Please enter a valid email address' });
        return;
      }

      if (formData.newEmail === formData.currentEmail) {
        setErrors({ ...errors, newEmail: 'New email must be different from current email' });
        return;
      }

      // Use Supabase service to request email change
      const success = await userProfileService.requestEmailChange(formData.newEmail);

      if (success) {
        Alert.alert(
          'Success', 
          'Email change request sent! Please check your new email for verification.',
          [{ text: 'OK' }]
        );

        setFormData(prev => ({ ...prev, newEmail: '' }));
      } else {
        Alert.alert('Error', 'Failed to send email change request');
      }

    } catch (error) {
      Alert.alert('Error', 'Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      setLoading(true);
      setErrors({ ...errors, currentPassword: '', newPassword: '', confirmPassword: '' });

      // Validate current password
      if (!formData.currentPassword.trim()) {
        setErrors({ ...errors, currentPassword: 'Current password is required' });
        return;
      }

      // Validate new password
      if (!formData.newPassword.trim()) {
        setErrors({ ...errors, newPassword: 'New password is required' });
        return;
      }

      if (!validatePassword(formData.newPassword)) {
        setErrors({ ...errors, newPassword: 'Password must be at least 8 characters long' });
        return;
      }

      // Validate confirm password
      if (!formData.confirmPassword.trim()) {
        setErrors({ ...errors, confirmPassword: 'Please confirm your new password' });
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setErrors({ ...errors, confirmPassword: 'Passwords do not match' });
        return;
      }

      // Use Supabase service to change password
      const success = await userProfileService.changePassword(formData.currentPassword, formData.newPassword);

      if (success) {
        Alert.alert('Success', 'Password updated successfully!');
        
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      } else {
        Alert.alert('Error', 'Failed to update password');
      }

    } catch (error) {
      Alert.alert('Error', 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordInput = (label: string, value: string, onChangeText: (text: string) => void, showPassword: boolean, setShowPassword: (show: boolean) => void, error: string) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.textInput, styles.passwordInput]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          placeholder={`Enter your ${label.toLowerCase()}`}
        />
        <TouchableOpacity 
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons 
            name={showPassword ? "eye-off" : "eye"} 
            size={20} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backButton} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Email & Password</Text>
          <Text style={styles.subtitle}>Update your account credentials</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Email Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Email</Text>
          <View style={styles.currentEmailContainer}>
            <Ionicons name="mail" size={20} color={colors.textSecondary} />
            <Text style={styles.currentEmailText}>{formData.currentEmail}</Text>
          </View>
        </View>

        {/* Update Email Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Email</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New Email Address</Text>
            <TextInput
              style={[styles.textInput, errors.newEmail ? styles.inputError : null]}
              value={formData.newEmail}
              onChangeText={(text) => {
                setFormData({ ...formData, newEmail: text });
                if (errors.newEmail) {
                  setErrors({ ...errors, newEmail: '' });
                }
              }}
              placeholder="Enter new email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.newEmail ? <Text style={styles.errorText}>{errors.newEmail}</Text> : null}
          </View>

          <TouchableOpacity 
            style={[styles.updateButton, loading && styles.updateButtonDisabled]}
            onPress={handleUpdateEmail}
            disabled={loading}
          >
            <Text style={styles.updateButtonText}>
              {loading ? 'Updating...' : 'Update Email'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Update Password Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Password</Text>
          
          {renderPasswordInput(
            'Current Password',
            formData.currentPassword,
            (text) => {
              setFormData({ ...formData, currentPassword: text });
              if (errors.currentPassword) {
                setErrors({ ...errors, currentPassword: '' });
              }
            },
            showCurrentPassword,
            setShowCurrentPassword,
            errors.currentPassword
          )}

          {renderPasswordInput(
            'New Password',
            formData.newPassword,
            (text) => {
              setFormData({ ...formData, newPassword: text });
              if (errors.newPassword) {
                setErrors({ ...errors, newPassword: '' });
              }
            },
            showNewPassword,
            setShowNewPassword,
            errors.newPassword
          )}

          {renderPasswordInput(
            'Confirm New Password',
            formData.confirmPassword,
            (text) => {
              setFormData({ ...formData, confirmPassword: text });
              if (errors.confirmPassword) {
                setErrors({ ...errors, confirmPassword: '' });
              }
            },
            showConfirmPassword,
            setShowConfirmPassword,
            errors.confirmPassword
          )}

          <TouchableOpacity 
            style={[styles.updateButton, loading && styles.updateButtonDisabled]}
            onPress={handleUpdatePassword}
            disabled={loading}
          >
            <Text style={styles.updateButtonText}>
              {loading ? 'Updating...' : 'Update Password'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Security Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Tips</Text>
          <View style={styles.tipsContainer}>
            <View style={styles.tipItem}>
              <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
              <Text style={styles.tipText}>Use a strong password with at least 8 characters</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
              <Text style={styles.tipText}>Include numbers, letters, and special characters</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
              <Text style={styles.tipText}>Never share your password with anyone</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
              <Text style={styles.tipText}>Enable two-factor authentication for extra security</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.s,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: scale(14),
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.m,
  },
  section: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.m,
  },
  currentEmailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.m,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentEmailText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.s,
  },
  inputGroup: {
    marginBottom: spacing.m,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.error,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
  },
  passwordInput: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  eyeButton: {
    padding: spacing.s,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  updateButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.medium,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.l,
    alignItems: 'center',
    marginTop: spacing.m,
  },
  updateButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  updateButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipsContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii.medium,
    padding: spacing.m,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.s,
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: spacing.s,
    flex: 1,
  },
}); 