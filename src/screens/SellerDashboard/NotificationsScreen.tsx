import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from './components/HeaderWithMenu';
import { useApp } from '../../context/AppContext';

const GROUPS = ['All', 'Orders', 'Comments', 'Boosts', 'System', 'Products', 'Posts', 'Analytics'];

export default function NotificationsScreen() {
  const { state, loadNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } = useApp();
  const [selectedGroup, setSelectedGroup] = useState('All');

  useEffect(() => {
    loadNotifications();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_update':
        return 'cart-outline';
      case 'comment':
        return 'chatbubble-ellipses-outline';
      case 'boost':
        return 'rocket-outline';
      case 'system':
        return 'alert-circle-outline';
      case 'product_update':
        return 'cube-outline';
      case 'post_update':
        return 'document-text-outline';
      case 'analytics_alert':
        return 'analytics-outline';
      case 'follower':
        return 'person-add-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationGroup = (type: string) => {
    switch (type) {
      case 'order_update':
        return 'Orders';
      case 'comment':
        return 'Comments';
      case 'boost':
        return 'Boosts';
      case 'system':
        return 'System';
      case 'product_update':
        return 'Products';
      case 'post_update':
        return 'Posts';
      case 'analytics_alert':
        return 'Analytics';
      case 'follower':
        return 'System';
      default:
        return 'System';
    }
  };

  const formatTimeAgo = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return created.toLocaleDateString();
  };

  const filteredNotifications = selectedGroup === 'All' 
    ? state.notifications 
    : state.notifications.filter(n => getNotificationGroup(n.type) === selectedGroup);

  const handleNotificationPress = async (notification: any) => {
    if (!notification.is_read) {
      try {
        await markNotificationRead(notification.id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    // TODO: Navigate to relevant screen based on notification type
    console.log('Navigate to:', notification.type, notification.data);
  };

  const handleMarkAllRead = async () => {
    if (state.user) {
      try {
        await markAllNotificationsRead(state.user.id);
        Alert.alert('Success', 'All notifications marked as read');
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        Alert.alert('Error', 'Failed to mark all notifications as read');
      }
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNotification(notificationId);
            } catch (error) {
              console.error('Error deleting notification:', error);
              Alert.alert('Error', 'Failed to delete notification');
            }
          },
        },
      ]
    );
  };

  const getUnreadCount = (group: string) => {
    const groupNotifications = group === 'All' 
      ? state.notifications 
      : state.notifications.filter(n => getNotificationGroup(n.type) === group);
    return groupNotifications.filter(n => !n.is_read).length;
  };

  return (
    <View style={styles.container}>
      <HeaderWithMenu />
      <View style={styles.headerRow}>
        <Text style={styles.title}>Notifications</Text>
        {state.notifications.some(n => !n.is_read) && (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllReadButton}>
            <Text style={styles.markAllReadText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groupsRow}>
        {GROUPS.map(group => {
          const unreadCount = getUnreadCount(group);
          return (
            <TouchableOpacity
              key={group}
              style={[styles.groupChip, selectedGroup === group && styles.groupChipActive]}
              onPress={() => setSelectedGroup(group)}
            >
              <Text style={[styles.groupChipText, selectedGroup === group && styles.groupChipTextActive]}>
                {group}
              </Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      <FlatList
        data={filteredNotifications}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.notificationCard, item.is_read ? null : styles.unreadCard]}
            onPress={() => handleNotificationPress(item)}
            onLongPress={() => handleDeleteNotification(item.id)}
          >
            <Ionicons 
              name={getNotificationIcon(item.type)} 
              size={24} 
              color={colors.secondary} 
              style={styles.icon} 
            />
            <View style={styles.notificationContent}>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.time}>{formatTimeAgo(item.created_at)}</Text>
            </View>
            <View style={styles.notificationActions}>
              {!item.is_read && <View style={styles.unreadDot} />}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteNotification(item.id)}
              >
                <Ionicons name="close" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No notifications found</Text>
            <Text style={styles.emptySubtext}>
              {selectedGroup === 'All' 
                ? 'You\'re all caught up!' 
                : `No ${selectedGroup.toLowerCase()} notifications`}
            </Text>
          </View>
        }
        refreshing={state.loadingStates.notifications}
        onRefresh={loadNotifications}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingTop: spacing.m,
    paddingBottom: spacing.s,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
  },
  markAllReadButton: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: radii.small,
  },
  markAllReadText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'monospace',
    color: colors.primary,
  },
  groupsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.m,
    marginBottom: spacing.s,
  },
  groupChip: {
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupChipActive: {
    backgroundColor: colors.primary + '33',
  },
  groupChipText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  groupChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.white,
  },
  listContent: {
    paddingHorizontal: spacing.m,
    paddingBottom: 80,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  unreadCard: {
    backgroundColor: colors.primary + '11',
  },
  icon: {
    marginRight: spacing.m,
  },
  notificationContent: {
    flex: 1,
  },
  message: {
    fontSize: 15,
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: 2,
  },
  time: {
    fontSize: 13,
    color: colors.disabled,
    fontFamily: 'monospace',
  },
  notificationActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginRight: spacing.s,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.m,
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  emptySubtext: {
    textAlign: 'center',
    color: colors.disabled,
    marginTop: spacing.xs,
    fontSize: 14,
    fontFamily: 'monospace',
  },
}); 