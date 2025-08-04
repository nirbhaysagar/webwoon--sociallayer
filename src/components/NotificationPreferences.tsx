import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../constants/theme';
import { NotificationService, NotificationPreferences } from '../services/notificationService';

interface NotificationPreferencesProps {
  visible: boolean;
  onClose: () => void;
}

interface PreferenceItem {
  key: keyof NotificationPreferences;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export default function NotificationPreferencesModal({ visible, onClose }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    orderUpdates: true,
    newProducts: true,
    promotions: true,
    socialInteractions: true,
    systemUpdates: true,
    marketing: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadPreferences();
    }
  }, [visible]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await NotificationService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof NotificationPreferences, value: boolean) => {
    try {
      const newPreferences = { ...preferences, [key]: value };
      setPreferences(newPreferences);
      await NotificationService.savePreferences(newPreferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save notification preferences');
    }
  };

  const handleTestNotification = async () => {
    try {
      await NotificationService.sendTestNotification();
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const preferenceItems: PreferenceItem[] = [
    {
      key: 'orderUpdates',
      title: 'Order Updates',
      description: 'Get notified about order status changes, shipping, and delivery',
      icon: 'bag-outline',
      color: colors.primary,
    },
    {
      key: 'newProducts',
      title: 'New Products',
      description: 'Be the first to know about new products from your favorite stores',
      icon: 'cube-outline',
      color: colors.success,
    },
    {
      key: 'promotions',
      title: 'Promotions & Deals',
      description: 'Receive notifications about special offers and discounts',
      icon: 'pricetag-outline',
      color: colors.warning,
    },
    {
      key: 'socialInteractions',
      title: 'Social Interactions',
      description: 'Get notified about likes, comments, and follows',
      icon: 'heart-outline',
      color: colors.favorite,
    },
    {
      key: 'systemUpdates',
      title: 'System Updates',
      description: 'Important app updates and maintenance notifications',
      icon: 'settings-outline',
      color: colors.info,
    },
    {
      key: 'marketing',
      title: 'Marketing & News',
      description: 'Receive promotional content and newsletters',
      icon: 'megaphone-outline',
      color: colors.textSecondary,
    },
  ];

  const renderPreferenceItem = (item: PreferenceItem) => (
    <View key={item.key} style={styles.preferenceItem}>
      <View style={styles.preferenceHeader}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={item.icon as any} size={24} color={item.color} />
        </View>
        <View style={styles.preferenceContent}>
          <Text style={styles.preferenceTitle}>{item.title}</Text>
          <Text style={styles.preferenceDescription}>{item.description}</Text>
        </View>
        <Switch
          value={preferences[item.key]}
          onValueChange={(value) => handleToggle(item.key, value)}
          trackColor={{ false: colors.border, true: item.color + '40' }}
          thumbColor={preferences[item.key] ? item.color : colors.textSecondary}
        />
      </View>
    </View>
  );

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Preferences</Text>
        <TouchableOpacity onPress={handleTestNotification} style={styles.testButton}>
          <Ionicons name="notifications-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="settings-outline" size={48} color={colors.primary} />
            <Text style={styles.loadingText}>Loading preferences...</Text>
          </View>
        ) : (
          <>
            {/* Info Section */}
            <View style={styles.infoSection}>
              <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
              <Text style={styles.infoText}>
                Customize which notifications you want to receive. You can change these settings anytime.
              </Text>
            </View>

            {/* Preferences List */}
            <View style={styles.preferencesSection}>
              {preferenceItems.map(renderPreferenceItem)}
            </View>

            {/* Additional Options */}
            <View style={styles.additionalSection}>
              <Text style={styles.sectionTitle}>Additional Options</Text>
              
              <TouchableOpacity style={styles.optionItem}>
                <View style={styles.optionContent}>
                  <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                  <Text style={styles.optionText}>Quiet Hours</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionItem}>
                <View style={styles.optionContent}>
                  <Ionicons name="sound-outline" size={20} color={colors.textSecondary} />
                  <Text style={styles.optionText}>Sound & Vibration</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionItem}>
                <View style={styles.optionContent}>
                  <Ionicons name="eye-outline" size={20} color={colors.textSecondary} />
                  <Text style={styles.optionText}>Notification History</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </>
        )}
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  closeButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.sizes.lg,
    ...typography.weights.semibold,
    color: colors.text,
  },
  testButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary + '10',
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoText: {
    ...typography.sizes.sm,
    ...typography.weights.medium,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  preferencesSection: {
    marginBottom: spacing.lg,
  },
  preferenceItem: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  preferenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  preferenceContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  preferenceTitle: {
    ...typography.sizes.md,
    ...typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  preferenceDescription: {
    ...typography.sizes.sm,
    ...typography.weights.regular,
    color: colors.textSecondary,
  },
  additionalSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.sizes.md,
    ...typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.xs,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    ...typography.sizes.sm,
    ...typography.weights.medium,
    color: colors.text,
    marginLeft: spacing.sm,
  },
}); 