import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import { useNavigation } from '@react-navigation/native';
import { UserShopContext } from '../../context/UserShopContext';
import Swiper from 'react-native-deck-swiper';
import { supabase } from '../../services/supabase';
import { Product } from '../../services/supabase'; 

const { width, height } = Dimensions.get('window');

const categories = ['All', 'Electronics', 'Fashion', 'Home'];
const sortOptions = ['Newest', 'Price: Low to High', 'Price: High to Low'];

type ExploreMode = 'Products' | 'Accounts';

const UserExploreScreen: React.FC = () => {
  const navigation = useNavigation();
  const { addToCart, addToWishlist } = useContext(UserShopContext);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState('discover');
  const [cardIndex, setCardIndex] = useState(0);
  const [exploreMode, setExploreMode] = useState<ExploreMode>('Products');

  useEffect(() => {
    if (exploreMode === 'Products') {
      fetchProducts();
    } else {
      setLoading(false); 
    }
  }, [exploreMode]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('products')
        .select('*')
        .limit(50) // Corrected order: limit before filter
        .eq('is_active', true);

      if (supabaseError) throw supabaseError;
      if (data) setProducts(data);
    } catch (e: any) {
      setError(e.message);
      console.error("Error fetching products:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products
    .filter(p =>
      (selectedCategory === 'All' || p.category === selectedCategory) &&
      (search === '' || p.name.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'Price: Low to High') return a.price - b.price;
      if (sortBy === 'Price: High to Low') return b.price - a.price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const handleAddToCart = (product: Product) => {
    try {
      const cartItem = { id: product.id, title: product.name, price: product.price, image: (product.media_urls && product.media_urls[0]) || '', store: product.store_id || 'Unknown Store', quantity: 1 };
      addToCart(cartItem);
      Alert.alert('Success', `${product.name} added to cart!`);
    } catch (err) {
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const handleAddToWishlist = (product: Product) => {
    try {
      const wishlistItem = { id: product.id, title: product.name, price: product.price, image: (product.media_urls && product.media_urls[0]) || '', store: product.store_id || 'Unknown Store' };
      addToWishlist(wishlistItem);
      Alert.alert('Success', `${product.name} added to wishlist!`);
    } catch (err) {
      Alert.alert('Error', 'Failed to add item to wishlist');
    }
  };

  const handleProductPress = (product: Product) => {
    // Convert Product to product detail format
    const productDetail = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.price * 1.3, // Mock original price
      discount: 23, // Mock discount
      rating: 4.5,
      reviewCount: 156,
      description: `Experience the amazing ${product.name}. This premium product offers exceptional quality and value for money. Perfect for everyday use and special occasions.`,
      features: [
        'Premium Quality',
        'Durable Design',
        'Easy to Use',
        'Great Value',
        'Customer Favorite',
        'Fast Shipping'
      ],
      images: [
        (product.media_urls && product.media_urls[0]) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
        'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=400'
      ],
      colors: ['Black', 'White', 'Blue'],
      sizes: ['S', 'M', 'L', 'XL'],
      inStock: true,
      stockCount: 25,
      seller: {
        name: product.store_id || 'Unknown Store',
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

  const onSwipedLeft = (index: number) => console.log('Skipped product at index:', index);
  const onSwipedRight = (index: number) => { const product = filteredProducts[index]; if (product) handleAddToWishlist(product); };
  const onSwipedUp = (index: number) => { const product = filteredProducts[index]; if (product) handleAddToCart(product); };

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        {exploreMode === 'Products' && (
            <View style={styles.viewModeToggle}>
            <TouchableOpacity
                style={[styles.viewModeButton, viewMode === 'discover' && styles.viewModeButtonActive]}
                onPress={() => setViewMode('discover')}
            >
                <Ionicons name="heart" size={20} color={viewMode === 'discover' ? colors.primary : colors.textSecondary} />
                <Text style={[styles.viewModeText, viewMode === 'discover' && styles.viewModeTextActive]}>Discover</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.viewModeButton, viewMode === 'browse' && styles.viewModeButtonActive]}
                onPress={() => setViewMode('browse')}
            >
                <Ionicons name="grid" size={20} color={viewMode === 'browse' ? colors.primary : colors.textSecondary} />
                <Text style={[styles.viewModeText, viewMode === 'browse' && styles.viewModeTextActive]}>Browse</Text>
            </TouchableOpacity>
            </View>
        )}
      </View>
      <View style={styles.searchFilterBar}>
        <TouchableOpacity
          style={styles.searchInput}
          onPress={() => navigation.navigate('UserSearchScreen')}
        >
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Search products...</Text>
        </TouchableOpacity>

        <View style={styles.exploreModeContainer}>
            <TouchableOpacity
                style={[styles.exploreModeButton, exploreMode === 'Products' && styles.exploreModeButtonActive]}
                onPress={() => setExploreMode('Products')}
            >
                <Text style={[styles.exploreModeText, exploreMode === 'Products' && styles.exploreModeTextActive]}>Products</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.exploreModeButton, exploreMode === 'Accounts' && styles.exploreModeButtonActive]}
                onPress={() => setExploreMode('Accounts')}
            >
                <Text style={[styles.exploreModeText, exploreMode === 'Accounts' && styles.exploreModeTextActive]}>Accounts</Text>
            </TouchableOpacity>
        </View>

        {exploreMode === 'Products' && (
            <>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {categories.map(cat => (
                    <TouchableOpacity
                    key={cat}
                    style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                    onPress={() => setSelectedCategory(cat)}
                    >
                    <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                ))}
                </ScrollView>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll}>
                {sortOptions.map(option => (
                    <TouchableOpacity
                    key={option}
                    style={[styles.sortChip, sortBy === option && styles.sortChipActive]}
                    onPress={() => setSortBy(option)}
                    >
                    <Text style={[styles.sortChipText, sortBy === option && styles.sortChipTextActive]}>{option}</Text>
                    </TouchableOpacity>
                ))}
                </ScrollView>
            </>
        )}
      </View>
    </View>
  );
  
  const renderProductContent = () => {
    if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /><Text style={styles.loadingText}>Loading Products...</Text></View>;
    if (error) return <View style={styles.centered}><Ionicons name="alert-circle-outline" size={64} color={colors.error} /><Text style={styles.errorText}>Failed to load products.</Text><Text style={styles.errorSubtext}>{error}</Text><TouchableOpacity style={styles.retryButton} onPress={fetchProducts}><Text style={styles.retryButtonText}>Try Again</Text></TouchableOpacity></View>;
    if (filteredProducts.length === 0) return <View style={styles.centered}><Ionicons name="search-outline" size={64} color={colors.textSecondary} /><Text style={styles.emptyText}>No products found.</Text><Text style={styles.emptySubtext}>Try adjusting your search or filters.</Text></View>;

    if (viewMode === 'browse') {
      return (
        <FlatList
          data={filteredProducts}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.productGrid}
          renderItem={renderBrowseCard}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader()}
        />
      );
    }
    
    return (
      <>
        {renderHeader()}
        <View style={styles.swiperContainer}>
          <Swiper
            cards={filteredProducts}
            cardIndex={cardIndex}
            renderCard={renderSwipeCard}
            onSwipedLeft={onSwipedLeft}
            onSwipedRight={onSwipedRight}
            onSwipedUp={onSwipedUp}
            onTapCard={(index) => handleProductPress(filteredProducts[index])}
            cardVerticalMargin={20}
            cardHorizontalMargin={20}
            stackSize={3}
            backgroundColor={'transparent'}
            cardStyle={styles.swipeCardStyle}
            containerStyle={{ flex: 1 }}
          />
        </View>
      </>
    );
  }

  const renderAccountContent = () => {
    return (
        <View>
            {renderHeader()}
            <View style={styles.centered}>
                <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
                <Text style={styles.emptyText}>Account Search Coming Soon</Text>
                <Text style={styles.emptySubtext}>You'll be able to find and follow your favorite sellers here.</Text>
            </View>
        </View>
    )
  }

  const renderSwipeCard = (card: Product) => {
    if (!card) return null;
    return (
      <View style={styles.swipeCard}>
        <Image source={{ uri: (card.media_urls && card.media_urls[0]) || 'https://via.placeholder.com/300' }} style={styles.swipeCardImage} />
        <View style={styles.swipeCardContent}>
          <View style={styles.swipeCardHeader}><Text style={styles.swipeCardTitle}>{card.name}</Text><Text style={styles.swipeCardPrice}>${card.price.toFixed(2)}</Text></View>
          <Text style={styles.swipeCardStore}>by {card.store_id}</Text><Text style={styles.swipeCardCategory}>{card.category}</Text>
          <View style={styles.swipeInstructions}>
            <View style={styles.swipeInstruction}><Ionicons name="arrow-back" size={20} color={colors.textSecondary} /><Text style={styles.swipeInstructionText}>Skip</Text></View>
            <View style={styles.swipeInstruction}><Ionicons name="heart" size={20} color={colors.discount} /><Text style={styles.swipeInstructionText}>Wishlist</Text></View>
            <View style={styles.swipeInstruction}><Ionicons name="arrow-up" size={20} color={colors.primary} /><Text style={styles.swipeInstructionText}>Add to Cart</Text></View>
          </View>
        </View>
      </View>
    );
  };

  const renderBrowseCard = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard} onPress={() => handleProductPress(item)}>
      <Image source={{ uri: (item.media_urls && item.media_urls[0]) || 'https://via.placeholder.com/150' }} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
      <TouchableOpacity style={styles.addToCartButton} onPress={() => handleAddToCart(item)}><Text style={styles.addToCartText}>Add to Cart</Text></TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {exploreMode === 'Products' ? renderProductContent() : renderAccountContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  loadingText: { marginTop: spacing.m, fontSize: moderateScale(16), color: colors.textSecondary },
  errorText: { marginTop: spacing.m, fontSize: moderateScale(20), fontWeight: '600', color: colors.error, textAlign: 'center' },
  errorSubtext: { marginTop: spacing.s, fontSize: moderateScale(14), color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.l },
  retryButton: { backgroundColor: colors.primary, paddingVertical: spacing.m, paddingHorizontal: spacing.xl, borderRadius: radii.pill },
  retryButtonText: { color: colors.white, fontWeight: '600', fontSize: moderateScale(16) },
  emptyText: { marginTop: spacing.m, fontSize: moderateScale(20), fontWeight: '600', color: colors.text },
  emptySubtext: { marginTop: spacing.s, fontSize: moderateScale(14), color: colors.textSecondary, textAlign: 'center' },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.l },
  title: { fontSize: moderateScale(28), fontWeight: '700', color: colors.text, fontFamily: typography.fontFamily, marginBottom: spacing.m },
  viewModeToggle: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radii.pill, padding: spacing.xs },
  viewModeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.s, paddingHorizontal: spacing.m, borderRadius: radii.pill },
  viewModeButtonActive: { backgroundColor: colors.primary + '15' },
  viewModeText: { marginLeft: spacing.xs, fontSize: scale(14), color: colors.textSecondary, fontWeight: '600' },
  viewModeTextActive: { color: colors.primary },
  searchFilterBar: { paddingHorizontal: spacing.l, paddingBottom: spacing.m },
  searchInput: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card, 
    borderRadius: radii.medium, 
    paddingHorizontal: spacing.m, 
    paddingVertical: spacing.m, 
    marginBottom: spacing.m
  },
  searchIcon: {
    marginRight: spacing.s,
  },
  searchPlaceholder: {
    fontSize: scale(16),
    color: colors.textSecondary,
  },
  exploreModeContainer: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radii.pill, padding: spacing.xs, marginBottom: spacing.m },
  exploreModeButton: { flex: 1, paddingVertical: spacing.s, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
  exploreModeButtonActive: { backgroundColor: colors.primary },
  exploreModeText: { fontSize: scale(14), color: colors.textSecondary, fontWeight: '600' },
  exploreModeTextActive: { color: colors.white },
  categoryScroll: { marginBottom: spacing.s },
  categoryChip: { backgroundColor: colors.card, borderRadius: radii.pill, paddingHorizontal: spacing.m, paddingVertical: spacing.s, marginRight: spacing.s, borderWidth: 1, borderColor: colors.border },
  categoryChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryChipText: { color: colors.textSecondary, fontSize: moderateScale(14), fontFamily: typography.fontFamily },
  categoryChipTextActive: { color: colors.text, fontWeight: '600' },
  sortScroll: { marginBottom: spacing.m },
  sortChip: { backgroundColor: colors.card, borderRadius: radii.pill, paddingHorizontal: spacing.m, paddingVertical: spacing.s, marginRight: spacing.s, borderWidth: 1, borderColor: colors.border },
  sortChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  sortChipText: { color: colors.textSecondary, fontSize: moderateScale(14), fontFamily: typography.fontFamily },
  sortChipTextActive: { color: colors.text, fontWeight: '600' },
  swiperContainer: { flex: 1 },
  swipeCardStyle: { borderRadius: radii.large, ...shadows.card },
  swipeCard: { width: width * 0.85, height: height * 0.65, backgroundColor: colors.card, borderRadius: radii.large, overflow: 'hidden', ...shadows.card, alignSelf: 'center' },
  swipeCardImage: { width: '100%', height: '70%', resizeMode: 'cover' },
  swipeCardContent: { padding: spacing.m, flex: 1 },
  swipeCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  swipeCardTitle: { fontSize: scale(18), fontWeight: '700', color: colors.text, flex: 1 },
  swipeCardPrice: { fontSize: scale(18), fontWeight: '700', color: colors.primary },
  swipeCardStore: { fontSize: scale(14), color: colors.textSecondary, marginBottom: spacing.xs },
  swipeCardCategory: { fontSize: scale(12), color: colors.textSecondary, marginBottom: spacing.m },
  swipeInstructions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 'auto' },
  swipeInstruction: { alignItems: 'center' },
  swipeInstructionText: { fontSize: scale(12), color: colors.textSecondary, marginTop: spacing.xs },
  productGrid: { paddingHorizontal: spacing.l, paddingBottom: spacing.xl },
  productCard: { flex: 1, backgroundColor: colors.card, borderRadius: radii.medium, padding: spacing.m, margin: spacing.xs, alignItems: 'center', ...shadows.card },
  productImage: { width: moderateScale(120), height: moderateScale(120), borderRadius: radii.medium, marginBottom: spacing.s },
  productName: { fontSize: scale(14), fontWeight: '600', color: colors.text, textAlign: 'center', marginBottom: spacing.xs },
  productPrice: { fontSize: scale(16), fontWeight: '700', color: colors.primary, marginBottom: spacing.s },
  addToCartButton: { backgroundColor: colors.primary, borderRadius: radii.pill, paddingVertical: spacing.s, paddingHorizontal: spacing.m, width: '100%', alignItems: 'center' },
  addToCartText: { color: '#fff', fontSize: scale(14), fontWeight: '600' },
});

export default UserExploreScreen;
