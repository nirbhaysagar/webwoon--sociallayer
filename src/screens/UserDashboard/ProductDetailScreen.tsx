import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  Animated, 
  Alert,
  Dimensions,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from '../SellerDashboard/components/HeaderWithMenu';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import { useNavigation } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

const mockProduct = {
  id: '1',
  name: 'Premium Wireless Bluetooth Headphones',
  price: 129.99,
  originalPrice: 199.99,
  discount: 35,
  rating: 4.8,
  reviewCount: 1247,
  description: 'Experience crystal-clear sound with these premium wireless headphones. Features include active noise cancellation, 30-hour battery life, and premium comfort for extended listening sessions.',
  features: [
    'Active Noise Cancellation',
    '30-hour Battery Life',
    'Premium Comfort Design',
    'Bluetooth 5.0',
    'Touch Controls',
    'Water Resistant'
  ],
  images: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
    'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=400'
  ],
  colors: ['Black', 'White', 'Blue'],
  sizes: ['One Size'],
  inStock: true,
  stockCount: 15,
  seller: {
    name: 'TechGear Pro',
    rating: 4.9,
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
      comment: 'Amazing sound quality! The noise cancellation is incredible. Worth every penny.',
      helpful: 24
    },
    {
      id: '2',
      user: 'Sarah Wilson',
      rating: 4,
      date: '1 week ago',
      comment: 'Great headphones, very comfortable for long sessions. Battery life is impressive.',
      helpful: 18
    },
    {
      id: '3',
      user: 'Mike Chen',
      rating: 5,
      date: '2 weeks ago',
      comment: 'Perfect for my daily commute. The sound quality is outstanding!',
      helpful: 31
    }
  ],
  relatedProducts: [
    {
      id: '2',
      name: 'Wireless Earbuds',
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200'
    },
    {
      id: '3',
      name: 'Gaming Headset',
      price: 149.99,
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200'
    },
    {
      id: '4',
      name: 'Portable Speaker',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200'
    }
  ]
};

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const ProductDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('Black');
  const [selectedSize, setSelectedSize] = useState('One Size');
  const [quantity, setQuantity] = useState(1);
  const [isSaved, setIsSaved] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  const scrollX = useRef(new Animated.Value(0)).current;
  const imageScrollViewRef = useRef(null);

  const product = route.params?.product || mockProduct;

  const handleAddToCart = () => {
    Alert.alert(
      'Added to Cart',
      `${product.name} has been added to your cart!`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { 
          text: 'View Cart', 
          onPress: () => navigation.navigate('UserCartScreen')
        },
      ]
    );
  };

  const handleBuyNow = () => {
    navigation.navigate('CheckoutScreen', { 
      items: [{ ...product, quantity }] 
    });
  };

  const handleSaveProduct = () => {
    setIsSaved(!isSaved);
    Alert.alert(
      isSaved ? 'Removed from Saved' : 'Added to Saved',
      isSaved ? 'Product removed from your saved items.' : 'Product added to your saved items!'
    );
  };

  const handleImageScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setSelectedImage(Math.round(index));
  };

  const renderImageItem = ({ item, index }) => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: item }} style={styles.productImage} resizeMode="cover" />
    </View>
  );

  const renderColorOption = (color) => (
    <TouchableOpacity
      key={color}
      style={[
        styles.colorOption,
        selectedColor === color && styles.selectedColorOption
      ]}
      onPress={() => setSelectedColor(color)}
    >
      <Text style={[
        styles.colorText,
        selectedColor === color && styles.selectedColorText
      ]}>
        {color}
      </Text>
    </TouchableOpacity>
  );

  const renderSizeOption = (size) => (
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
  );

  const renderReview = ({ item }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewUser}>{item.user}</Text>
        <View style={styles.reviewRating}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= item.rating ? "star" : "star-outline"}
              size={16}
              color={star <= item.rating ? colors.discount : colors.border}
            />
          ))}
        </View>
      </View>
      <Text style={styles.reviewDate}>{item.date}</Text>
      <Text style={styles.reviewComment}>{item.comment}</Text>
      <View style={styles.reviewFooter}>
        <TouchableOpacity style={styles.helpfulButton}>
          <Ionicons name="thumbs-up-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.helpfulText}>Helpful ({item.helpful})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRelatedProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.relatedProduct}
      onPress={() => navigation.navigate('ProductDetailScreen', { product: item })}
    >
      <Image source={{ uri: item.image }} style={styles.relatedProductImage} />
      <Text style={styles.relatedProductName}>{item.name}</Text>
      <Text style={styles.relatedProductPrice}>${item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithMenu />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Images */}
        <View style={styles.imageSection}>
          <Animated.FlatList
            ref={imageScrollViewRef}
            data={product.images}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false, listener: handleImageScroll }
            )}
            scrollEventThrottle={16}
          />
          
          {/* Image Indicators */}
          <View style={styles.imageIndicators}>
            {product.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  selectedImage === index && styles.activeIndicator
                ]}
              />
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.imageActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleSaveProduct}>
              <Ionicons 
                name={isSaved ? "heart" : "heart-outline"} 
                size={24} 
                color={isSaved ? colors.discount : colors.text} 
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>${product.price}</Text>
            <Text style={styles.originalPrice}>${product.originalPrice}</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{product.discount}% OFF</Text>
            </View>
          </View>

          <Text style={styles.productName}>{product.name}</Text>

          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= product.rating ? "star" : "star-outline"}
                  size={16}
                  color={star <= product.rating ? colors.discount : colors.border}
                />
              ))}
            </View>
            <Text style={styles.ratingText}>{product.rating}</Text>
            <Text style={styles.reviewCount}>({product.reviewCount} reviews)</Text>
          </View>

          {/* Stock Status */}
          <View style={styles.stockStatus}>
            <Ionicons 
              name={product.inStock ? "checkmark-circle" : "close-circle"} 
              size={16} 
              color={product.inStock ? colors.success : colors.error} 
            />
            <Text style={styles.stockText}>
              {product.inStock ? `In Stock (${product.stockCount} available)` : 'Out of Stock'}
            </Text>
          </View>
        </View>

        {/* Color Selection */}
        <View style={styles.selectionSection}>
          <Text style={styles.sectionTitle}>Color</Text>
          <View style={styles.colorOptions}>
            {product.colors.map(renderColorOption)}
          </View>
        </View>

        {/* Size Selection */}
        <View style={styles.selectionSection}>
          <Text style={styles.sectionTitle}>Size</Text>
          <View style={styles.sizeOptions}>
            {product.sizes.map(renderSizeOption)}
          </View>
        </View>

        {/* Quantity */}
        <View style={styles.quantitySection}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Ionicons name="remove" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Ionicons name="add" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {showFullDescription ? product.description : product.description.substring(0, 150) + '...'}
          </Text>
          <TouchableOpacity 
            style={styles.readMoreButton}
            onPress={() => setShowFullDescription(!showFullDescription)}
          >
            <Text style={styles.readMoreText}>
              {showFullDescription ? 'Read Less' : 'Read More'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Features</Text>
          {product.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Seller Info */}
        <View style={styles.sellerSection}>
          <Text style={styles.sectionTitle}>Seller</Text>
          <View style={styles.sellerCard}>
            <Image source={{ uri: product.seller.avatar }} style={styles.sellerAvatar} />
            <View style={styles.sellerInfo}>
              <View style={styles.sellerNameRow}>
                <Text style={styles.sellerName}>{product.seller.name}</Text>
                {product.seller.verified && (
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                )}
              </View>
              <View style={styles.sellerRating}>
                <Ionicons name="star" size={14} color={colors.discount} />
                <Text style={styles.sellerRatingText}>{product.seller.rating}</Text>
                <Text style={styles.sellerReviewCount}>({product.seller.reviewCount} reviews)</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.viewStoreButton}>
              <Text style={styles.viewStoreText}>View Store</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reviews */}
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllReviewsText}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={product.reviews}
            renderItem={renderReview}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Related Products */}
        <View style={styles.relatedSection}>
          <Text style={styles.sectionTitle}>You Might Also Like</Text>
          <FlatList
            data={product.relatedProducts}
            renderItem={renderRelatedProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedProductsList}
          />
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceInfo}>
          <Text style={styles.bottomPrice}>${product.price}</Text>
          <Text style={styles.bottomOriginalPrice}>${product.originalPrice}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Ionicons name="cart-outline" size={20} color={colors.white} />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
            <Text style={styles.buyNowText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  imageSection: {
    position: 'relative',
    height: 300,
  },
  imageContainer: {
    width: screenWidth,
    height: 300,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 24,
  },
  imageActions: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.s,
    ...shadows.card,
  },
  productInfo: {
    padding: spacing.l,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  price: {
    fontSize: scale(24),
    fontWeight: 'bold',
    color: colors.text,
    marginRight: spacing.s,
  },
  originalPrice: {
    fontSize: scale(16),
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
    marginRight: spacing.s,
  },
  discountBadge: {
    backgroundColor: colors.discount,
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: 12,
  },
  discountText: {
    fontSize: scale(12),
    fontWeight: 'bold',
    color: colors.white,
  },
  productName: {
    fontSize: scale(20),
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.m,
    lineHeight: 28,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  stars: {
    flexDirection: 'row',
    marginRight: spacing.s,
  },
  ratingText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.s,
  },
  reviewCount: {
    fontSize: scale(14),
    color: colors.textSecondary,
  },
  stockStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    fontSize: scale(14),
    color: colors.textSecondary,
    marginLeft: spacing.s,
  },
  selectionSection: {
    paddingHorizontal: spacing.l,
    marginBottom: spacing.l,
  },
  sectionTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.m,
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.s,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginRight: spacing.s,
    marginBottom: spacing.s,
  },
  selectedColorOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  colorText: {
    fontSize: scale(14),
    color: colors.text,
  },
  selectedColorText: {
    color: colors.primary,
    fontWeight: '600',
  },
  sizeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sizeOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.s,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginRight: spacing.s,
    marginBottom: spacing.s,
  },
  selectedSizeOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  sizeText: {
    fontSize: scale(14),
    color: colors.text,
  },
  selectedSizeText: {
    color: colors.primary,
    fontWeight: '600',
  },
  quantitySection: {
    paddingHorizontal: spacing.l,
    marginBottom: spacing.l,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.text,
    marginHorizontal: spacing.m,
    minWidth: 30,
    textAlign: 'center',
  },
  descriptionSection: {
    paddingHorizontal: spacing.l,
    marginBottom: spacing.l,
  },
  description: {
    fontSize: scale(14),
    color: colors.text,
    lineHeight: 22,
  },
  readMoreButton: {
    marginTop: spacing.s,
  },
  readMoreText: {
    fontSize: scale(14),
    color: colors.primary,
    fontWeight: '600',
  },
  featuresSection: {
    paddingHorizontal: spacing.l,
    marginBottom: spacing.l,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  featureText: {
    fontSize: scale(14),
    color: colors.text,
    marginLeft: spacing.s,
  },
  sellerSection: {
    paddingHorizontal: spacing.l,
    marginBottom: spacing.l,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    ...shadows.card,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: spacing.m,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sellerName: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.xs,
  },
  sellerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerRatingText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
  },
  sellerReviewCount: {
    fontSize: scale(12),
    color: colors.textSecondary,
  },
  viewStoreButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radii.s,
  },
  viewStoreText: {
    fontSize: scale(12),
    fontWeight: '600',
    color: colors.white,
  },
  reviewsSection: {
    paddingHorizontal: spacing.l,
    marginBottom: spacing.l,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  viewAllReviewsText: {
    fontSize: scale(14),
    color: colors.primary,
    fontWeight: '600',
  },
  reviewItem: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  reviewUser: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.text,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewDate: {
    fontSize: scale(12),
    color: colors.textSecondary,
    marginBottom: spacing.s,
  },
  reviewComment: {
    fontSize: scale(14),
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.s,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpfulText: {
    fontSize: scale(12),
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  relatedSection: {
    paddingHorizontal: spacing.l,
    marginBottom: spacing.l,
  },
  relatedProductsList: {
    paddingRight: spacing.l,
  },
  relatedProduct: {
    width: 150,
    marginRight: spacing.m,
  },
  relatedProductImage: {
    width: 150,
    height: 150,
    borderRadius: radii.medium,
    marginBottom: spacing.s,
  },
  relatedProductName: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  relatedProductPrice: {
    fontSize: scale(14),
    fontWeight: 'bold',
    color: colors.primary,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  priceInfo: {
    flex: 1,
  },
  bottomPrice: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: colors.text,
  },
  bottomOriginalPrice: {
    fontSize: scale(14),
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  actionButtons: {
    flexDirection: 'row',
    flex: 1,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radii.medium,
    marginRight: spacing.s,
    flex: 1,
    justifyContent: 'center',
  },
  addToCartText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.white,
    marginLeft: spacing.xs,
  },
  buyNowButton: {
    backgroundColor: colors.discount,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radii.medium,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyNowText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.white,
  },
});

export default ProductDetailScreen; 