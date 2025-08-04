import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from '../SellerDashboard/components/HeaderWithMenu';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import BackButton from '../../components/BackButton';

interface Conversation {
  id: string;
  subject: string;
  status: string;
  last_message_at: string;
  unread_count: number;
  latest_message?: {
    content: string;
    sender_id: string;
    sender_type: string;
  };
  stores?: {
    name: string;
    logo_url: string;
  };
  products?: {
    name: string;
    price: number;
    product_images: Array<{ image_url: string }>;
  };
}

export default function MessagingScreen() {
  const navigation = useNavigation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock data for testing
  const mockConversations: Conversation[] = [
    {
      id: 'conv1',
      subject: 'Question about wireless headphones',
      status: 'active',
      last_message_at: new Date().toISOString(),
      unread_count: 2,
      latest_message: {
        content: 'Thanks for your quick response!',
        sender_id: 'user1',
        sender_type: 'user'
      },
      stores: {
        name: 'TechStore',
        logo_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=100&q=80'
      },
      products: {
        name: 'Premium Wireless Headphones',
        price: 199.99,
        product_images: [{ image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80' }]
      }
    },
    {
      id: 'conv2',
      subject: 'Order #12345 inquiry',
      status: 'active',
      last_message_at: new Date(Date.now() - 3600000).toISOString(),
      unread_count: 0,
      latest_message: {
        content: 'Your order has been shipped!',
        sender_id: 'store1',
        sender_type: 'seller'
      },
      stores: {
        name: 'FashionHub',
        logo_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=100&q=80'
      }
    },
    {
      id: 'conv3',
      subject: 'Product availability question',
      status: 'resolved',
      last_message_at: new Date(Date.now() - 86400000).toISOString(),
      unread_count: 0,
      latest_message: {
        content: 'The item is back in stock now.',
        sender_id: 'store2',
        sender_type: 'seller'
      },
      stores: {
        name: 'HomeDecor Plus',
        logo_url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=100&q=80'
      }
    }
  ];

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/messaging/conversations');
      // const data = await response.json();
      // setConversations(data.data);
      
      // Using mock data for now
      setConversations(mockConversations);
      setUnreadCount(mockConversations.reduce((sum, conv) => sum + conv.unread_count, 0));
    } catch (error) {
      console.error('Error loading conversations:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load conversations',
        text2: error.message
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  }, [loadConversations]);

  const handleConversationPress = (conversation: Conversation) => {
    console.log('Navigating to chat with conversation:', conversation.id);
    navigation.navigate('Chat', { conversationId: conversation.id });
  };

  const handleNewMessage = () => {
    console.log('Navigating to new conversation');
    // For now, just show a toast since NewConversationScreen doesn't exist yet
    Toast.show({
      type: 'info',
      text1: 'New Conversation',
      text2: 'This feature will be available soon!'
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'resolved':
        return colors.primary;
      case 'archived':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleConversationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: item.stores?.logo_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=100&q=80' }}
          style={styles.avatar}
        />
        {item.unread_count > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{item.unread_count}</Text>
          </View>
        )}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.storeName} numberOfLines={1}>
            {item.stores?.name || 'Store'}
          </Text>
          <Text style={styles.timestamp}>
            {formatTime(item.last_message_at)}
          </Text>
        </View>

        <Text style={styles.subject} numberOfLines={1}>
          {item.subject}
        </Text>

        <View style={styles.messagePreview}>
          <Text style={styles.messageText} numberOfLines={2}>
            {item.latest_message?.content || 'No messages yet'}
          </Text>
          {item.latest_message?.sender_type === 'seller' && (
            <Ionicons name="checkmark-circle" size={16} color={colors.success} style={styles.readIcon} />
          )}
        </View>

        {item.products && (
          <View style={styles.productPreview}>
            <Image
              source={{ uri: item.products.product_images[0]?.image_url }}
              style={styles.productImage}
            />
            <Text style={styles.productName} numberOfLines={1}>
              {item.products.name}
            </Text>
            <Text style={styles.productPrice}>
              ${item.products.price.toFixed(2)}
            </Text>
          </View>
        )}

        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No conversations yet</Text>
      <Text style={styles.emptySubtitle}>
        Start a conversation with a seller to ask questions about products or orders
      </Text>
      <TouchableOpacity style={styles.newMessageButton} onPress={handleNewMessage}>
        <Ionicons name="add" size={20} color={colors.white} />
        <Text style={styles.newMessageText}>Start New Conversation</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backButton} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Messages</Text>
          <Text style={styles.subtitle}>
            Chat with sellers and get support
          </Text>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.conversationsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    fontSize: scale(24),
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: scale(14),
    color: colors.textSecondary,
  },
  newButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.circle,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.floating,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: scale(16),
    color: colors.textSecondary,
  },
  conversationsList: {
    padding: spacing.m,
  },
  conversationItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.m,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: radii.circle,
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.error,
    borderRadius: radii.circle,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCount: {
    color: colors.white,
    fontSize: scale(12),
    fontWeight: 'bold',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  storeName: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  timestamp: {
    fontSize: scale(12),
    color: colors.textSecondary,
  },
  subject: {
    fontSize: scale(14),
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  messageText: {
    fontSize: scale(13),
    color: colors.textSecondary,
    flex: 1,
  },
  readIcon: {
    marginLeft: spacing.xs,
  },
  productPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.small,
    padding: spacing.xs,
    marginBottom: spacing.xs,
  },
  productImage: {
    width: 30,
    height: 30,
    borderRadius: radii.small,
    marginRight: spacing.xs,
  },
  productName: {
    fontSize: scale(12),
    color: colors.text,
    flex: 1,
  },
  productPrice: {
    fontSize: scale(12),
    fontWeight: '600',
    color: colors.primary,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: radii.pill,
  },
  statusText: {
    fontSize: scale(10),
    color: colors.white,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  emptySubtitle: {
    fontSize: scale(14),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.l,
  },
  newMessageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    ...shadows.floating,
  },
  newMessageText: {
    color: colors.white,
    fontSize: scale(16),
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
}); 