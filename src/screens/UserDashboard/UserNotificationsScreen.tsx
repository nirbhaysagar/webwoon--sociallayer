import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import BackButton from '../../components/BackButton';

const mockNotifications = [
  {
    id: '1',
    type: 'order',
    title: 'Order Shipped',
    message: 'Your order #12345 has been shipped and is on its way!',
    time: '2 min ago',
    isRead: false,
    icon: 'checkmark-circle',
    iconColor: colors.success,
  },
  {
    id: '2',
    type: 'sale',
    title: 'Flash Sale Alert',
    message: 'TrendyStore is having a 50% off sale on all summer items!',
    time: '1 hour ago',
    isRead: false,
    icon: 'pricetag',
    iconColor: colors.discount,
  },
  {
    id: '3',
    type: 'post',
    title: 'New Post from LuxuryBrand',
    message: 'LuxuryBrand just posted a new collection. Check it out!',
    time: '3 hours ago',
    isRead: true,
    icon: 'camera',
    iconColor: colors.primary,
  },
  {
    id: '4',
    type: 'follow',
    title: 'New Follower',
    message: 'HomeDecor started following you',
    time: '1 day ago',
    isRead: true,
    icon: 'person-add',
    iconColor: colors.primary,
  },
  {
    id: '5',
    type: 'comment',
    title: 'New Comment',
    message: 'Someone commented on your saved post',
    time: '2 days ago',
    isRead: true,
    icon: 'chatbubble',
    iconColor: colors.textSecondary,
  },
];

export default function UserNotificationsScreen() {
  const [notifications, setNotifications] = useState(mockNotifications);

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

  const getUnreadCount = () => notifications.filter(n => !n.isRead).length;

  const renderNotification = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
      onPress={() => markAsRead(item.id)}
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
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backButton} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>
            {getUnreadCount() > 0 ? `${getUnreadCount()} unread` : 'All caught up!'}
          </Text>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.notificationsList}
        showsVerticalScrollIndicator={false}
      />
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
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.s,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: 8,
  },
  markAllRead: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  notificationsList: {
    paddingHorizontal: spacing.m,
    paddingBottom: 120,
  },
  notificationCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  unreadCard: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  notificationInfo: {
    flex: 1,
  },
  titleTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  notificationMessage: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.s,
    marginTop: 4,
  },
}); 