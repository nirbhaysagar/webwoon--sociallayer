import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from '../SellerDashboard/components/HeaderWithMenu';
import { scale } from '../../lib/scale';
import Button from '../../components/common/Button';
import { useNavigation } from '@react-navigation/native';

const mockAddresses = [
  {
    id: '1',
    name: 'John Doe',
    street: '123 Main Street',
    apartment: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'United States',
    isDefault: true,
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    street: '456 Oak Avenue',
    apartment: 'Unit 7',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90210',
    country: 'United States',
    isDefault: false,
  },
];

export default function ShippingAddressesScreen() {
  const navigation = useNavigation();
  const [addresses, setAddresses] = useState(mockAddresses);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  const handleAddAddress = () => {
    setEditForm({
      name: '',
      street: '',
      apartment: '',
      city: '',
      state: '',
      zip: '',
      country: '',
    });
    setShowAddModal(true);
  };

  const handleEditAddress = (address) => {
    setSelectedAddress(address);
    setEditForm({
      name: address.name,
      street: address.street,
      apartment: address.apartment,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
    });
    setShowEditModal(true);
  };

  const handleSaveAddress = () => {
    if (!editForm.name || !editForm.street || !editForm.city || !editForm.state || !editForm.zip) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (showAddModal) {
      const newAddress = {
        id: Date.now().toString(),
        ...editForm,
        isDefault: addresses.length === 0,
      };
      setAddresses([...addresses, newAddress]);
      setShowAddModal(false);
      Alert.alert('Success', 'Address added successfully!');
    } else {
      const updatedAddresses = addresses.map(addr => 
        addr.id === selectedAddress.id ? { ...addr, ...editForm } : addr
      );
      setAddresses(updatedAddresses);
      setShowEditModal(false);
      Alert.alert('Success', 'Address updated successfully!');
    }
  };

  const handleDeleteAddress = (address) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const updatedAddresses = addresses.filter(addr => addr.id !== address.id);
            setAddresses(updatedAddresses);
            Alert.alert('Success', 'Address deleted successfully!');
          }
        },
      ]
    );
  };

  const handleSetDefault = (address) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === address.id,
    }));
    setAddresses(updatedAddresses);
    Alert.alert('Success', 'Default address updated!');
  };

  const renderAddressCard = (address) => (
    <View key={address.id} style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <Text style={styles.addressName}>{address.name}</Text>
        {address.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>
      <Text style={styles.addressText}>{address.street}</Text>
      {address.apartment && <Text style={styles.addressText}>{address.apartment}</Text>}
      <Text style={styles.addressText}>{address.city}, {address.state} {address.zip}</Text>
      <Text style={styles.addressText}>{address.country}</Text>
      
      <View style={styles.addressActions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleEditAddress(address)}
        >
          <Ionicons name="pencil-outline" size={16} color={colors.primary} />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        
        {!address.isDefault && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleSetDefault(address)}
          >
            <Ionicons name="star-outline" size={16} color={colors.primary} />
            <Text style={styles.actionButtonText}>Set Default</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={() => handleDeleteAddress(address)}
        >
          <Ionicons name="trash-outline" size={16} color={colors.error} />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAddressModal = () => (
    <Modal
      visible={showAddModal || showEditModal}
      animationType="slide"
      transparent
      onRequestClose={() => {
        setShowAddModal(false);
        setShowEditModal(false);
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {showAddModal ? 'Add New Address' : 'Edit Address'}
            </Text>
            <TouchableOpacity 
              onPress={() => {
                setShowAddModal(false);
                setShowEditModal(false);
              }} 
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <Text style={styles.formLabel}>Full Name *</Text>
            <TextInput
              style={styles.textInput}
              value={editForm.name}
              onChangeText={(text) => setEditForm({ ...editForm, name: text })}
              placeholder="Enter full name"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.formLabel}>Street Address *</Text>
            <TextInput
              style={styles.textInput}
              value={editForm.street}
              onChangeText={(text) => setEditForm({ ...editForm, street: text })}
              placeholder="Enter street address"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.formLabel}>Apartment/Suite</Text>
            <TextInput
              style={styles.textInput}
              value={editForm.apartment}
              onChangeText={(text) => setEditForm({ ...editForm, apartment: text })}
              placeholder="Enter apartment or suite number"
              placeholderTextColor={colors.textSecondary}
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.formLabel}>City *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.city}
                  onChangeText={(text) => setEditForm({ ...editForm, city: text })}
                  placeholder="Enter city"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.formLabel}>State *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.state}
                  onChangeText={(text) => setEditForm({ ...editForm, state: text })}
                  placeholder="Enter state"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.formLabel}>ZIP Code *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.zip}
                  onChangeText={(text) => setEditForm({ ...editForm, zip: text })}
                  placeholder="Enter ZIP code"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.formLabel}>Country *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.country}
                  onChangeText={(text) => setEditForm({ ...editForm, country: text })}
                  placeholder="Enter country"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => {
                setShowAddModal(false);
                setShowEditModal(false);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
              <Text style={styles.saveButtonText}>Save Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithMenu />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Shipping Addresses</Text>
        </View>
        <Text style={styles.subtitle}>Manage your delivery addresses</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {addresses.length > 0 ? (
          addresses.map(renderAddressCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No addresses found</Text>
            <Text style={styles.emptySubtext}>Add your first shipping address</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
        <Ionicons name="add" size={24} color={colors.text} />
        <Text style={styles.addButtonText}>Add New Address</Text>
      </TouchableOpacity>

      {renderAddressModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.m,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  backButton: {
    padding: spacing.s,
    marginRight: spacing.s,
  },
  title: {
    fontSize: scale(24),
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  subtitle: {
    fontSize: scale(16),
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.m,
  },
  addressCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.m,
    ...shadows.card,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  addressName: {
    fontSize: scale(18),
    fontWeight: '700',
    color: colors.text,
  },
  defaultBadge: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
  },
  defaultText: {
    fontSize: scale(12),
    fontWeight: '600',
    color: colors.text,
  },
  addressText: {
    fontSize: scale(14),
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.m,
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.s,
  },
  actionButtonText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  deleteButton: {
    marginLeft: 'auto',
  },
  deleteButtonText: {
    color: colors.error,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.medium,
    padding: spacing.m,
    margin: spacing.m,
    ...shadows.card,
  },
  addButtonText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.s,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: scale(18),
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  emptySubtext: {
    fontSize: scale(14),
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: radii.large,
    width: '90%',
    maxHeight: '80%',
    ...shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: scale(20),
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: spacing.s,
  },
  formContainer: {
    padding: spacing.l,
  },
  formLabel: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.s,
    marginTop: spacing.m,
  },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: radii.medium,
    padding: spacing.m,
    fontSize: scale(16),
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.s,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  modalActions: {
    flexDirection: 'row',
    padding: spacing.l,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginRight: spacing.s,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginLeft: spacing.s,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.text,
  },
}); 