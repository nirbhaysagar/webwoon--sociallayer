import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, shadows } from '../constants/theme';
import { useNotifications } from '../context/NotificationContext';

const NotificationDemo = () => {
  const {
    sendOrderNotification,
    sendPromotionNotification,
    sendProductNotification,
    sendMessageNotification,
    sendSystemNotification,
    hasPermission,
    initializeNotifications,
  } = useNotifications();

  const handleTestOrderNotification = async () => {
    if (!hasPermission) {
      const granted = await initializeNotifications();
      if (!granted) {
        Alert.alert('Permission Required', 'Please enable notifications to test this feature.');
        return;
      }
    }
    
    await sendOrderNotification('order-123', 'shipped', 'ORD-2024-001');
    Alert.alert('Success', 'Order notification sent!');
  };

  const handleTestPromotionNotification = async () => {
    if (!hasPermission) {
      const granted = await initializeNotifications();
      if (!granted) {
        Alert.alert('Permission Required', 'Please enable notifications to test this feature.');
        return;
      }
    }
    
    await sendPromotionNotification(
      'promo-456',
      'Flash Sale Alert!',
      'Get 50% off on all electronics today only!',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
    );
    Alert.alert('Success', 'Promotion notification sent!');
  };

  const handleTestProductNotification = async () => {
    if (!hasPermission) {
      const granted = await initializeNotifications();
      if (!granted) {
        Alert.alert('Permission Required', 'Please enable notifications to test this feature.');
        return;
      }
    }
    
    await sendProductNotification('product-789', 'iPhone 15 Pro', 'restock');
    Alert.alert('Success', 'Product notification sent!');
  };

  const handleTestMessageNotification = async () => {
    if (!hasPermission) {
      const granted = await initializeNotifications();
      if (!granted) {
        Alert.alert('Permission Required', 'Please enable notifications to test this feature.');
        return;
      }
    }
    
    await sendMessageNotification('user-123', 'TechStore', 'Your order has been shipped!');
    Alert.alert('Success', 'Message notification sent!');
  };

  const handleTestSystemNotification = async () => {
    if (!hasPermission) {
      const granted = await initializeNotifications();
      if (!granted) {
        Alert.alert('Permission Required', 'Please enable notifications to test this feature.');
        return;
      }
    }
    
    await sendSystemNotification(
      'App Update Available',
      'A new version of the app is available with exciting new features!'
    );
    Alert.alert('Success', 'System notification sent!');
  };

  const renderDemoButton = (
    title: string,
    icon: string,
    onPress: () => void,
    color: string = colors.primary
  ) => (
    <TouchableOpacity style={[styles.demoButton, { borderColor: color }]} onPress={onPress}>
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={[styles.demoButtonText, { color }]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Demo</Text>
      <Text style={styles.subtitle}>Test different types of notifications</Text>
      
      <View style={styles.buttonGrid}>
        {renderDemoButton(
          'Order Update',
          'receipt-outline',
          handleTestOrderNotification,
          colors.success
        )}
        
        {renderDemoButton(
          'Promotion',
          'pricetag-outline',
          handleTestPromotionNotification,
          colors.discount
        )}
        
        {renderDemoButton(
          'Product Restock',
          'add-circle-outline',
          handleTestProductNotification,
          colors.primary
        )}
        
        {renderDemoButton(
          'Message',
          'chatbubble-outline',
          handleTestMessageNotification,
          colors.warning
        )}
        
        {renderDemoButton(
          'System Alert',
          'notifications-outline',
          handleTestSystemNotification,
          colors.error
        )}
      </View>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Permission Status: {hasPermission ? 'Granted' : 'Not Granted'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.l,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.s,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.l,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.l,
  },
  demoButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.m,
    borderWidth: 2,
    borderRadius: radii.medium,
    backgroundColor: colors.card,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  demoButtonText: {
    marginLeft: spacing.s,
    fontSize: 14,
    fontWeight: '600',
  },
  statusContainer: {
    padding: spacing.m,
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default NotificationDemo; 