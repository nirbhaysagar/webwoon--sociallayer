import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
  Dimensions,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from '../SellerDashboard/components/HeaderWithMenu';
import { UserShopContext } from '../../context/UserShopContext';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from '../../lib/scale';

const { width } = Dimensions.get('window');

export default function UserCartScreen() {
  const {
    cart,
    wishlist,
    addToWishlist,
    addToCart,
    removeFromWishlist,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
  } = useContext(UserShopContext);
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('cart');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [shippingOption, setShippingOption] = useState('standard');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');

  // Enhanced cart logic
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
    } else {
      updateCartItemQuantity(id, newQuantity);
    }
  };

  const moveToWishlist = (item) => {
    removeFromCart(item.id);
    if (!wishlist.find(w => w.id === item.id)) {
      addToWishlist({ ...item, quantity: undefined });
    }
  };

  const addToCartFromWishlist = (item) => {
    removeFromWishlist(item.id);
    if (!cart.find(c => c.id === item.id)) {
      addToCart({ ...item, quantity: 1 });
    }
  };

  const toggleItemSelection = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const selectAllItems = () => {
    const allIds = cart.map(item => item.id);
    setSelectedItems(new Set(allIds));
  };

  const deselectAllItems = () => {
    setSelectedItems(new Set());
  };

  const removeSelectedItems = () => {
    Alert.alert(
      'Remove Items',
      `Remove ${selectedItems.size} selected item${selectedItems.size > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            selectedItems.forEach(id => removeFromCart(id));
            setSelectedItems(new Set());
            setIsEditing(false);
          }
        }
      ]
    );
  };

  const moveSelectedToWishlist = () => {
    selectedItems.forEach(id => {
      const item = cart.find(c => c.id === id);
      if (item) {
        moveToWishlist(item);
      }
    });
    setSelectedItems(new Set());
    setIsEditing(false);
  };

  const handleApplyPromoCode = () => {
    if (promoCode.toUpperCase() === 'SUMMER20') {
      setDiscount(0.20);
      setPromoMessage('Promo code applied successfully!');
    } else if (promoCode.trim() === '') {
      setDiscount(0);
      setPromoMessage('');
    } else {
      setDiscount(0);
      setPromoMessage('Invalid promo code.');
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout.');
      return;
    }
    navigation.navigate('CheckoutScreen');
  };

  // Price calculations
  const selectedCartItems = cart.filter(item => selectedItems.has(item.id));
  const subtotal = selectedCartItems.length > 0 
    ? selectedCartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
    : cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  const shippingCosts = {
    standard: 9.99,
    express: 19.99,
    overnight: 29.99
  };

  const shippingCost = shippingCosts[shippingOption];
  const tax = subtotal * 0.08;
  const discountAmount = subtotal * discount;
  const totalPrice = subtotal - discountAmount + shippingCost + tax;

  const renderCartItem = (item) => (
    <View key={item.id} style={styles.cartItem}>
      {isEditing && (
        <TouchableOpacity 
          style={[styles.checkbox, selectedItems.has(item.id) && styles.checkboxSelected]}
          onPress={() => toggleItemSelection(item.id)}
        >
          <Ionicons 
            name={selectedItems.has(item.id) ? "checkmark-circle" : "ellipse-outline"} 
            size={24} 
            color={selectedItems.has(item.id) ? colors.primary : colors.textSecondary} 
          />
        </TouchableOpacity>
      )}
      
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      
      <View style={styles.itemInfo}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <TouchableOpacity style={styles.removeButton} onPress={() => removeFromCart(item.id)}>
            <Ionicons name="close" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.itemStore}>{item.store}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        
        <View style={styles.quantityRow}>
          <View style={styles.quantityControls}>
            <TouchableOpacity 
              style={styles.quantityBtn} 
              onPress={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
            >
              <Ionicons name="remove" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity || 1}</Text>
            <TouchableOpacity 
              style={styles.quantityBtn} 
              onPress={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
            >
              <Ionicons name="add" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.itemTotal}>
            ${((item.price * (item.quantity || 1)).toFixed(2))}
          </Text>
        </View>

        {!isEditing && (
          <View style={styles.cartActionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => moveToWishlist(item)}>
              <Ionicons name="heart-outline" size={16} color={colors.discount} />
              <Text style={styles.actionBtnText}>Save for Later</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="share-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.actionBtnText}>Share</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderWishlistItem = (item) => (
    <View key={item.id} style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      
      <View style={styles.itemInfo}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <TouchableOpacity style={styles.removeButton} onPress={() => removeFromWishlist(item.id)}>
            <Ionicons name="close" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.itemStore}>{item.store}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        
        <View style={styles.cartActionsRow}>
          <TouchableOpacity style={[styles.actionBtn, styles.primaryActionBtn]} onPress={() => addToCartFromWishlist(item)}>
            <Ionicons name="cart-outline" size={16} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.primary }]}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="share-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.actionBtnText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.wishlistIcon}>
        <Ionicons name="heart" size={24} color={colors.discount} />
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons 
          name={activeTab === 'cart' ? "cart-outline" : "heart-outline"} 
          size={80} 
          color={colors.textSecondary} 
        />
      </View>
      <Text style={styles.emptyTitle}>
        {activeTab === 'cart' ? 'Your cart is empty' : 'Your wishlist is empty'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'cart' 
          ? 'Start shopping to add amazing products to your cart!' 
          : 'Save your favorite products here for later!'
        }
      </Text>
      <TouchableOpacity 
        style={styles.emptyActionButton}
        onPress={() => navigation.navigate('Explore')}
      >
        <Text style={styles.emptyActionButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  const renderShippingOptions = () => (
    <View style={styles.shippingSection}>
      <Text style={styles.sectionTitle}>Shipping Options</Text>
      {Object.entries(shippingCosts).map(([option, cost]) => (
        <TouchableOpacity
          key={option}
          style={[styles.shippingOption, shippingOption === option && styles.shippingOptionSelected]}
          onPress={() => setShippingOption(option)}
        >
          <View style={styles.shippingOptionContent}>
            <Ionicons 
              name={shippingOption === option ? "radio-button-on" : "radio-button-off"} 
              size={20} 
              color={shippingOption === option ? colors.primary : colors.textSecondary} 
            />
            <View style={styles.shippingOptionInfo}>
              <Text style={styles.shippingOptionTitle}>
                {option.charAt(0).toUpperCase() + option.slice(1)} Shipping
              </Text>
              <Text style={styles.shippingOptionSubtitle}>
                {option === 'standard' ? '3-5 business days' : 
                 option === 'express' ? '1-2 business days' : 'Next business day'}
              </Text>
              <Text style={styles.shippingOptionDelivery}>
                Estimated delivery: {option === 'standard' ? 'Dec 15-18' : 
                                   option === 'express' ? 'Dec 12-13' : 'Dec 11'}
              </Text>
            </View>
            <Text style={styles.shippingOptionPrice}>${cost.toFixed(2)}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCartContent = () => {
    if (cart.length === 0) {
      return renderEmptyState();
    }
    return (
      <>
        <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
          {cart.map(renderCartItem)}
          {renderShippingOptions()}
        </ScrollView>
        
        <View style={styles.summary}>
          <View style={styles.promoContainer}>
            <TextInput
              style={styles.promoInput}
              placeholder="Enter promo code"
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
              placeholderTextColor={colors.textSecondary}
            />
            <TouchableOpacity style={styles.promoButton} onPress={handleApplyPromoCode}>
              <Text style={styles.promoButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
          {promoMessage ? (
            <Text style={[styles.promoMessage, { color: discount > 0 ? colors.success : colors.error }]}>
              {promoMessage}
            </Text>
          ) : null}
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.success }]}>Discount</Text>
              <Text style={[styles.summaryValue, { color: colors.success }]}>
                -${discountAmount.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>${shippingCost.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotalRow]}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotal}>${totalPrice.toFixed(2)}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.checkoutButton}
            onPress={handleCheckout}
          >
            <Ionicons name="card-outline" size={20} color="#fff" />
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          </TouchableOpacity>
          
          <View style={styles.checkoutFooter}>
            <Text style={styles.checkoutFooterText}>
              By placing your order, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithMenu />
      
      <View style={styles.header}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'cart' && styles.tabButtonActive]}
            onPress={() => setActiveTab('cart')}
          >
            <Ionicons name="cart" size={20} color={activeTab === 'cart' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabButtonText, activeTab === 'cart' && styles.tabButtonTextActive]}>
              Cart ({cart.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'wishlist' && styles.tabButtonActive]}
            onPress={() => setActiveTab('wishlist')}
          >
            <Ionicons name="heart" size={20} color={activeTab === 'wishlist' ? colors.discount : colors.textSecondary} />
            <Text style={[styles.tabButtonText, activeTab === 'wishlist' && styles.tabButtonTextActive]}>
              Wishlist ({wishlist.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'cart' && cart.length > 0 && (
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => {
                setIsEditing(!isEditing);
                if (isEditing) {
                  setSelectedItems(new Set());
                }
              }}
            >
              <Text style={styles.editButtonText}>
                {isEditing ? 'Done' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isEditing && selectedItems.size > 0 && (
        <View style={styles.bulkActions}>
          <TouchableOpacity style={styles.bulkActionBtn} onPress={removeSelectedItems}>
            <Ionicons name="trash-outline" size={16} color={colors.error} />
            <Text style={[styles.bulkActionText, { color: colors.error }]}>
              Remove ({selectedItems.size})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bulkActionBtn} onPress={moveSelectedToWishlist}>
            <Ionicons name="heart-outline" size={16} color={colors.discount} />
            <Text style={[styles.bulkActionText, { color: colors.discount }]}>
              Move to Wishlist
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'cart' ? (
        renderCartContent()
      ) : (
        <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
          {wishlist.length > 0 ? (
            wishlist.map(renderWishlistItem)
          ) : (
            renderEmptyState()
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  tabRow: {
    flexDirection: 'row',
    flex: 1,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: radii.pill,
    backgroundColor: colors.card,
    marginRight: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButtonActive: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  tabButtonText: {
    marginLeft: spacing.xs,
    fontSize: scale(14),
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: colors.primary,
  },
  headerActions: {
    flexDirection: 'row',
  },
  editButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radii.medium,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editButtonText: {
    fontSize: scale(14),
    color: colors.primary,
    fontWeight: '600',
  },
  bulkActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bulkActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginRight: spacing.m,
    borderRadius: radii.medium,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bulkActionText: {
    marginLeft: spacing.xs,
    fontSize: scale(13),
    fontWeight: '500',
  },
  cartList: {
    flex: 1,
    paddingHorizontal: spacing.m,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.m,
    alignItems: 'flex-start',
    ...shadows.card,
  },
  checkbox: {
    marginRight: spacing.s,
    marginTop: spacing.xs,
  },
  checkboxSelected: {
    // Already handled by icon color
  },
  itemImage: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: radii.medium,
    marginRight: spacing.m,
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  itemTitle: {
    fontSize: scale(16),
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: spacing.s,
  },
  removeButton: {
    padding: spacing.xs,
  },
  itemStore: {
    fontSize: scale(14),
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  itemPrice: {
    fontSize: scale(16),
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.s,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quantityBtn: {
    padding: spacing.s,
  },
  quantityText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.text,
    paddingHorizontal: spacing.m,
    minWidth: 30,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: scale(16),
    fontWeight: '700',
    color: colors.text,
  },
  wishlistIcon: {
    padding: spacing.s,
  },
  cartActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.s,
    borderRadius: radii.small,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryActionBtn: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
  },
  actionBtnText: {
    marginLeft: spacing.xs,
    fontSize: scale(12),
    color: colors.textSecondary,
    fontWeight: '500',
  },
  shippingSection: {
    marginTop: spacing.m,
    marginBottom: spacing.l,
  },
  sectionTitle: {
    fontSize: scale(18),
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.m,
  },
  shippingOption: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shippingOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  shippingOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shippingOptionInfo: {
    flex: 1,
    marginLeft: spacing.s,
  },
  shippingOptionTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.text,
  },
  shippingOptionSubtitle: {
    fontSize: scale(14),
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  shippingOptionDelivery: {
    fontSize: scale(12),
    color: colors.success,
    marginTop: spacing.xs,
  },
  shippingOptionPrice: {
    fontSize: scale(16),
    fontWeight: '700',
    color: colors.primary,
  },
  summary: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    margin: spacing.m,
    padding: spacing.m,
    ...shadows.card,
  },
  promoContainer: {
    flexDirection: 'row',
    marginBottom: spacing.m,
  },
  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    paddingHorizontal: spacing.m,
    marginRight: spacing.s,
    fontSize: scale(14),
    color: colors.text,
  },
  promoButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.medium,
    paddingHorizontal: spacing.l,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  promoMessage: {
    marginBottom: spacing.m,
    fontSize: scale(14),
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.s,
    marginTop: spacing.s,
  },
  summaryLabel: {
    fontSize: scale(16),
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: scale(16),
    color: colors.text,
    fontWeight: '500',
  },
  summaryTotalLabel: {
    fontSize: scale(18),
    fontWeight: '700',
    color: colors.text,
  },
  summaryTotal: {
    fontSize: scale(18),
    fontWeight: '700',
    color: colors.primary,
  },
  checkoutButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.m,
    ...shadows.button,
  },
  checkoutButtonText: {
    fontSize: scale(16),
    fontWeight: '700',
    color: '#fff',
    marginLeft: spacing.s,
  },
  checkoutFooter: {
    marginTop: spacing.m,
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  checkoutFooterText: {
    fontSize: scale(12),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  emptyTitle: {
    fontSize: scale(20),
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  emptySubtitle: {
    fontSize: scale(16),
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.l,
    lineHeight: 24,
  },
  emptyActionButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl,
  },
  emptyActionButtonText: {
    fontSize: scale(16),
    fontWeight: '700',
    color: '#fff',
  },
});
