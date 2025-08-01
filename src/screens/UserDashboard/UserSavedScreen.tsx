import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, SafeAreaView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from '../SellerDashboard/components/HeaderWithMenu';
import { scale } from '../../lib/scale';
import { useNavigation } from '@react-navigation/native';

const mockSavedItems = [
  {
    id: '1',
    type: 'product',
    name: 'Wireless Bluetooth Headphones',
    price: 89.99,
    originalPrice: 129.99,
    image: 'https://via.placeholder.com/120x120',
    store: 'TechStore',
    savedDate: '2024-01-15',
    discount: 31,
  },
  {
    id: '2',
    type: 'product',
    name: 'Organic Cotton T-Shirt',
    price: 24.99,
    originalPrice: 34.99,
    image: 'https://via.placeholder.com/120x120',
    store: 'FashionHub',
    savedDate: '2024-01-14',
    discount: 29,
  },
  {
    id: '3',
    type: 'post',
    name: 'New Collection Launch',
    description: 'Check out our latest summer collection with amazing deals!',
    image: 'https://via.placeholder.com/120x120',
    store: 'StyleBoutique',
    savedDate: '2024-01-13',
    likes: 156,
    comments: 23,
  },
  {
    id: '4',
    type: 'product',
    name: 'Smart Watch Series 5',
    price: 299.99,
    originalPrice: 399.99,
    image: 'https://via.placeholder.com/120x120',
    store: 'GadgetWorld',
    savedDate: '2024-01-12',
    discount: 25,
  },
  {
    id: '5',
    type: 'post',
    name: 'Weekend Sale Alert',
    description: 'Up to 70% off on selected items this weekend only!',
    image: 'https://via.placeholder.com/120x120',
    store: 'DealMart',
    savedDate: '2024-01-11',
    likes: 89,
    comments: 12,
  },
];

export default function UserSavedScreen() {
  const navigation = useNavigation();
  const [savedItems, setSavedItems] = useState(mockSavedItems);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Items', count: savedItems.length },
    { id: 'products', label: 'Products', count: savedItems.filter(item => item.type === 'product').length },
    { id: 'posts', label: 'Posts', count: savedItems.filter(item => item.type === 'post').length },
  ];

  const filteredItems = selectedFilter === 'all' 
    ? savedItems 
    : savedItems.filter(item => item.type === selectedFilter.slice(0, -1));

  const handleRemoveItem = (itemId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your saved list?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            const updatedItems = savedItems.filter(item => item.id !== itemId);
            setSavedItems(updatedItems);
            Alert.alert('Success', 'Item removed from saved list!');
          }
        },
      ]
    );
  };

  const handleMoveToCart = (item) => {
    if (item.type === 'product') {
      Alert.alert('Success', 'Product added to cart!');
    } else {
      Alert.alert('Info', 'Posts cannot be added to cart');
    }
  };

  const handleProductPress = (item) => {
    // Convert saved item to product detail format
    const productDetail = {
      id: item.id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      discount: item.discount,
      rating: 4.5,
      reviewCount: 156,
      description: `Experience the amazing ${item.name}. This premium product offers exceptional quality and value for money. Perfect for everyday use and special occasions.`,
      features: [
        'Premium Quality',
        'Durable Design',
        'Easy to Use',
        'Great Value',
        'Customer Favorite',
        'Fast Shipping'
      ],
      images: [
        item.image,
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400'
      ],
      colors: ['Black', 'White', 'Blue'],
      sizes: ['S', 'M', 'L', 'XL'],
      inStock: true,
      stockCount: 25,
      seller: {
        name: item.store,
        rating: 4.8,
        reviewCount: 15420,
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100'
      },
      reviews: [
        {
          id: '1',
          user: 'Alex Johnson',
          rating: 5,
          date: '2 days ago',
          comment: 'Amazing product! Quality is outstanding and delivery was fast.',
          helpful: 24
        },
        {
          id: '2',
          user: 'Sarah Wilson',
          rating: 4,
          date: '1 week ago',
          comment: 'Great value for money. Very satisfied with the purchase.',
          helpful: 18
        },
        {
          id: '3',
          user: 'Mike Chen',
          rating: 5,
          date: '2 weeks ago',
          comment: 'Perfect for my needs. Highly recommend!',
          helpful: 31
        }
      ],
      relatedProducts: [
        {
          id: '2',
          name: 'Similar Product 1',
          price: 79.99,
          image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200'
        },
        {
          id: '3',
          name: 'Similar Product 2',
          price: 149.99,
          image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200'
        },
        {
          id: '4',
          name: 'Similar Product 3',
          price: 99.99,
          image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200'
        }
      ]
    };
    
    navigation.navigate('ProductDetailScreen', { product: productDetail });
  };

  const renderProductItem = (item) => (
    <TouchableOpacity key={item.id} style={styles.productCard} onPress={() => handleProductPress(item)}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      {item.discount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{item.discount}%</Text>
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.storeName}>{item.store}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>${item.price}</Text>
          {item.originalPrice > item.price && (
            <Text style={styles.originalPrice}>${item.originalPrice}</Text>
          )}
        </View>
        <Text style={styles.savedDate}>Saved {item.savedDate}</Text>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleMoveToCart(item)}
        >
          <Ionicons name="cart-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleRemoveItem(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderPostItem = (item) => (
    <View key={item.id} style={styles.postCard}>
      <Image source={{ uri: item.image }} style={styles.postImage} />
      <View style={styles.postInfo}>
        <Text style={styles.postTitle} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.postDescription} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.storeName}>{item.store}</Text>
        <View style={styles.postStats}>
          <View style={styles.statItem}>
            <Ionicons name="heart-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.statText}>{item.likes}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.statText}>{item.comments}</Text>
          </View>
        </View>
        <Text style={styles.savedDate}>Saved {item.savedDate}</Text>
      </View>
      <TouchableOpacity 
        style={styles.removeButton} 
        onPress={() => handleRemoveItem(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => {
    return item.type === 'product' ? renderProductItem(item) : renderPostItem(item);
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithMenu />
      
      <View style={styles.header}>
        <Text style={styles.title}>Saved Items</Text>
        <Text style={styles.subtitle}>Your saved products and posts</Text>
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

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
        style={styles.flatList}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No saved items found</Text>
            <Text style={styles.emptySubtext}>Start saving products and posts you like</Text>
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
  listContainer: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.l,
    flexGrow: 1,
  },
  flatList: {
    flex: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    width: '48%',
    marginBottom: spacing.m,
    ...shadows.card,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: radii.medium,
    borderTopRightRadius: radii.medium,
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.s,
    left: spacing.s,
    backgroundColor: colors.error,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
  },
  discountText: {
    fontSize: scale(12),
    fontWeight: '700',
    color: colors.text,
  },
  productInfo: {
    padding: spacing.m,
  },
  productName: {
    fontSize: scale(14),
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  storeName: {
    fontSize: scale(12),
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  currentPrice: {
    fontSize: scale(14),
    fontWeight: '700',
    color: colors.text,
    marginRight: spacing.xs,
  },
  originalPrice: {
    fontSize: scale(12),
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  savedDate: {
    fontSize: scale(10),
    color: colors.textSecondary,
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.m,
  },
  actionButton: {
    padding: spacing.s,
  },
  postCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    width: '48%',
    marginBottom: spacing.m,
    ...shadows.card,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: radii.medium,
    borderTopRightRadius: radii.medium,
  },
  postInfo: {
    padding: spacing.m,
  },
  postTitle: {
    fontSize: scale(14),
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  postDescription: {
    fontSize: scale(12),
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 16,
  },
  postStats: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.s,
  },
  statText: {
    fontSize: scale(10),
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  removeButton: {
    position: 'absolute',
    top: spacing.s,
    right: spacing.s,
    backgroundColor: colors.error + '20',
    borderRadius: 15,
    padding: spacing.xs,
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
