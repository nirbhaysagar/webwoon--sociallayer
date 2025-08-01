import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from '../SellerDashboard/components/HeaderWithMenu';
import { followAPI } from '../../services/api';

// Mock store and posts/products data
const mockStore = {
  id: 'store1',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  name: 'Urban Styles',
  description: 'Trendy fashion for everyone. Discover our latest collections and exclusive offers!',
  category: 'Fashion',
  followers: 1200,
};

const mockPosts = [
  {
    id: 'p1',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
    title: 'Summer Collection',
  },
  {
    id: 'p2',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    title: 'Smart Home Bundle',
  },
  {
    id: 'p3',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    title: 'Organic Skincare',
  },
  {
    id: 'p4',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    title: 'Yoga Mat',
  },
];

const HARDCODED_USER_ID = 'test-user-id'; // Replace with real user id from context/auth
const HARDCODED_STORE_ID = 'store1'; // Replace with real store id from route/props

export default function SellerProfileScreen({ route }) {
  // In real app, use route.params.storeId to fetch store data
  // const { storeId } = route.params;
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    // On mount, check if user is following this store
    async function checkFollowing() {
      try {
        setLoading(true);
        const following = await followAPI.isFollowing(HARDCODED_USER_ID, HARDCODED_STORE_ID);
        setIsFollowing(following);
      } catch (e) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    }
    checkFollowing();
  }, []);

  const handleFollowToggle = async () => {
    try {
      setLoading(true);
      if (isFollowing) {
        await followAPI.unfollowStore(HARDCODED_USER_ID, HARDCODED_STORE_ID);
        setIsFollowing(false);
      } else {
        await followAPI.followStore(HARDCODED_USER_ID, HARDCODED_STORE_ID);
        setIsFollowing(true);
      }
    } catch (e) {
      alert('Error updating follow status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithMenu />
      <View style={styles.headerSection}>
        <Image source={{ uri: mockStore.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.storeName}>{mockStore.name}</Text>
          <Text style={styles.category}>{mockStore.category}</Text>
          <Text style={styles.description}>{mockStore.description}</Text>
          <Text style={styles.followers}>{mockStore.followers} followers</Text>
        </View>
        <TouchableOpacity style={styles.followBtn} onPress={handleFollowToggle} disabled={loading}>
          <Ionicons name={isFollowing ? 'person-remove-outline' : 'person-add-outline'} size={20} color={colors.primary} />
          <Text style={styles.followBtnText}>{loading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>Posts & Products</Text>
      <FlatList
        data={mockPosts}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <Image source={{ uri: item.image }} style={styles.gridImage} />
            <Text style={styles.gridTitle}>{item.title}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: colors.textSecondary }}>No posts yet.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: radii.large,
    padding: spacing.m,
    margin: spacing.m,
    ...shadows.card,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radii.circle,
    marginRight: spacing.m,
  },
  storeName: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  followers: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radii.pill,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  followBtnText: {
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: spacing.m,
    marginTop: spacing.s,
    marginBottom: spacing.s,
  },
  grid: {
    paddingHorizontal: spacing.m,
    paddingBottom: 80,
  },
  gridItem: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    margin: 6,
    alignItems: 'center',
    padding: 8,
    ...shadows.card,
  },
  gridImage: {
    width: '100%',
    height: 120,
    borderRadius: radii.medium,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  gridTitle: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
}); 