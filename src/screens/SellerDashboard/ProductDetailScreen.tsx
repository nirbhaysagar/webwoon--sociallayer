import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList, Alert, Dimensions,
  SafeAreaView, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { useUserShop } from '../../context/UserShopContext';
import { ProductService, Product } from '../../services/productService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Comprehensive mock product data
const mockProduct = {
  id: '1',
  name: 'Premium Wireless Noise-Canceling Headphones',
  brand: 'AudioTech Pro',
  price: 299.99,
  oldPrice: 399.99,
  discount: 25,
  rating: 4.8,
  reviewCount: 1247,
  stock: 45,
  images: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500',
  ],
  colors: ['Black', 'White', 'Blue', 'Red'],
  sizes: ['One Size'],
  description: 'Experience crystal-clear sound with our premium wireless headphones. Featuring advanced noise-canceling technology, these headphones deliver immersive audio quality for music, calls, and entertainment. With up to 30 hours of battery life and comfortable over-ear design, they\'re perfect for long listening sessions.',
  specifications: {
    'Battery Life': 'Up to 30 hours',
    'Bluetooth Version': '5.0',
    'Noise Cancellation': 'Active ANC',
    'Driver Size': '40mm',
    'Frequency Response': '20Hz - 20kHz',
    'Impedance': '32 ohms',
    'Weight': '250g',
    'Cable Length': '1.2m',
    'Warranty': '2 years',
    'Compatibility': 'iOS, Android, Windows, Mac'
  },
  features: [
    'Active Noise Cancellation',
    'Bluetooth 5.0 Technology',
    '30-Hour Battery Life',
    'Quick Charge (10 min = 5 hours)',
    'Built-in Microphone',
    'Touch Controls',
    'Foldable Design',
    'Premium Materials',
    'Multi-device Pairing',
    'Customizable EQ'
  ],
  reviews: [
    {
      id: '1',
      user: 'Sarah M.',
      rating: 5,
      date: '2024-01-15',
      title: 'Excellent sound quality!',
      comment: 'These headphones exceeded my expectations. The noise cancellation is incredible and the sound quality is crystal clear. Battery life is amazing too!'
    },
    {
      id: '2',
      user: 'Mike R.',
      rating: 4,
      date: '2024-01-10',
      title: 'Great headphones, minor issues',
      comment: 'Overall very satisfied with the purchase. Sound quality is excellent and they\'re very comfortable for long sessions. Only giving 4 stars because the touch controls can be a bit sensitive.'
    },
    {
      id: '3',
      user: 'Jennifer L.',
      rating: 5,
      date: '2024-01-08',
      title: 'Perfect for work from home',
      comment: 'I use these for work calls and music. The noise cancellation helps me focus, and the microphone quality is great for video calls. Highly recommend!'
    },
    {
      id: '4',
      user: 'David K.',
      rating: 4,
      date: '2024-01-05',
      title: 'Solid choice',
      comment: 'Good build quality and sound. The battery life is impressive. Would buy again.'
    },
    {
      id: '5',
      user: 'Emma T.',
      rating: 5,
      date: '2024-01-03',
      title: 'Amazing value for money',
      comment: 'For the price, these headphones are incredible. The sound quality rivals much more expensive models. Very happy with my purchase!'
    }
  ],
  store: {
    name: 'AudioTech Store',
    rating: 4.9,
    verified: true,
    location: 'New York, NY',
    shipping: 'Free shipping',
    returnPolicy: '30-day return policy'
  },
  relatedProducts: [
    {
      id: '2',
      name: 'Wireless Earbuds Pro',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300',
      rating: 4.6
    },
    {
      id: '3',
      name: 'Bluetooth Speaker',
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300',
      rating: 4.4
    },
    {
      id: '4',
      name: 'Gaming Headset',
      price: 149.99,
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300',
      rating: 4.7
    }
  ],
  recommendedProducts: [
    {
      id: '5',
      name: 'Premium Carrying Case',
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300',
      rating: 4.8,
      originalPrice: 39.99,
      discount: 25
    },
    {
      id: '6',
      name: 'Bluetooth Adapter',
      price: 19.99,
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300',
      rating: 4.5,
      originalPrice: 24.99,
      discount: 20
    },
    {
      id: '7',
      name: 'Premium Audio Cable',
      price: 15.99,
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300',
      rating: 4.7,
      originalPrice: 19.99,
      discount: 20
    },
    {
      id: '8',
      name: 'Headphone Stand',
      price: 34.99,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300',
      rating: 4.6,
      originalPrice: 44.99,
      discount: 22
    },
    {
      id: '9',
      name: 'Wireless Charging Pad',
      price: 49.99,
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300',
      rating: 4.4,
      originalPrice: 59.99,
      discount: 17
    },
    {
      id: '10',
      name: 'Audio Enhancement Kit',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300',
      rating: 4.9,
      originalPrice: 99.99,
      discount: 20
    }
  ]
};

export default function ProductDetailScreen({ route, navigation }) {
  const { addToCart, addToWishlist } = useUserShop();
  const { productId } = route.params || { productId: '1' };

  const [product, setProduct] = useState(mockProduct);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState(product.relatedProducts);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      // In a real app, you would fetch the product by ID
      // const productData = await ProductService.getProductById(productId);
      // setProduct(productData);
      
      // For now, we'll use mock data
      setProduct(mockProduct);
      setRelatedProducts(mockProduct.relatedProducts);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      const cartItem = {
        id: product.id,
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
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const handleAddToWishlist = async () => {
    try {
      const wishlistItem = {
        id: product.id,
        title: product.name,
        price: product.price,
        image: product.images[0],
        store: product.store.name
      };
      
      await addToWishlist(wishlistItem);
      Alert.alert('Success', 'Product added to wishlist!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add item to wishlist');
    }
  };

  const renderImageGallery = () => (
    <View style={styles.imageGallery}>
      <Image 
        source={{ uri: product.images[currentImageIndex] }} 
        style={styles.mainImage} 
        resizeMode="contain"
      />
      
      {/* Image indicators */}
      <View style={styles.imageIndicators}>
        {product.images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              currentImageIndex === index && styles.activeIndicator
            ]}
          />
        ))}
      </View>

      {/* Navigation arrows */}
      <TouchableOpacity
        style={styles.arrowLeft}
        onPress={() => setCurrentImageIndex((prev) => 
          prev === 0 ? product.images.length - 1 : prev - 1
        )}
      >
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.arrowRight}
        onPress={() => setCurrentImageIndex((prev) => 
          (prev + 1) % product.images.length
        )}
      >
        <Ionicons name="chevron-forward" size={24} color={colors.text} />
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
        <Text style={styles.brand}>{product.brand}</Text>
        {product.store.verified && (
          <Ionicons name="checkmark-circle" size={16} color={colors.secondary} />
        )}
      </View>
      
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={16} color={colors.rating} />
        <Text style={styles.rating}>{product.rating}</Text>
        <Text style={styles.reviewCount}>({product.reviewCount} reviews)</Text>
      </View>
      
      <Text style={styles.productName}>{product.name}</Text>
      
      <View style={styles.priceRow}>
        {product.oldPrice && (
          <Text style={styles.oldPrice}>${product.oldPrice.toFixed(2)}</Text>
        )}
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      </View>
      
      <View style={styles.stockInfo}>
        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
        <Text style={styles.stockText}>In Stock ({product.stock} available)</Text>
      </View>
    </View>
  );

  const renderColorSelector = () => (
    <View style={styles.selectorSection}>
      <Text style={styles.sectionTitle}>Color</Text>
      <View style={styles.colorOptions}>
        {product.colors.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              selectedColor === color && styles.selectedColorOption
            ]}
            onPress={() => setSelectedColor(color)}
          >
            <Text style={[
              styles.colorOptionText,
              selectedColor === color && styles.selectedColorOptionText
            ]}>
              {color}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSizeSelector = () => (
    <View style={styles.selectorSection}>
      <Text style={styles.sectionTitle}>Size</Text>
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
              styles.sizeOptionText,
              selectedSize === size && styles.selectedSizeOptionText
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
      <Text style={styles.sectionTitle}>Quantity</Text>
      <View style={styles.quantityControls}>
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
      {['description', 'specifications', 'reviews'].map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.descriptionText}>{product.description}</Text>
            
            <Text style={styles.featuresTitle}>Key Features</Text>
            {product.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark" size={16} color={colors.success} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
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
            <View style={styles.reviewsHeader}>
              <Text style={styles.reviewsTitle}>Customer Reviews</Text>
              <Text style={styles.reviewsCount}>{product.reviews.length} reviews</Text>
            </View>
            
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
                        color={colors.rating}
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewTitle}>{review.title}</Text>
                <Text style={styles.reviewComment}>{review.comment}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
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
        nestedScrollEnabled={false}
        scrollEnabled={true}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.relatedProduct}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          >
            <Image source={{ uri: item.image }} style={styles.relatedProductImage} />
            <Text style={styles.relatedProductName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.relatedProductPrice}>${item.price.toFixed(2)}</Text>
            <View style={styles.relatedProductRating}>
              <Ionicons name="star" size={12} color={colors.rating} />
              <Text style={styles.relatedProductRatingText}>{item.rating}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.relatedProductsList}
      />
    </View>
  );

  const renderRecommendedProducts = () => (
    <View style={styles.recommendedSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.recommendedTitle}>Recommended for You</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={product.recommendedProducts}
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={false}
        scrollEnabled={true}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.recommendedProduct}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          >
            <View style={styles.recommendedProductImageContainer}>
              <Image source={{ uri: item.image }} style={styles.recommendedProductImage} />
              {item.discount > 0 && (
                <View style={styles.recommendedDiscountBadge}>
                  <Text style={styles.recommendedDiscountText}>-{item.discount}%</Text>
                </View>
              )}
            </View>
            <View style={styles.recommendedProductInfo}>
              <Text style={styles.recommendedProductName} numberOfLines={2}>{item.name}</Text>
              <View style={styles.recommendedProductRating}>
                <Ionicons name="star" size={12} color={colors.rating} />
                <Text style={styles.recommendedProductRatingText}>{item.rating}</Text>
              </View>
              <View style={styles.recommendedPriceRow}>
                {item.originalPrice && (
                  <Text style={styles.recommendedOriginalPrice}>${item.originalPrice.toFixed(2)}</Text>
                )}
                <Text style={styles.recommendedProductPrice}>${item.price.toFixed(2)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.recommendedProductsList}
      />
    </View>
  );

  const renderProductReviews = () => (
    <View style={styles.reviewsSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.reviewsSectionTitle}>Customer Reviews</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All Reviews</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.reviewsSummary}>
        <View style={styles.overallRating}>
          <Text style={styles.overallRatingNumber}>{product.rating}</Text>
          <View style={styles.overallRatingStars}>
            {[...Array(5)].map((_, index) => (
              <Ionicons
                key={index}
                name={index < Math.floor(product.rating) ? "star" : "star-outline"}
                size={16}
                color={colors.rating}
              />
            ))}
          </View>
          <Text style={styles.reviewsCountText}>{product.reviewCount} reviews</Text>
        </View>
      </View>
      
      {product.reviews.slice(0, 3).map((review) => (
        <View key={review.id} style={styles.reviewCard}>
          <View style={styles.reviewCardHeader}>
            <View style={styles.reviewUserInfo}>
              <View style={styles.reviewUserAvatar}>
                <Text style={styles.reviewUserInitial}>{review.user.charAt(0)}</Text>
              </View>
              <View style={styles.reviewUserDetails}>
                <Text style={styles.reviewUserName}>{review.user}</Text>
                <View style={styles.reviewRating}>
                  {[...Array(5)].map((_, index) => (
                    <Ionicons
                      key={index}
                      name={index < review.rating ? "star" : "star-outline"}
                      size={12}
                      color={colors.rating}
                    />
                  ))}
                </View>
              </View>
            </View>
            <Text style={styles.reviewDate}>{review.date}</Text>
          </View>
          <Text style={styles.reviewCardTitle}>{review.title}</Text>
          <Text style={styles.reviewCardComment}>{review.comment}</Text>
        </View>
      ))}
      
      <TouchableOpacity style={styles.loadMoreReviews}>
        <Text style={styles.loadMoreReviewsText}>Load More Reviews</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="share-social-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleAddToWishlist}
          >
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={24} 
              color={isLiked ? colors.favorite : colors.text} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleAddToCart}
          >
            <Ionicons name="cart-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
        scrollEnabled={true}
      >
        {renderImageGallery()}
        {renderProductInfo()}
        {renderColorSelector()}
        {renderSizeSelector()}
        {renderQuantitySelector()}
        {renderTabs()}
        {renderTabContent()}
        {renderRelatedProducts()}
        {renderRecommendedProducts()}
        {renderProductReviews()}
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
          <Text style={styles.wishlistButtonText}>
            {isLiked ? 'Added' : 'Wishlist'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <Ionicons name="cart-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.floatingActionButton}
        onPress={handleAddToCart}
      >
        <Ionicons name="cart" size={24} color="#fff" />
      </TouchableOpacity>
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
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    padding: spacing.s,
  },
  headerActions: {
    flexDirection: 'row',
  },
  scrollView: {
    flex: 1,
    marginBottom: 80, // Space for bottom bar
  },
  scrollContent: {
    paddingBottom: 120, // More space for bottom bar
  },
  imageGallery: {
    position: 'relative',
    height: 300,
    backgroundColor: colors.card,
    marginHorizontal: spacing.m,
    marginTop: spacing.s,
    borderRadius: radii.large,
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: spacing.m,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: colors.primary,
  },
  arrowLeft: {
    position: 'absolute',
    left: spacing.s,
    top: '50%',
    marginTop: -20,
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: spacing.s,
    ...shadows.card,
  },
  arrowRight: {
    position: 'absolute',
    right: spacing.s,
    top: '50%',
    marginTop: -20,
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: spacing.s,
    ...shadows.card,
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.m,
    left: spacing.m,
    backgroundColor: colors.discount,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
  },
  discountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  productInfo: {
    paddingHorizontal: spacing.m,
    paddingTop: spacing.m,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  brand: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: spacing.s,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  rating: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.rating,
    marginLeft: spacing.xs,
  },
  reviewCount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.s,
    lineHeight: 26,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  oldPrice: {
    fontSize: 16,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
    marginRight: spacing.s,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  stockText: {
    fontSize: 14,
    color: colors.success,
    marginLeft: spacing.xs,
  },
  selectorSection: {
    paddingHorizontal: spacing.m,
    marginBottom: spacing.m,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.s,
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginRight: spacing.s,
    marginBottom: spacing.s,
  },
  selectedColorOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  colorOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedColorOptionText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  sizeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sizeOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginRight: spacing.s,
    marginBottom: spacing.s,
  },
  selectedSizeOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  sizeOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedSizeOptionText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  quantitySection: {
    paddingHorizontal: spacing.m,
    marginBottom: spacing.m,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.card,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: spacing.m,
    minWidth: 30,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.m,
    marginBottom: spacing.m,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.s,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  tabContent: {
    paddingHorizontal: spacing.m,
    marginBottom: spacing.m,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.m,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.s,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  featureText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: spacing.s,
    flex: 1,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  specKey: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  specValue: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  reviewsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  reviewsCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  reviewItem: {
    marginBottom: spacing.m,
    paddingBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  reviewComment: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  relatedSection: {
    marginBottom: spacing.m,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: spacing.m,
    marginBottom: spacing.s,
  },
  relatedProductsList: {
    paddingHorizontal: spacing.m,
  },
  relatedProduct: {
    width: 150,
    marginRight: spacing.m,
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.s,
    ...shadows.card,
  },
  relatedProductImage: {
    width: '100%',
    height: 100,
    borderRadius: radii.small,
    marginBottom: spacing.s,
  },
  relatedProductName: {
    fontSize: 12,
    color: colors.text,
    marginBottom: spacing.xs,
    lineHeight: 16,
  },
  relatedProductPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  relatedProductRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  relatedProductRatingText: {
    fontSize: 12,
    color: colors.rating,
    marginLeft: spacing.xs,
  },
  recommendedSection: {
    marginBottom: spacing.m,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    marginBottom: spacing.s,
  },
  recommendedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  recommendedProductsList: {
    paddingHorizontal: spacing.m,
  },
  recommendedProduct: {
    width: 180,
    marginRight: spacing.m,
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    overflow: 'hidden',
    ...shadows.card,
  },
  recommendedProductImageContainer: {
    position: 'relative',
  },
  recommendedProductImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  recommendedDiscountBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.discount,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  recommendedDiscountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
  },
  recommendedProductInfo: {
    padding: spacing.s,
  },
  recommendedProductName: {
    fontSize: 12,
    color: colors.text,
    marginBottom: spacing.xs,
    lineHeight: 16,
    fontWeight: '600',
  },
  recommendedProductRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  recommendedProductRatingText: {
    fontSize: 10,
    color: colors.rating,
    marginLeft: spacing.xs,
  },
  recommendedPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendedOriginalPrice: {
    fontSize: 10,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
    marginRight: spacing.xs,
  },
  recommendedProductPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  reviewsSection: {
    marginBottom: spacing.m,
  },
  reviewsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  reviewsSummary: {
    paddingHorizontal: spacing.m,
    marginBottom: spacing.m,
  },
  overallRating: {
    alignItems: 'center',
    paddingVertical: spacing.m,
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    ...shadows.card,
  },
  overallRatingNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  overallRatingStars: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  reviewsCountText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  reviewCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginHorizontal: spacing.m,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.s,
  },
  reviewUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.s,
  },
  reviewUserInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  reviewUserDetails: {
    flex: 1,
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  reviewCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  reviewCardComment: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  loadMoreReviews: {
    alignItems: 'center',
    paddingVertical: spacing.m,
    marginHorizontal: spacing.m,
  },
  loadMoreReviewsText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  wishlistButton: {
    width: 80,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
    flexDirection: 'row',
    ...shadows.card,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radii.medium,
    paddingVertical: spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.floating,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  wishlistButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 4,
  },
  floatingActionButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.floating,
    elevation: 8,
  },
}); 