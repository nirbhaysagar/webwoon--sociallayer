import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from '../SellerDashboard/components/HeaderWithMenu';
import { useNavigation } from '@react-navigation/native';

const mockFollowing = [
  {
    id: '1',
    name: 'TrendyStore',
    avatar: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=100&q=80',
    followers: '12.5K',
    isFollowing: true,
    category: 'Fashion',
    lastPost: '2 hours ago',
  },
  {
    id: '2',
    name: 'TechHub',
    avatar: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=100&q=80',
    followers: '8.2K',
    isFollowing: true,
    category: 'Technology',
    lastPost: '1 day ago',
  },
  {
    id: '3',
    name: 'LuxuryBrand',
    avatar: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=100&q=80',
    followers: '25.1K',
    isFollowing: true,
    category: 'Luxury',
    lastPost: '3 hours ago',
  },
  {
    id: '4',
    name: 'HomeDecor',
    avatar: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=100&q=80',
    followers: '5.7K',
    isFollowing: true,
    category: 'Home & Garden',
    lastPost: '5 hours ago',
  },
];

export default function UserFollowingScreen() {
  const [following, setFollowing] = useState(mockFollowing);
  const navigation = useNavigation();

  const toggleFollow = (id) => {
    setFollowing(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, isFollowing: !item.isFollowing }
          : item
      )
    );
  };

  const renderFollowingItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.followingCard}
      onPress={() => navigation.navigate('SellerProfileScreen', { 
        storeId: item.id,
        storeName: item.name,
        storeAvatar: item.avatar,
        storeCategory: item.category
      })}
      activeOpacity={0.7}
    >
      <View style={styles.followingHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.followingInfo}>
          <Text style={styles.storeName}>{item.name}</Text>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.followers}>{item.followers} followers</Text>
        </View>
        <TouchableOpacity 
          style={[styles.followButton, item.isFollowing && styles.followingButton]}
          onPress={(e) => {
            e.stopPropagation(); // Prevent card navigation when button is pressed
            toggleFollow(item.id);
          }}
        >
          <Text style={[styles.followButtonText, item.isFollowing && styles.followingButtonText]}>
            {item.isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.lastActivity}>
        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.lastPostText}>Last post: {item.lastPost}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <HeaderWithMenu />
      
      <View style={styles.header}>
        <Text style={styles.title}>Following</Text>
        <Text style={styles.subtitle}>{following.length} stores and creators</Text>
      </View>
      
      <FlatList
        data={following}
        keyExtractor={item => item.id}
        renderItem={renderFollowingItem}
        contentContainerStyle={styles.followingList}
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
    paddingHorizontal: spacing.m,
    paddingTop: spacing.m,
    paddingBottom: spacing.s,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  followingList: {
    paddingHorizontal: spacing.m,
    paddingBottom: 120,
  },
  followingCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.m,
    ...shadows.card,
  },
  followingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: spacing.m,
  },
  followingInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  followers: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  followButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radii.small,
  },
  followingButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  followingButtonText: {
    color: colors.textSecondary,
  },
  lastActivity: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.s,
  },
  lastPostText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
}); 