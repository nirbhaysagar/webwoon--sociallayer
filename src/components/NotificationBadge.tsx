import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import notificationService from '../services/notificationService';
import { theme } from '../constants/theme';

interface NotificationBadgeProps {
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  onPress, 
  size = 'medium' 
}) => {
  const { user } = useApp();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadUnreadCount = async () => {
    try {
      if (!user?.id) {
        setUnreadCount(0);
        return;
      }

      const count = await notificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnreadCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const getBadgeSize = () => {
    switch (size) {
      case 'small':
        return { width: 16, height: 16, fontSize: 10 };
      case 'large':
        return { width: 24, height: 24, fontSize: 12 };
      default:
        return { width: 20, height: 20, fontSize: 11 };
    }
  };

  const badgeSize = getBadgeSize();

  if (loading || unreadCount === 0) {
    return null;
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={[
        styles.badge,
        {
          width: badgeSize.width,
          height: badgeSize.height,
        }
      ]}>
        <Text style={[
          styles.badgeText,
          { fontSize: badgeSize.fontSize }
        ]}>
          {unreadCount > 99 ? '99+' : unreadCount.toString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 16,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: theme.colors.white,
    fontWeight: theme.typography.weights.bold,
    textAlign: 'center',
  },
});

export default NotificationBadge; 
