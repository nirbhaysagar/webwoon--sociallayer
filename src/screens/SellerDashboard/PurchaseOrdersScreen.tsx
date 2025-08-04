import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import inventoryService, { PurchaseOrder, Supplier, InventoryItem } from '../../services/inventoryService';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../config/supabase';

interface PurchaseOrdersScreenProps {
  navigation: any;
}

export default function PurchaseOrdersScreen({ navigation }: PurchaseOrdersScreenProps) {
  const { state } = useApp();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const sellerId = state.user?.id || 'seller-1';

  // Form state for creating new PO
  const [formData, setFormData] = useState({
    supplier_id: '',
    expected_delivery_date: '',
    notes: ''
  });

  // Order items state
  const [orderItems, setOrderItems] = useState<Array<{
    product_id: number;
    quantity_ordered: number;
    unit_cost: number;
    notes: string;
  }>>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      // If user is not authenticated, use mock data for demonstration
      if (!user) {
        console.log('User not authenticated, using mock purchase order data');
        const mockPurchaseOrders = [
          {
            id: 'po-1',
            seller_id: 'mock-seller-id',
            supplier_id: 'supplier-1',
            order_number: 'PO-2024-001',
            status: 'confirmed' as const,
            order_date: new Date(Date.now() - 86400000).toISOString(),
            expected_delivery_date: new Date(Date.now() + 604800000).toISOString(),
            total_amount: 2500.00,
            notes: 'Electronics components for new product line',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            supplier: {
              id: 'supplier-1',
              seller_id: 'mock-seller-id',
              name: 'Tech Supplies Co.',
              contact_person: 'John Smith',
              email: 'john@techsupplies.com',
              phone: '+1-555-0123',
              address: '123 Tech Street, Silicon Valley, CA',
              website: 'https://techsupplies.com',
              payment_terms: 'Net 30',
              lead_time_days: 7,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          },
          {
            id: 'po-2',
            seller_id: 'mock-seller-id',
            supplier_id: 'supplier-2',
            order_number: 'PO-2024-002',
            status: 'draft' as const,
            order_date: new Date().toISOString(),
            expected_delivery_date: new Date(Date.now() + 1209600000).toISOString(),
            total_amount: 1800.00,
            notes: 'Raw materials for manufacturing',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            supplier: {
              id: 'supplier-2',
              seller_id: 'mock-seller-id',
              name: 'Global Electronics',
              contact_person: 'Sarah Johnson',
              email: 'sarah@globalelectronics.com',
              phone: '+1-555-0456',
              address: '456 Electronics Blvd, Austin, TX',
              website: 'https://globalelectronics.com',
              payment_terms: 'Net 45',
              lead_time_days: 14,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          },
          {
            id: 'po-3',
            seller_id: 'mock-seller-id',
            supplier_id: 'supplier-3',
            order_number: 'PO-2024-003',
            status: 'received' as const,
            order_date: new Date(Date.now() - 172800000).toISOString(),
            expected_delivery_date: new Date(Date.now() - 86400000).toISOString(),
            actual_delivery_date: new Date(Date.now() - 86400000).toISOString(),
            total_amount: 3200.00,
            notes: 'Quality parts for assembly',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            supplier: {
              id: 'supplier-3',
              seller_id: 'mock-seller-id',
              name: 'Quality Parts Inc.',
              contact_person: 'Mike Chen',
              email: 'mike@qualityparts.com',
              phone: '+1-555-0789',
              address: '789 Quality Ave, Seattle, WA',
              website: 'https://qualityparts.com',
              payment_terms: 'Net 30',
              lead_time_days: 5,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          }
        ];
        
        const mockSuppliers = [
          {
            id: 'supplier-1',
            seller_id: 'mock-seller-id',
            name: 'Tech Supplies Co.',
            contact_person: 'John Smith',
            email: 'john@techsupplies.com',
            phone: '+1-555-0123',
            address: '123 Tech Street, Silicon Valley, CA',
            website: 'https://techsupplies.com',
            payment_terms: 'Net 30',
            lead_time_days: 7,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'supplier-2',
            seller_id: 'mock-seller-id',
            name: 'Global Electronics',
            contact_person: 'Sarah Johnson',
            email: 'sarah@globalelectronics.com',
            phone: '+1-555-0456',
            address: '456 Electronics Blvd, Austin, TX',
            website: 'https://globalelectronics.com',
            payment_terms: 'Net 45',
            lead_time_days: 14,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'supplier-3',
            seller_id: 'mock-seller-id',
            name: 'Quality Parts Inc.',
            contact_person: 'Mike Chen',
            email: 'mike@qualityparts.com',
            phone: '+1-555-0789',
            address: '789 Quality Ave, Seattle, WA',
            website: 'https://qualityparts.com',
            payment_terms: 'Net 30',
            lead_time_days: 5,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        const mockInventoryItems = [
          {
            id: 'inv-1',
            product_id: 1,
            seller_id: 'mock-seller-id',
            quantity_available: 45,
            quantity_reserved: 5,
            quantity_on_hold: 0,
            low_stock_threshold: 10,
            reorder_point: 5,
            reorder_quantity: 50,
            unit_cost: 25.00,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product: {
              id: 1,
              name: 'Wireless Headphones',
              price: 89.99,
              image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80'
            }
          },
          {
            id: 'inv-2',
            product_id: 2,
            seller_id: 'mock-seller-id',
            quantity_available: 12,
            quantity_reserved: 3,
            quantity_on_hold: 0,
            low_stock_threshold: 15,
            reorder_point: 10,
            reorder_quantity: 100,
            unit_cost: 15.00,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product: {
              id: 2,
              name: 'Smartphone Case',
              price: 24.99,
              image_url: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=400&q=80'
            }
          }
        ];
        
        setPurchaseOrders(mockPurchaseOrders);
        setSuppliers(mockSuppliers);
        setInventoryItems(mockInventoryItems);
        return;
      }

      const [ordersData, suppliersData, inventoryData] = await Promise.all([
        inventoryService.getPurchaseOrders(sellerId),
        inventoryService.getSuppliers(sellerId),
        inventoryService.getInventoryItems(sellerId)
      ]);

      setPurchaseOrders(ordersData);
      setSuppliers(suppliersData);
      setInventoryItems(inventoryData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const resetForm = () => {
    setFormData({
      supplier_id: '',
      expected_delivery_date: '',
      notes: ''
    });
    setOrderItems([]);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, {
      product_id: 0,
      quantity_ordered: 1,
      unit_cost: 0,
      notes: ''
    }]);
  };

  const updateOrderItem = (index: number, field: string, value: any) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setOrderItems(updatedItems);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleCreatePurchaseOrder = async () => {
    if (!formData.supplier_id) {
      Alert.alert('Error', 'Please select a supplier');
      return;
    }

    if (orderItems.length === 0) {
      Alert.alert('Error', 'Please add at least one item');
      return;
    }

    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // For demo purposes, show success message even without authentication
        const totalAmount = orderItems.reduce((sum, item) => sum + (item.quantity_ordered * item.unit_cost), 0);
        
        Alert.alert(
          'Success', 
          'Purchase order created successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                setShowCreateModal(false);
                resetForm();
                
                // Add the new purchase order to local state for demo
                const newPurchaseOrder = {
                  id: `demo-po-${Date.now()}`,
                  seller_id: 'mock-seller-id',
                  supplier_id: formData.supplier_id,
                  order_number: `PO-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                  status: 'draft' as const,
                  order_date: new Date().toISOString(),
                  expected_delivery_date: formData.expected_delivery_date || null,
                  total_amount: totalAmount,
                  notes: formData.notes,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  supplier: suppliers.find(s => s.id === formData.supplier_id)
                };
                
                setPurchaseOrders(prev => [newPurchaseOrder, ...prev]);
              }
            }
          ]
        );
        return;
      }

      const totalAmount = orderItems.reduce((sum, item) => sum + (item.quantity_ordered * item.unit_cost), 0);
      
      const purchaseOrderData = {
        seller_id: user.id, // Use the authenticated user's ID
        supplier_id: formData.supplier_id,
        expected_delivery_date: formData.expected_delivery_date || null,
        notes: formData.notes,
        total_amount: totalAmount,
        status: 'draft'
      };

      const result = await inventoryService.createPurchaseOrder(purchaseOrderData);
      
      if (result) {
        Alert.alert('Success', 'Purchase order created successfully');
        setShowCreateModal(false);
        resetForm();
        loadData();
      } else {
        Alert.alert('Error', 'Failed to create purchase order');
      }
    } catch (error) {
      console.error('Error creating purchase order:', error);
      Alert.alert('Error', 'Failed to create purchase order');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return colors.textSecondary;
      case 'sent': return colors.info;
      case 'confirmed': return colors.warning;
      case 'received': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return 'document-outline';
      case 'sent': return 'send-outline';
      case 'confirmed': return 'checkmark-circle-outline';
      case 'received': return 'checkmark-done-circle-outline';
      case 'cancelled': return 'close-circle-outline';
      default: return 'document-outline';
    }
  };

  const filteredOrders = purchaseOrders.filter(order => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.supplier?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const renderPurchaseOrderCard = (order: PurchaseOrder) => (
    <TouchableOpacity 
      key={order.id} 
      style={styles.orderCard}
      onPress={() => navigation.navigate('PurchaseOrderDetail', { orderId: order.id })}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>{order.order_number}</Text>
          <Text style={styles.orderDate}>
            {new Date(order.order_date).toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
          <Ionicons name={getStatusIcon(order.status) as any} size={16} color={getStatusColor(order.status)} />
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {order.status.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="business-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{order.supplier?.name || 'Unknown Supplier'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>${order.total_amount.toLocaleString()}</Text>
        </View>
        
        {order.expected_delivery_date && (
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              Expected: {new Date(order.expected_delivery_date).toLocaleDateString()}
            </Text>
          </View>
        )}
        
        {order.items && order.items.length > 0 && (
          <View style={styles.detailRow}>
            <Ionicons name="cube-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>{order.items.length} items</Text>
          </View>
        )}
      </View>
      
      {order.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesText} numberOfLines={2}>{order.notes}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCreateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Purchase Order</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Supplier *</Text>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerText}>
                  {formData.supplier_id ? 
                    suppliers.find(s => s.id === formData.supplier_id)?.name : 
                    'Select supplier'
                  }
                </Text>
                <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
              </View>
              {suppliers.map(supplier => (
                <TouchableOpacity
                  key={supplier.id}
                  style={[
                    styles.supplierOption,
                    formData.supplier_id === supplier.id && styles.supplierOptionSelected
                  ]}
                  onPress={() => setFormData({...formData, supplier_id: supplier.id})}
                >
                  <Text style={[
                    styles.supplierOptionText,
                    formData.supplier_id === supplier.id && styles.supplierOptionTextSelected
                  ]}>
                    {supplier.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Expected Delivery Date</Text>
              <TextInput
                style={styles.textInput}
                value={formData.expected_delivery_date}
                onChangeText={(text) => setFormData({...formData, expected_delivery_date: text})}
                placeholder="YYYY-MM-DD"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData({...formData, notes: text})}
                placeholder="Add notes..."
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View style={styles.itemsSection}>
              <View style={styles.itemsHeader}>
                <Text style={styles.itemsTitle}>Order Items</Text>
                <TouchableOpacity style={styles.addItemButton} onPress={addOrderItem}>
                  <Ionicons name="add" size={16} color={colors.primary} />
                  <Text style={styles.addItemText}>Add Item</Text>
                </TouchableOpacity>
              </View>
              
              {orderItems.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>Item {index + 1}</Text>
                    <TouchableOpacity onPress={() => removeOrderItem(index)}>
                      <Ionicons name="trash" size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.itemInputs}>
                    <View style={styles.inputRow}>
                      <View style={styles.inputHalf}>
                        <Text style={styles.inputLabel}>Product</Text>
                        <View style={styles.pickerContainer}>
                          <Text style={styles.pickerText}>
                            {item.product_id ? 
                              inventoryItems.find(p => p.product_id === item.product_id)?.product?.name : 
                              'Select product'
                            }
                          </Text>
                          <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                        </View>
                      </View>
                      <View style={styles.inputHalf}>
                        <Text style={styles.inputLabel}>Quantity</Text>
                        <TextInput
                          style={styles.textInput}
                          value={item.quantity_ordered.toString()}
                          onChangeText={(text) => updateOrderItem(index, 'quantity_ordered', parseInt(text) || 0)}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                    
                    <View style={styles.inputRow}>
                      <View style={styles.inputHalf}>
                        <Text style={styles.inputLabel}>Unit Cost</Text>
                        <TextInput
                          style={styles.textInput}
                          value={item.unit_cost.toString()}
                          onChangeText={(text) => updateOrderItem(index, 'unit_cost', parseFloat(text) || 0)}
                          keyboardType="numeric"
                        />
                      </View>
                      <View style={styles.inputHalf}>
                        <Text style={styles.inputLabel}>Total</Text>
                        <Text style={styles.totalText}>
                          ${(item.quantity_ordered * item.unit_cost).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                    
                    <TextInput
                      style={styles.textInput}
                      value={item.notes}
                      onChangeText={(text) => updateOrderItem(index, 'notes', text)}
                      placeholder="Item notes..."
                    />
                  </View>
                </View>
              ))}
              
              {orderItems.length > 0 && (
                <View style={styles.orderTotal}>
                  <Text style={styles.totalLabel}>Order Total:</Text>
                  <Text style={styles.totalAmount}>
                    ${orderItems.reduce((sum, item) => sum + (item.quantity_ordered * item.unit_cost), 0).toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleCreatePurchaseOrder}
            >
              <Text style={styles.saveButtonText}>Create Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="document-text-outline" size={48} color={colors.primary} />
        <Text style={styles.loadingText}>Loading purchase orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Purchase Orders</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchTextInput}
            placeholder="Search orders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Status Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statusFilter}
        contentContainerStyle={styles.statusFilterContent}
      >
        {(['all', 'draft', 'sent', 'confirmed', 'received', 'cancelled'] as const).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusButton,
              selectedStatus === status && styles.statusButtonActive
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text style={[
              styles.statusButtonText,
              selectedStatus === status && styles.statusButtonTextActive
            ]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{purchaseOrders.length}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              ${purchaseOrders.reduce((sum, order) => sum + order.total_amount, 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Value</Text>
          </View>
        </View>

        <View style={styles.ordersList}>
          {filteredOrders.length > 0 ? (
            filteredOrders.map(renderPurchaseOrderCard)
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                {searchQuery || selectedStatus !== 'all' ? 'No orders found' : 'No purchase orders yet'}
              </Text>
              {!searchQuery && selectedStatus === 'all' && (
                <TouchableOpacity 
                  style={styles.addFirstButton}
                  onPress={openCreateModal}
                >
                  <Text style={styles.addFirstButtonText}>Create First Order</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {renderCreateModal()}
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.sizes.lg,
    ...typography.weights.semibold,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchTextInput: {
    flex: 1,
    marginLeft: spacing.sm,
    ...typography.sizes.sm,
    color: colors.text,
  },
  statusFilter: {
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
  },
  statusFilterContent: {
    paddingHorizontal: spacing.md,
  },
  statusButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    marginRight: spacing.sm,
    backgroundColor: colors.gray[100],
  },
  statusButtonActive: {
    backgroundColor: colors.primary,
  },
  statusButtonText: {
    ...typography.sizes.sm,
    ...typography.weights.medium,
    color: colors.textSecondary,
  },
  statusButtonTextActive: {
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    ...shadows.sm,
  },
  statValue: {
    ...typography.sizes.xl,
    ...typography.weights.bold,
    color: colors.primary,
  },
  statLabel: {
    ...typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  ordersList: {
    padding: spacing.md,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    ...typography.sizes.md,
    ...typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  orderDate: {
    ...typography.sizes.sm,
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
  },
  statusText: {
    ...typography.sizes.xs,
    ...typography.weights.medium,
    marginLeft: spacing.xs,
  },
  orderDetails: {
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailText: {
    ...typography.sizes.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  notesContainer: {
    backgroundColor: colors.gray[50],
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  notesText: {
    ...typography.sizes.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  addFirstButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  addFirstButtonText: {
    ...typography.sizes.sm,
    ...typography.weights.medium,
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    width: '90%',
    maxHeight: '90%',
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.sizes.lg,
    ...typography.weights.semibold,
    color: colors.text,
  },
  formContainer: {
    padding: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.sizes.sm,
    ...typography.weights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pickerText: {
    ...typography.sizes.sm,
    color: colors.text,
  },
  supplierOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  supplierOptionSelected: {
    backgroundColor: colors.primary + '10',
  },
  supplierOptionText: {
    ...typography.sizes.sm,
    color: colors.text,
  },
  supplierOptionTextSelected: {
    color: colors.primary,
    ...typography.weights.medium,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.sizes.sm,
    color: colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  itemsSection: {
    marginTop: spacing.lg,
  },
  itemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  itemsTitle: {
    ...typography.sizes.md,
    ...typography.weights.semibold,
    color: colors.text,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  addItemText: {
    ...typography.sizes.sm,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  itemRow: {
    backgroundColor: colors.gray[50],
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  itemTitle: {
    ...typography.sizes.sm,
    ...typography.weights.medium,
    color: colors.text,
  },
  itemInputs: {
    gap: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inputHalf: {
    flex: 1,
  },
  totalText: {
    ...typography.sizes.sm,
    ...typography.weights.medium,
    color: colors.primary,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  orderTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary + '10',
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  totalLabel: {
    ...typography.sizes.md,
    ...typography.weights.medium,
    color: colors.text,
  },
  totalAmount: {
    ...typography.sizes.lg,
    ...typography.weights.bold,
    color: colors.primary,
  },
  modalActions: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  cancelButtonText: {
    ...typography.sizes.sm,
    ...typography.weights.medium,
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  saveButtonText: {
    ...typography.sizes.sm,
    ...typography.weights.medium,
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
}); 