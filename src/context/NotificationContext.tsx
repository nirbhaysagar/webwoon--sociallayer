import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notificationService, NotificationPreferences, NotificationData } from '../services/notifications';

interface NotificationContextType {
  // State
  isInitialized: boolean;
  hasPermission: boolean;
  preferences: NotificationPreferences | null;
  unreadCount: number;
  
  // Actions
  initializeNotifications: () => Promise<boolean>;
  updatePreferences: (preferences: NotificationPreferences) => Promise<boolean>;
  sendOrderNotification: (orderId: string, status: string, orderNumber: string) => Promise<void>;
  sendPromotionNotification: (promotionId: string, title: string, description: string, image?: string) => Promise<void>;
  sendProductNotification: (productId: string, productName: string, action: 'restock' | 'price_drop' | 'back_in_stock') => Promise<void>;
  sendMessageNotification: (senderId: string, senderName: string, message: string) => Promise<void>;
  sendSystemNotification: (title: string, body: string, data?: any) => Promise<void>;
  clearUnreadCount: () => void;
  incrementUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initialize notifications when component mounts
    initializeNotifications();
    
    // Load user preferences
    loadPreferences();
    
    // Cleanup on unmount
    return () => {
      notificationService.cleanup();
    };
  }, []);

  const initializeNotifications = async (): Promise<boolean> => {
    try {
      const success = await notificationService.initialize();
      setIsInitialized(success);
      setHasPermission(success);
      return success;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      setIsInitialized(false);
      setHasPermission(false);
      return false;
    }
  };

  const loadPreferences = async () => {
    try {
      const userPreferences = await notificationService.getNotificationPreferences();
      if (userPreferences) {
        setPreferences(userPreferences);
      } else {
        // Set default preferences
        const defaultPreferences: NotificationPreferences = {
          orders: true,
          promotions: true,
          products: true,
          messages: true,
          system: true,
          marketing: false,
        };
        setPreferences(defaultPreferences);
        await notificationService.updateNotificationPreferences(defaultPreferences);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  const updatePreferences = async (newPreferences: NotificationPreferences): Promise<boolean> => {
    try {
      const success = await notificationService.updateNotificationPreferences(newPreferences);
      if (success) {
        setPreferences(newPreferences);
      }
      return success;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  };

  const sendOrderNotification = async (orderId: string, status: string, orderNumber: string): Promise<void> => {
    try {
      if (preferences?.orders) {
        await notificationService.sendOrderNotification(orderId, status, orderNumber);
        incrementUnreadCount();
      }
    } catch (error) {
      console.error('Error sending order notification:', error);
    }
  };

  const sendPromotionNotification = async (promotionId: string, title: string, description: string, image?: string): Promise<void> => {
    try {
      if (preferences?.promotions) {
        await notificationService.sendPromotionNotification(promotionId, title, description, image);
        incrementUnreadCount();
      }
    } catch (error) {
      console.error('Error sending promotion notification:', error);
    }
  };

  const sendProductNotification = async (productId: string, productName: string, action: 'restock' | 'price_drop' | 'back_in_stock'): Promise<void> => {
    try {
      if (preferences?.products) {
        await notificationService.sendProductNotification(productId, productName, action);
        incrementUnreadCount();
      }
    } catch (error) {
      console.error('Error sending product notification:', error);
    }
  };

  const sendMessageNotification = async (senderId: string, senderName: string, message: string): Promise<void> => {
    try {
      if (preferences?.messages) {
        await notificationService.sendMessageNotification(senderId, senderName, message);
        incrementUnreadCount();
      }
    } catch (error) {
      console.error('Error sending message notification:', error);
    }
  };

  const sendSystemNotification = async (title: string, body: string, data?: any): Promise<void> => {
    try {
      if (preferences?.system) {
        await notificationService.sendSystemNotification(title, body, data);
        incrementUnreadCount();
      }
    } catch (error) {
      console.error('Error sending system notification:', error);
    }
  };

  const clearUnreadCount = () => {
    setUnreadCount(0);
  };

  const incrementUnreadCount = () => {
    setUnreadCount(prev => prev + 1);
  };

  const value: NotificationContextType = {
    isInitialized,
    hasPermission,
    preferences,
    unreadCount,
    initializeNotifications,
    updatePreferences,
    sendOrderNotification,
    sendPromotionNotification,
    sendProductNotification,
    sendMessageNotification,
    sendSystemNotification,
    clearUnreadCount,
    incrementUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 