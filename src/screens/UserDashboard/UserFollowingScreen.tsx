import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import BackButton from '../../components/BackButton';
import followService from '../../services/followService';

interface FollowedSeller {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  followers: number;
  products: number;
  isVerified: boolean;
  lastActive: string;
}

const mockFollowedSellers: FollowedSeller[] = [
  {
    id: 'seller-1',
    username: '@janedoe',
    name: 'Jane Doe',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=400&q=80',
    bio: 'Fashion enthusiast and lifestyle creator',
    followers: 2847,
    products: 89,
    isVerified: true,
    lastActive: '2 hours ago',
  },
  {
    id: 'seller-2',
    username: '@techguru',
    name: 'Mike Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Tech reviewer and gadget enthusiast',
    followers: 1542,
    products: 45,
    isVerified: true,
    lastActive: '1 hour ago',
  },
  {
    id: 'seller-3',
    username: '@fitnesspro',
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
    bio: 'Fitness coach and wellness advocate',
    followers: 3201,
    products: 67,
    isVerified: false,
    lastActive: '30 minutes ago',
  },
  {
    id: 'seller-4',
    username: '@foodiechef',
    name: 'Alex Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    bio: 'Chef and food content creator',
    followers: 1892,
    products: 34,
    isVerified: true,
    lastActive: '3 hours ago',
  },
  {
    id: 'seller-5',
    username: '@artstudio',
    name: 'Emma Davis',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    bio: 'Artist and creative designer',
    followers: 2156,
    products: 78,
    isVerified: false,
    lastActive: '1 day ago',
  },
];

export default function UserFollowingScreen() {
  const navigation = useNavigation();
  const [followedSellers, setFollowedSellers] = useState<FollowedSeller[]>(mockFollowedSellers);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const followedSellersData = await followService.getFollowedSellers();
      setFollowedSellers(followedSellersData);
    } catch (error) {
      console.error('Error refreshing followed sellers:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleUnfollow = async (sellerId: string) => {
    Alert.alert(
      'Unfollow Seller',
      'Are you sure you want to unfollow this seller?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unfollow',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await followService.unfollowSeller(sellerId);
              
              if (success) {
                setFollowedSellers(prev => 
                  prev.filter(seller => seller.id !== sellerId)
                );
                Alert.alert('Success', 'Seller unfollowed successfully');
              } else {
                Alert.alert('Error', 'Failed to unfollow seller');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to unfollow seller');
            }
          }
        }
      ]
    );
  };

  const handleViewProfile = (seller: FollowedSeller) => {
    navigation.navigate('SellerProfile', { sellerId: seller.id });
  };

  const handleMessage = (seller: FollowedSeller) => {
    navigation.navigate('ChatScreen', {
      recipientId: seller.id,
      recipientName: seller.name,
      recipientAvatar: seller.avatar
    });
  };

  const handleViewProducts = (seller: FollowedSeller) => {
    navigation.navigate('SellerProducts', { sellerId: seller.id });
  };

  const filteredSellers = followedSellers.filter(seller =>
    seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seller.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSellerItem = ({ item }: { item: FollowedSeller }) => (
    <View style={styles.sellerCard}>
      <TouchableOpacity 
        style={styles.sellerInfo}
        onPress={() => handleViewProfile(item)}
      >
        <Image source={{ uri: item.avatar }} style={styles.sellerAvatar} />
        <View style={styles.sellerDetails}>
          <View style={styles.sellerHeader}>
            <Text style={styles.sellerName}>{item.name}</Text>
            {item.isVerified && (
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
            )}
          </View>
          <Text style={styles.sellerUsername}>{item.username}</Text>
          <Text style={styles.sellerBio} numberOfLines={2}>{item.bio}</Text>
          <View style={styles.sellerStats}>
            <Text style={styles.sellerStat}>{item.followers.toLocaleString()} followers</Text>
            <Text style={styles.sellerStat}>•</Text>
            <Text style={styles.sellerStat}>{item.products} products</Text>
            <Text style={styles.sellerStat}>•</Text>
            <Text style={styles.sellerStat}>{item.lastActive}</Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.sellerActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleMessage(item)}
        >
          <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleViewProducts(item)}
        >
          <Ionicons name="bag-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.unfollowButton}
          onPress={() => handleUnfollow(item.id)}
        >
          <Text style={styles.unfollowButtonText}>Unfollow</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backButton} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Following</Text>
          <Text style={styles.subtitle}>
            {followedSellers.length} {followedSellers.length === 1 ? 'seller' : 'sellers'}
          </Text>
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchTextInput}
            placeholder="Search followed sellers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Followed Sellers List */}
      <FlatList
        data={filteredSellers}
        renderItem={renderSellerItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No followed sellers</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'No sellers match your search' : 'Start following sellers to see them here'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity 
                style={styles.discoverButton}
                onPress={() => navigation.navigate('ProductDiscovery')}
              >
                <Text style={styles.discoverButtonText}>Discover Sellers</Text>
              </TouchableOpacity>
            )}
          </View>
        }
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
    fontSize: scale(20),
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: scale(14),
    color: colors.textSecondary,
  },
  searchButton: {
    padding: spacing.s,
  },
  searchContainer: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.medium,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.s,
  },
  listContainer: {
    paddingHorizontal: spacing.m,
  },
  sellerCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.m,
    ...shadows.card,
  },
  sellerInfo: {
    flexDirection: 'row',
    marginBottom: spacing.m,
  },
  sellerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: spacing.m,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: spacing.xs,
  },
  sellerUsername: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  sellerBio: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  sellerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerStat: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  sellerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    padding: spacing.s,
  },
  unfollowButton: {
    backgroundColor: colors.error,
    borderRadius: radii.small,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.m,
  },
  unfollowButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.m,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.l,
  },
  discoverButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.medium,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.l,
  },
  discoverButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 