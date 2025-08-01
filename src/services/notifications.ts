import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  type: 'order' | 'promotion' | 'product' | 'message' | 'system';
  priority?: 'high' | 'normal' | 'low';
  image?: string;
  actionUrl?: string;
}

export interface NotificationPreferences {
  orders: boolean;
  promotions: boolean;
  products: boolean;
  messages: boolean;
  system: boolean;
  marketing: boolean;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  async initialize() {
    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return false;
      }

      // Get push token
      if (Device.isDevice) {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: process.env.EXPO_PROJECT_ID, // Add your Expo project ID
        });
        this.expoPushToken = token.data;
        console.log('Push token:', this.expoPushToken);
        
        // Save token to Supabase
        await this.saveTokenToDatabase(this.expoPushToken);
      } else {
        console.log('Must use physical device for Push Notifications');
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  private async saveTokenToDatabase(token: string) {
    try {
      const { error } = await supabase
        .from('user_notification_tokens')
        .upsert({
          user_id: 'current-user-id', // Replace with actual user ID
          expo_push_token: token,
          device_type: Platform.OS,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error saving token to database:', error);
      }
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  private setupNotificationListeners() {
    // Handle notification received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Handle notification response (user tapped notification)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  private handleNotificationReceived(notification: Notifications.Notification) {
    // Handle different notification types
    const data = notification.request.content.data;
    
    switch (data?.type) {
      case 'order':
        this.handleOrderNotification(data);
        break;
      case 'promotion':
        this.handlePromotionNotification(data);
        break;
      case 'product':
        this.handleProductNotification(data);
        break;
      case 'message':
        this.handleMessageNotification(data);
        break;
      case 'system':
        this.handleSystemNotification(data);
        break;
    }
  }

  private handleNotificationResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data;
    
    // Navigate based on notification type
    switch (data?.type) {
      case 'order':
        // Navigate to order details
        this.navigateToOrder(data.orderId);
        break;
      case 'product':
        // Navigate to product details
        this.navigateToProduct(data.productId);
        break;
      case 'message':
        // Navigate to messages
        this.navigateToMessages(data.senderId);
        break;
      case 'promotion':
        // Navigate to promotion or product
        this.navigateToPromotion(data.promotionId);
        break;
    }
  }

  private handleOrderNotification(data: any) {
    // Update order status in app state
    console.log('Order notification:', data);
  }

  private handlePromotionNotification(data: any) {
    // Show promotion banner or update promotions list
    console.log('Promotion notification:', data);
  }

  private handleProductNotification(data: any) {
    // Update product availability or show restock notification
    console.log('Product notification:', data);
  }

  private handleMessageNotification(data: any) {
    // Update message count or show message preview
    console.log('Message notification:', data);
  }

  private handleSystemNotification(data: any) {
    // Handle system-wide notifications
    console.log('System notification:', data);
  }

  private navigateToOrder(orderId: string) {
    // Navigation logic for order details
    console.log('Navigate to order:', orderId);
  }

  private navigateToProduct(productId: string) {
    // Navigation logic for product details
    console.log('Navigate to product:', productId);
  }

  private navigateToMessages(senderId: string) {
    // Navigation logic for messages
    console.log('Navigate to messages:', senderId);
  }

  private navigateToPromotion(promotionId: string) {
    // Navigation logic for promotions
    console.log('Navigate to promotion:', promotionId);
  }

  // Send local notification
  async sendLocalNotification(notification: NotificationData) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: true,
          priority: notification.priority || 'normal',
          ...(notification.image && { attachments: [{ url: notification.image }] }),
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  // Schedule notification for later
  async scheduleNotification(notification: NotificationData, trigger: any) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: true,
          priority: notification.priority || 'normal',
          ...(notification.image && { attachments: [{ url: notification.image }] }),
        },
        trigger,
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  // Send order status notification
  async sendOrderNotification(orderId: string, status: string, orderNumber: string) {
    const notification: NotificationData = {
      id: `order-${orderId}`,
      title: 'Order Update',
      body: `Your order #${orderNumber} has been ${status.toLowerCase()}`,
      type: 'order',
      priority: 'high',
      data: {
        orderId,
        orderNumber,
        status,
        type: 'order',
      },
    };

    await this.sendLocalNotification(notification);
  }

  // Send promotion notification
  async sendPromotionNotification(promotionId: string, title: string, description: string, image?: string) {
    const notification: NotificationData = {
      id: `promotion-${promotionId}`,
      title,
      body: description,
      type: 'promotion',
      priority: 'normal',
      image,
      data: {
        promotionId,
        type: 'promotion',
      },
    };

    await this.sendLocalNotification(notification);
  }

  // Send product restock notification
  async sendProductNotification(productId: string, productName: string, action: 'restock' | 'price_drop' | 'back_in_stock') {
    let title = '';
    let body = '';

    switch (action) {
      case 'restock':
        title = 'Product Restocked!';
        body = `${productName} is back in stock`;
        break;
      case 'price_drop':
        title = 'Price Drop Alert!';
        body = `${productName} price has dropped`;
        break;
      case 'back_in_stock':
        title = 'Back in Stock!';
        body = `${productName} is now available`;
        break;
    }

    const notification: NotificationData = {
      id: `product-${productId}`,
      title,
      body,
      type: 'product',
      priority: 'normal',
      data: {
        productId,
        productName,
        action,
        type: 'product',
      },
    };

    await this.sendLocalNotification(notification);
  }

  // Send message notification
  async sendMessageNotification(senderId: string, senderName: string, message: string) {
    const notification: NotificationData = {
      id: `message-${senderId}`,
      title: `Message from ${senderName}`,
      body: message,
      type: 'message',
      priority: 'high',
      data: {
        senderId,
        senderName,
        type: 'message',
      },
    };

    await this.sendLocalNotification(notification);
  }

  // Send system notification
  async sendSystemNotification(title: string, body: string, data?: any) {
    const notification: NotificationData = {
      id: `system-${Date.now()}`,
      title,
      body,
      type: 'system',
      priority: 'normal',
      data: {
        ...data,
        type: 'system',
      },
    };

    await this.sendLocalNotification(notification);
  }

  // Update notification preferences
  async updateNotificationPreferences(preferences: NotificationPreferences) {
    try {
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: 'current-user-id', // Replace with actual user ID
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error updating notification preferences:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      return false;
    }
  }

  // Get notification preferences
  async getNotificationPreferences(): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', 'current-user-id') // Replace with actual user ID
        .single();

      if (error) {
        console.error('Error getting notification preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting preferences:', error);
      return null;
    }
  }

  // Clean up listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Get current token
  getToken(): string | null {
    return this.expoPushToken;
  }
}

export const notificationService = new NotificationService(); 