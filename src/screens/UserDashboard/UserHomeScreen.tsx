import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from '../SellerDashboard/components/HeaderWithMenu';
import { useApp } from '../../context/AppContext';
import PostCommentsModal from '../SellerDashboard/components/PostCommentsModal';
import SharePostModal from '../SellerDashboard/components/SharePostModal';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { CartService } from '../../services/cartService';
import { WaitlistService } from '../../services/waitlistService';
import { PostInteractionService } from '../../services/postInteractionService';
import { useUserShop } from '../../context/UserShopContext';
import { ProductService, Product } from '../../services/productService';
import { useNavigation } from '@react-navigation/native';
import { AnalyticsService } from '../../services/analyticsService';
import BackButton from '../../components/BackButton';

export default function UserHomeScreen() {
  const { state } = useApp();
  const { authState } = useAuth();
  const { addToCart, addToWishlist } = useUserShop();
  const navigation = useNavigation();
  const [feedItems, setFeedItems] = useState([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Load real products from database
  const loadProducts = async () => {
    try {
      const featuredProducts = await ProductService.getFeaturedProducts(10);
      const trendingProducts = await ProductService.getTrendingProducts(5);
      
      // Combine and deduplicate products
      const allProducts = [...featuredProducts, ...trendingProducts];
      const uniqueProducts = allProducts.filter((product, index, self) => 
        index === self.findIndex(p => p.id === product.id)
      );
      
      setProducts(uniqueProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  // Combine real products with posts from AppContext
  const combinePosts = () => {
    // Convert real products to post format
    const productPosts = products.map(product => ({
      id: `product-${product.id}`,
      content: `Check out this amazing ${product.name}! 🚀`,
      media_urls: [product.image_url],
      created_at: product.created_at,
      likes_count: Math.floor(Math.random() * 20) + 5, // Mock engagement
      saves_count: Math.floor(Math.random() * 10) + 2,
      shares_count: Math.floor(Math.random() * 5) + 1,
      stores: {
        name: product.store?.name || 'Store',
        logo_url: product.store?.logo_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=100&q=80'
      },
      products: {
        id: product.id.toString(),
        name: product.name,
        price: product.price,
        image: product.image_url,
        store: product.store?.name || 'Store'
      }
    }));

    // Convert posts from AppContext to feed format
    const contextPosts = state.posts.map(post => ({
      id: post.id,
      content: post.content,
      media_urls: post.media_urls || [],
      created_at: post.created_at,
      likes_count: post.likes_count || 0,
      saves_count: post.saves_count || 0,
      shares_count: post.shares_count || 0,
      stores: {
        name: 'Your Store',
        logo_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=100&q=80'
      },
      products: post.featured_product_id ? {
        id: post.featured_product_id,
        name: 'Featured Product',
        price: 99.99,
        image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=300&q=80',
        store: 'Your Store'
      } : null
    }));

    // Combine and sort by creation date
    const allPosts = [...productPosts, ...contextPosts];
    return allPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  // Fetch feed data from Supabase
  const fetchFeedData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load products first
      await loadProducts();

      // Use combined posts (real products + context posts)
      const allPosts = combinePosts();
      setFeedItems(allPosts);
    } catch (err) {
      console.error('Error in fetchFeedData:', err);
      setError('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedData();
    // Track page view
    AnalyticsService.trackEvent('page_view', { page: 'UserHome' });
  }, []);

  // Refresh feed when posts are added to context
  useEffect(() => {
    if (state.posts.length > 0) {
      const allPosts = combinePosts();
      setFeedItems(allPosts);
    }
  }, [state.posts]);

  // Handle like/unlike a post
  const handleLike = async (postId) => {
    try {
      // In development mode, allow likes without authentication
      if (!authState.user) {
        console.log('Development mode: Allowing like without authentication');
        const currentPost = feedItems.find(item => item.id === postId);
        const isCurrentlyLiked = currentPost.isLiked;

        setFeedItems(prev => 
          prev.map(item => 
            item.id === postId 
              ? { 
                  ...item, 
                  isLiked: !isCurrentlyLiked,
                  likes_count: isCurrentlyLiked ? (item.likes_count || 1) - 1 : (item.likes_count || 0) + 1
                }
              : item
          )
        );
        return;
      }

      // Use the PostInteractionService
      const result = await PostInteractionService.toggleLike(authState.user.id, postId);
      
      // Update local state
      setFeedItems(prev => 
        prev.map(item => 
          item.id === postId 
            ? { 
                ...item, 
                isLiked: result.isLiked,
                likes_count: result.likesCount
              }
            : item
        )
      );
    } catch (error) {
      console.error('Error handling like:', error);
      Alert.alert('Failed to update like');
    }
  };

  // Handle save/unsave a post
  const handleSave = async (postId) => {
    try {
      // In development mode, allow saves without authentication
      if (!authState.user) {
        console.log('Development mode: Allowing save without authentication');
        const currentPost = feedItems.find(item => item.id === postId);
        const isCurrentlySaved = currentPost.isSaved;

        setFeedItems(prev => 
          prev.map(item => 
            item.id === postId 
              ? { 
                  ...item, 
                  isSaved: !isCurrentlySaved,
                  saves_count: isCurrentlySaved ? (item.saves_count || 1) - 1 : (item.saves_count || 0) + 1
                }
              : item
          )
        );
        return;
      }

      // Use the PostInteractionService
      const result = await PostInteractionService.toggleSave(authState.user.id, postId);
      
      // Update local state
      setFeedItems(prev => 
        prev.map(item => 
          item.id === postId 
            ? { 
                ...item, 
                isSaved: result.isSaved,
                saves_count: result.savesCount
              }
            : item
        )
      );
    } catch (error) {
      console.error('Error handling save:', error);
      Alert.alert('Failed to update save');
    }
  };

  // Handle add to cart using UserShopContext
  const handleAddToCart = (productId) => {
    try {
      // Find the product in the feed
      const post = feedItems.find(item => item.products?.id === productId);
      const product = post?.products;
      
      if (!product) {
        Alert.alert('Error', 'Product not found');
        return;
      }

      // Create cart item
      const cartItem = {
        id: product.id,
        title: product.name,
        price: product.price,
        image: product.image,
        store: product.store || post.stores?.name || 'Store',
        quantity: 1
      };

      // Add to cart using context
      addToCart(cartItem);
      
      Alert.alert(
        'Added to Cart', 
        `${product.name} has been added to your cart!`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => {
            // Navigate to cart screen
            console.log('Navigate to cart');
          }}
        ]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Failed to add to cart');
    }
  };

  // Handle add to waitlist using UserShopContext
  const handleAddToWaitlist = (productId) => {
    try {
      // Find the product in the feed
      const post = feedItems.find(item => item.products?.id === productId);
      const product = post?.products;
      
      if (!product) {
        Alert.alert('Error', 'Product not found');
        return;
      }

      // Create wishlist item
      const wishlistItem = {
        id: product.id,
        title: product.name,
        price: product.price,
        image: product.image,
        store: product.store || post.stores?.name || 'Store'
      };

      // Add to wishlist using context
      addToWishlist(wishlistItem);
      
      Alert.alert(
        'Added to Waitlist', 
        `${product.name} has been added to your waitlist!`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Waitlist', onPress: () => {
            // Navigate to wishlist screen
            console.log('Navigate to wishlist');
          }}
        ]
      );
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      Alert.alert('Failed to add to waitlist');
    }
  };

  const handleCommentPress = (post) => {
    setSelectedPost(post);
    setShowComments(true);
  };

  const handleSharePress = (post) => {
    setSelectedPost(post);
    setShowShare(true);
  };

  const renderFeedItem = ({ item }) => (
    <View style={styles.feedCard}>
      <View style={styles.feedHeader}>
        <Image 
          source={{ 
            uri: item.stores?.logo_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=100&q=80' 
          }} 
          style={styles.storeAvatar} 
        />
        <View style={styles.feedInfo}>
          <Text style={styles.storeName}>{item.stores?.name || 'Unknown Store'}</Text>
          <Text style={styles.postTime}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      {item.media_urls && item.media_urls.length > 0 && (
        <Image source={{ uri: item.media_urls[0] }} style={styles.feedImage} />
      )}
      
      <View style={styles.feedContent}>
        <Text style={styles.feedTitle}>{item.content}</Text>
        
        {/* Product Information */}
        {item.products && (
          <TouchableOpacity 
            style={styles.productSection}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.products.id })}
          >
            <Text style={styles.productName}>{item.products.name}</Text>
            <Text style={styles.feedPrice}>${item.products.price}</Text>
            
            {/* Action Buttons for Product */}
            <View style={styles.productActions}>
              <TouchableOpacity 
                style={styles.addToCartButton}
                onPress={() => handleAddToCart(item.products.id)}
              >
                <Ionicons name="cart-outline" size={20} color={colors.white} />
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.waitlistButton}
                onPress={() => handleAddToWaitlist(item.products.id)}
              >
                <Ionicons name="time-outline" size={20} color={colors.primary} />
                <Text style={styles.waitlistText}>Waitlist</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        
        <View style={styles.feedActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleLike(item.id)}
          >
            <Ionicons 
              name={item.isLiked ? 'heart' : 'heart-outline'} 
              size={24} 
              color={item.isLiked ? colors.favorite : colors.textSecondary} 
            />
            <Text style={styles.actionText}>{item.likes_count || 0}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleCommentPress(item)}
          >
            <Ionicons name="chatbubble-outline" size={24} color={colors.textSecondary} />
            <Text style={styles.actionText}>0</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleSharePress(item)}
          >
            <Ionicons name="share-outline" size={24} color={colors.textSecondary} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleSave(item.id)}
          >
            <Ionicons 
              name={item.isSaved ? 'bookmark' : 'bookmark-outline'} 
              size={24} 
              color={item.isSaved ? colors.favorite : colors.textSecondary} 
            />
            <Text style={styles.actionText}>{item.saves_count || 0}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backButton} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Home</Text>
          <Text style={styles.subtitle}>Discover amazing products</Text>
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={() => navigation.navigate('ProductSearch')}>
          <Ionicons name="search" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Discover amazing products</Text>
          <Text style={styles.subtitleText}>Find the latest trends and deals</Text>
        </View>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Ionicons name="alert-circle-outline" size={scale(48)} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : feedItems.length === 0 ? (
          <View style={styles.centered}>
            <Ionicons name="sparkles-outline" size={scale(48)} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No posts yet. Follow some stores to see their updates!</Text>
          </View>
        ) : (
          <FlatList
            data={feedItems}
            renderItem={renderFeedItem}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        )}
      </ScrollView>
      <PostCommentsModal
        visible={showComments}
        onClose={() => setShowComments(false)}
        post={selectedPost}
      />
      <SharePostModal
        visible={showShare}
        onClose={() => setShowShare(false)}
        post={selectedPost}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.large,
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
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  searchButton: {
    padding: spacing.small,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.small,
  },
  subtitleText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  feedCard: {
    backgroundColor: colors.white,
    borderRadius: radii.large,
    marginBottom: spacing.large,
    overflow: 'hidden',
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.border,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.large,
  },
  storeAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: spacing.medium,
  },
  feedInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  postTime: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  moreButton: {
    padding: spacing.small,
  },
  feedImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  feedContent: {
    padding: spacing.large,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginBottom: spacing.medium,
    lineHeight: 24,
  },
  productSection: {
    marginTop: spacing.large,
    padding: spacing.large,
    backgroundColor: colors.surface,
    borderRadius: radii.large,
  },
  productName: {
    fontSize: 20,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.small,
  },
  feedPrice: {
    fontSize: 22,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.large,
  },
  productActions: {
    flexDirection: 'row',
    gap: spacing.medium,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.large,
    borderRadius: radii.large,
    gap: spacing.small,
    ...shadows.small,
  },
  addToCartText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  waitlistButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.large,
    borderRadius: radii.large,
    gap: spacing.small,
  },
  waitlistText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  feedActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.large,
    paddingTop: spacing.medium,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.small,
  },
  actionText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: spacing.small,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  errorText: {
    color: colors.error,
    fontSize: 18,
    marginTop: spacing.medium,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 18,
    marginTop: spacing.medium,
    textAlign: 'center',
  },
}); 