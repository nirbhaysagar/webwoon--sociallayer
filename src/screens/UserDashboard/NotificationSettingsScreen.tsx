import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from '../SellerDashboard/components/HeaderWithMenu';
import { scale } from '../../lib/scale';
import { useNavigation } from '@react-navigation/native';
import { useNotifications } from '../../context/NotificationContext';

const notificationSettings = [
  {
    id: 'orders',
    title: 'Order Updates',
    description: 'Get notified about order status changes, shipping updates, and delivery confirmations',
    icon: 'receipt-outline',
    enabled: true,
  },
  {
    id: 'promotions',
    title: 'Promotions & Deals',
    description: 'Receive notifications about sales, discounts, and special offers',
    icon: 'pricetag-outline',
    enabled: true,
  },
  {
    id: 'new_products',
    title: 'New Products',
    description: 'Get notified when stores you follow add new products',
    icon: 'add-circle-outline',
    enabled: false,
  },
  {
    id: 'messages',
    title: 'Messages',
    description: 'Receive notifications for new messages from sellers and support',
    icon: 'chatbubble-outline',
    enabled: true,
  },
  {
    id: 'reviews',
    title: 'Review Reminders',
    description: 'Get reminded to leave reviews for your recent purchases',
    icon: 'star-outline',
    enabled: false,
  },
  {
    id: 'security',
    title: 'Security Alerts',
    description: 'Get notified about account security events and login attempts',
    icon: 'shield-outline',
    enabled: true,
  },
  {
    id: 'newsletter',
    title: 'Newsletter',
    description: 'Receive our weekly newsletter with shopping tips and trends',
    icon: 'mail-outline',
    enabled: false,
  },
];

export default function NotificationSettingsScreen() {
  const navigation = useNavigation();
  const { preferences, updatePreferences, hasPermission, initializeNotifications } = useNotifications();
  const [settings, setSettings] = useState(notificationSettings);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Update settings when preferences change
    if (preferences) {
      const updatedSettings = notificationSettings.map(setting => ({
        ...setting,
        enabled: preferences[setting.id as keyof typeof preferences] || false,
      }));
      setSettings(updatedSettings);
    }
  }, [preferences]);

  const handleToggleSetting = async (settingId) => {
    if (!hasPermission) {
      const granted = await initializeNotifications();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to use this feature.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    const updatedSettings = settings.map(setting => 
      setting.id === settingId 
        ? { ...setting, enabled: !setting.enabled }
        : setting
    );
    setSettings(updatedSettings);
    
    const setting = settings.find(s => s.id === settingId);
    const newStatus = !setting.enabled;
    
    // Update preferences in the notification system
    if (preferences) {
      const newPreferences = {
        ...preferences,
        [settingId]: newStatus,
      };
      
      setIsLoading(true);
      const success = await updatePreferences(newPreferences);
      setIsLoading(false);
      
      if (success) {
        Alert.alert(
          'Notification Updated',
          `${setting.title} notifications are now ${newStatus ? 'enabled' : 'disabled'}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          'Failed to update notification preferences. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleSaveAllSettings = () => {
    Alert.alert(
      'Settings Saved',
      'Your notification preferences have been updated successfully!',
      [{ text: 'OK' }]
    );
  };

  const renderSettingItem = (setting) => (
    <View key={setting.id} style={styles.settingItem}>
      <View style={styles.settingHeader}>
        <View style={styles.settingInfo}>
          <Ionicons name={setting.icon} size={24} color={colors.textSecondary} style={styles.settingIcon} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{setting.title}</Text>
            <Text style={styles.settingDescription}>{setting.description}</Text>
          </View>
        </View>
        <Switch
          value={setting.enabled}
          onValueChange={() => handleToggleSetting(setting.id)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={setting.enabled ? colors.background : colors.textSecondary}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithMenu />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Notification Settings</Text>
        </View>
        <Text style={styles.subtitle}>Configure your notification preferences</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.settingsContainer}>
          {settings.map(renderSettingItem)}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Notification Tips</Text>
              <Text style={styles.infoDescription}>
                You can change these settings at any time. Some notifications are required for account security and order updates.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveAllSettings}>
        <Text style={styles.saveButtonText}>Save All Settings</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.m,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  backButton: {
    padding: spacing.s,
    marginRight: spacing.s,
  },
  title: {
    fontSize: scale(24),
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  subtitle: {
    fontSize: scale(16),
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.m,
  },
  settingsContainer: {
    marginBottom: spacing.l,
  },
  settingItem: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  settingIcon: {
    marginRight: spacing.m,
    marginTop: 2,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: scale(16),
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: scale(14),
    color: colors.textSecondary,
    lineHeight: 20,
  },
  infoSection: {
    marginBottom: spacing.l,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    ...shadows.card,
  },
  infoText: {
    flex: 1,
    marginLeft: spacing.m,
  },
  infoTitle: {
    fontSize: scale(16),
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  infoDescription: {
    fontSize: scale(14),
    color: colors.textSecondary,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.medium,
    padding: spacing.m,
    margin: spacing.m,
    alignItems: 'center',
    ...shadows.card,
  },
  saveButtonText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.text,
  },
}); 