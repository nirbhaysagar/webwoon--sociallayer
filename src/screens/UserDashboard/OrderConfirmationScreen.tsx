import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from '../SellerDashboard/components/HeaderWithMenu';
import { useNavigation, useRoute } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from '../../lib/scale';

const { width } = Dimensions.get('window');

export default function OrderConfirmationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { order } = route.params || {};
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  }, []);

  const handleContinueShopping = () => {
    navigation.navigate('Home');
  };

  const handleViewOrders = () => {
    navigation.navigate('Orders');
  };

  const handleTrackOrder = () => {
    // Navigate to order tracking screen
    navigation.navigate('OrderTracking', { orderId: order?.id });
  };

  const handleShareOrder = () => {
    // Share order details
    console.log('Share order functionality');
  };

  const handleDownloadReceipt = () => {
    // Download receipt functionality
    console.log('Download receipt functionality');
  };

  // Mock order data for demonstration
  const mockOrder = {
    id: order?.id || 'ORD-2024-001',
    status: 'confirmed',
    items: order?.items || [
      { title: 'Summer Collection Sneakers', quantity: 1, price: 89.99 },
      { title: 'Smart Home Bundle', quantity: 1, price: 299.99 },
    ],
    shipping_address: order?.shipping_address || {
      name: 'John Doe',
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      phone: '+1 (555) 123-4567',
    },
    payment_method: order?.payment_method || 'Credit Card',
    subtotal: order?.subtotal || 389.98,
    shipping: order?.shipping || 9.99,
    tax: order?.tax || 31.20,
    total_amount: order?.total_amount || 431.17,
    estimated_delivery: '2024-01-15',
    tracking_number: 'TRK123456789',
  };

  const orderData = order || mockOrder;

  const renderOrderStatus = () => (
    <View style={styles.statusContainer}>
      <View style={styles.statusStep}>
        <View style={[styles.statusDot, styles.statusCompleted]}>
          <Ionicons name="checkmark" size={16} color="white" />
        </View>
        <Text style={styles.statusText}>Order Placed</Text>
        <Text style={styles.statusTime}>Just now</Text>
      </View>
      
      <View style={styles.statusLine} />
      
      <View style={styles.statusStep}>
        <View style={[styles.statusDot, styles.statusActive]}>
          <Ionicons name="time" size={16} color="white" />
        </View>
        <Text style={styles.statusText}>Processing</Text>
        <Text style={styles.statusTime}>Next</Text>
      </View>
      
      <View style={styles.statusLine} />
      
      <View style={styles.statusStep}>
        <View style={[styles.statusDot, styles.statusPending]}>
          <Ionicons name="car" size={16} color={colors.textSecondary} />
        </View>
        <Text style={[styles.statusText, styles.statusPendingText]}>Shipped</Text>
        <Text style={[styles.statusTime, styles.statusPendingText]}>Estimated: {orderData.estimated_delivery}</Text>
      </View>
      
      <View style={styles.statusLine} />
      
      <View style={styles.statusStep}>
        <View style={[styles.statusDot, styles.statusPending]}>
          <Ionicons name="home" size={16} color={colors.textSecondary} />
        </View>
        <Text style={[styles.statusText, styles.statusPendingText]}>Delivered</Text>
        <Text style={[styles.statusTime, styles.statusPendingText]}>TBD</Text>
      </View>
    </View>
  );

  const renderOrderSummary = () => (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>Order Summary</Text>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Subtotal</Text>
        <Text style={styles.summaryValue}>${orderData.subtotal.toFixed(2)}</Text>
      </View>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Shipping</Text>
        <Text style={styles.summaryValue}>${orderData.shipping.toFixed(2)}</Text>
      </View>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Tax</Text>
        <Text style={styles.summaryValue}>${orderData.tax.toFixed(2)}</Text>
      </View>
      
      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>${orderData.total_amount.toFixed(2)}</Text>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <TouchableOpacity style={styles.quickAction} onPress={handleTrackOrder}>
        <Ionicons name="location-outline" size={24} color={colors.primary} />
        <Text style={styles.quickActionText}>Track Order</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.quickAction} onPress={handleShareOrder}>
        <Ionicons name="share-outline" size={24} color={colors.primary} />
        <Text style={styles.quickActionText}>Share</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.quickAction} onPress={handleDownloadReceipt}>
        <Ionicons name="download-outline" size={24} color={colors.primary} />
        <Text style={styles.quickActionText}>Receipt</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <HeaderWithMenu />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.successContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            }
          ]}
        >
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={scale(80)} color={colors.success} />
          </View>
          
          <Text style={styles.title}>Order Confirmed!</Text>
          <Text style={styles.subtitle}>Thank you for your purchase</Text>
          <Text style={styles.orderNumber}>#{orderData.id}</Text>
        </Animated.View>
        
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          {/* Order Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Status</Text>
            {renderOrderStatus()}
          </View>
          
          {/* Order Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Details</Text>
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderDate}>{new Date().toLocaleDateString()}</Text>
                <Text style={styles.orderStatus}>Confirmed</Text>
              </View>
              
              <View style={styles.itemsSection}>
                {orderData.items.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.title}</Text>
                      <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                    </View>
                    <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          
          {/* Shipping Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Information</Text>
            <View style={styles.shippingCard}>
              <View style={styles.shippingHeader}>
                <Ionicons name="location-outline" size={20} color={colors.primary} />
                <Text style={styles.shippingTitle}>Delivery Address</Text>
              </View>
              <Text style={styles.addressText}>{orderData.shipping_address.name}</Text>
              <Text style={styles.addressText}>{orderData.shipping_address.street}</Text>
              <Text style={styles.addressText}>
                {orderData.shipping_address.city}, {orderData.shipping_address.state} {orderData.shipping_address.zip}
              </Text>
              <Text style={styles.addressText}>{orderData.shipping_address.phone}</Text>
              
              {orderData.tracking_number && (
                <View style={styles.trackingInfo}>
                  <Text style={styles.trackingLabel}>Tracking Number:</Text>
                  <Text style={styles.trackingNumber}>{orderData.tracking_number}</Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Payment Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            <View style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <Ionicons name="card-outline" size={20} color={colors.primary} />
                <Text style={styles.paymentTitle}>Payment Method</Text>
              </View>
              <Text style={styles.paymentMethod}>{orderData.payment_method}</Text>
            </View>
          </View>
          
          {/* Order Summary */}
          <View style={styles.section}>
            {renderOrderSummary()}
          </View>
          
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            {renderQuickActions()}
          </View>
        </Animated.View>
        
        <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleContinueShopping}>
            <Ionicons name="bag-outline" size={20} color="white" />
            <Text style={styles.primaryButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleViewOrders}>
            <Ionicons name="receipt-outline" size={20} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>View My Orders</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.m,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  successIcon: {
    marginBottom: spacing.m,
  },
  title: {
    fontSize: scale(28),
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: scale(16),
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  orderNumber: {
    fontSize: scale(14),
    color: colors.primary,
    fontWeight: '600',
  },
  contentContainer: {
    marginBottom: spacing.l,
  },
  section: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.m,
  },
  statusContainer: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    ...shadows.card,
  },
  statusStep: {
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  statusDot: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statusCompleted: {
    backgroundColor: colors.success,
  },
  statusActive: {
    backgroundColor: colors.primary,
  },
  statusPending: {
    backgroundColor: colors.border,
  },
  statusText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statusPendingText: {
    color: colors.textSecondary,
  },
  statusTime: {
    fontSize: scale(12),
    color: colors.textSecondary,
  },
  statusLine: {
    width: 2,
    height: scale(20),
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.m,
  },
  orderCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    ...shadows.card,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
    paddingBottom: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orderDate: {
    fontSize: scale(14),
    color: colors.textSecondary,
  },
  orderStatus: {
    fontSize: scale(14),
    color: colors.success,
    fontWeight: '600',
  },
  itemsSection: {
    gap: spacing.s,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: scale(14),
    color: colors.text,
    fontWeight: '500',
  },
  itemQuantity: {
    fontSize: scale(12),
    color: colors.textSecondary,
  },
  itemPrice: {
    fontSize: scale(14),
    color: colors.text,
    fontWeight: '600',
  },
  shippingCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    ...shadows.card,
  },
  shippingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  shippingTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.s,
  },
  addressText: {
    fontSize: scale(14),
    color: colors.text,
    marginBottom: spacing.xs,
  },
  trackingInfo: {
    marginTop: spacing.s,
    paddingTop: spacing.s,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  trackingLabel: {
    fontSize: scale(12),
    color: colors.textSecondary,
  },
  trackingNumber: {
    fontSize: scale(14),
    color: colors.primary,
    fontWeight: '600',
  },
  paymentCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    ...shadows.card,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  paymentTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.s,
  },
  paymentMethod: {
    fontSize: scale(14),
    color: colors.text,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    ...shadows.card,
  },
  summaryTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.m,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  summaryLabel: {
    fontSize: scale(14),
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: scale(14),
    color: colors.text,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.s,
    marginTop: spacing.s,
  },
  totalLabel: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.text,
  },
  totalAmount: {
    fontSize: scale(18),
    fontWeight: '700',
    color: colors.primary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    ...shadows.card,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionText: {
    fontSize: scale(12),
    color: colors.text,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: spacing.m,
    marginBottom: spacing.xl,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: scale(16),
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingVertical: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    gap: spacing.s,
  },
  secondaryButtonText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.primary,
  },
}); 