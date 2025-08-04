import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  FlatList, 
  Alert, 
  Dimensions,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { useUserShop } from '../../context/UserShopContext';
import { ProductService, Product } from '../../services/productService';
import BackButton from '../../components/BackButton';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const { addToCart, addToWishlist } = useUserShop();
  const { productId } = route.params;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('description');

  // Mock product data for demonstration
  const mockProduct = {
    id: productId,
    name: "Premium Wireless Bluetooth Headphones",
    description: "Experience crystal-clear sound with our premium wireless headphones. Features include active noise cancellation, 30-hour battery life, and premium comfort for extended listening sessions.",
    price: 199.99,
    originalPrice: 249.99,
    discount: 20,
    rating: 4.8,
    reviewCount: 1247,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80"
    ],
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'White', value: '#FFFFFF' },
      { name: 'Blue', value: '#3B82F6' }
    ],
    sizes: ['One Size'],
    specifications: {
      "Brand": "AudioTech Pro",
      "Model": "ATH-WP1000",
      "Connectivity": "Bluetooth 5.0",
      "Battery Life": "30 hours",
      "Noise Cancellation": "Active",
      "Weight": "250g",
      "Warranty": "2 years"
    },
    features: [
      "Active Noise Cancellation",
      "30-hour battery life",
      "Premium comfort design",
      "Bluetooth 5.0 connectivity",
      "Built-in microphone",
      "Touch controls"
    ],
    reviews: [
      {
        id: 1,
        user: "John D.",
        rating: 5,
        date: "2 days ago",
        comment: "Amazing sound quality! The noise cancellation is incredible."
      },
      {
        id: 2,
        user: "Sarah M.",
        rating: 4,
        date: "1 week ago",
        comment: "Great headphones, very comfortable for long listening sessions."
      },
      {
        id: 3,
        user: "Mike R.",
        rating: 5,
        date: "2 weeks ago",
        comment: "Perfect for my daily commute. Battery life is impressive."
      }
    ],
    store: {
      name: "TechStore Pro",
      rating: 4.9,
      verified: true,
      followers: 1250
    },
    inStock: true,
    stockQuantity: 15,
    shipping: "Free shipping",
    returnPolicy: "30-day return policy"
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      // In a real app, you would fetch the product from ProductService
      // const productData = await ProductService.getProductById(productId);
      // setProduct(productData);
      
      // For now, using mock data
      setProduct(mockProduct);
      
      // Load related products
      const related = await ProductService.getFeaturedProducts(4);
      setRelatedProducts(related);
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      const cartItem = {
        id: product.id.toString(),
        title: product.name,
        price: product.price,
        image: product.images[0],
        store: product.store.name,
        quantity: quantity,
        selectedSize: selectedSize,
        selectedColor: selectedColor
      };
      
      await addToCart(cartItem);
      Alert.alert('Success', 'Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const handleAddToWishlist = async () => {
    try {
      const wishlistItem = {
        id: product.id.toString(),
        title: product.name,
        price: product.price,
        image: product.images[0],
        store: product.store.name,
        quantity: 1
      };
      
      await addToWishlist(wishlistItem);
      setIsLiked(true);
      Alert.alert('Success', 'Product added to wishlist!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      Alert.alert('Error', 'Failed to add item to wishlist');
    }
  };

  const handleMessageSeller = () => {
    Alert.alert('Message Seller', 'This feature is not yet implemented.');
  };

  const renderImageGallery = () => (
    <View style={styles.imageGallery}>
      <Image 
        source={{ uri: product.images[currentImageIndex] }} 
        style={styles.mainImage} 
      />
      
      {/* Image indicators */}
      <View style={styles.imageIndicators}>
        {product.images.map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.indicator, 
              index === currentImageIndex && styles.activeIndicator
            ]} 
          />
        ))}
      </View>
      
      {/* Navigation arrows */}
      <TouchableOpacity 
        style={styles.arrowLeft}
        onPress={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
      >
        <Ionicons name="chevron-back" size={24} color={colors.white} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.arrowRight}
        onPress={() => setCurrentImageIndex(Math.min(product.images.length - 1, currentImageIndex + 1))}
      >
        <Ionicons name="chevron-forward" size={24} color={colors.white} />
      </TouchableOpacity>
      
      {/* Discount badge */}
      {product.discount > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{product.discount}%</Text>
        </View>
      )}
    </View>
  );

  const renderProductInfo = () => (
    <View style={styles.productInfo}>
      <View style={styles.brandRow}>
        <Text style={styles.brand}>{product.store.name}</Text>
        {product.store.verified && (
          <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
        )}
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color={colors.warning} />
          <Text style={styles.rating}>{product.rating}</Text>
          <Text style={styles.reviewCount}>({product.reviewCount})</Text>
        </View>
      </View>
      
      <Text style={styles.productName}>{product.name}</Text>
      
      <View style={styles.priceRow}>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        {product.originalPrice && (
          <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
        )}
      </View>
      
      <View style={styles.stockInfo}>
        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
        <Text style={styles.stockText}>In Stock ({product.stockQuantity} available)</Text>
      </View>
    </View>
  );

  const renderColorSelector = () => (
    <View style={styles.selectorSection}>
      <Text style={styles.selectorTitle}>Color</Text>
      <View style={styles.colorOptions}>
        {product.colors.map((color) => (
          <TouchableOpacity
            key={color.name}
            style={[
              styles.colorOption,
              selectedColor === color.name && styles.selectedColorOption
            ]}
            onPress={() => setSelectedColor(color.name)}
          >
            <View style={[styles.colorCircle, { backgroundColor: color.value }]} />
            <Text style={styles.colorName}>{color.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSizeSelector = () => (
    <View style={styles.selectorSection}>
      <Text style={styles.selectorTitle}>Size</Text>
      <View style={styles.sizeOptions}>
        {product.sizes.map((size) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.sizeOption,
              selectedSize === size && styles.selectedSizeOption
            ]}
            onPress={() => setSelectedSize(size)}
          >
            <Text style={[
              styles.sizeText,
              selectedSize === size && styles.selectedSizeText
            ]}>
              {size}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderQuantitySelector = () => (
    <View style={styles.quantitySection}>
      <Text style={styles.selectorTitle}>Quantity</Text>
      <View style={styles.quantitySelector}>
        <TouchableOpacity 
          style={styles.quantityBtn}
          onPress={() => setQuantity(Math.max(1, quantity - 1))}
        >
          <Ionicons name="remove" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{quantity}</Text>
        <TouchableOpacity 
          style={styles.quantityBtn}
          onPress={() => setQuantity(quantity + 1)}
        >
          <Ionicons name="add" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'description' && styles.activeTab]}
        onPress={() => setActiveTab('description')}
      >
        <Text style={[styles.tabText, activeTab === 'description' && styles.activeTabText]}>
          Description
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'specifications' && styles.activeTab]}
        onPress={() => setActiveTab('specifications')}
      >
        <Text style={[styles.tabText, activeTab === 'specifications' && styles.activeTabText]}>
          Specifications
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
        onPress={() => setActiveTab('reviews')}
      >
        <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
          Reviews ({product.reviews.length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.descriptionText}>{product.description}</Text>
            <View style={styles.featuresList}>
              <Text style={styles.featuresTitle}>Key Features:</Text>
              {product.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      
      case 'specifications':
        return (
          <View style={styles.tabContent}>
            {Object.entries(product.specifications).map(([key, value]) => (
              <View key={key} style={styles.specItem}>
                <Text style={styles.specKey}>{key}</Text>
                <Text style={styles.specValue}>{value}</Text>
              </View>
            ))}
          </View>
        );
      
      case 'reviews':
        return (
          <View style={styles.tabContent}>
            {product.reviews.map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewUser}>{review.user}</Text>
                  <View style={styles.reviewRating}>
                    {[...Array(5)].map((_, index) => (
                      <Ionicons 
                        key={index}
                        name={index < review.rating ? "star" : "star-outline"} 
                        size={14} 
                        color={colors.warning} 
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewDate}>{review.date}</Text>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>
        );
      
      default:
        return null;
    }
  };

  const renderRelatedProducts = () => (
    <View style={styles.relatedSection}>
      <Text style={styles.relatedTitle}>Related Products</Text>
      <FlatList
        data={relatedProducts}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.relatedProduct}
            onPress={() => navigation.push('ProductDetail', { productId: item.id })}
          >
            <Image source={{ uri: item.image_url }} style={styles.relatedImage} />
            <Text style={styles.relatedProductName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.relatedProductPrice}>${item.price.toFixed(2)}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading product details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text>Product not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backButton} />
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleAddToWishlist}>
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={24} 
              color={isLiked ? colors.error : colors.text} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderImageGallery()}
        {renderProductInfo()}
        {renderColorSelector()}
        {renderSizeSelector()}
        {renderQuantitySelector()}
        {renderTabs()}
        {renderTabContent()}
        {renderRelatedProducts()}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.wishlistButton}
          onPress={handleAddToWishlist}
        >
          <Ionicons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={24} 
            color={isLiked ? colors.favorite : colors.text} 
          />
        </TouchableOpacity>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Ionicons name="cart-outline" size={20} color={colors.white} />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.messageSellerButton} onPress={handleMessageSeller}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
            <Text style={styles.messageSellerText}>Message Seller</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
} 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: radii.circle,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.s,
  },
  scrollView: {
    flex: 1,
  },
  imageGallery: {
    position: 'relative',
    height: screenWidth,
    backgroundColor: colors.white,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: spacing.lg,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
  activeIndicator: {
    backgroundColor: colors.primary,
    opacity: 1,
  },
  arrowLeft: {
    position: 'absolute',
    left: spacing.md,
    top: '50%',
    marginTop: -20,
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: spacing.sm,
    ...shadows.md,
  },
  arrowRight: {
    position: 'absolute',
    right: spacing.md,
    top: '50%',
    marginTop: -20,
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: spacing.sm,
    ...shadows.md,
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    backgroundColor: colors.error,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  discountText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  productInfo: {
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  brand: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  rating: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.warning,
    marginLeft: spacing.xs,
  },
  reviewCount: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  productName: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  price: {
    ...typography.h1,
    fontWeight: '700',
    color: colors.text,
  },
  originalPrice: {
    ...typography.body,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
    marginLeft: spacing.sm,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    ...typography.body,
    color: colors.success,
    marginLeft: spacing.xs,
  },
  selectorSection: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  selectorTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  colorOptions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  colorOption: {
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  selectedColorOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorName: {
    ...typography.caption,
    color: colors.text,
  },
  sizeOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sizeOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  selectedSizeOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  sizeText: {
    ...typography.body,
    color: colors.text,
  },
  selectedSizeText: {
    color: colors.white,
  },
  quantitySection: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radii.md,
    padding: spacing.xs,
    alignSelf: 'flex-start',
  },
  quantityBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  quantityText: {
    ...typography.h3,
    fontWeight: '600',
    color: colors.text,
    marginHorizontal: spacing.md,
    minWidth: 30,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.transparent,
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  tabContent: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    minHeight: 200,
  },
  descriptionText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  featuresList: {
    marginTop: spacing.md,
  },
  featuresTitle: {
    ...typography.h3,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureText: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  specKey: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  specValue: {
    ...typography.body,
    color: colors.textSecondary,
  },
  reviewItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  reviewUser: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  reviewComment: {
    ...typography.body,
    color: colors.text,
    lineHeight: 20,
  },
  relatedSection: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  relatedTitle: {
    ...typography.h3,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  relatedProduct: {
    width: 150,
    marginRight: spacing.md,
  },
  relatedImage: {
    width: 150,
    height: 150,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
  },
  relatedProductName: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  relatedProductPrice: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primary,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  wishlistButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.md,
  },
  addToCartText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.white,
    marginLeft: spacing.sm,
  },
  messageSellerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    ...shadows.sm,
  },
  messageSellerText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
}); 