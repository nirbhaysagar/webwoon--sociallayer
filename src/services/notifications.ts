import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Web-compatible device detection
const isDevice = Platform.OS !== 'web';

// Configure notification behavior (only on mobile)
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export interface NotificationData {
  type: 'order_update' | 'new_follower' | 'sale_alert' | 'message' | 'promotion';
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: boolean;
  priority?: 'high' | 'normal' | 'low';
}

export class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;
  private isInitialized = false;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Request permissions (platform-specific)
      if (Platform.OS === 'web') {
        // Web notification permissions
        if ('Notification' in window) {
          if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
              console.log('Web notification permission denied');
              return;
            }
          }
        }
      } else {
        // Mobile notification permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('Failed to get push token for push notification!');
          return;
        }
      }

      // Get push token (only on mobile devices)
      if (isDevice) {
        try {
          const token = await Notifications.getExpoPushTokenAsync({
            projectId: process.env.EXPO_PUBLIC_PROJECT_ID || 'your-project-id',
          });
          this.expoPushToken = token.data;
          console.log('Expo push token:', this.expoPushToken);
        } catch (error) {
          console.log('Push notifications not available on this platform');
        }
      } else {
        console.log('Push notifications not supported on web platform');
      }

      // Set up notification listeners
      this.setupNotificationListeners();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  private setupNotificationListeners() {
    // Only set up listeners on mobile devices
    if (!isDevice) {
      console.log('Notification listeners not available on web platform');
      return;
    }

    // Handle notification received while app is running
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Handle notification response (user tapped notification)
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }

  private handleNotificationReceived(notification: Notifications.Notification) {
    // Handle different notification types
    const data = notification.request.content.data;
    
    switch (data?.type) {
      case 'order_update':
        this.handleOrderUpdateNotification(data);
        break;
      case 'new_follower':
        this.handleNewFollowerNotification(data);
        break;
      case 'sale_alert':
        this.handleSaleAlertNotification(data);
        break;
      case 'message':
        this.handleMessageNotification(data);
        break;
      case 'promotion':
        this.handlePromotionNotification(data);
        break;
    }
  }

  private handleNotificationResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data;
    
    // Navigate based on notification type
    switch (data?.type) {
      case 'order_update':
        // Navigate to order details
        this.navigateToOrder(data.orderId);
        break;
      case 'new_follower':
        // Navigate to user profile
        this.navigateToProfile(data.followerId);
        break;
      case 'sale_alert':
        // Navigate to product/sale
        this.navigateToProduct(data.productId);
        break;
      case 'message':
        // Navigate to messages
        this.navigateToMessages(data.senderId);
        break;
      case 'promotion':
        // Navigate to promotion
        this.navigateToPromotion(data.promotionId);
        break;
    }
  }

  // Navigation handlers (to be implemented with navigation)
  private navigateToOrder(orderId: string) {
    console.log('Navigate to order:', orderId);
    // TODO: Implement navigation
  }

  private navigateToProfile(userId: string) {
    console.log('Navigate to profile:', userId);
    // TODO: Implement navigation
  }

  private navigateToProduct(productId: string) {
    console.log('Navigate to product:', productId);
    // TODO: Implement navigation
  }

  private navigateToMessages(senderId: string) {
    console.log('Navigate to messages:', senderId);
    // TODO: Implement navigation
  }

  private navigateToPromotion(promotionId: string) {
    console.log('Navigate to promotion:', promotionId);
    // TODO: Implement navigation
  }

  // Notification handler methods
  private handleOrderUpdateNotification(data: any) {
    console.log('Handling order update notification:', data);
    if (data.orderId) {
      this.navigateToOrder(data.orderId);
    }
  }

  private handleNewFollowerNotification(data: any) {
    console.log('Handling new follower notification:', data);
    if (data.followerId) {
      this.navigateToProfile(data.followerId);
    }
  }

  private handleSaleAlertNotification(data: any) {
    console.log('Handling sale alert notification:', data);
    if (data.productId) {
      this.navigateToProduct(data.productId);
    }
  }

  private handleMessageNotification(data: any) {
    console.log('Handling message notification:', data);
    if (data.senderId) {
      this.navigateToMessages(data.senderId);
    }
  }

  private handlePromotionNotification(data: any) {
    console.log('Handling promotion notification:', data);
    if (data.promotionId) {
      this.navigateToPromotion(data.promotionId);
    }
  }

  // 1. ORDER STATUS UPDATES
  async sendOrderUpdateNotification(userId: string, orderData: any) {
    const notification: NotificationData = {
      type: 'order_update',
      title: `Order ${orderData.status}`,
      body: `Your order #${orderData.orderNumber} has been ${orderData.status.toLowerCase()}`,
      data: {
        orderId: orderData.id,
        orderNumber: orderData.orderNumber,
        status: orderData.status,
      },
      priority: 'high',
    };

    await this.sendNotification(userId, notification);
  }

  // 2. NEW FOLLOWER NOTIFICATIONS
  async sendNewFollowerNotification(userId: string, followerData: any) {
    const notification: NotificationData = {
      type: 'new_follower',
      title: 'New Follower',
      body: `${followerData.name} started following you`,
      data: {
        followerId: followerData.id,
        followerName: followerData.name,
      },
      priority: 'normal',
    };

    await this.sendNotification(userId, notification);
  }

  // 3. SALE AND PROMOTION ALERTS
  async sendSaleAlertNotification(userId: string, saleData: any) {
    const notification: NotificationData = {
      type: 'sale_alert',
      title: 'Flash Sale Alert!',
      body: `${saleData.storeName} is having a ${saleData.discount}% off sale!`,
      data: {
        productId: saleData.productId,
        storeId: saleData.storeId,
        discount: saleData.discount,
      },
      priority: 'high',
    };

    await this.sendNotification(userId, notification);
  }

  // 4. MESSAGE NOTIFICATIONS
  async sendMessageNotification(userId: string, messageData: any) {
    const notification: NotificationData = {
      type: 'message',
      title: `Message from ${messageData.senderName}`,
      body: messageData.preview,
      data: {
        senderId: messageData.senderId,
        messageId: messageData.id,
        senderName: messageData.senderName,
      },
      priority: 'high',
    };

    await this.sendNotification(userId, notification);
  }

  // 5. PROMOTION NOTIFICATIONS
  async sendPromotionNotification(userId: string, promotionData: any) {
    const notification: NotificationData = {
      type: 'promotion',
      title: promotionData.title,
      body: promotionData.description,
      data: {
        promotionId: promotionData.id,
        storeId: promotionData.storeId,
      },
      priority: 'normal',
    };

    await this.sendNotification(userId, notification);
  }

  // Generic notification sender
  private async sendNotification(userId: string, notification: NotificationData) {
    try {
      // Store notification in database
      const { error: dbError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: notification.type,
          title: notification.title,
          message: notification.body,
          data: notification.data,
        });

      if (dbError) {
        console.error('Error storing notification:', dbError);
      }

      // Send push notification (only on mobile devices)
      if (this.expoPushToken && isDevice) {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: notification.title,
              body: notification.body,
              data: notification.data,
              sound: notification.sound !== false,
            },
            trigger: null, // Send immediately
          });
        } catch (error) {
          console.log('Could not send push notification:', error);
        }
      } else if (Platform.OS === 'web') {
        // Web fallback: show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.body,
            icon: '/favicon.ico',
          });
        }
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Get user's push token
  async getUserPushToken(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('push_token')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data?.push_token || null;
    } catch (error) {
      console.error('Error getting user push token:', error);
      return null;
    }
  }

  // Update user's push token
  async updateUserPushToken(userId: string, token: string) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ push_token: token })
        .eq('id', userId);

      if (error) throw error;
      console.log('Push token updated for user:', userId);
    } catch (error) {
      console.error('Error updating push token:', error);
    }
  }

  // Get user's notification preferences
  async getNotificationPreferences(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('notification_preferences')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data?.notification_preferences || {
        order_updates: true,
        new_followers: true,
        sales_alerts: true,
        messages: true,
        promotions: true,
      };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return {
        order_updates: true,
        new_followers: true,
        sales_alerts: true,
        messages: true,
        promotions: true,
      };
    }
  }

  // Update user's notification preferences
  async updateNotificationPreferences(userId: string, preferences: any) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ notification_preferences: preferences })
        .eq('id', userId);

      if (error) throw error;
      console.log('Notification preferences updated for user:', userId);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  }

  // Clear all notifications for a user
  async clearNotifications(userId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      console.log('Notifications cleared for user:', userId);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  // Get unread notification count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance(); 