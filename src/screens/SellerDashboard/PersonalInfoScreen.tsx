import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';

interface PersonalInfo {
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
}

export default function PersonalInfoScreen() {
  const navigation = useNavigation();
  const { state, updateUserProfile } = useApp();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    full_name: state.user?.full_name || '',
    email: state.user?.email || '',
    phone: state.user?.phone || '',
    avatar_url: state.user?.avatar_url || 'https://randomuser.me/api/portraits/women/44.jpg',
  });

  const [originalInfo, setOriginalInfo] = useState<PersonalInfo>(personalInfo);

  useEffect(() => {
    if (state.user) {
      const info = {
        full_name: state.user.full_name || '',
        email: state.user.email || '',
        phone: state.user.phone || '',
        avatar_url: state.user.avatar_url || 'https://randomuser.me/api/portraits/women/44.jpg',
      };
      setPersonalInfo(info);
      setOriginalInfo(info);
    }
  }, [state.user]);

  const hasChanges = () => {
    return JSON.stringify(personalInfo) !== JSON.stringify(originalInfo);
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      navigation.goBack();
      return;
    }

    setSaving(true);
    try {
      // Validate required fields
      if (!personalInfo.full_name.trim()) {
        Alert.alert('Error', 'Full name is required');
        return;
      }

      if (!personalInfo.email.trim()) {
        Alert.alert('Error', 'Email is required');
        return;
      }

      // Update user profile in database
      await updateUserProfile({
        full_name: personalInfo.full_name.trim(),
        email: personalInfo.email.trim(),
        phone: personalInfo.phone.trim(),
        avatar_url: personalInfo.avatar_url,
      });

      setOriginalInfo(personalInfo);
      Alert.alert('Success', 'Personal information updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update personal information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Information</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.saveButton, !hasChanges() && styles.saveButtonDisabled]}
          disabled={!hasChanges() || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.saveButtonText, !hasChanges() && styles.saveButtonTextDisabled]}>
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarSection}>
          <Image source={{ uri: personalInfo.avatar_url }} style={styles.avatar} />
          <TouchableOpacity style={styles.changeAvatarButton}>
            <Ionicons name="camera" size={20} color={colors.primary} />
            <Text style={styles.changeAvatarText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={personalInfo.full_name}
              onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, full_name: text }))}
              placeholder="Enter your full name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={styles.input}
              value={personalInfo.email}
              onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, email: text }))}
              placeholder="Enter your email address"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={personalInfo.phone}
              onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, phone: text }))}
              placeholder="Enter your phone number"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Account Information</Text>
          <Text style={styles.infoText}>
            Your personal information is used to identify you and provide customer support.
            This information is kept private and secure.
          </Text>
        </View>

        {/* Test content to ensure scrolling works */}
        <View style={styles.testSection}>
          <Text style={styles.testTitle}>Test Section 1</Text>
          <Text style={styles.testText}>
            This is test content to ensure scrolling works properly. 
            If you can see this text, scrolling should be working.
          </Text>
        </View>

        <View style={styles.testSection}>
          <Text style={styles.testTitle}>Test Section 2</Text>
          <Text style={styles.testText}>
            More test content to make sure the scroll view has enough content to scroll.
            This should help us verify that the scrolling functionality is working correctly.
          </Text>
        </View>

        <View style={styles.testSection}>
          <Text style={styles.testTitle}>Test Section 3</Text>
          <Text style={styles.testText}>
            Additional test content to ensure there's enough content to trigger scrolling.
            If you can scroll to see this section, then the scrolling is working properly.
          </Text>
        </View>

        <View style={styles.testSection}>
          <Text style={styles.testTitle}>Test Section 4</Text>
          <Text style={styles.testText}>
            Final test section to make sure there's plenty of content to scroll through.
            This should definitely be enough content to test the scrolling functionality.
          </Text>
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
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
  },
  saveButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: radii.small,
    backgroundColor: colors.primary,
  },
  saveButtonDisabled: {
    backgroundColor: colors.border,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: '#fff',
  },
  saveButtonTextDisabled: {
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.l,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing.m,
  },
  changeAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.s,
  },
  changeAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  formSection: {
    marginBottom: spacing.l,
  },
  inputGroup: {
    marginBottom: spacing.m,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoSection: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.l,
    ...shadows.card,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.s,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  testSection: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.m,
    ...shadows.card,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.s,
  },
  testText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.textSecondary,
    lineHeight: 20,
  },
}); 