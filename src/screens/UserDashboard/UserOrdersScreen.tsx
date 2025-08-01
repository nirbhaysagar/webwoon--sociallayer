import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, FlatList, RefreshControl, Modal, Animated, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from '../SellerDashboard/components/HeaderWithMenu';
import { useApp } from '../../context/AppContext';
import { orderAPI } from '../../services/api';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import Button from '../../components/common/Button';

const statusColors = {
  delivered: colors.rating,
  shipped: colors.secondary,
  processing: colors.primary,
  pending: colors.textSecondary,
  cancelled: colors.error,
};

const statusLabels = {
  delivered: 'Delivered',
  shipped: 'Shipped',
  processing: 'Processing',
  pending: 'Pending',
  cancelled: 'Cancelled',
};

const statusFilters = [
  { key: 'all', label: 'All' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

const mockOrders = [
  {
    id: '1',
    orderNumber: '#ORD-2024-001',
    date: '2024-01-15',
    status: 'delivered',
    total: 89.99,
    items: ['Summer Collection Sneakers'],
    store: 'TrendyStore',
    order_items: [
      {
        products: {
          name: 'Summer Collection Sneakers',
          image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=150&fit=crop',
          price: 89.99,
          quantity: 1
        }
      }
    ],
    stores: { name: 'TrendyStore' }
  },
  {
    id: '2',
    orderNumber: '#ORD-2024-002',
    date: '2024-01-10',
    status: 'shipped',
    total: 599.98,
    items: ['Smart Home Bundle', 'Premium Yoga Mat'],
    store: 'TechHub',
    order_items: [
      {
        products: {
          name: 'Smart Home Bundle',
          image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop',
          price: 399.99,
          quantity: 1
        }
      },
      {
        products: {
          name: 'Premium Yoga Mat',
          image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=150&h=150&fit=crop',
          price: 199.99,
          quantity: 1
        }
      }
    ],
    stores: { name: 'TechHub' }
  },
  {
    id: '3',
    orderNumber: '#ORD-2024-003',
    date: '2024-01-05',
    status: 'processing',
    total: 149.99,
    items: ['Organic Skincare Set'],
    store: 'NaturalGlow',
    order_items: [
      {
        products: {
          name: 'Organic Skincare Set',
          image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=150&h=150&fit=crop',
          price: 149.99,
          quantity: 1
        }
      }
    ],
    stores: { name: 'NaturalGlow' }
  },
  {
    id: '4',
    orderNumber: '#ORD-2024-004',
    date: '2024-01-20',
    status: 'pending',
    total: 299.97,
    items: ['Wireless Headphones', 'Phone Case', 'Screen Protector'],
    store: 'ElectroStore',
    order_items: [
      {
        products: {
          name: 'Wireless Headphones',
          image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop',
          price: 199.99,
          quantity: 1
        }
      },
      {
        products: {
          name: 'Phone Case',
          image_url: 'https://images.unsplash.com/photo-1603313011108-4f2d6c2c6f4e?w=150&h=150&fit=crop',
          price: 49.99,
          quantity: 1
        }
      },
      {
        products: {
          name: 'Screen Protector',
          image_url: 'https://images.unsplash.com/photo-1603313011108-4f2d6c2c6f4e?w=150&h=150&fit=crop',
          price: 49.99,
          quantity: 1
        }
      }
    ],
    stores: { name: 'ElectroStore' }
  },
  {
    id: '5',
    orderNumber: '#ORD-2024-005',
    date: '2024-01-18',
    status: 'cancelled',
    total: 79.99,
    items: ['Designer Watch'],
    store: 'LuxuryTime',
    order_items: [
      {
        products: {
          name: 'Designer Watch',
          image_url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=150&h=150&fit=crop',
          price: 79.99,
          quantity: 1
        }
      }
    ],
    stores: { name: 'LuxuryTime' }
  }
];

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const OrderCard = ({ order, onPress }) => {
    const [scaleValue] = useState(new Animated.Value(1));

    const handlePressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.98,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };
    const orderDate = new Date(order.created_at || order.date).toLocaleDateString();
    const orderItems = order.order_items?.map(item => item.products?.name || 'Product') || order.items || [];
    const storeName = order.stores?.name || order.store || 'Store';
    const status = (order.status || '').toLowerCase();
    const statusColor = statusColors[status] || colors.textSecondary;
    const statusLabel = statusLabels[status] || status;
    const productImages = order.order_items?.map(item => item.products?.image_url).filter(Boolean) || [];

    return (
        <AnimatedTouchableOpacity 
            style={[styles.orderCard, { transform: [{ scale: scaleValue }] }]}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>{order.orderNumber || `#${order.id}`}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor }]}> 
                    <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
                </View>
            </View>
            <Text style={styles.orderDate}>{orderDate}</Text>
            <Text style={styles.orderStore}>{storeName}</Text>
            <View style={styles.orderItemsRow}>
                {productImages.slice(0, 3).map((img, idx) => (
                    <Image key={idx} source={{ uri: img }} style={styles.productThumb} />
                ))}
                {orderItems.length > 3 && (
                    <View style={styles.moreItems}><Text style={styles.moreItemsText}>+{orderItems.length - 3}</Text></View>
                )}
            </View>
            <View style={styles.orderFooter}>
                <Text style={styles.orderTotal}>${order.total_amount?.toFixed(2) || order.total?.toFixed(2) || '0.00'}</Text>
                <Button
                    title="View Details"
                    style={styles.detailsButton}
                    textStyle={styles.detailsButtonText}
                    onPress={onPress}
                />
            </View>
        </AnimatedTouchableOpacity>
    );
};

export default function UserOrdersScreen() {
  const { state } = useApp();
  const userId = state.user?.id;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSellerMode, setIsSellerMode] = useState(false);

  useEffect(() => {
    // For demo purposes, load orders immediately
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      // For demo purposes, always use mock data
      // const userOrders = await orderAPI.getUserOrders(userId);
      // setOrders(userOrders);
      
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOrders(mockOrders);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Failed to load orders');
      // Fallback to mock data if API fails
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const renderOrderDetails = () => {
    if (!selectedOrder) return null;
    const orderDate = new Date(selectedOrder.created_at || selectedOrder.date).toLocaleDateString();
    const orderItems = selectedOrder.order_items?.map(item => item.products) || [];
    const status = (selectedOrder.status || '').toLowerCase();
    const statusColor = statusColors[status] || colors.textSecondary;
    const statusLabel = statusLabels[status] || selectedOrder.status;
    
    return (
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView 
            style={styles.modalScrollView}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
          >
            <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Details</Text>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Order Info Section */}
            <View style={styles.orderInfoSection}>
              <View style={styles.orderInfoRow}>
                <Text style={styles.orderInfoLabel}>Order Number:</Text>
                <Text style={styles.orderInfoValue}>{selectedOrder.orderNumber || `#${selectedOrder.id}`}</Text>
              </View>
              <View style={styles.orderInfoRow}>
                <Text style={styles.orderInfoLabel}>Order Date:</Text>
                <Text style={styles.orderInfoValue}>{orderDate}</Text>
              </View>
              <View style={styles.orderInfoRow}>
                <Text style={styles.orderInfoLabel}>Store:</Text>
                <Text style={styles.orderInfoValue}>{selectedOrder.stores?.name || selectedOrder.store}</Text>
              </View>
              <View style={styles.orderInfoRow}>
                <Text style={styles.orderInfoLabel}>Status:</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor }]}>
                  <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
                </View>
              </View>
            </View>

            {/* Shipping Address Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Shipping Address</Text>
              <View style={styles.addressContainer}>
                <Ionicons name="location-outline" size={20} color={colors.textSecondary} style={styles.addressIcon} />
                <View style={styles.addressText}>
                  <Text style={styles.addressName}>John Doe</Text>
                  <Text style={styles.addressLine}>123 Main Street</Text>
                  <Text style={styles.addressLine}>Apt 4B</Text>
                  <Text style={styles.addressLine}>New York, NY 10001</Text>
                  <Text style={styles.addressLine}>United States</Text>
                </View>
              </View>
            </View>

            {/* Products Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Products</Text>
              <ScrollView style={styles.productsList} showsVerticalScrollIndicator={false}>
                {orderItems.length > 0 ? orderItems.map((prod, idx) => (
                  <View key={idx} style={styles.productRow}>
                    <Image source={{ uri: prod?.image_url }} style={styles.productImage} />
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{prod?.name}</Text>
                      <Text style={styles.productQty}>Quantity: {prod?.quantity || 1}</Text>
                      <Text style={styles.productPrice}>${prod?.price?.toFixed(2) || '0.00'}</Text>
                    </View>
                  </View>
                )) : (
                  <Text style={styles.noProductsText}>No products found.</Text>
                )}
              </ScrollView>
            </View>

            {/* Order Summary Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>${selectedOrder.total_amount?.toFixed(2) || selectedOrder.total?.toFixed(2) || '0.00'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping:</Text>
                <Text style={styles.summaryValue}>$5.99</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax:</Text>
                <Text style={styles.summaryValue}>$2.99</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>${selectedOrder.total_amount?.toFixed(2) || selectedOrder.total?.toFixed(2) || '0.00'}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={() => {/* Track order */}}>
                <Ionicons name="location" size={20} color={colors.primary} />
                <Text style={styles.actionButtonText}>Track Order</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => {/* Contact support */}}>
                <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
                <Text style={styles.actionButtonText}>Contact Support</Text>
              </TouchableOpacity>
            </View>
          </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderWithMenu />
      
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>My Orders</Text>
          <Text style={styles.subtitle}>Track your recent purchases status.</Text>
        </View>
        
        {/* User/Seller Toggle */}
        <View style={styles.toggleContainer}>
          <Text style={[styles.toggleLabel, !isSellerMode && styles.toggleLabelActive]}>User</Text>
          <Switch
            value={isSellerMode}
            onValueChange={setIsSellerMode}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={isSellerMode ? colors.background : colors.primary}
            style={styles.toggleSwitch}
          />
          <Text style={[styles.toggleLabel, isSellerMode && styles.toggleLabelActive]}>Seller</Text>
        </View>
      </View>

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterRow}
          contentContainerStyle={styles.filterRowContent}
        >
          {statusFilters.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterBtnText, filter === f.key && styles.filterBtnTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Retry"
            style={styles.retryButton}
            onPress={loadOrders}
            textStyle={styles.retryButtonText}
          />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <OrderCard order={item} onPress={() => { setSelectedOrder(item); setShowModal(true); }} />}
          contentContainerStyle={styles.ordersList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>You haven’t placed any orders yet.</Text>
              <Text style={styles.emptySubtext}>Start shopping to see your orders here!</Text>
              <Button
                title="Start Shopping"
                style={styles.shopBtn}
                onPress={() => {/* navigate to explore */}}
                textStyle={styles.shopBtnText}
              />
            </View>
          }
        />
      )}
      
      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => {/* Add order action */}}>
        <Ionicons name="settings-outline" size={24} color={colors.background} />
      </TouchableOpacity>
      
      {renderOrderDetails()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.m,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: scale(24),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.s,
  },
  subtitle: {
    fontSize: scale(16),
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  ordersList: {
    flex: 1,
    paddingHorizontal: spacing.m,
  },
  orderCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.m,
    ...shadows.card,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  orderTitle: {
    fontSize: scale(16),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.s,
  },
  orderNumber: {
    fontSize: scale(14),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  orderStatus: {
    fontSize: scale(14),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#fff',
  },
  orderDate: {
    fontSize: scale(14),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  orderStore: {
    fontSize: scale(14),
    color: colors.textSecondary,
    marginBottom: spacing.s,
  },
  orderItems: {
    marginBottom: spacing.s,
  },
  orderItem: {
    fontSize: scale(14),
    color: colors.text,
    marginBottom: spacing.s,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {
    fontSize: scale(18),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.primary,
  },
  trackButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
  },
  trackButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: scale(14),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
  },
  loadingText: {
    fontSize: scale(16),
    color: colors.textSecondary,
    marginTop: spacing.m,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
  },
  errorText: {
    fontSize: scale(16),
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
  },
  retryButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: scale(14),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingTop: spacing.xl,
  },
  emptyText: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  emptySubtext: {
    fontSize: scale(16),
    color: colors.textSecondary,
    textAlign: 'center',
  },
  shopBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    marginTop: spacing.m,
  },
  shopBtnText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: scale(16),
  },
  filterContainer: {
    marginBottom: spacing.m,
  },
  filterRow: {
    paddingHorizontal: spacing.m,
  },
  filterRowContent: {
    paddingRight: spacing.m,
  },
  filterBtn: {
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    marginRight: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    height: 40,
  },
  filterBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterBtnText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterBtnTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  statusBadge: {
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusBadgeText: {
    fontSize: scale(12),
    fontWeight: '600',
  },
  orderItemsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.s,
  },
  productThumb: {
    width: 50,
    height: 50,
    borderRadius: radii.small,
    marginRight: spacing.s,
    marginBottom: spacing.s,
  },
  moreItems: {
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    marginLeft: spacing.s,
  },
  moreItemsText: {
    fontSize: scale(12),
    color: colors.textSecondary,
  },
  detailsButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
  },
  detailsButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: scale(14),
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalScrollView: {
    maxHeight: '80%',
    width: '90%',
  },
  modalScrollContent: {
    paddingVertical: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: radii.large,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.card,
  },
  modalTitle: {
    fontSize: scale(20),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.s,
  },
  modalSubtitle: {
    fontSize: scale(16),
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.textSecondary,
    marginBottom: spacing.s,
  },
  modalDate: {
    fontSize: scale(14),
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.textSecondary,
    marginBottom: spacing.s,
  },
  modalProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
    paddingBottom: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalProductImg: {
    width: 50,
    height: 50,
    borderRadius: radii.small,
    marginRight: spacing.s,
  },
  modalProductName: {
    fontSize: scale(16),
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.s,
  },
  modalProductQty: {
    fontSize: scale(14),
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.textSecondary,
    marginBottom: spacing.s,
  },
  modalProductPrice: {
    fontSize: scale(14),
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.primary,
  },
  modalTotal: {
    fontSize: scale(18),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.primary,
    marginTop: spacing.m,
    marginBottom: spacing.xl,
  },
  closeModalBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
  },
  closeModalBtnText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: scale(14),
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    ...shadows.small,
  },
  toggleLabel: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.textSecondary,
    marginHorizontal: spacing.s,
  },
  toggleLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  toggleSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.m,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.large,
    elevation: 8,
  },
  // Enhanced Modal Styles
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
    paddingBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: spacing.s,
  },
  orderInfoSection: {
    marginBottom: spacing.l,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  orderInfoLabel: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.textSecondary,
  },
  orderInfoValue: {
    fontSize: scale(14),
    fontWeight: '700',
    color: colors.text,
  },
  sectionContainer: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    fontSize: scale(16),
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.m,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
  },
  addressIcon: {
    marginRight: spacing.s,
    marginTop: 2,
  },
  addressText: {
    flex: 1,
  },
  addressName: {
    fontSize: scale(16),
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  addressLine: {
    fontSize: scale(14),
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  productsList: {
    maxHeight: 200,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.s,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: radii.small,
    marginRight: spacing.m,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: scale(16),
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  productQty: {
    fontSize: scale(14),
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  productPrice: {
    fontSize: scale(16),
    fontWeight: '700',
    color: colors.primary,
  },
  noProductsText: {
    fontSize: scale(14),
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  summaryLabel: {
    fontSize: scale(14),
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.s,
    marginTop: spacing.s,
  },
  totalLabel: {
    fontSize: scale(16),
    fontWeight: '700',
    color: colors.text,
  },
  totalValue: {
    fontSize: scale(18),
    fontWeight: '700',
    color: colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.l,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  actionButtonText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.primary,
    marginLeft: spacing.s,
  },
});
