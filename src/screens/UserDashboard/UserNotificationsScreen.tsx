import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, SafeAreaView, FlatList, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from '../SellerDashboard/components/HeaderWithMenu';
import { scale } from '../../lib/scale';
import { useNavigation } from '@react-navigation/native';

const mockNotifications = [
  {
    id: '1',
    type: 'order',
    title: 'Order Shipped',
    message: 'Your order #12345 has been shipped and is on its way!',
    timestamp: '2 hours ago',
    isRead: false,
    icon: 'bag-outline',
    iconColor: colors.primary,
  },
  {
    id: '2',
    type: 'promotion',
    title: 'Special Offer',
    message: 'Get 20% off on all electronics this weekend!',
    timestamp: '1 day ago',
    isRead: false,
    icon: 'pricetag-outline',
    iconColor: colors.error,
  },
  {
    id: '3',
    type: 'social',
    title: 'New Follower',
    message: 'Sarah Johnson started following you',
    timestamp: '2 days ago',
    isRead: true,
    icon: 'person-add-outline',
    iconColor: colors.success,
  },
  {
    id: '4',
    type: 'product',
    title: 'Price Drop',
    message: 'Wireless Headphones price dropped by $30',
    timestamp: '3 days ago',
    isRead: true,
    icon: 'trending-down-outline',
    iconColor: colors.warning,
  },
  {
    id: '5',
    type: 'security',
    title: 'Login Alert',
    message: 'New login detected from a new device',
    timestamp: '1 week ago',
    isRead: true,
    icon: 'shield-outline',
    iconColor: colors.error,
  },
];

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const NotificationCard = ({ item, onPress }) => {
    const [scaleValue] = useState(new Animated.Value(1));

    const handlePressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.98,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    return (
        <AnimatedTouchableOpacity 
            style={[styles.notificationCard, !item.isRead && styles.unreadCard, { transform: [{ scale: scaleValue }] }]}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <View style={styles.notificationHeader}>
                <View style={[styles.iconContainer, { backgroundColor: item.iconColor + '20' }]}>
                    <Ionicons name={item.icon} size={20} color={item.iconColor} />
                </View>
                <View style={styles.notificationInfo}>
                    <View style={styles.titleTimeRow}>
                        <Text style={[styles.notificationTitle, !item.isRead && styles.unreadTitle]}>
                            {item.title}
                        </Text>
                        <Text style={styles.timeText}>{item.time}</Text>
                    </View>
                    <Text style={styles.notificationMessage}>{item.message}</Text>
                </View>
                {!item.isRead && <View style={styles.unreadDot} />}
            </View>
        </AnimatedTouchableOpacity>
    );
};


export default function UserNotificationsScreen() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: notifications.filter(notif => !notif.isRead).length },
    { id: 'order', label: 'Orders', count: notifications.filter(notif => notif.type === 'order').length },
    { id: 'promotion', label: 'Promotions', count: notifications.filter(notif => notif.type === 'promotion').length },
  ];

  const filteredNotifications = selectedFilter === 'all' 
    ? notifications 
    : selectedFilter === 'unread'
    ? notifications.filter(notif => !notif.isRead)
    : notifications.filter(notif => notif.type === selectedFilter);

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const handleDeleteNotification = (notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const updatedNotifications = notifications.filter(notif => notif.id !== notificationId);
            setNotifications(updatedNotifications);
            Alert.alert('Success', 'Notification deleted successfully!');
          }
        },
      ]
    );
  };

  const getUnreadCount = () => notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithMenu />
      
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>Stay updated with your latest activities</Text>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedFilter === filter.id && styles.filterButtonTextActive
              ]}>
                {filter.label} ({filter.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={markAllAsRead}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.actionButtonText}>Mark All as Read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredNotifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[
              styles.notificationCard,
              !item.isRead && styles.unreadCard
            ]}
            onPress={() => markAsRead(item.id)}
          >
            <View style={styles.notificationIcon}>
              <Ionicons 
                name={item.icon} 
                size={24} 
                color={item.iconColor} 
              />
            </View>
            
            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
              </View>
              
              <Text style={styles.notificationMessage} numberOfLines={2}>
                {item.message}
              </Text>
              
              {!item.isRead && <View style={styles.unreadIndicator} />}
            </View>
            
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => handleDeleteNotification(item.id)}
            >
              <Ionicons name="trash-outline" size={16} color={colors.error} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
        style={styles.flatList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No notifications found</Text>
            <Text style={styles.emptySubtext}>You're all caught up!</Text>
          </View>
        }
      />
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
  title: {
    fontSize: scale(24),
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: scale(16),
    color: colors.textSecondary,
  },
  filterContainer: {
    paddingHorizontal: spacing.m,
    marginBottom: spacing.m,
  },
  filterButton: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginRight: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: colors.text,
  },
  actionsContainer: {
    paddingHorizontal: spacing.m,
    marginBottom: spacing.m,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.primary,
    marginLeft: spacing.s,
  },
  listContainer: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.l,
    flexGrow: 1,
  },
  flatList: {
    flex: 1,
  },
  notificationCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.m,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...shadows.card,
  },
  unreadCard: {
    backgroundColor: colors.primary + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  notificationIcon: {
    marginRight: spacing.m,
    marginTop: spacing.xs,
  },
  notificationContent: {
    flex: 1,
    position: 'relative',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  notificationTitle: {
    fontSize: scale(16),
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: spacing.s,
  },
  timestamp: {
    fontSize: scale(12),
    color: colors.textSecondary,
  },
  notificationMessage: {
    fontSize: scale(14),
    color: colors.textSecondary,
    lineHeight: 20,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  deleteButton: {
    padding: spacing.s,
    marginLeft: spacing.s,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: scale(18),
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  emptySubtext: {
    fontSize: scale(14),
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
