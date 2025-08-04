import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Modal, Image, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from './components/HeaderWithMenu';
import Toast from 'react-native-toast-message';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../services/supabase';
import { useNavigation } from '@react-navigation/native';

const TABS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'All'];

const statusColors = {
  pending: colors.warning,
  processing: colors.primary,
  shipped: colors.secondary,
  delivered: colors.success,
  cancelled: colors.error,
  refunded: colors.error,
  All: colors.textSecondary,
};

const statusIcons = {
  pending: 'time-outline',
  processing: 'construct-outline',
  shipped: 'send-outline',
  delivered: 'checkmark-circle-outline',
  cancelled: 'close-circle-outline',
  refunded: 'refresh-outline',
};

export default function OrdersScreen() {
  const { state, loadOrders } = useApp();
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('Pending');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');

  // Load orders on component mount
  useEffect(() => {
    loadOrdersData();
  }, []);

  const loadOrdersData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          ),
          users!orders_user_id_fkey (
            full_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      Toast.show({ type: 'error', text1: 'Failed to load orders' });
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(
    o => (selectedTab === 'All' || o.status === selectedTab.toLowerCase()) &&
      (o.users?.full_name?.toLowerCase().includes(search.toLowerCase()) || 
       o.order_items?.some(item => item.products?.name?.toLowerCase().includes(search.toLowerCase())))
  );

  const getOrderStatus = (order) => {
    const status = order.status || 'pending';
    return {
      label: status.charAt(0).toUpperCase() + status.slice(1),
      color: statusColors[status] || colors.gray[600],
      icon: statusIcons[status] || 'help-outline'
    };
  };

  const calculateOrderTotal = (order) => {
    if (!order.order_items) return 0;
    return order.order_items.reduce((sum, item) => {
      return sum + (parseFloat(item.products?.price || 0) * item.quantity);
    }, 0);
  };

  const getOrderItemsText = (order) => {
    if (!order.order_items) return 'No items';
    return order.order_items.map(item => 
      `${item.quantity}x ${item.products?.name || 'Unknown Product'}`
    ).join(', ');
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      Toast.show({ 
        type: 'success', 
        text1: `Order ${newStatus}!`,
        text2: `Order status updated to ${newStatus}`
      });
      
      loadOrdersData(); // Reload orders
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error updating order status:', error);
      Toast.show({ type: 'error', text1: 'Failed to update order status' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (order, newStatus) => {
    Alert.alert(
      'Update Order Status',
      `Are you sure you want to mark this order as ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Update', onPress: () => updateOrderStatus(order.id, newStatus) }
      ]
    );
  };

  const sendMessageToCustomer = async () => {
    if (!messageText.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter a message' });
      return;
    }

    try {
      setLoading(true);
      // Here you would typically send to a messaging system
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Toast.show({ 
        type: 'success', 
        text1: 'Message sent!',
        text2: 'Customer will be notified'
      });
      
      setShowMessageModal(false);
      setMessageText('');
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to send message' });
    } finally {
      setLoading(false);
    }
  };

  const loadOrderDetails = async (orderId) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          ),
          users!orders_user_id_fkey (
            full_name,
            email,
            phone,
            avatar_url
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrderDetails(data);
    } catch (error) {
      console.error('Error loading order details:', error);
      Toast.show({ type: 'error', text1: 'Failed to load order details' });
    }
  };

  const renderOrderCard = ({ item }) => {
    const status = getOrderStatus(item);
    const total = calculateOrderTotal(item);
    const itemsText = getOrderItemsText(item);

    return (
      <TouchableOpacity 
        style={styles.orderCard} 
        onPress={() => {
          setSelectedOrder(item);
          loadOrderDetails(item.id);
        }}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>Order #{item.id}</Text>
            <Text style={styles.orderDate}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '15' }]}>
            <Ionicons name={status.icon} size={16} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>
        
        <View style={styles.customerInfo}>
          <Image 
            source={{ uri: item.users?.avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg' }} 
            style={styles.avatar} 
          />
          <View style={styles.customerDetails}>
            <Text style={styles.customerName}>{item.users?.full_name || 'Unknown Customer'}</Text>
            <Text style={styles.customerEmail}>{item.users?.email}</Text>
          </View>
        </View>
        
        <View style={styles.orderItems}>
          <Text style={styles.itemsLabel}>Items:</Text>
          <Text style={styles.itemsText}>{itemsText}</Text>
        </View>
        
        <View style={styles.orderFooter}>
          <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
          <TouchableOpacity 
            style={styles.messageButton}
            onPress={() => {
              setSelectedOrder(item);
              setShowMessageModal(true);
            }}
          >
            <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderWithMenu />
      <View style={styles.header}>
        <BackButton style={styles.backButton} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Orders</Text>
          <Text style={styles.subtitle}>
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Orders</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders or customers"
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>
      <View style={styles.tabsRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.tabActive]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderOrderCard}
        ListEmptyComponent={<Text style={styles.emptyText}>No orders found.</Text>}
      />
      <Modal visible={!!selectedOrder} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <Image source={{ uri: selectedOrder.users?.avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg' }} style={styles.modalAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalCustomer}>{selectedOrder.users?.full_name || 'Unknown Customer'}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getOrderStatus(selectedOrder).color + '15' }]}>
                      <Ionicons name={getOrderStatus(selectedOrder).icon} size={16} color={getOrderStatus(selectedOrder).color} />
                      <Text style={[styles.statusText, { color: getOrderStatus(selectedOrder).color }]}>
                        {getOrderStatus(selectedOrder).label}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedOrder(null)}>
                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Order Tracking */}
                <View style={styles.trackingSection}>
                  <Text style={styles.sectionTitle}>Order Tracking</Text>
                  <View style={styles.trackingTimeline}>
                    <View style={styles.timelineItem}>
                      <View style={[styles.timelineDot, { backgroundColor: colors.success }]} />
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineTitle}>Order Placed</Text>
                        <Text style={styles.timelineDate}>
                          {new Date(selectedOrder.created_at).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                    
                    {selectedOrder.status !== 'pending' && (
                      <View style={styles.timelineItem}>
                        <View style={[styles.timelineDot, { backgroundColor: colors.primary }]} />
                        <View style={styles.timelineContent}>
                          <Text style={styles.timelineTitle}>Processing</Text>
                          <Text style={styles.timelineDate}>
                            {new Date(selectedOrder.created_at).toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    )}
                    
                    {['shipped', 'delivered'].includes(selectedOrder.status) && (
                      <View style={styles.timelineItem}>
                        <View style={[styles.timelineDot, { backgroundColor: colors.secondary }]} />
                        <View style={styles.timelineContent}>
                          <Text style={styles.timelineTitle}>Shipped</Text>
                          <Text style={styles.timelineDate}>
                            {new Date(selectedOrder.created_at).toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    )}
                    
                    {selectedOrder.status === 'delivered' && (
                      <View style={styles.timelineItem}>
                        <View style={[styles.timelineDot, { backgroundColor: colors.success }]} />
                        <View style={styles.timelineContent}>
                          <Text style={styles.timelineTitle}>Delivered</Text>
                          <Text style={styles.timelineDate}>
                            {new Date(selectedOrder.created_at).toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>

                {/* Order Details */}
                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>Order Details</Text>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Order ID:</Text>
                    <Text style={styles.detailValue}>#{selectedOrder.id}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Order Date:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedOrder.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total Amount:</Text>
                    <Text style={styles.detailValue}>${calculateOrderTotal(selectedOrder).toFixed(2)}</Text>
                  </View>
                </View>

                {/* Order Items */}
                <View style={styles.itemsSection}>
                  <Text style={styles.sectionTitle}>Order Items</Text>
                  {selectedOrder.order_items?.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <Image 
                        source={{ uri: item.products?.image_urls?.[0] || 'https://via.placeholder.com/50' }} 
                        style={styles.itemImage} 
                      />
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName}>{item.products?.name || 'Unknown Product'}</Text>
                        <Text style={styles.itemPrice}>${item.products?.price || 0}</Text>
                      </View>
                      <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                    </View>
                  ))}
                </View>

                {/* Customer Information */}
                <View style={styles.customerSection}>
                  <Text style={styles.sectionTitle}>Customer Information</Text>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Name:</Text>
                    <Text style={styles.detailValue}>{selectedOrder.users?.full_name || 'Unknown'}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email:</Text>
                    <Text style={styles.detailValue}>{selectedOrder.users?.email || 'N/A'}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Phone:</Text>
                    <Text style={styles.detailValue}>{selectedOrder.users?.phone || 'N/A'}</Text>
                  </View>
                  
                  {selectedOrder.shipping_address && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Shipping Address:</Text>
                      <Text style={styles.detailValue}>{selectedOrder.shipping_address}</Text>
                    </View>
                  )}
                </View>

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  {selectedOrder.status === 'pending' && (
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleStatusUpdate(selectedOrder, 'processing')}>
                      <Ionicons name="construct-outline" size={20} color={colors.background} />
                      <Text style={styles.actionText}>Start Processing</Text>
                    </TouchableOpacity>
                  )}
                  
                  {selectedOrder.status === 'processing' && (
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleStatusUpdate(selectedOrder, 'shipped')}>
                      <Ionicons name="send-outline" size={20} color={colors.background} />
                      <Text style={styles.actionText}>Mark as Shipped</Text>
                    </TouchableOpacity>
                  )}
                  
                  {selectedOrder.status === 'shipped' && (
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleStatusUpdate(selectedOrder, 'delivered')}>
                      <Ionicons name="checkmark-circle-outline" size={20} color={colors.background} />
                      <Text style={styles.actionText}>Mark as Delivered</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity style={styles.messageBtn} onPress={() => setShowMessageModal(true)}>
                    <Ionicons name="chatbubble-outline" size={20} color={colors.secondary} />
                    <Text style={styles.messageText}>Message Customer</Text>
                  </TouchableOpacity>
                  
                  {!['cancelled', 'refunded'].includes(selectedOrder.status) && (
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => handleStatusUpdate(selectedOrder, 'cancelled')}>
                      <Ionicons name="close-circle-outline" size={20} color={colors.background} />
                      <Text style={styles.cancelText}>Cancel Order</Text>
                    </TouchableOpacity>
                  )}
                  
                  {selectedOrder.status === 'delivered' && (
                    <TouchableOpacity style={styles.refundBtn} onPress={() => handleStatusUpdate(selectedOrder, 'refunded')}>
                      <Ionicons name="refresh-outline" size={20} color={colors.background} />
                      <Text style={styles.refundText}>Process Refund</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
      {loading && <></>}
      <Modal visible={showMessageModal} animationType="slide" transparent>
        <View style={styles.messageModalOverlay}>
          <View style={styles.messageModalContent}>
            <Text style={styles.messageModalTitle}>Message to {selectedOrder?.users?.full_name || 'Customer'}</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Type your message..."
              placeholderTextColor={colors.textSecondary}
              multiline
              value={messageText}
              onChangeText={setMessageText}
            />
            <TouchableOpacity style={styles.sendMessageBtn} onPress={sendMessageToCustomer}>
              <Ionicons name="send" size={24} color={colors.background} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  subtitle: {
    fontSize: scale(14),
    color: colors.textSecondary,
    marginTop: 4,
  },
  filterButton: {
    padding: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingTop: spacing.m,
    paddingBottom: spacing.s,
    justifyContent: 'space-between',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flex: 1,
    marginLeft: spacing.m,
  },
  searchInput: {
    flex: 1,
    fontSize: scale(15),
    color: colors.text,
    padding: 0,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
    paddingHorizontal: spacing.m,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: radii.pill,
    backgroundColor: colors.card,
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: colors.primary + '33',
  },
  tabText: {
    fontSize: scale(15),
    fontWeight: '500',
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  listContent: {
    paddingHorizontal: spacing.m,
    paddingBottom: 80,
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
    fontWeight: 'bold',
    color: colors.text,
  },
  orderDate: {
    fontSize: scale(13),
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  statusText: {
    fontSize: scale(13),
    fontWeight: 'bold',
    marginLeft: 6,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radii.circle,
    marginRight: spacing.s,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: scale(15),
    fontWeight: 'bold',
    color: colors.text,
  },
  customerEmail: {
    fontSize: scale(13),
    color: colors.textSecondary,
  },
  orderItems: {
    marginBottom: spacing.s,
  },
  itemsLabel: {
    fontSize: scale(14),
    color: colors.textSecondary,
    marginBottom: 4,
  },
  itemsText: {
    fontSize: scale(15),
    color: colors.text,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.s,
  },
  totalAmount: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: colors.primary,
  },
  messageButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.l,
    fontSize: scale(16),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: colors.background,
    borderRadius: radii.large,
    padding: spacing.l,
    ...shadows.card,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  modalAvatar: {
    width: 48,
    height: 48,
    borderRadius: radii.medium,
    marginRight: spacing.m,
  },
  modalCustomer: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: colors.text,
  },
  modalStatus: {
    fontSize: scale(14),
    color: colors.primary,
    fontWeight: 'bold',
  },
  modalLabel: {
    fontSize: scale(13),
    color: colors.textSecondary,
    marginTop: spacing.s,
    marginBottom: 2,
  },
  modalValue: {
    fontSize: scale(15),
    color: colors.text,
    marginBottom: 2,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: spacing.m,
    justifyContent: 'space-between',
  },
  fulfillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  fulfillText: {
    color: colors.background,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  messageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageText: {
    color: colors.secondary,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  deleteText: {
    color: colors.background,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  refundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  refundText: {
    color: colors.background,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  messageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageModalContent: {
    width: '90%',
    backgroundColor: colors.background,
    borderRadius: radii.large,
    padding: spacing.l,
    alignItems: 'center',
    ...shadows.card,
  },
  messageModalTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.s,
  },
  messageInput: {
    width: '100%',
    height: 150,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.medium,
    padding: spacing.s,
    fontSize: scale(15),
    color: colors.text,
    textAlignVertical: 'top',
    marginBottom: spacing.s,
  },
  sendMessageBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.circle,
    padding: 12,
    ...shadows.card,
  },
  // Order Details Modal Styles
  sectionTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.m,
  },
  trackingSection: {
    marginBottom: spacing.l,
  },
  trackingTimeline: {
    marginLeft: spacing.s,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.m,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.m,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: scale(15),
    fontWeight: '600',
    color: colors.text,
  },
  timelineDate: {
    fontSize: scale(13),
    color: colors.textSecondary,
    marginTop: 2,
  },
  detailsSection: {
    marginBottom: spacing.l,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: scale(14),
    color: colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: scale(14),
    color: colors.text,
    fontWeight: '600',
  },
  itemsSection: {
    marginBottom: spacing.l,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: radii.small,
    marginRight: spacing.s,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: scale(15),
    fontWeight: '600',
    color: colors.text,
  },
  itemPrice: {
    fontSize: scale(13),
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemQuantity: {
    fontSize: scale(15),
    fontWeight: 'bold',
    color: colors.primary,
  },
  customerSection: {
    marginBottom: spacing.l,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  actionText: {
    color: colors.background,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  cancelText: {
    color: colors.background,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
}); 