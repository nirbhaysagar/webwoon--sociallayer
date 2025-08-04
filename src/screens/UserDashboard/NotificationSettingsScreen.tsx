import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BackButton } from '../../components/BackButton';
import { useApp } from '../../context/AppContext';
import notificationService, { NotificationPreference } from '../../services/notificationService';
import { theme } from '../../constants/theme';

const NotificationSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useApp();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const categories = [
    { key: 'order', label: 'Order Updates', description: 'Order confirmations, shipping updates, delivery notifications' },
    { key: 'live_stream', label: 'Live Streams', description: 'When sellers go live, stream reminders' },
    { key: 'message', label: 'Messages', description: 'New messages from sellers and other users' },
    { key: 'store', label: 'Store Updates', description: 'New products, price drops, back in stock alerts' },
    { key: 'social', label: 'Social', description: 'New followers, likes, comments' },
    { key: 'system', label: 'System', description: 'App updates, maintenance notifications' },
    { key: 'promotion', label: 'Promotions', description: 'Sales, discounts, special offers' },
  ];

  const loadPreferences = async () => {
    try {
      if (!user?.id) return;
      
      let prefs = await notificationService.getUserPreferences(user.id);
      
      // If no preferences exist, create default ones
      if (prefs.length === 0) {
        await notificationService.createDefaultPreferences(user.id);
        prefs = await notificationService.getUserPreferences(user.id);
      }
      
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
      Alert.alert('Error', 'Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPreferences();
    setRefreshing(false);
  };

  const updatePreference = async (
    category: string,
    field: keyof NotificationPreference,
    value: boolean
  ) => {
    try {
      if (!user?.id) return;

      const success = await notificationService.updatePreference(user.id, category, {
        [field]: value
      });

      if (success) {
        // Update local state
        setPreferences(prev => 
          prev.map(pref => 
            pref.category === category 
              ? { ...pref, [field]: value }
              : pref
          )
        );
      } else {
        Alert.alert('Error', 'Failed to update setting');
      }
    } catch (error) {
      console.error('Error updating preference:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const getPreference = (category: string) => {
    return preferences.find(p => p.category === category);
  };

  const renderCategoryItem = (category: typeof categories[0]) => {
    const preference = getPreference(category.key);
    
    if (!preference) return null;

    return (
      <View key={category.key} style={styles.categoryItem}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>{category.label}</Text>
          <Text style={styles.categoryDescription}>{category.description}</Text>
        </View>
        
        <View style={styles.switchesContainer}>
          <View style={styles.switchItem}>
            <Text style={styles.switchLabel}>Push Notifications</Text>
            <Switch
              value={preference.push_enabled}
              onValueChange={(value) => updatePreference(category.key, 'push_enabled', value)}
              trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary }}
              thumbColor={theme.colors.white}
            />
          </View>
          
          <View style={styles.switchItem}>
            <Text style={styles.switchLabel}>Email Notifications</Text>
            <Switch
              value={preference.email_enabled}
              onValueChange={(value) => updatePreference(category.key, 'email_enabled', value)}
              trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary }}
              thumbColor={theme.colors.white}
            />
          </View>
          
          <View style={styles.switchItem}>
            <Text style={styles.switchLabel}>In-App Notifications</Text>
            <Switch
              value={preference.in_app_enabled}
              onValueChange={(value) => updatePreference(category.key, 'in_app_enabled', value)}
              trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary }}
              thumbColor={theme.colors.white}
            />
          </View>
          
          <View style={styles.switchItem}>
            <Text style={styles.switchLabel}>Sound</Text>
            <Switch
              value={preference.sound_enabled}
              onValueChange={(value) => updatePreference(category.key, 'sound_enabled', value)}
              trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary }}
              thumbColor={theme.colors.white}
            />
          </View>
          
          <View style={styles.switchItem}>
            <Text style={styles.switchLabel}>Vibration</Text>
            <Switch
              value={preference.vibration_enabled}
              onValueChange={(value) => updatePreference(category.key, 'vibration_enabled', value)}
              trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary }}
              thumbColor={theme.colors.white}
            />
          </View>
        </View>
      </View>
    );
  };

  useEffect(() => {
    loadPreferences();
  }, [user?.id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <BackButton />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading notification settings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton />
      
      <View style={styles.header}>
        <Text style={styles.title}>Notification Settings</Text>
        <Text style={styles.subtitle}>
          Customize how you receive notifications
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {categories.map(renderCategoryItem)}
          
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>About Notifications</Text>
            <Text style={styles.infoText}>
              • Push notifications appear on your device even when the app is closed{'\n'}
              • Email notifications are sent to your registered email address{'\n'}
              • In-app notifications appear within the app{'\n'}
              • You can change these settings at any time
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  categoryItem: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryHeader: {
    marginBottom: theme.spacing.md,
  },
  categoryTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  categoryDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  switchesContainer: {
    gap: theme.spacing.md,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  switchLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  infoSection: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  infoTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
  },
});

export default NotificationSettingsScreen; 
