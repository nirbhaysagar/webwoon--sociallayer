import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from './components/HeaderWithMenu';

const mockStore = {
  banner: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  name: 'Urban Styles',
  bio: 'Trendy streetwear for all. Free shipping on orders $50+.',
  followers: 1200,
  isFollowing: false,
  isSaved: false,
  featuredProducts: [
    {
      id: '1',
      img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
      title: 'Sneakers',
      price: '$120',
    },
    {
      id: '2',
      img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      title: 'Handbag',
      price: '$90',
    },
  ],
  shoppablePosts: [
    {
      id: '1',
      img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80',
      title: 'Summer Collection',
    },
    {
      id: '2',
      img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
      title: 'New Arrivals',
    },
  ],
};

export default function StorefrontPreviewScreen() {
  const [asUser, setAsUser] = useState(false);
  const [isFollowing, setIsFollowing] = useState(mockStore.isFollowing);
  const [isSaved, setIsSaved] = useState(mockStore.isSaved);

  return (
    <View style={styles.container}>
      <HeaderWithMenu />
      <View style={styles.headerRow}>
        <Text style={styles.title}>Storefront Preview</Text>
        <TouchableOpacity style={styles.toggleBtn} onPress={() => setAsUser(v => !v)}>
          <Ionicons name={asUser ? 'person' : 'eye'} size={20} color={colors.secondary} />
          <Text style={styles.toggleText}>{asUser ? 'As User' : 'As Seller'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: mockStore.banner }} style={styles.banner} />
        <View style={styles.avatarRow}>
          <Image source={{ uri: mockStore.avatar }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.storeName}>{mockStore.name}</Text>
            <Text style={styles.bio}>{mockStore.bio}</Text>
            <Text style={styles.followers}>{mockStore.followers} followers</Text>
          </View>
          <View style={styles.actionBtns}>
            <TouchableOpacity
              style={[styles.followBtn, isFollowing && styles.followingBtn]}
              onPress={() => setIsFollowing(f => !f)}
            >
              <Ionicons name={isFollowing ? 'checkmark' : 'person-add'} size={18} color={isFollowing ? colors.background : colors.primary} />
              <Text style={[styles.followText, isFollowing && styles.followingText]}>{isFollowing ? 'Following' : 'Follow'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, isSaved && styles.savedBtn]}
              onPress={() => setIsSaved(s => !s)}
            >
              <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={18} color={isSaved ? colors.secondary : colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Featured Products</Text>
        <FlatList
          data={mockStore.featuredProducts}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <Image source={{ uri: item.img }} style={styles.productImg} />
              <Text style={styles.productTitle}>{item.title}</Text>
              <Text style={styles.productPrice}>{item.price}</Text>
            </View>
          )}
        />
        <Text style={styles.sectionTitle}>Shoppable Posts</Text>
        <FlatList
          data={mockStore.shoppablePosts}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
          renderItem={({ item }) => (
            <View style={styles.postCard}>
              <Image source={{ uri: item.img }} style={styles.postImg} />
              <Text style={styles.postTitle}>{item.title}</Text>
            </View>
          )}
        />
      </ScrollView>
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
    fontSize: typography.title,
    fontWeight: 'bold',
    color: colors.text,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  toggleText: {
    color: colors.secondary,
    fontSize: 14,
    marginLeft: 6,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  banner: {
    width: '100%',
    height: 120,
    borderRadius: radii.large,
    marginBottom: -36,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radii.large,
    marginHorizontal: spacing.m,
    marginTop: -36,
    padding: spacing.m,
    ...shadows.card,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radii.circle,
    marginRight: spacing.m,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  bio: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  followers: {
    fontSize: 13,
    color: colors.disabled,
  },
  actionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.m,
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
  },
  followingBtn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  followText: {
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  followingText: {
    color: colors.background,
  },
  saveBtn: {
    backgroundColor: colors.card,
    borderRadius: radii.circle,
    padding: 8,
  },
  savedBtn: {
    backgroundColor: colors.secondary + '22',
  },
  sectionTitle: {
    fontSize: typography.subtitle,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.l,
    marginBottom: spacing.s,
    marginLeft: spacing.m,
  },
  carousel: {
    paddingLeft: spacing.m,
    marginBottom: spacing.s,
  },
  productCard: {
    width: 120,
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    marginRight: spacing.m,
    padding: spacing.s,
    alignItems: 'center',
    ...shadows.card,
  },
  productImg: {
    width: 80,
    height: 80,
    borderRadius: radii.medium,
    marginBottom: 6,
  },
  productTitle: {
    fontSize: 15,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: 'bold',
  },
  postCard: {
    width: 120,
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    marginRight: spacing.m,
    padding: spacing.s,
    alignItems: 'center',
    ...shadows.card,
  },
  postImg: {
    width: 80,
    height: 80,
    borderRadius: radii.medium,
    marginBottom: 6,
  },
  postTitle: {
    fontSize: 15,
    color: colors.text,
    fontWeight: 'bold',
  },
}); 