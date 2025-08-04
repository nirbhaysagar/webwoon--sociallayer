import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  RefreshControl,
  Alert,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import { supabase } from '../../config/supabase';
import BackButton from '../../components/BackButton';

interface OrderItem {
  id: string;
  product_id: number;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  total_amount: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
  shipping_address: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  payment_method: {
    type: string;
    last4: string;
  };
  tracking_number?: string;
  estimated_delivery?: string;
  store_name: string;
  store_logo: string;
}

export default function OrderManagementScreen() {
  const navigation = useNavigation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch orders from Supabase
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            product_id,
            product_name,
            unit_price,
            quantity,
            total_price
          ),
          stores(name, logo_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error('Failed to load orders');
      }

      // Transform data to match our interface
      const transformedOrders = ordersData.map((order: any) => ({
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        total_amount: order.total_amount,
        items: order.order_items?.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80', // Default image
          quantity: item.quantity,
          price: item.unit_price,
          total: item.total_price
        })) || [],
        created_at: order.created_at,
        updated_at: order.updated_at,
        shipping_address: order.shipping_address,
        payment_method: order.payment_method,
        tracking_number: order.tracking_number,
        estimated_delivery: order.estimated_delivery,
        store_name: order.stores?.name || 'TechStore',
        store_logo: order.stores?.logo_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=100&q=80'
      }));

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load orders',
        text2: error.message
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, [loadOrders]);

  const handleOrderPress = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleReorder = (order: Order) => {
    Alert.alert(
      'Reorder',
      `Add all items from order ${order.order_number} to cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add to Cart', 
          onPress: () => {
            // TODO: Add items to cart
            Toast.show({
              type: 'success',
              text1: 'Items added to cart',
              text2: 'All items from this order have been added to your cart'
            });
          }
        }
      ]
    );
  };

  const handleCancelOrder = async (order: Order) => {
    Alert.alert(
      'Cancel Order',
      `Are you sure you want to cancel order ${order.order_number}?`,
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Update order status in Supabase
              const { error } = await supabase
                .from('orders')
                .update({ status: 'cancelled' })
                .eq('id', order.id);

              if (error) {
                throw new Error('Failed to cancel order');
              }

              // Update local state
              setOrders(prev => 
                prev.map(o => 
                  o.id === order.id 
                    ? { ...o, status: 'cancelled' as const }
                    : o
                )
              );

              Toast.show({
                type: 'success',
                text1: 'Order cancelled',
                text2: 'Your order has been cancelled successfully'
              });
            } catch (error) {
              console.error('Error cancelling order:', error);
              Toast.show({
                type: 'error',
                text1: 'Failed to cancel order',
                text2: error.message
              });
            }
          }
        }
      ]
    );
  };

  const handleTrackOrder = (order: Order) => {
    if (order.tracking_number) {
      // Navigate to tracking screen
      navigation.navigate('OrderTracking', { 
        orderNumber: order.order_number, 
        trackingNumber: order.tracking_number 
      });
    } else {
      Toast.show({
        type: 'info',
        text1: 'No tracking available',
        text2: 'Tracking information will be available once your order ships'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'confirmed':
        return colors.info;
      case 'processing':
        return colors.primary;
      case 'shipped':
        return colors.success;
      case 'delivered':
        return colors.success;
      case 'cancelled':
        return colors.error;
      case 'refunded':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'confirmed':
        return 'checkmark-circle-outline';
      case 'processing':
        return 'construct-outline';
      case 'shipped':
        return 'car-outline';
      case 'delivered':
        return 'checkmark-done-circle-outline';
      case 'cancelled':
        return 'close-circle-outline';
      case 'refunded':
        return 'refresh-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleOrderPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>{item.order_number}</Text>
          <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons name={getStatusIcon(item.status) as any} size={16} color={colors.white} />
          <Text style={styles.statusText}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.storeInfo}>
        <Image source={{ uri: item.store_logo }} style={styles.storeLogo} />
        <Text style={styles.storeName}>{item.store_name}</Text>
      </View>

      <View style={styles.itemsPreview}>
        {item.items.slice(0, 2).map((orderItem, index) => (
          <View key={orderItem.id} style={styles.itemPreview}>
            <Image source={{ uri: orderItem.product_image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>
                {orderItem.product_name}
              </Text>
              <Text style={styles.itemQuantity}>Qty: {orderItem.quantity}</Text>
            </View>
          </View>
        ))}
        {item.items.length > 2 && (
          <Text style={styles.moreItems}>+{item.items.length - 2} more items</Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalAmount}>${item.total_amount.toFixed(2)}</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleTrackOrder(item)}
          >
            <Ionicons name="location-outline" size={16} color={colors.primary} />
            <Text style={styles.actionButtonText}>Track</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleReorder(item)}
          >
            <Ionicons name="refresh-outline" size={16} color={colors.primary} />
            <Text style={styles.actionButtonText}>Reorder</Text>
          </TouchableOpacity>
          {item.status === 'pending' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancelOrder(item)}
            >
              <Ionicons name="close-outline" size={16} color={colors.error} />
              <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderStatusFilter = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              selectedStatus === status && styles.filterButtonActive
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedStatus === status && styles.filterButtonTextActive
            ]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderOrderModal = () => (
    <Modal
      visible={showOrderModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      {selectedOrder && (
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowOrderModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Order Details</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.modalContent}>
            <View style={styles.orderSummary}>
              <Text style={styles.orderNumber}>{selectedOrder.order_number}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status) }]}>
                <Ionicons name={getStatusIcon(selectedOrder.status) as any} size={16} color={colors.white} />
                <Text style={styles.statusText}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Items</Text>
              {selectedOrder.items.map((item) => (
                <View key={item.id} style={styles.orderItem}>
                  <Image source={{ uri: item.product_image }} style={styles.orderItemImage} />
                  <View style={styles.orderItemInfo}>
                    <Text style={styles.orderItemName}>{item.product_name}</Text>
                    <Text style={styles.orderItemQuantity}>Quantity: {item.quantity}</Text>
                    <Text style={styles.orderItemPrice}>${item.price.toFixed(2)}</Text>
                  </View>
                  <Text style={styles.orderItemTotal}>${item.total.toFixed(2)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Shipping Address</Text>
              <Text style={styles.addressText}>{selectedOrder.shipping_address.name}</Text>
              <Text style={styles.addressText}>{selectedOrder.shipping_address.address}</Text>
              <Text style={styles.addressText}>
                {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip_code}
              </Text>
              <Text style={styles.addressText}>{selectedOrder.shipping_address.country}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment</Text>
              <Text style={styles.paymentText}>
                {selectedOrder.payment_method.type.toUpperCase()} ending in {selectedOrder.payment_method.last4}
              </Text>
            </View>

            {selectedOrder.tracking_number && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tracking</Text>
                <Text style={styles.trackingText}>Number: {selectedOrder.tracking_number}</Text>
                {selectedOrder.estimated_delivery && (
                  <Text style={styles.trackingText}>
                    Estimated delivery: {formatDate(selectedOrder.estimated_delivery)}
                  </Text>
                )}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${selectedOrder.total_amount.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={styles.summaryValue}>Free</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total</Text>
                <Text style={styles.summaryValue}>${selectedOrder.total_amount.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backButton} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>My Orders</Text>
          <Text style={styles.subtitle}>
            Track your purchases and manage orders
          </Text>
        </View>
      </View>

      {/* Status Filter */}
      {renderStatusFilter()}

      {/* Orders List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ordersList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Order Details Modal */}
      {renderOrderModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: scale(24),
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: scale(14),
    color: colors.textSecondary,
  },
  filterContainer: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
  },
  filterButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    marginRight: spacing.s,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: scale(12),
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: scale(16),
    color: colors.textSecondary,
  },
  ordersList: {
    padding: spacing.m,
  },
  orderCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.text,
  },
  orderDate: {
    fontSize: scale(12),
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  statusText: {
    fontSize: scale(10),
    color: colors.white,
    fontWeight: '600',
    marginLeft: spacing.xxs,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  storeLogo: {
    width: 20,
    height: 20,
    borderRadius: radii.circle,
    marginRight: spacing.xs,
  },
  storeName: {
    fontSize: scale(12),
    color: colors.textSecondary,
  },
  itemsPreview: {
    marginBottom: spacing.s,
  },
  itemPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: radii.small,
    marginRight: spacing.s,
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
  moreItems: {
    fontSize: scale(12),
    color: colors.primary,
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalAmount: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    marginLeft: spacing.s,
  },
  actionButtonText: {
    fontSize: scale(12),
    color: colors.primary,
    fontWeight: '500',
    marginLeft: spacing.xxs,
  },
  cancelButton: {
    // Additional styles for cancel button
  },
  cancelButtonText: {
    color: colors.error,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: spacing.l,
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  section: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.s,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  orderItemImage: {
    width: 60,
    height: 60,
    borderRadius: radii.small,
    marginRight: spacing.m,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: scale(14),
    color: colors.text,
    fontWeight: '500',
  },
  orderItemQuantity: {
    fontSize: scale(12),
    color: colors.textSecondary,
  },
  orderItemPrice: {
    fontSize: scale(12),
    color: colors.textSecondary,
  },
  orderItemTotal: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.text,
  },
  addressText: {
    fontSize: scale(14),
    color: colors.text,
    marginBottom: spacing.xxs,
  },
  paymentText: {
    fontSize: scale(14),
    color: colors.text,
  },
  trackingText: {
    fontSize: scale(14),
    color: colors.text,
    marginBottom: spacing.xxs,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
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
}); 