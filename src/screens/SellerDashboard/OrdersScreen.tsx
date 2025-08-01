import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from './components/HeaderWithMenu';
import Toast from 'react-native-toast-message';
import { scale, verticalScale, moderateScale } from '../../lib/scale';

const TABS = ['New', 'Shipped', 'Cancelled', 'All'];
const mockOrders = [
  {
    id: '1',
    customer: 'Alice Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    items: '2x Sneakers, 1x Cap',
    total: '$180',
    status: 'New',
    date: '2024-06-01',
    address: '123 Main St, NY',
    phone: '+1 555-1234',
    email: 'alice@email.com',
  },
  {
    id: '2',
    customer: 'Bob Smith',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    items: '1x Handbag',
    total: '$90',
    status: 'Shipped',
    date: '2024-05-30',
    address: '456 Oak Ave, LA',
    phone: '+1 555-5678',
    email: 'bob@email.com',
  },
  {
    id: '3',
    customer: 'Cathy Lee',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    items: '1x Dress',
    total: '$60',
    status: 'Cancelled',
    date: '2024-05-28',
    address: '789 Pine Rd, SF',
    phone: '+1 555-9012',
    email: 'cathy@email.com',
  },
];

const statusColors = {
  New: colors.primary,
  Shipped: colors.secondary,
  Cancelled: colors.discount,
  All: colors.textSecondary,
};

export default function OrdersScreen() {
  const [selectedTab, setSelectedTab] = useState('New');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const filteredOrders = mockOrders.filter(
    o => (selectedTab === 'All' || o.status === selectedTab) &&
      (o.customer.toLowerCase().includes(search.toLowerCase()) || o.items.toLowerCase().includes(search.toLowerCase()))
  );

  const handleFulfill = async (order) => {
    setLoading(true);
    try {
      await new Promise(res => setTimeout(res, 1000));
      Toast.show({ type: 'success', text1: 'Order marked as fulfilled!' });
      setSelectedOrder(null);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to fulfill order' });
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (order) => {
    setLoading(true);
    try {
      await new Promise(res => setTimeout(res, 1000));
      Toast.show({ type: 'success', text1: 'Order deleted!' });
      setSelectedOrder(null);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to delete order' });
    } finally {
      setLoading(false);
    }
  };
  const handleRefund = async (order) => {
    setLoading(true);
    try {
      await new Promise(res => setTimeout(res, 1000));
      Toast.show({ type: 'success', text1: 'Order refunded!' });
      setSelectedOrder(null);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to refund order' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderWithMenu />
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
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.orderCard} onPress={() => setSelectedOrder(item)}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.customer}>{item.customer}</Text>
              <Text style={styles.items}>{item.items}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
            <View style={styles.rightCol}>
              <Text style={[styles.statusBadge, { backgroundColor: statusColors[item.status] + '22', color: statusColors[item.status] }]}>{item.status}</Text>
              <Text style={styles.total}>{item.total}</Text>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.secondary} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No orders found.</Text>}
      />
      <Modal visible={!!selectedOrder} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <>
                <View style={styles.modalHeader}>
                  <Image source={{ uri: selectedOrder.avatar }} style={styles.modalAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalCustomer}>{selectedOrder.customer}</Text>
                    <Text style={styles.modalStatus}>{selectedOrder.status}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedOrder(null)}>
                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalLabel}>Order Items</Text>
                <Text style={styles.modalValue}>{selectedOrder.items}</Text>
                <Text style={styles.modalLabel}>Total</Text>
                <Text style={styles.modalValue}>{selectedOrder.total}</Text>
                <Text style={styles.modalLabel}>Shipping Address</Text>
                <Text style={styles.modalValue}>{selectedOrder.address}</Text>
                <Text style={styles.modalLabel}>Contact</Text>
                <Text style={styles.modalValue}>{selectedOrder.phone} | {selectedOrder.email}</Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.fulfillBtn} onPress={() => handleFulfill(selectedOrder)}>
                    <Ionicons name="checkmark-circle-outline" size={20} color={colors.background} />
                    <Text style={styles.fulfillText}>Mark as Fulfilled</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.messageBtn}>
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.secondary} />
                    <Text style={styles.messageText}>Message Buyer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(selectedOrder)}>
                    <Ionicons name="trash-outline" size={20} color={colors.background} />
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.refundBtn} onPress={() => handleRefund(selectedOrder)}>
                    <Ionicons name="refresh-outline" size={20} color={colors.background} />
                    <Text style={styles.refundText}>Refund</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
      {loading && <></>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingTop: spacing.m,
    paddingBottom: spacing.s,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: scale(24),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.medium,
    marginRight: spacing.m,
  },
  customer: {
    fontSize: scale(16),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: 2,
  },
  items: {
    fontSize: scale(14),
    color: colors.textSecondary,
    marginBottom: 2,
  },
  date: {
    fontSize: scale(13),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.disabled,
  },
  rightCol: {
    alignItems: 'flex-end',
    marginLeft: spacing.m,
  },
  statusBadge: {
    fontSize: scale(13),
    fontWeight: 'bold',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  total: {
    fontSize: scale(16),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.primary,
  },
  actionBtn: {
    backgroundColor: colors.background,
    borderRadius: radii.circle,
    padding: 6,
    ...shadows.card,
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
    backgroundColor: colors.discount,
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
}); 