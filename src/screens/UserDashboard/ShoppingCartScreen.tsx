import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from '../SellerDashboard/components/HeaderWithMenu';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import { CartService } from '../../services/cartService';
import { useUserShop } from '../../context/UserShopContext';
import { useNavigation } from '@react-navigation/native';
import BackButton from '../../components/BackButton';

export default function ShoppingCartScreen({ navigation }) {
  const { authState } = useAuth();
  const { 
    cart, 
    wishlist, 
    loading: contextLoading,
    updateCartItemQuantity, 
    removeFromCart, 
    removeFromWishlist, 
    addToCart,
    refreshCart,
    refreshWishlist
  } = useUserShop();
  const [activeTab, setActiveTab] = useState('cart'); // 'cart' or 'wishlist'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debug: Log cart context
  console.log('ShoppingCartScreen - Cart context:', cart);
  console.log('ShoppingCartScreen - Cart length:', cart.length);

  // Monitor cart changes
  useEffect(() => {
    console.log('ShoppingCartScreen - Cart context changed:', cart);
  }, [cart]);

  // Convert cart context items to display format
  const cartItems = cart.map(item => ({
    id: item.id,
    product: {
      id: item.id,
      name: item.title || item.name,
      price: item.price,
      image: item.image || item.image_url,
      store: item.store || 'Store'
    },
    quantity: item.quantity || 1
  }));

  console.log('ShoppingCartScreen - CartItems after mapping:', cartItems);

  // Convert wishlist context items to display format
  const wishlistItems = wishlist.map(item => ({
    id: item.id,
    product: {
      id: item.id,
      name: item.title || item.name,
      price: item.price,
      image: item.image || item.image_url,
      store: item.store || 'Store'
    }
  }));

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      setLoading(true);
      if (newQuantity <= 0) {
        await removeFromCart(itemId);
        return;
      }

      await updateCartItemQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError('Failed to update quantity');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async (itemId) => {
    console.log('handleRemoveFromCart called with ID:', itemId);
    console.log('Current cart context:', cart);
    console.log('Current cartItems:', cartItems);
    
    try {
      setLoading(true);
      
      // Try direct removal first to test context
      console.log('Attempting direct removal...');
      await removeFromCart(itemId);
      
      // Also show alert for user confirmation
      Alert.alert(
        'Remove Item',
        'Are you sure you want to remove this item from your cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Remove', 
            style: 'destructive',
            onPress: async () => {
              console.log('Removing item with ID:', itemId);
              console.log('Cart before removal:', cart);
              await removeFromCart(itemId);
              console.log('Cart after removal:', cart);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error removing from cart:', error);
      setError('Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (itemId) => {
    try {
      setLoading(true);
      Alert.alert(
        'Remove Item',
        'Are you sure you want to remove this item from your wishlist?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Remove', 
            style: 'destructive',
            onPress: async () => {
              console.log('Removing wishlist item with ID:', itemId);
              await removeFromWishlist(itemId);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setError('Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  const moveToCart = async (wishlistItem) => {
    try {
      setLoading(true);
      const cartItem = {
        id: wishlistItem.id,
        title: wishlistItem.product.name,
        price: wishlistItem.product.price,
        image: wishlistItem.product.image,
        store: wishlistItem.product.store,
        quantity: 1
      };
      await addToCart(cartItem);
      await removeFromWishlist(wishlistItem.id);
      Alert.alert('Success', 'Item moved to cart!');
    } catch (error) {
      console.error('Error moving to cart:', error);
      setError('Failed to move item to cart');
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const calculateShipping = () => {
    return cartItems.length > 0 ? 9.99 : 0; // Fixed shipping cost
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };

  const handleCheckout = () => {
    console.log('Checkout button pressed');
    console.log('Cart items:', cartItems);
    console.log('Auth state:', authState);

    // For testing, bypass auth check
    if (!authState.user) {
      console.log('No user logged in, but proceeding for testing');
      // Alert.alert('Please log in to checkout');
      // return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Your cart is empty');
      return;
    }

    // Navigate to checkout screen with cart data
    try {
      console.log('Navigating to checkout with data:', {
        cartItems: cartItems,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        shipping: calculateShipping(),
        total: calculateTotal()
      });
      
      navigation.navigate('CheckoutScreen', {
        cartItems: cartItems,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        shipping: calculateShipping(),
        total: calculateTotal()
      });
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Failed to navigate to checkout');
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.product.image }} style={styles.productImage} />
      
      <View style={styles.itemInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.product.name}
        </Text>
        <Text style={styles.productStore}>{item.product.store}</Text>
        <Text style={styles.productPrice}>${item.product.price}</Text>
        
        <View style={styles.quantityRow}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={28} color={colors.white} />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={28} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.itemActions}>
        <Text style={styles.itemTotal}>
          ${(item.product.price * item.quantity).toFixed(2)}
        </Text>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => {
            console.log('Delete button pressed for item:', item);
            console.log('Item ID:', item.id);
            handleRemoveFromCart(item.id);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={24} color={colors.white} />
          <Text style={styles.deleteButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderWishlistItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.product.image }} style={styles.productImage} />
      
      <View style={styles.itemInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.product.name}
        </Text>
        <Text style={styles.productStore}>{item.product.store}</Text>
        <Text style={styles.productPrice}>${item.product.price}</Text>
      </View>
      
      <View style={styles.itemActions}>
        <TouchableOpacity 
          style={styles.moveToCartButton}
          onPress={() => moveToCart(item)}
          activeOpacity={0.7}
        >
          <Ionicons name="cart-outline" size={24} color={colors.white} />
          <Text style={styles.moveToCartText}>Add to Cart</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleRemoveFromWishlist(item.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={24} color={colors.white} />
          <Text style={styles.deleteButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backButton} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Shopping Cart</Text>
          <Text style={styles.subtitle}>
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </Text>
        </View>
        {cartItems.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearCart}>
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Switch */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'cart' && styles.activeTabButton]}
          onPress={() => setActiveTab('cart')}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="cart-outline" 
            size={28} 
            color={activeTab === 'cart' ? colors.white : colors.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'cart' && styles.activeTabText]}>
            Cart ({cartItems.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'wishlist' && styles.activeTabButton]}
          onPress={() => setActiveTab('wishlist')}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="heart-outline" 
            size={28} 
            color={activeTab === 'wishlist' ? colors.white : colors.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'wishlist' && styles.activeTabText]}>
            Wishlist ({wishlistItems.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading || contextLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : activeTab === 'cart' ? (
        cartItems.length === 0 ? (
          <View style={styles.centered}>
            <Ionicons name="cart-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <Text style={styles.emptySubtext}>Add some products to get started</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={cartItems}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.cartList}
            />
            
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items ({cartItems.length})</Text>
                <Text style={styles.summaryValue}>${calculateSubtotal().toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={styles.summaryValue}>${calculateShipping().toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax (8%)</Text>
                <Text style={styles.summaryValue}>${calculateTax().toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${calculateTotal().toFixed(2)}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.checkoutButton}
                onPress={() => {
                  console.log('Checkout button pressed');
                  handleCheckout();
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="card-outline" size={32} color={colors.white} />
                <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              </TouchableOpacity>
            </View>
          </>
        )
      ) : (
        wishlistItems.length === 0 ? (
          <View style={styles.centered}>
            <Ionicons name="heart-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Your wishlist is empty</Text>
            <Text style={styles.emptySubtext}>Save products you love</Text>
          </View>
        ) : (
          <FlatList
            data={wishlistItems}
            renderItem={renderWishlistItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cartList}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
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
    fontSize: 36,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.medium,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: spacing.large,
  },
  cartList: {
    padding: spacing.large * 1.5,
  },
  cartItem: {
    backgroundColor: colors.white,
    borderRadius: radii.large * 1.5,
    padding: spacing.large * 1.5,
    marginBottom: spacing.large * 1.5,
    flexDirection: 'row',
    ...shadows.large,
    borderWidth: 2,
    borderColor: colors.border,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: radii.large,
    marginRight: spacing.large * 1.5,
  },
  itemInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 22,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.medium,
    lineHeight: 28,
  },
  productStore: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.medium,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.large,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.large,
    marginBottom: spacing.large,
  },
  quantityButton: {
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: radii.large,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.medium,
    elevation: 4,
  },
  quantityText: {
    fontSize: 24,
    fontWeight: typography.weights.bold,
    color: colors.text,
    minWidth: 60,
    textAlign: 'center',
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  itemTotal: {
    fontSize: 22,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.large,
  },
  deleteButton: {
    backgroundColor: colors.error,
    borderRadius: radii.medium,
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.large,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.small,
    minWidth: 120,
    ...shadows.medium,
    elevation: 3,
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: typography.weights.bold,
  },
  // Tab Switch Styles
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.large * 1.5,
    marginBottom: spacing.large * 1.5,
    backgroundColor: colors.card,
    borderRadius: radii.large * 1.5,
    padding: spacing.medium,
    ...shadows.large,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.large,
    paddingHorizontal: spacing.large * 1.5,
    borderRadius: radii.large,
    gap: spacing.medium,
  },
  activeTabButton: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 18,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  // Wishlist Item Styles
  moveToCartButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.large * 1.5,
    paddingVertical: spacing.large,
    borderRadius: radii.large,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.medium,
    marginBottom: spacing.large,
    ...shadows.medium,
  },
  moveToCartText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: typography.weights.bold,
  },
  summary: {
    backgroundColor: colors.white,
    padding: spacing.large * 1.5,
    borderTopLeftRadius: radii.large * 1.5,
    borderTopRightRadius: radii.large * 1.5,
    ...shadows.large,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.large,
    paddingVertical: spacing.medium,
  },
  summaryLabel: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  totalRow: {
    borderTopWidth: 3,
    borderTopColor: colors.border,
    paddingTop: spacing.large,
    marginTop: spacing.large,
  },
  totalLabel: {
    fontSize: 24,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  checkoutButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.large * 1.5,
    padding: spacing.large * 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.large * 1.5,
    ...shadows.large,
    elevation: 6,
  },
  checkoutText: {
    color: colors.white,
    fontSize: 22,
    fontWeight: typography.weights.bold,
    marginLeft: spacing.large,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.large,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.medium,
  },
  emptyText: {
    fontSize: 28,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.large * 1.5,
  },
  emptySubtext: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.large,
  },
}); 