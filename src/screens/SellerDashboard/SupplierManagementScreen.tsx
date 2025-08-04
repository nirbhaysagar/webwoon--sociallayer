import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import inventoryService, { Supplier } from '../../services/inventoryService';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../config/supabase';

interface SupplierManagementScreenProps {
  navigation: any;
}

export default function SupplierManagementScreen({ navigation }: SupplierManagementScreenProps) {
  const { state } = useApp();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const sellerId = state.user?.id || 'seller-1';

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    payment_terms: '',
    lead_time_days: '7'
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      // If user is not authenticated, use mock data for demonstration
      if (!user) {
        console.log('User not authenticated, using mock supplier data');
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
        setSuppliers(mockSuppliers);
        return;
      }

      const data = await inventoryService.getSuppliers(sellerId);
      setSuppliers(data);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      Alert.alert('Error', 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSuppliers();
    setRefreshing(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      payment_terms: '',
      lead_time_days: '7'
    });
    setEditingSupplier(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setFormData({
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      website: supplier.website || '',
      payment_terms: supplier.payment_terms || '',
      lead_time_days: supplier.lead_time_days.toString()
    });
    setEditingSupplier(supplier);
    setShowAddModal(true);
  };

  const handleSaveSupplier = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Supplier name is required');
      return;
    }

    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // For demo purposes, show success message even without authentication
        Alert.alert(
          'Success', 
          `Supplier ${editingSupplier ? 'updated' : 'added'} successfully!`,
          [
            {
              text: 'OK',
              onPress: () => {
                setShowAddModal(false);
                // Add the new supplier to the local state for demo
                const newSupplier = {
                  id: `demo-${Date.now()}`,
                  seller_id: 'mock-seller-id',
                  name: formData.name,
                  contact_person: formData.contact_person,
                  email: formData.email,
                  phone: formData.phone,
                  address: formData.address,
                  website: formData.website,
                  payment_terms: formData.payment_terms,
                  lead_time_days: parseInt(formData.lead_time_days) || 7,
                  is_active: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                };
                
                if (editingSupplier) {
                  setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? newSupplier : s));
                } else {
                  setSuppliers(prev => [newSupplier, ...prev]);
                }
              }
            }
          ]
        );
        return;
      }

      const supplierData = {
        ...formData,
        seller_id: user.id, // Use the authenticated user's ID
        lead_time_days: parseInt(formData.lead_time_days) || 7,
        is_active: true
      };

      if (editingSupplier) {
        // Update existing supplier
        const updatedSupplier = await inventoryService.saveSupplier({
          id: editingSupplier.id,
          ...supplierData
        });
        
        if (updatedSupplier) {
          setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? updatedSupplier : s));
          Alert.alert('Success', 'Supplier updated successfully');
        }
      } else {
        // Add new supplier
        const newSupplier = await inventoryService.saveSupplier(supplierData);
        
        if (newSupplier) {
          setSuppliers(prev => [newSupplier, ...prev]);
          Alert.alert('Success', 'Supplier added successfully');
        }
      }

      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving supplier:', error);
      Alert.alert('Error', 'Failed to save supplier');
    }
  };

  const handleDeleteSupplier = (supplier: Supplier) => {
    Alert.alert(
      'Delete Supplier',
      `Are you sure you want to delete ${supplier.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteSupplier(supplier.id) }
      ]
    );
  };

  const deleteSupplier = async (supplierId: string) => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // For demo purposes, show success message even without authentication
        Alert.alert(
          'Success', 
          'Supplier deleted successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Remove the supplier from local state for demo
                setSuppliers(prev => prev.filter(s => s.id !== supplierId));
              }
            }
          ]
        );
        return;
      }

      const success = await inventoryService.deleteSupplier(supplierId);
      
      if (success) {
        setSuppliers(prev => prev.filter(s => s.id !== supplierId));
        Alert.alert('Success', 'Supplier deleted successfully');
      } else {
        Alert.alert('Error', 'Failed to delete supplier');
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      Alert.alert('Error', 'Failed to delete supplier');
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSupplierCard = (supplier: Supplier) => (
    <View key={supplier.id} style={styles.supplierCard}>
      <View style={styles.supplierHeader}>
        <View style={styles.supplierInfo}>
          <Text style={styles.supplierName}>{supplier.name}</Text>
          <Text style={styles.supplierContact}>
            {supplier.contact_person && `${supplier.contact_person} • `}
            {supplier.email}
          </Text>
        </View>
        <View style={styles.supplierActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => openEditModal(supplier)}
          >
            <Ionicons name="pencil" size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDeleteSupplier(supplier)}
          >
            <Ionicons name="trash" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.supplierDetails}>
        {supplier.phone && (
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>{supplier.phone}</Text>
          </View>
        )}
        
        {supplier.website && (
          <View style={styles.detailRow}>
            <Ionicons name="globe-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>{supplier.website}</Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{supplier.lead_time_days} days lead time</Text>
        </View>
        
        {supplier.payment_terms && (
          <View style={styles.detailRow}>
            <Ionicons name="card-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>{supplier.payment_terms}</Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.viewProductsButton}
        onPress={() => navigation.navigate('SupplierProducts', { supplierId: supplier.id })}
      >
        <Text style={styles.viewProductsText}>View Products</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderAddModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
            </Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Supplier Name *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
                placeholder="Enter supplier name"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contact Person</Text>
              <TextInput
                style={styles.textInput}
                value={formData.contact_person}
                onChangeText={(text) => setFormData({...formData, contact_person: text})}
                placeholder="Enter contact person name"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
                placeholder="Enter email address"
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.textInput}
                value={formData.phone}
                onChangeText={(text) => setFormData({...formData, phone: text})}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.address}
                onChangeText={(text) => setFormData({...formData, address: text})}
                placeholder="Enter address"
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Website</Text>
              <TextInput
                style={styles.textInput}
                value={formData.website}
                onChangeText={(text) => setFormData({...formData, website: text})}
                placeholder="Enter website URL"
                keyboardType="url"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Payment Terms</Text>
              <TextInput
                style={styles.textInput}
                value={formData.payment_terms}
                onChangeText={(text) => setFormData({...formData, payment_terms: text})}
                placeholder="e.g., Net 30, COD"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Lead Time (Days)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.lead_time_days}
                onChangeText={(text) => setFormData({...formData, lead_time_days: text})}
                placeholder="7"
                keyboardType="numeric"
              />
            </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveSupplier}
            >
              <Text style={styles.saveButtonText}>
                {editingSupplier ? 'Update' : 'Add'} Supplier
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="people-outline" size={48} color={colors.primary} />
        <Text style={styles.loadingText}>Loading suppliers...</Text>
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
        <Text style={styles.headerTitle}>Supplier Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchTextInput}
            placeholder="Search suppliers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

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
            <Text style={styles.statValue}>{suppliers.length}</Text>
            <Text style={styles.statLabel}>Total Suppliers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {suppliers.filter(s => s.is_active).length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        <View style={styles.suppliersList}>
          {filteredSuppliers.length > 0 ? (
            filteredSuppliers.map(renderSupplierCard)
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No suppliers found' : 'No suppliers yet'}
              </Text>
              {!searchQuery && (
                <TouchableOpacity 
                  style={styles.addFirstButton}
                  onPress={openAddModal}
                >
                  <Text style={styles.addFirstButtonText}>Add First Supplier</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {renderAddModal()}
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
  suppliersList: {
    padding: spacing.md,
  },
  supplierCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  supplierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    ...typography.sizes.md,
    ...typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  supplierContact: {
    ...typography.sizes.sm,
    color: colors.textSecondary,
  },
  supplierActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  supplierDetails: {
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
  viewProductsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary + '10',
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  viewProductsText: {
    ...typography.sizes.sm,
    ...typography.weights.medium,
    color: colors.primary,
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
    maxHeight: '80%',
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