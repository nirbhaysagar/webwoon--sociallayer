import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';

interface NotificationPreferences {
  order_updates: boolean;
  new_followers: boolean;
  sales_alerts: boolean;
  messages: boolean;
  promotions: boolean;
  product_reviews: boolean;
  inventory_alerts: boolean;
  marketing_emails: boolean;
  push_notifications: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
}

export default function NotificationPreferencesScreen() {
  const navigation = useNavigation();
  const { state, updateNotificationPreferences } = useApp();
  const [saving, setSaving] = useState(false);
  
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    order_updates: true,
    new_followers: true,
    sales_alerts: true,
    messages: true,
    promotions: false,
    product_reviews: true,
    inventory_alerts: true,
    marketing_emails: false,
    push_notifications: true,
    email_notifications: true,
    sms_notifications: false,
  });

  const [originalPreferences, setOriginalPreferences] = useState<NotificationPreferences>(preferences);

  useEffect(() => {
    // Load existing notification preferences
    if (state.user?.notification_preferences) {
      const prefs = {
        ...preferences,
        ...state.user.notification_preferences,
      };
      setPreferences(prefs);
      setOriginalPreferences(prefs);
    }
  }, [state.user]);

  const hasChanges = () => {
    return JSON.stringify(preferences) !== JSON.stringify(originalPreferences);
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      navigation.goBack();
      return;
    }

    setSaving(true);
    try {
      // Update notification preferences in database
      await updateNotificationPreferences(preferences);

      setOriginalPreferences(preferences);
      Alert.alert('Success', 'Notification preferences updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification preferences. Please try again.');
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

  const togglePreference = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderNotificationItem = (
    title: string,
    description: string,
    key: keyof NotificationPreferences,
    icon: string
  ) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationHeader}>
        <View style={styles.notificationIcon}>
          <Ionicons name={icon as any} size={20} color={colors.primary} />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{title}</Text>
          <Text style={styles.notificationDescription}>{description}</Text>
        </View>
        <Switch
          value={preferences[key]}
          onValueChange={() => togglePreference(key)}
          trackColor={{ true: colors.primary, false: colors.disabled }}
          thumbColor={preferences[key] ? colors.primary : colors.disabled}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Preferences</Text>
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Notifications</Text>
          <Text style={styles.sectionDescription}>
            Stay updated on important business activities and customer interactions.
          </Text>

          {renderNotificationItem(
            'Order Updates',
            'Get notified when orders are placed, shipped, or delivered',
            'order_updates',
            'receipt-outline'
          )}

          {renderNotificationItem(
            'Sales Alerts',
            'Receive notifications about new sales and revenue milestones',
            'sales_alerts',
            'trending-up-outline'
          )}

          {renderNotificationItem(
            'New Followers',
            'Get notified when customers follow your store',
            'new_followers',
            'people-outline'
          )}

          {renderNotificationItem(
            'Messages',
            'Receive notifications for customer messages and inquiries',
            'messages',
            'chatbubble-outline'
          )}

          {renderNotificationItem(
            'Product Reviews',
            'Get notified when customers leave reviews on your products',
            'product_reviews',
            'star-outline'
          )}

          {renderNotificationItem(
            'Inventory Alerts',
            'Get notified when products are running low on stock',
            'inventory_alerts',
            'warning-outline'
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Marketing & Promotions</Text>
          <Text style={styles.sectionDescription}>
            Control promotional and marketing communications.
          </Text>

          {renderNotificationItem(
            'Promotions',
            'Receive notifications about platform promotions and deals',
            'promotions',
            'gift-outline'
          )}

          {renderNotificationItem(
            'Marketing Emails',
            'Receive marketing emails from the platform',
            'marketing_emails',
            'mail-outline'
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Channels</Text>
          <Text style={styles.sectionDescription}>
            Choose how you want to receive notifications.
          </Text>

          {renderNotificationItem(
            'Push Notifications',
            'Receive notifications on your device',
            'push_notifications',
            'notifications-outline'
          )}

          {renderNotificationItem(
            'Email Notifications',
            'Receive notifications via email',
            'email_notifications',
            'mail-outline'
          )}

          {renderNotificationItem(
            'SMS Notifications',
            'Receive notifications via text message',
            'sms_notifications',
            'chatbubble-outline'
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Notification Settings</Text>
          <Text style={styles.infoText}>
            You can change these settings at any time. Some notifications 
            are required for business operations and cannot be disabled.
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
  section: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.textSecondary,
    marginBottom: spacing.m,
  },
  notificationItem: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  notificationDescription: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.textSecondary,
    lineHeight: 18,
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
}); 