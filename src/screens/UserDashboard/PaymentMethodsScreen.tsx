import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from '../SellerDashboard/components/HeaderWithMenu';
import { scale } from '../../lib/scale';
import Button from '../../components/common/Button';
import { useNavigation } from '@react-navigation/native';

const mockPaymentMethods = [
  {
    id: '1',
    type: 'card',
    brand: 'Visa',
    last4: '4242',
    expiryMonth: '12',
    expiryYear: '2025',
    cardholderName: 'Sarah Johnson',
    isDefault: true,
  },
  {
    id: '2',
    type: 'card',
    brand: 'Mastercard',
    last4: '8888',
    expiryMonth: '08',
    expiryYear: '2026',
    cardholderName: 'Sarah Johnson',
    isDefault: false,
  },
  {
    id: '3',
    type: 'paypal',
    email: 'sarah.johnson@email.com',
    isDefault: false,
  },
];

export default function PaymentMethodsScreen() {
  const navigation = useNavigation();
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [editForm, setEditForm] = useState({
    type: 'card',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    email: '',
  });

  const handleAddPaymentMethod = () => {
    setEditForm({
      type: 'card',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardholderName: '',
      email: '',
    });
    setShowAddModal(true);
  };

  const handleEditPaymentMethod = (method) => {
    setSelectedMethod(method);
    if (method.type === 'card') {
      setEditForm({
        type: 'card',
        cardNumber: `**** **** **** ${method.last4}`,
        expiryMonth: method.expiryMonth,
        expiryYear: method.expiryYear,
        cvv: '',
        cardholderName: method.cardholderName,
        email: '',
      });
    } else {
      setEditForm({
        type: 'paypal',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardholderName: '',
        email: method.email,
      });
    }
    setShowEditModal(true);
  };

  const handleSavePaymentMethod = () => {
    if (editForm.type === 'card') {
      if (!editForm.cardNumber || !editForm.expiryMonth || !editForm.expiryYear || !editForm.cardholderName) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
    } else {
      if (!editForm.email) {
        Alert.alert('Error', 'Please enter your PayPal email');
        return;
      }
    }

    if (showAddModal) {
      const newMethod = {
        id: Date.now().toString(),
        ...editForm,
        isDefault: paymentMethods.length === 0,
      };
      setPaymentMethods([...paymentMethods, newMethod]);
      setShowAddModal(false);
      Alert.alert('Success', 'Payment method added successfully!');
    } else {
      const updatedMethods = paymentMethods.map(method => 
        method.id === selectedMethod.id ? { ...method, ...editForm } : method
      );
      setPaymentMethods(updatedMethods);
      setShowEditModal(false);
      Alert.alert('Success', 'Payment method updated successfully!');
    }
  };

  const handleDeletePaymentMethod = (method) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const updatedMethods = paymentMethods.filter(m => m.id !== method.id);
            setPaymentMethods(updatedMethods);
            Alert.alert('Success', 'Payment method deleted successfully!');
          }
        },
      ]
    );
  };

  const handleSetDefault = (method) => {
    const updatedMethods = paymentMethods.map(m => ({
      ...m,
      isDefault: m.id === method.id,
    }));
    setPaymentMethods(updatedMethods);
    Alert.alert('Success', 'Default payment method updated!');
  };

  const getCardIcon = (brand) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return 'card-outline';
      case 'mastercard':
        return 'card-outline';
      case 'amex':
        return 'card-outline';
      default:
        return 'card-outline';
    }
  };

  const renderPaymentMethodCard = (method) => (
    <View key={method.id} style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <Ionicons 
            name={method.type === 'paypal' ? 'logo-paypal' : getCardIcon(method.brand)} 
            size={24} 
            color={method.type === 'paypal' ? colors.primary : colors.textSecondary} 
          />
          <View style={styles.paymentDetails}>
            {method.type === 'card' ? (
              <>
                <Text style={styles.paymentName}>{method.brand} •••• {method.last4}</Text>
                <Text style={styles.paymentSubtext}>Expires {method.expiryMonth}/{method.expiryYear}</Text>
                <Text style={styles.paymentSubtext}>{method.cardholderName}</Text>
              </>
            ) : (
              <>
                <Text style={styles.paymentName}>PayPal</Text>
                <Text style={styles.paymentSubtext}>{method.email}</Text>
              </>
            )}
          </View>
        </View>
        {method.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>
      
      <View style={styles.paymentActions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleEditPaymentMethod(method)}
        >
          <Ionicons name="pencil-outline" size={16} color={colors.primary} />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        
        {!method.isDefault && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleSetDefault(method)}
          >
            <Ionicons name="star-outline" size={16} color={colors.primary} />
            <Text style={styles.actionButtonText}>Set Default</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={() => handleDeletePaymentMethod(method)}
        >
          <Ionicons name="trash-outline" size={16} color={colors.error} />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPaymentModal = () => (
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
              {showAddModal ? 'Add Payment Method' : 'Edit Payment Method'}
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
            <View style={styles.paymentTypeSelector}>
              <TouchableOpacity 
                style={[
                  styles.typeButton, 
                  editForm.type === 'card' && styles.typeButtonActive
                ]}
                onPress={() => setEditForm({ ...editForm, type: 'card' })}
              >
                <Ionicons name="card-outline" size={20} color={editForm.type === 'card' ? colors.text : colors.textSecondary} />
                <Text style={[styles.typeButtonText, editForm.type === 'card' && styles.typeButtonTextActive]}>
                  Credit Card
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.typeButton, 
                  editForm.type === 'paypal' && styles.typeButtonActive
                ]}
                onPress={() => setEditForm({ ...editForm, type: 'paypal' })}
              >
                <Ionicons name="logo-paypal" size={20} color={editForm.type === 'paypal' ? colors.primary : colors.textSecondary} />
                <Text style={[styles.typeButtonText, editForm.type === 'paypal' && styles.typeButtonTextActive]}>
                  PayPal
                </Text>
              </TouchableOpacity>
            </View>

            {editForm.type === 'card' ? (
              <>
                <Text style={styles.formLabel}>Card Number *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.cardNumber}
                  onChangeText={(text) => setEditForm({ ...editForm, cardNumber: text })}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />

                <Text style={styles.formLabel}>Cardholder Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.cardholderName}
                  onChangeText={(text) => setEditForm({ ...editForm, cardholderName: text })}
                  placeholder="Enter cardholder name"
                  placeholderTextColor={colors.textSecondary}
                />

                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.formLabel}>Expiry Month *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editForm.expiryMonth}
                      onChangeText={(text) => setEditForm({ ...editForm, expiryMonth: text })}
                      placeholder="MM"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={styles.formLabel}>Expiry Year *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editForm.expiryYear}
                      onChangeText={(text) => setEditForm({ ...editForm, expiryYear: text })}
                      placeholder="YYYY"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <Text style={styles.formLabel}>CVV *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.cvv}
                  onChangeText={(text) => setEditForm({ ...editForm, cvv: text })}
                  placeholder="123"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  secureTextEntry
                />
              </>
            ) : (
              <>
                <Text style={styles.formLabel}>PayPal Email *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.email}
                  onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                  placeholder="Enter your PayPal email"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </>
            )}
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
            <TouchableOpacity style={styles.saveButton} onPress={handleSavePaymentMethod}>
              <Text style={styles.saveButtonText}>Save Payment Method</Text>
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
          <Text style={styles.title}>Payment Methods</Text>
        </View>
        <Text style={styles.subtitle}>Manage your payment options</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {paymentMethods.length > 0 ? (
          paymentMethods.map(renderPaymentMethodCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No payment methods found</Text>
            <Text style={styles.emptySubtext}>Add your first payment method</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={handleAddPaymentMethod}>
        <Ionicons name="add" size={24} color={colors.text} />
        <Text style={styles.addButtonText}>Add Payment Method</Text>
      </TouchableOpacity>

      {renderPaymentModal()}
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
  paymentCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.m,
    ...shadows.card,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.s,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentDetails: {
    marginLeft: spacing.m,
    flex: 1,
  },
  paymentName: {
    fontSize: scale(16),
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  paymentSubtext: {
    fontSize: scale(14),
    color: colors.textSecondary,
    marginBottom: spacing.xs,
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
  paymentActions: {
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
  paymentTypeSelector: {
    flexDirection: 'row',
    marginBottom: spacing.l,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  typeButtonTextActive: {
    color: colors.text,
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