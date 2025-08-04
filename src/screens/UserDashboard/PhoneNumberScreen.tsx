import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import BackButton from '../../components/BackButton';
import userProfileService from '../../services/userProfileService';

export default function PhoneNumberScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [showVerificationCode, setShowVerificationCode] = useState(false);

  const [formData, setFormData] = useState({
    currentPhone: '+1 (555) 123-4567',
    newPhone: '',
    verificationCode: '',
  });

  const [errors, setErrors] = useState({
    newPhone: '',
    verificationCode: '',
  });

  const validatePhoneNumber = (phone: string) => {
    // Basic phone number validation (can be enhanced)
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as US phone number
    if (cleaned.length === 10) {
      return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    return phone;
  };

  const handleSendVerificationCode = async () => {
    try {
      setLoading(true);
      setErrors({ ...errors, newPhone: '' });

      if (!formData.newPhone.trim()) {
        setErrors({ ...errors, newPhone: 'Phone number is required' });
        return;
      }

      if (!validatePhoneNumber(formData.newPhone)) {
        setErrors({ ...errors, newPhone: 'Please enter a valid phone number' });
        return;
      }

      if (formData.newPhone === formData.currentPhone) {
        setErrors({ ...errors, newPhone: 'New phone number must be different from current' });
        return;
      }

      // Use Supabase service to send verification code
      const success = await userProfileService.sendPhoneVerificationCode(formData.newPhone);

      if (success) {
        setShowVerificationCode(true);
        Alert.alert('Success', 'Verification code sent to your new phone number');
      } else {
        Alert.alert('Error', 'Failed to send verification code');
      }

    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndUpdate = async () => {
    try {
      setLoading(true);
      setErrors({ ...errors, verificationCode: '' });

      if (!formData.verificationCode.trim()) {
        setErrors({ ...errors, verificationCode: 'Verification code is required' });
        return;
      }

      if (formData.verificationCode.length !== 6) {
        setErrors({ ...errors, verificationCode: 'Please enter a 6-digit verification code' });
        return;
      }

      // Use Supabase service to verify phone number
      const success = await userProfileService.verifyPhoneNumber(formData.newPhone, formData.verificationCode);

      if (success) {
        Alert.alert('Success', 'Phone number updated successfully!');
        
        setFormData(prev => ({
          ...prev,
          currentPhone: formatPhoneNumber(prev.newPhone),
          newPhone: '',
          verificationCode: '',
        }));
        
        setShowVerificationCode(false);
      } else {
        Alert.alert('Error', 'Failed to verify code');
      }

    } catch (error) {
      Alert.alert('Error', 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setLoading(true);
      
      // Use Supabase service to resend code
      const success = await userProfileService.sendPhoneVerificationCode(formData.newPhone);
      
      if (success) {
        Alert.alert('Success', 'Verification code resent successfully');
      } else {
        Alert.alert('Error', 'Failed to resend verification code');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to resend verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backButton} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Phone Number</Text>
          <Text style={styles.subtitle}>Update your phone number</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Phone Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Phone Number</Text>
          <View style={styles.currentPhoneContainer}>
            <Ionicons name="call" size={20} color={colors.textSecondary} />
            <Text style={styles.currentPhoneText}>{formData.currentPhone}</Text>
          </View>
        </View>

        {/* Update Phone Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Phone Number</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New Phone Number</Text>
            <TextInput
              style={[styles.textInput, errors.newPhone ? styles.inputError : null]}
              value={formData.newPhone}
              onChangeText={(text) => {
                setFormData({ ...formData, newPhone: text });
                if (errors.newPhone) {
                  setErrors({ ...errors, newPhone: '' });
                }
              }}
              placeholder="+1 (555) 123-4567"
              keyboardType="phone-pad"
            />
            {errors.newPhone ? <Text style={styles.errorText}>{errors.newPhone}</Text> : null}
          </View>

          {!showVerificationCode ? (
            <TouchableOpacity 
              style={[styles.updateButton, loading && styles.updateButtonDisabled]}
              onPress={handleSendVerificationCode}
              disabled={loading}
            >
              <Text style={styles.updateButtonText}>
                {loading ? 'Sending...' : 'Send Verification Code'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.verificationSection}>
              <Text style={styles.verificationTitle}>Enter Verification Code</Text>
              <Text style={styles.verificationSubtitle}>
                We've sent a 6-digit code to {formatPhoneNumber(formData.newPhone)}
              </Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Verification Code</Text>
                <TextInput
                  style={[styles.textInput, styles.verificationInput, errors.verificationCode ? styles.inputError : null]}
                  value={formData.verificationCode}
                  onChangeText={(text) => {
                    setFormData({ ...formData, verificationCode: text });
                    if (errors.verificationCode) {
                      setErrors({ ...errors, verificationCode: '' });
                    }
                  }}
                  placeholder="123456"
                  keyboardType="number-pad"
                  maxLength={6}
                />
                {errors.verificationCode ? <Text style={styles.errorText}>{errors.verificationCode}</Text> : null}
              </View>

              <View style={styles.verificationButtons}>
                <TouchableOpacity 
                  style={[styles.updateButton, loading && styles.updateButtonDisabled]}
                  onPress={handleVerifyAndUpdate}
                  disabled={loading}
                >
                  <Text style={styles.updateButtonText}>
                    {loading ? 'Verifying...' : 'Verify & Update'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.resendButton}
                  onPress={handleResendCode}
                  disabled={loading}
                >
                  <Text style={styles.resendButtonText}>Resend Code</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Phone Number Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips</Text>
          <View style={styles.tipsContainer}>
            <View style={styles.tipItem}>
              <Ionicons name="information-circle" size={16} color={colors.primary} />
              <Text style={styles.tipText}>Enter your phone number with country code</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="information-circle" size={16} color={colors.primary} />
              <Text style={styles.tipText}>We'll send a verification code to confirm</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="information-circle" size={16} color={colors.primary} />
              <Text style={styles.tipText}>Your phone number is used for account security</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="information-circle" size={16} color={colors.primary} />
              <Text style={styles.tipText}>You can receive SMS notifications for orders</Text>
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
  currentPhoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.m,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentPhoneText: {
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
  verificationInput: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
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
  verificationSection: {
    marginTop: spacing.m,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  verificationSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.m,
  },
  verificationButtons: {
    marginTop: spacing.m,
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: spacing.s,
    marginTop: spacing.s,
  },
  resendButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
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