import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert,
  SafeAreaView, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';

export default function CheckoutScreen({ route, navigation }) {
  const { cartItems, subtotal, tax, shipping, total } = route.params;

  const [activeStep, setActiveStep] = useState(1); // 1: Address, 2: Payment, 3: Review
  const [loading, setLoading] = useState(false);

  // Address form state
  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });

  // Payment form state
  const [payment, setPayment] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');

  const handleAddressSubmit = () => {
    // Validate address
    if (!address.firstName || !address.lastName || !address.email || 
        !address.phone || !address.street || !address.city || 
        !address.state || !address.zipCode) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    setActiveStep(2);
  };

  const handlePaymentSubmit = () => {
    // Validate payment
    if (selectedPaymentMethod === 'card') {
      if (!payment.cardNumber || !payment.expiryDate || !payment.cvv || !payment.cardholderName) {
        Alert.alert('Error', 'Please fill in all payment details');
        return;
      }
    }
    setActiveStep(3);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Order Placed Successfully!',
        'Your order has been confirmed. You will receive an email confirmation shortly.',
        [
          {
            text: 'View Orders',
            onPress: () => navigation.navigate('OrderHistory')
          },
          {
            text: 'Continue Shopping',
            onPress: () => navigation.navigate('UserHome')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderAddressForm = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>1</Text>
        </View>
        <Text style={styles.stepTitle}>Shipping Address</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>First Name *</Text>
            <TextInput
              style={styles.textInput}
              value={address.firstName}
              onChangeText={(text) => setAddress({...address, firstName: text})}
              placeholder="Enter first name"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>Last Name *</Text>
            <TextInput
              style={styles.textInput}
              value={address.lastName}
              onChangeText={(text) => setAddress({...address, lastName: text})}
              placeholder="Enter last name"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email *</Text>
          <TextInput
            style={styles.textInput}
            value={address.email}
            onChangeText={(text) => setAddress({...address, email: text})}
            placeholder="Enter email address"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone *</Text>
          <TextInput
            style={styles.textInput}
            value={address.phone}
            onChangeText={(text) => setAddress({...address, phone: text})}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Street Address *</Text>
          <TextInput
            style={styles.textInput}
            value={address.street}
            onChangeText={(text) => setAddress({...address, street: text})}
            placeholder="Enter street address"
          />
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>City *</Text>
            <TextInput
              style={styles.textInput}
              value={address.city}
              onChangeText={(text) => setAddress({...address, city: text})}
              placeholder="Enter city"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>State *</Text>
            <TextInput
              style={styles.textInput}
              value={address.state}
              onChangeText={(text) => setAddress({...address, state: text})}
              placeholder="Enter state"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>ZIP Code *</Text>
            <TextInput
              style={styles.textInput}
              value={address.zipCode}
              onChangeText={(text) => setAddress({...address, zipCode: text})}
              placeholder="Enter ZIP code"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>Country</Text>
            <TextInput
              style={styles.textInput}
              value={address.country}
              onChangeText={(text) => setAddress({...address, country: text})}
              placeholder="Enter country"
            />
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleAddressSubmit}>
        <Text style={styles.nextButtonText}>Continue to Payment</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderPaymentForm = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>2</Text>
        </View>
        <Text style={styles.stepTitle}>Payment Method</Text>
      </View>

      <View style={styles.paymentMethods}>
        <TouchableOpacity
          style={[styles.paymentMethod, selectedPaymentMethod === 'card' && styles.selectedPaymentMethod]}
          onPress={() => setSelectedPaymentMethod('card')}
        >
          <Ionicons name="card-outline" size={24} color={selectedPaymentMethod === 'card' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.paymentMethodText, selectedPaymentMethod === 'card' && styles.selectedPaymentMethodText]}>
            Credit/Debit Card
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.paymentMethod, selectedPaymentMethod === 'paypal' && styles.selectedPaymentMethod]}
          onPress={() => setSelectedPaymentMethod('paypal')}
        >
          <Ionicons name="logo-paypal" size={24} color={selectedPaymentMethod === 'paypal' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.paymentMethodText, selectedPaymentMethod === 'paypal' && styles.selectedPaymentMethodText]}>
            PayPal
          </Text>
        </TouchableOpacity>
      </View>

      {selectedPaymentMethod === 'card' && (
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Card Number *</Text>
            <TextInput
              style={styles.textInput}
              value={payment.cardNumber}
              onChangeText={(text) => setPayment({...payment, cardNumber: text})}
              placeholder="1234 5678 9012 3456"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Expiry Date *</Text>
              <TextInput
                style={styles.textInput}
                value={payment.expiryDate}
                onChangeText={(text) => setPayment({...payment, expiryDate: text})}
                placeholder="MM/YY"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>CVV *</Text>
              <TextInput
                style={styles.textInput}
                value={payment.cvv}
                onChangeText={(text) => setPayment({...payment, cvv: text})}
                placeholder="123"
                keyboardType="numeric"
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cardholder Name *</Text>
            <TextInput
              style={styles.textInput}
              value={payment.cardholderName}
              onChangeText={(text) => setPayment({...payment, cardholderName: text})}
              placeholder="Enter cardholder name"
            />
          </View>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => setActiveStep(1)}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handlePaymentSubmit}>
          <Text style={styles.nextButtonText}>Review Order</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOrderReview = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>3</Text>
        </View>
        <Text style={styles.stepTitle}>Review Order</Text>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Shipping Address</Text>
        <View style={styles.addressCard}>
          <Text style={styles.addressText}>
            {address.firstName} {address.lastName}
          </Text>
          <Text style={styles.addressText}>{address.street}</Text>
          <Text style={styles.addressText}>
            {address.city}, {address.state} {address.zipCode}
          </Text>
          <Text style={styles.addressText}>{address.country}</Text>
          <Text style={styles.addressText}>{address.phone}</Text>
        </View>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Payment Method</Text>
        <View style={styles.paymentCard}>
          <Ionicons 
            name={selectedPaymentMethod === 'card' ? 'card-outline' : 'logo-paypal'} 
            size={24} 
            color={colors.primary} 
          />
          <Text style={styles.paymentText}>
            {selectedPaymentMethod === 'card' ? 'Credit/Debit Card' : 'PayPal'}
          </Text>
        </View>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Order Summary</Text>
        {cartItems.map((item, index) => (
          <View key={index} style={styles.orderItem}>
            <Text style={styles.orderItemName}>{item.product.name}</Text>
            <Text style={styles.orderItemQuantity}>Qty: {item.quantity}</Text>
            <Text style={styles.orderItemPrice}>${(item.product.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.orderSummary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>${shipping.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => setActiveStep(2)}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.placeOrderButton, loading && styles.disabledButton]} 
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.placeOrderText}>Processing...</Text>
          ) : (
            <>
              <Text style={styles.placeOrderText}>Place Order</Text>
              <Ionicons name="checkmark" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        {[1, 2, 3].map((step) => (
          <View key={step} style={styles.progressStep}>
            <View style={[
              styles.progressDot, 
              activeStep >= step ? styles.activeProgressDot : styles.inactiveProgressDot
            ]}>
              {activeStep > step && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={[
              styles.progressText,
              activeStep >= step ? styles.activeProgressText : styles.inactiveProgressText
            ]}>
              {step === 1 ? 'Address' : step === 2 ? 'Payment' : 'Review'}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeStep === 1 && renderAddressForm()}
        {activeStep === 2 && renderPaymentForm()}
        {activeStep === 3 && renderOrderReview()}
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.s,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    backgroundColor: colors.card,
    marginHorizontal: spacing.m,
    marginTop: spacing.s,
    borderRadius: radii.medium,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  activeProgressDot: {
    backgroundColor: colors.primary,
  },
  inactiveProgressDot: {
    backgroundColor: colors.border,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  activeProgressText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  inactiveProgressText: {
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    padding: spacing.m,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  formContainer: {
    marginBottom: spacing.l,
  },
  inputGroup: {
    marginBottom: spacing.m,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    fontSize: 16,
    backgroundColor: colors.card,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  halfInput: {
    flex: 1,
  },
  paymentMethods: {
    marginBottom: spacing.l,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    marginBottom: spacing.s,
  },
  selectedPaymentMethod: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  paymentMethodText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: spacing.s,
  },
  selectedPaymentMethodText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    flex: 1,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.xs,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: radii.medium,
    flex: 1,
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: spacing.xs,
  },
  placeOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: radii.medium,
    flex: 1,
    justifyContent: 'center',
  },
  placeOrderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: spacing.xs,
  },
  disabledButton: {
    backgroundColor: colors.textSecondary,
  },
  reviewSection: {
    marginBottom: spacing.l,
  },
  reviewSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.m,
  },
  addressCard: {
    backgroundColor: colors.card,
    padding: spacing.m,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.m,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.s,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orderItemName: {
    fontSize: 14,
    color: colors.text,
    flex: 2,
  },
  orderItemQuantity: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    textAlign: 'center',
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  orderSummary: {
    backgroundColor: colors.card,
    padding: spacing.m,
    borderRadius: radii.medium,
    marginBottom: spacing.l,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.s,
    marginTop: spacing.s,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
}); 