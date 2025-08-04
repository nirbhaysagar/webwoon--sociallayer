import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image, SafeAreaView, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from './components/HeaderWithMenu';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - spacing.md * 3) / 3;

const mockProfile = {
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  name: 'Jane Doe',
  username: '@janedoe',
  email: 'jane@email.com',
  phone: '+1 555-1234',
  bio: 'Fashion enthusiast and lifestyle creator. Sharing my passion for style and beauty! ✨',
  website: 'www.janedoe.com',
  location: 'New York, NY',
  business: {
    store: 'Urban Styles',
    category: 'Fashion',
    address: '123 Main St, NY',
  },
  stats: {
    posts: 156,
    followers: 2847,
    following: 892,
    products: 89,
    sales: 1247,
    revenue: 45600,
  },
  isVerified: true,
  isPrivate: false,
};

const mockPosts = [
  { id: '1', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop', likes: 234, comments: 12, type: 'post' },
  { id: '2', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop', likes: 189, comments: 8, type: 'product' },
  { id: '3', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop', likes: 456, comments: 23, type: 'post' },
  { id: '4', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop', likes: 123, comments: 5, type: 'product' },
  { id: '5', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop', likes: 678, comments: 34, type: 'post' },
  { id: '6', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop', likes: 345, comments: 18, type: 'product' },
  { id: '7', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop', likes: 567, comments: 29, type: 'post' },
  { id: '8', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop', likes: 234, comments: 15, type: 'product' },
  { id: '9', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop', likes: 789, comments: 42, type: 'post' },
];

const mockProducts = [
  { id: '1', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop', title: 'Summer Dress', price: '$89.99', sales: 45 },
  { id: '2', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop', title: 'Denim Jacket', price: '$129.99', sales: 32 },
  { id: '3', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop', title: 'Sneakers', price: '$79.99', sales: 67 },
  { id: '4', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop', title: 'Handbag', price: '$159.99', sales: 28 },
  { id: '5', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop', title: 'Sunglasses', price: '$49.99', sales: 89 },
  { id: '6', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop', title: 'Watch', price: '$299.99', sales: 15 },
];

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(mockProfile);
  const [activeTab, setActiveTab] = useState('posts');

  const renderStatItem = (label: string, value: number | string) => (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{typeof value === 'number' ? value.toLocaleString() : value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderPostItem = ({ item }) => (
    <TouchableOpacity style={styles.postItem}>
      <Image source={{ uri: item.image }} style={styles.postImage} />
      <View style={styles.postOverlay}>
        <View style={styles.postStats}>
          <Ionicons name="heart" size={16} color="#fff" />
          <Text style={styles.postStatText}>{item.likes}</Text>
          <Ionicons name="chatbubble" size={16} color="#fff" />
          <Text style={styles.postStatText}>{item.comments}</Text>
        </View>
        {item.type === 'product' && (
          <View style={styles.productBadge}>
            <Ionicons name="bag" size={12} color="#fff" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }) => (
    <TouchableOpacity style={styles.productItem}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productOverlay}>
        <Text style={styles.productTitle}>{item.title}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
        <View style={styles.productSales}>
          <Ionicons name="trending-up" size={12} color="#fff" />
          <Text style={styles.productSalesText}>{item.sales} sold</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithMenu />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.headerTop}>
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.username}>{profile.username}</Text>
                {profile.isVerified && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                )}
              </View>
              <Text style={styles.displayName}>{profile.name}</Text>
              <Text style={styles.bio}>{profile.bio}</Text>
              {profile.website && (
                <Text style={styles.website}>{profile.website}</Text>
              )}
              {profile.location && (
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.location}>{profile.location}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            {renderStatItem('Posts', profile.stats.posts)}
            {renderStatItem('Followers', profile.stats.followers)}
            {renderStatItem('Following', profile.stats.following)}
            {renderStatItem('Products', profile.stats.products)}
          </View>

          {/* Business Stats */}
          <View style={styles.businessStats}>
            {renderStatItem('Sales', profile.stats.sales)}
            {renderStatItem('Revenue', `$${profile.stats.revenue.toLocaleString()}`)}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-outline" size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
            onPress={() => setActiveTab('posts')}
          >
            <Ionicons 
              name="grid-outline" 
              size={24} 
              color={activeTab === 'posts' ? colors.primary : colors.textSecondary} 
            />
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'products' && styles.activeTab]}
            onPress={() => setActiveTab('products')}
          >
            <Ionicons 
              name="bag-outline" 
              size={24} 
              color={activeTab === 'products' ? colors.primary : colors.textSecondary} 
            />
            <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>Products</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
            onPress={() => setActiveTab('saved')}
          >
            <Ionicons 
              name="bookmark-outline" 
              size={24} 
              color={activeTab === 'saved' ? colors.primary : colors.textSecondary} 
            />
            <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>Saved</Text>
          </TouchableOpacity>
        </View>

        {/* Content Grid */}
        <View style={styles.contentGrid}>
          {activeTab === 'posts' && (
            <FlatList
              data={mockPosts}
              renderItem={renderPostItem}
              keyExtractor={item => item.id}
              numColumns={3}
              scrollEnabled={false}
              columnWrapperStyle={styles.gridRow}
            />
          )}
          {activeTab === 'products' && (
            <FlatList
              data={mockProducts}
              renderItem={renderProductItem}
              keyExtractor={item => item.id}
              numColumns={3}
              scrollEnabled={false}
              columnWrapperStyle={styles.gridRow}
            />
          )}
          {activeTab === 'saved' && (
            <FlatList
              data={mockPosts.slice(0, 6)}
              renderItem={renderPostItem}
              keyExtractor={item => item.id}
              numColumns={3}
              scrollEnabled={false}
              columnWrapperStyle={styles.gridRow}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.m,
  },
  profileHeader: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.l,
    ...shadows.card,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
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
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  website: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: spacing.s,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.s,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  businessStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.s,
    paddingTop: spacing.s,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.s,
  },
  editButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.medium,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.s,
  },
  editButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  shareButton: {
    padding: spacing.s,
  },
  settingsButton: {
    padding: spacing.s,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.l,
    paddingHorizontal: spacing.s,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  contentGrid: {
    flex: 1,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  postItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    borderRadius: radii.small,
    marginBottom: spacing.s,
    ...shadows.card,
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
    borderBottomLeftRadius: radii.small,
    borderBottomRightRadius: radii.small,
    padding: spacing.s,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  postStatText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  productBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    borderRadius: radii.small,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: radii.small,
  },
  productOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderBottomLeftRadius: radii.small,
    borderBottomRightRadius: radii.small,
    padding: spacing.s,
  },
  productTitle: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  productPrice: {
    color: colors.white,
    fontSize: 11,
    marginBottom: 2,
  },
  productSales: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productSalesText: {
    color: colors.white,
    fontSize: 10,
    marginLeft: 2,
  },
}); 