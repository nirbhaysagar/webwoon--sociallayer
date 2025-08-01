import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows, button, icon } from '../../constants/theme';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import { UserShopContext } from '../../context/UserShopContext';

const product = {
  images: [
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  ],
  discount: 20,
  brand: 'WinterElegance',
  verified: true,
  rating: 4.7,
  title: 'Light Hooded Tracksuit',
  price: 1259,
  oldPrice: 1510.5,
  sizes: ['XS', 'S', 'M', 'L', 'XL'],
  selectedSize: 'M',
  characteristics: 'Soft, warm, and perfect for winter.',
  recommended: ['Jacket', 'Sneakers'],
};

export default function ProductDetailScreen() {
  const { addToCart } = useContext(UserShopContext);
  const [imgIdx, setImgIdx] = useState(0);
  const [size, setSize] = useState(product.selectedSize);
  const [showChar, setShowChar] = useState(false);
  const [showRec, setShowRec] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleAddToCart = () => {
    try {
      // Create cart item from current product data
      const cartItem = {
        id: 'product-1', // You might want to get this from props or navigation params
        title: 'Premium Wireless Headphones',
        price: 199.99,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        store: 'TechStore',
        quantity: 1
      };
      
      addToCart(cartItem);
      Alert.alert('Success', 'Product added to cart!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image Carousel */}
        <View style={styles.carouselWrap}>
          <Image source={{ uri: product.images[imgIdx] }} style={styles.productImg} />
          {/* Discount badge */}
          {product.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          )}
          {/* Top right icons */}
          <View style={styles.topRightIcons}>
            <TouchableOpacity onPress={() => setLiked(l => !l)} style={styles.iconBtn}>
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={icon.size} color={liked ? colors.favorite : colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="share-social-outline" size={icon.size} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          {/* Carousel arrows */}
          <TouchableOpacity style={styles.arrowLeft} onPress={() => setImgIdx((imgIdx - 1 + product.images.length) % product.images.length)}>
            <Ionicons name="chevron-back" size={icon.large} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.arrowRight} onPress={() => setImgIdx((imgIdx + 1) % product.images.length)}>
            <Ionicons name="chevron-forward" size={icon.large} color={colors.text} />
          </TouchableOpacity>
        </View>
        {/* Brand, rating, title, price */}
        <View style={styles.brandRow}>
          <Text style={styles.brand}>{product.brand}</Text>
          {product.verified && <Ionicons name="checkmark-circle" size={icon.small} color={colors.secondary} style={{ marginLeft: 4 }} />}
          <Ionicons name="star" size={icon.small} color={colors.rating} style={{ marginLeft: 8 }} />
          <Text style={styles.rating}>{product.rating}</Text>
        </View>
        <Text style={styles.title}>{product.title}</Text>
        <View style={styles.priceRow}>
          {product.oldPrice && (
            <Text style={styles.oldPrice}>${product.oldPrice.toFixed(2)}</Text>
          )}
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        </View>
        {/* Size selector */}
        <View style={styles.sizesRow}>
          {product.sizes.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.sizeBtn, size === s && styles.sizeBtnActive]}
              onPress={() => setSize(s)}
            >
              <Text style={[styles.sizeBtnText, size === s && styles.sizeBtnTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Expandable sections */}
        <TouchableOpacity style={styles.expandRow} onPress={() => setShowChar(c => !c)}>
          <Text style={styles.expandTitle}>Characteristics</Text>
          <Ionicons name={showChar ? 'chevron-up' : 'chevron-down'} size={icon.size} color={colors.textSecondary} />
        </TouchableOpacity>
        {showChar && <Text style={styles.expandContent}>{product.characteristics}</Text>}
        <TouchableOpacity style={styles.expandRow} onPress={() => setShowRec(r => !r)}>
          <Text style={styles.expandTitle}>Recommended</Text>
          <Ionicons name={showRec ? 'chevron-up' : 'chevron-down'} size={icon.size} color={colors.textSecondary} />
        </TouchableOpacity>
        {showRec && (
          <View style={styles.recommendedRow}>
            {product.recommended.map(r => (
              <View key={r} style={styles.recommendedChip}><Text style={styles.recommendedText}>{r}</Text></View>
            ))}
          </View>
        )}
      </ScrollView>
      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.arBtn}>
          <Ionicons name="camera-outline" size={icon.size} color={colors.text} />
          <Text style={styles.arBtnText}>AR View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cartBtn} onPress={handleAddToCart}>
          <Text style={styles.cartBtnText}>+ Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  carouselWrap: {
    marginTop: spacing.m,
    marginHorizontal: spacing.m,
    borderRadius: radii.large,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...shadows.card,
  },
  productImg: {
    width: scale(220),
    height: scale(220),
    borderRadius: radii.large,
    margin: spacing.m,
    resizeMode: 'contain',
  },
  discountBadge: {
    position: 'absolute',
    top: verticalScale(18),
    left: spacing.m,
    backgroundColor: colors.discount,
    borderRadius: radii.pill,
    paddingHorizontal: verticalScale(12),
    paddingVertical: verticalScale(4),
    zIndex: 2,
  },
  discountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: scale(14),
  },
  topRightIcons: {
    position: 'absolute',
    top: verticalScale(18),
    right: spacing.m,
    flexDirection: 'row',
    zIndex: 2,
  },
  iconBtn: {
    marginLeft: verticalScale(12),
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: verticalScale(6),
    ...shadows.card,
  },
  arrowLeft: {
    position: 'absolute',
    left: 0,
    top: '50%',
    marginTop: -verticalScale(24),
    zIndex: 2,
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: verticalScale(4),
    ...shadows.card,
  },
  arrowRight: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -verticalScale(24),
    zIndex: 2,
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: verticalScale(4),
    ...shadows.card,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.m,
    marginHorizontal: spacing.m,
  },
  brand: {
    fontSize: scale(15),
    fontWeight: 'bold',
    color: colors.text,
  },
  rating: {
    fontSize: scale(14),
    color: colors.rating,
    fontWeight: 'bold',
    marginLeft: verticalScale(2),
  },
  title: {
    fontSize: typography.title,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: spacing.m,
    marginTop: verticalScale(4),
    marginBottom: verticalScale(2),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.m,
    marginBottom: spacing.s,
  },
  oldPrice: {
    fontSize: scale(15),
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
    marginRight: verticalScale(8),
  },
  price: {
    fontSize: scale(20),
    color: colors.text,
    fontWeight: 'bold',
  },
  sizesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.m,
    marginBottom: spacing.s,
  },
  sizeBtn: {
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: verticalScale(16),
    paddingVertical: verticalScale(8),
    marginRight: verticalScale(8),
    borderWidth: 1,
    borderColor: colors.card,
  },
  sizeBtnActive: {
    backgroundColor: colors.primary + '33',
    borderColor: colors.primary,
  },
  sizeBtnText: {
    color: colors.textSecondary,
    fontWeight: 'bold',
    fontSize: scale(15),
  },
  sizeBtnTextActive: {
    color: colors.primary,
  },
  expandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.m,
    marginTop: spacing.s,
    marginBottom: verticalScale(2),
    paddingVertical: verticalScale(8),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  expandTitle: {
    fontSize: scale(15),
    color: colors.text,
    fontWeight: 'bold',
  },
  expandContent: {
    fontSize: scale(14),
    color: colors.textSecondary,
    marginHorizontal: spacing.m,
    marginBottom: verticalScale(8),
  },
  recommendedRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.m,
    marginBottom: verticalScale(8),
  },
  recommendedChip: {
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: verticalScale(12),
    paddingVertical: verticalScale(4),
    marginRight: verticalScale(8),
    borderWidth: 1,
    borderColor: colors.card,
  },
  recommendedText: {
    fontSize: scale(13),
    color: colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    left: spacing.m,
    right: spacing.m,
    bottom: spacing.m,
  },
  arBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: button.borderRadius,
    height: button.height,
    paddingHorizontal: button.paddingHorizontal,
    marginRight: spacing.s,
    ...shadows.card,
  },
  arBtnText: {
    fontSize: button.fontSize,
    color: colors.text,
    fontWeight: button.fontWeight,
    marginLeft: verticalScale(8),
  },
  cartBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: button.borderRadius,
    height: button.height,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.floating,
  },
  cartBtnText: {
    fontSize: button.fontSize,
    color: '#111',
    fontWeight: button.fontWeight,
  },
}); 