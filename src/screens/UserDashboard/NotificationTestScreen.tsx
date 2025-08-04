import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { NotificationService } from '../../services/notificationService';

export default function NotificationTestScreen({ navigation }) {
  const [sending, setSending] = useState(false);

  const handleSendNotification = async (templateKey: string, data?: any) => {
    try {
      setSending(true);
      await NotificationService.sendNotificationByTemplate(templateKey, data);
      Alert.alert('Success', 'Notification sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
      Alert.alert('Error', 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleSendTestNotification = async () => {
    try {
      setSending(true);
      await NotificationService.sendTestNotification();
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    } finally {
      setSending(false);
    }
  };

  const notificationTests = [
    {
      title: 'Order Shipped',
      description: 'Test order shipping notification',
      icon: 'bag-outline',
      color: colors.primary,
      onPress: () => handleSendNotification('orderShipped', { orderId: '12345' }),
    },
    {
      title: 'Order Delivered',
      description: 'Test order delivery notification',
      icon: 'checkmark-circle-outline',
      color: colors.success,
      onPress: () => handleSendNotification('orderDelivered', { orderId: '12345' }),
    },
    {
      title: 'New Product',
      description: 'Test new product notification',
      icon: 'cube-outline',
      color: colors.success,
      onPress: () => handleSendNotification('newProduct', { 
        productId: '123', 
        productName: 'Wireless Headphones', 
        storeName: 'TechStore' 
      }),
    },
    {
      title: 'Promotion',
      description: 'Test promotion notification',
      icon: 'pricetag-outline',
      color: colors.warning,
      onPress: () => handleSendNotification('promotion', { discount: 20, category: 'Electronics' }),
    },
    {
      title: 'Social Like',
      description: 'Test social interaction notification',
      icon: 'heart-outline',
      color: colors.favorite,
      onPress: () => handleSendNotification('socialLike', { userId: '123', userName: 'John Doe' }),
    },
    {
      title: 'System Update',
      description: 'Test system update notification',
      icon: 'settings-outline',
      color: colors.info,
      onPress: () => handleSendNotification('systemUpdate'),
    },
  ];

  const renderTestButton = (test: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.testButton}
      onPress={test.onPress}
      disabled={sending}
    >
      <View style={[styles.iconContainer, { backgroundColor: test.color + '20' }]}>
        <Ionicons name={test.icon as any} size={24} color={test.color} />
      </View>
      <View style={styles.testContent}>
        <Text style={styles.testTitle}>{test.title}</Text>
        <Text style={styles.testDescription}>{test.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Test</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Section */}
        <View style={styles.infoSection}>
          <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            Test different types of notifications to see how they appear and behave.
          </Text>
        </View>

        {/* Quick Test */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Test</Text>
          <TouchableOpacity
            style={styles.quickTestButton}
            onPress={handleSendTestNotification}
            disabled={sending}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.white} />
            <Text style={styles.quickTestText}>
              {sending ? 'Sending...' : 'Send Test Notification'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notification Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          {notificationTests.map(renderTestButton)}
        </View>

        {/* Navigation Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Management</Text>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('NotificationHistory')}
          >
            <View style={styles.navContent}>
              <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.navText}>View Notification History</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('NotificationPreferences')}
          >
            <View style={styles.navContent}>
              <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.navText}>Notification Preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.sizes.lg,
    ...typography.weights.semibold,
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: spacing.md,
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.sizes.md,
    ...typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  quickTestButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTestText: {
    ...typography.sizes.md,
    ...typography.weights.semibold,
    color: colors.white,
    marginLeft: spacing.sm,
  },
  testButton: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  testContent: {
    flex: 1,
  },
  testTitle: {
    ...typography.sizes.sm,
    ...typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  testDescription: {
    ...typography.sizes.xs,
    ...typography.weights.regular,
    color: colors.textSecondary,
  },
  navButton: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.xs,
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navText: {
    ...typography.sizes.sm,
    ...typography.weights.medium,
    color: colors.text,
    marginLeft: spacing.sm,
  },
}); 