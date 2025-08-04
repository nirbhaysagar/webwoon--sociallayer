import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import BackButton from '../../components/BackButton';
import { supabase } from '../../config/supabase';
import followService from '../../services/followService';

interface SellerProfile {
  id: string;
  username: string;
  name: string;
  bio: string;
  website: string;
  location: string;
  avatar: string;
  posts: number;
  followers: number;
  following: number;
  products: number;
  sales: number;
  revenue: number;
  isVerified: boolean;
  isFollowing: boolean;
}

export default function SellerProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [seller, setSeller] = useState<SellerProfile>({
    id: 'seller-1',
    username: '@janedoe',
    name: 'Jane Doe',
    bio: 'Fashion enthusiast and lifestyle creator. Sharing my passion for style and beauty! ✨',
    website: 'www.janedoe.com',
    location: 'New York, NY',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=400&q=80',
    posts: 156,
    followers: 2847,
    following: 892,
    products: 89,
    sales: 1247,
    revenue: 45600,
    isVerified: true,
    isFollowing: false,
  });
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = async () => {
    try {
      setLoading(true);
      
      let success = false;
      
      if (seller.isFollowing) {
        // Unfollow seller
        success = await followService.unfollowSeller(seller.id);
        if (success) {
          setSeller(prev => ({
            ...prev,
            isFollowing: false,
            followers: prev.followers - 1,
          }));
          Alert.alert('Success', `You unfollowed ${seller.name}`);
        }
      } else {
        // Follow seller
        success = await followService.followSeller(seller.id);
        if (success) {
          setSeller(prev => ({
            ...prev,
            isFollowing: true,
            followers: prev.followers + 1,
          }));
          Alert.alert('Success', `You are now following ${seller.name}`);
        }
      }

      if (!success) {
        Alert.alert('Error', 'Failed to update follow status');
      }

    } catch (error) {
      Alert.alert('Error', 'Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    navigation.navigate('ChatScreen', { 
      recipientId: seller.id,
      recipientName: seller.name,
      recipientAvatar: seller.avatar
    });
  };

  const handleViewProducts = () => {
    navigation.navigate('SellerProducts', { sellerId: seller.id });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backButton} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Seller Profile</Text>
          <Text style={styles.subtitle}>{seller.name}</Text>
        </View>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: seller.avatar }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.username}>{seller.username}</Text>
              {seller.isVerified && (
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              )}
            </View>
            <Text style={styles.fullName}>{seller.name}</Text>
            <Text style={styles.bio}>{seller.bio}</Text>
            <Text style={styles.website}>{seller.website}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.location}>{seller.location}</Text>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{seller.posts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{seller.followers.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{seller.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{seller.products}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
        </View>

        {/* Revenue Stats */}
        <View style={styles.revenueContainer}>
          <View style={styles.revenueItem}>
            <Text style={styles.revenueNumber}>{seller.sales.toLocaleString()}</Text>
            <Text style={styles.revenueLabel}>Sales</Text>
          </View>
          <View style={styles.revenueItem}>
            <Text style={styles.revenueNumber}>${seller.revenue.toLocaleString()}</Text>
            <Text style={styles.revenueLabel}>Revenue</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[
              styles.followButton, 
              seller.isFollowing && styles.followingButton
            ]}
            onPress={handleFollowToggle}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.followButtonText}>...</Text>
            ) : (
              <>
                <Ionicons 
                  name={seller.isFollowing ? "checkmark" : "add"} 
                  size={16} 
                  color={seller.isFollowing ? colors.text : colors.white} 
                />
                <Text style={[
                  styles.followButtonText,
                  seller.isFollowing && styles.followingButtonText
                ]}>
                  {seller.isFollowing ? 'Following' : 'Follow'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
            <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.productsButton} onPress={handleViewProducts}>
            <Ionicons name="bag-outline" size={16} color={colors.primary} />
            <Text style={styles.productsButtonText}>Products</Text>
          </TouchableOpacity>
        </View>

        {/* Content Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Ionicons name="grid-outline" size={20} color={colors.primary} />
            <Text style={[styles.tabText, styles.activeTabText]}>Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="bag-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.tabText}>Products</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="bookmark-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.tabText}>Saved</Text>
          </TouchableOpacity>
        </View>

        {/* Posts Grid */}
        <View style={styles.postsGrid}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <TouchableOpacity key={item} style={styles.postItem}>
              <Image 
                source={{ uri: `https://images.unsplash.com/photo-${1500000000000 + item}?auto=format&fit=crop&w=300&q=80` }} 
                style={styles.postImage} 
              />
              <View style={styles.postOverlay}>
                <View style={styles.postStats}>
                  <Ionicons name="heart" size={12} color={colors.white} />
                  <Text style={styles.postStatText}>{Math.floor(Math.random() * 500) + 100}</Text>
                  <Ionicons name="chatbubble" size={12} color={colors.white} />
                  <Text style={styles.postStatText}>{Math.floor(Math.random() * 50) + 5}</Text>
                </View>
                {Math.random() > 0.5 && (
                  <Ionicons name="bag" size={12} color={colors.primary} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  shareButton: {
    padding: spacing.s,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    padding: spacing.l,
    backgroundColor: colors.card,
    margin: spacing.m,
    borderRadius: radii.medium,
    ...shadows.card,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: spacing.m,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: spacing.xs,
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  bio: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  website: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginHorizontal: spacing.m,
    marginBottom: spacing.m,
    ...shadows.card,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  revenueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginHorizontal: spacing.m,
    marginBottom: spacing.m,
    ...shadows.card,
  },
  revenueItem: {
    alignItems: 'center',
  },
  revenueNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  revenueLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: spacing.m,
    marginBottom: spacing.m,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.medium,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.l,
    flex: 1,
    marginRight: spacing.s,
    justifyContent: 'center',
  },
  followingButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  followButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },
  followingButtonText: {
    color: colors.text,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.medium,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },
  productsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.medium,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  productsButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.s,
    marginHorizontal: spacing.m,
    marginBottom: spacing.l,
    ...shadows.card,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
  },
  activeTab: {
    backgroundColor: colors.primaryLight,
    borderRadius: radii.medium,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.m,
  },
  postItem: {
    width: '48%',
    aspectRatio: 1,
    marginVertical: spacing.s,
    borderRadius: radii.small,
    overflow: 'hidden',
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
    borderRadius: radii.small,
  },
  postOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: spacing.s,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postStatText: {
    color: colors.white,
    fontSize: 12,
    marginLeft: spacing.xs,
  },
}); 