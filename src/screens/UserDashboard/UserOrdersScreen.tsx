import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, FlatList, RefreshControl, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import BackButton from '../../components/BackButton';
import HeaderWithMenu from '../SellerDashboard/components/HeaderWithMenu';
import { useApp } from '../../context/AppContext';
import { orderAPI } from '../../services/api';

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
    status: 'Delivered',
    total: 89.99,
    items: ['Summer Collection Sneakers'],
    store: 'TrendyStore',
  },
  {
    id: '2',
    orderNumber: '#ORD-2024-002',
    date: '2024-01-10',
    status: 'Shipped',
    total: 599.98,
    items: ['Smart Home Bundle', 'Premium Yoga Mat'],
    store: 'TechHub',
  },
  {
    id: '3',
    orderNumber: '#ORD-2024-003',
    date: '2024-01-05',
    status: 'Processing',
    total: 149.99,
    items: ['Organic Skincare Set'],
    store: 'NaturalGlow',
  },
];

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

  useEffect(() => {
    if (userId) {
      loadOrders();
    }
  }, [userId]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const userOrders = await orderAPI.getUserOrders(userId);
      setOrders(userOrders);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return colors.rating;
      case 'shipped': return colors.secondary;
      case 'processing': return colors.primary;
      case 'pending': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  const renderOrder = (order) => {
    const orderDate = new Date(order.created_at || order.date).toLocaleDateString();
    const orderItems = order.order_items?.map(item => item.products?.name || 'Product') || order.items || [];
    const storeName = order.stores?.name || order.store || 'Store';
    const status = (order.status || '').toLowerCase();
    const statusColor = statusColors[status] || colors.textSecondary;
    const statusLabel = statusLabels[status] || status;
    const productImages = order.order_items?.map(item => item.products?.image_url).filter(Boolean) || [];

    return (
      <TouchableOpacity key={order.id} style={styles.orderCard} onPress={() => { setSelectedOrder(order); setShowModal(true); }}>
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
          <TouchableOpacity style={styles.detailsButton} onPress={() => { setSelectedOrder(order); setShowModal(true); }}>
            <Text style={styles.detailsButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderOrderDetails = () => {
    if (!selectedOrder) return null;
    const orderDate = new Date(selectedOrder.created_at || selectedOrder.date).toLocaleDateString();
    const orderItems = selectedOrder.order_items?.map(item => item.products) || [];
    return (
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Order Details</Text>
            <Text style={styles.modalSubtitle}>{selectedOrder.orderNumber || `#${selectedOrder.id}`}</Text>
            <Text style={styles.modalDate}>{orderDate}</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {orderItems.length > 0 ? orderItems.map((prod, idx) => (
                <View key={idx} style={styles.modalProductRow}>
                  <Image source={{ uri: prod?.image_url }} style={styles.modalProductImg} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalProductName}>{prod?.name}</Text>
                    <Text style={styles.modalProductQty}>Qty: {prod?.quantity || 1}</Text>
                    <Text style={styles.modalProductPrice}>${prod?.price?.toFixed(2) || '0.00'}</Text>
                  </View>
                </View>
              )) : <Text>No products found.</Text>}
            </ScrollView>
            <Text style={styles.modalTotal}>Total: ${selectedOrder.total_amount?.toFixed(2) || selectedOrder.total?.toFixed(2) || '0.00'}</Text>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowModal(false)}>
              <Text style={styles.closeModalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backButton} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>My Orders</Text>
          <Text style={styles.subtitle}>
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      {/* Status Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {statusFilters.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterBtnText, filter === f.key && styles.filterBtnTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your orders…</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadOrders}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={item => item.id}
          renderItem={({ item }) => renderOrder(item)}
          contentContainerStyle={styles.ordersList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>You haven’t placed any orders yet.</Text>
              <Text style={styles.emptySubtext}>Start shopping to see your orders here!</Text>
              <TouchableOpacity style={styles.shopBtn} onPress={() => {/* navigate to explore */}}>
                <Text style={styles.shopBtnText}>Start Shopping</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
      {renderOrderDetails()}
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
  filterButton: {
    padding: spacing.s,
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.m,
    marginBottom: spacing.m,
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
    minWidth: 90,
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
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: radii.large,
    padding: spacing.xl,
    width: '90%',
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
}); 