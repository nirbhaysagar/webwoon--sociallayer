import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from '../SellerDashboard/components/HeaderWithMenu';
import { UserShopContext } from '../../context/UserShopContext';
import { useApp } from '../../context/AppContext';
import { orderAPI } from '../../services/api';
import { paymentService, paymentValidation } from '../../services/payment';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from '../../lib/scale';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  name: string;
  icon: string;
  last4?: string;
  brand?: string;
}

const paymentMethods: PaymentMethod[] = [
  { id: 'card', type: 'card', name: 'Credit/Debit Card', icon: 'card-outline' },
  { id: 'paypal', type: 'paypal', name: 'PayPal', icon: 'logo-paypal' },
  { id: 'apple_pay', type: 'apple_pay', name: 'Apple Pay', icon: 'logo-apple' },
  { id: 'google_pay', type: 'google_pay', name: 'Google Pay', icon: 'logo-google' },
];

export default function CheckoutScreen() {
  const { cart, removeFromCart } = useContext(UserShopContext);
  const { state } = useApp();
  const userId = state.user?.id;
  const navigation = useNavigation();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [address, setAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
  });
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const shipping = 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const totalPrice = subtotal + shipping + tax;

  const steps = [
    { id: 1, title: 'Shipping', icon: 'location-outline' },
    { id: 2, title: 'Payment', icon: 'card-outline' },
    { id: 3, title: 'Review', icon: 'checkmark-circle-outline' },
  ];

  const validateAddress = () => {
    const errors: Record<string, string> = {};
    
    if (!address.name.trim()) errors.name = 'Full name is required';
    if (!address.street.trim()) errors.street = 'Street address is required';
    if (!address.city.trim()) errors.city = 'City is required';
    if (!address.state.trim()) errors.state = 'State is required';
    if (!address.zip.trim()) errors.zip = 'ZIP code is required';
    if (!address.phone.trim()) errors.phone = 'Phone number is required';
    if (!address.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(address.email)) errors.email = 'Invalid email format';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePayment = () => {
    const errors: Record<string, string> = {};
    
    if (!selectedPaymentMethod) {
      errors.paymentMethod = 'Please select a payment method';
    } else if (selectedPaymentMethod.type === 'card') {
      if (!paymentDetails.cardNumber.trim()) errors.cardNumber = 'Card number is required';
      else if (paymentDetails.cardNumber.replace(/\s/g, '').length < 13) errors.cardNumber = 'Invalid card number';
      
      if (!paymentDetails.expiryDate.trim()) errors.expiryDate = 'Expiry date is required';
      else if (!/^\d{2}\/\d{2}$/.test(paymentDetails.expiryDate)) errors.expiryDate = 'Use MM/YY format';
      
      if (!paymentDetails.cvv.trim()) errors.cvv = 'CVV is required';
      else if (paymentDetails.cvv.length < 3) errors.cvv = 'Invalid CVV';
      
      if (!paymentDetails.cardholderName.trim()) errors.cardholderName = 'Cardholder name is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateAddress()) {
        setCurrentStep(2);
        setValidationErrors({});
      }
    } else if (currentStep === 2) {
      if (validatePayment()) {
        setCurrentStep(3);
        setValidationErrors({});
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setValidationErrors({});
    }
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const processPayment = async () => {
    setProcessingPayment(true);
    
    try {
      // Validate payment details
      if (selectedPaymentMethod?.type === 'card') {
        if (!paymentValidation.validateCardNumber(paymentDetails.cardNumber)) {
          throw new Error('Invalid card number');
        }
        
        const [month, year] = paymentDetails.expiryDate.split('/');
        if (!paymentValidation.validateExpiryDate(month, year)) {
          throw new Error('Invalid expiry date');
        }
        
        if (!paymentValidation.validateCVV(paymentDetails.cvv)) {
          throw new Error('Invalid CVV');
        }
      }

      // Create payment intent
      const clientSecret = await paymentService.createPaymentIntent(
        Math.round(totalPrice * 100), // Convert to cents
        'usd'
      );

      // Process payment with Stripe
      const paymentResult = await paymentService.processPayment(
        selectedPaymentMethod?.id || 'card',
        Math.round(totalPrice * 100),
        `order_${Date.now()}`
      );

      if (paymentResult.success) {
        await handlePlaceOrder(paymentResult.transactionId || paymentResult.id);
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      Alert.alert('Payment Failed', error.message || 'There was an issue processing your payment. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePlaceOrder = async (transactionId?: string) => {
    if (!userId) {
      Alert.alert('Not logged in', 'Please log in to place an order.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const orderData = {
        user_id: userId,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity || 1,
          price: item.price,
          title: item.title,
        })),
        shipping_address: address,
        payment_method: selectedPaymentMethod?.type,
        transaction_id: transactionId,
        subtotal,
        shipping,
        tax,
        total_amount: totalPrice,
        status: 'confirmed',
      };
      
      const order = await orderAPI.createOrder(orderData);
      
      // Clear cart
      cart.forEach(item => removeFromCart(item.id));
      
      navigation.navigate('OrderConfirmationScreen', { order });
    } catch (e) {
      Alert.alert('Order Failed', 'Could not place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <View key={step.id} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            currentStep >= step.id && styles.stepCircleActive
          ]}>
            {currentStep > step.id ? (
              <Ionicons name="checkmark" size={16} color="white" />
            ) : (
              <Ionicons name={step.icon} size={16} color={currentStep >= step.id ? "white" : colors.textSecondary} />
            )}
          </View>
          <Text style={[
            styles.stepTitle,
            currentStep >= step.id && styles.stepTitleActive
          ]}>
            {step.title}
          </Text>
          {index < steps.length - 1 && (
            <View style={[
              styles.stepLine,
              currentStep > step.id && styles.stepLineActive
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderShippingForm = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Shipping Information</Text>
      
      <TextInput 
        style={[styles.input, validationErrors.name && styles.inputError]} 
        placeholder="Full Name" 
        value={address.name} 
        onChangeText={v => setAddress(a => ({ ...a, name: v }))} 
      />
      {validationErrors.name && <Text style={styles.errorText}>{validationErrors.name}</Text>}
      
      <TextInput 
        style={[styles.input, validationErrors.email && styles.inputError]} 
        placeholder="Email Address" 
        value={address.email} 
        onChangeText={v => setAddress(a => ({ ...a, email: v }))} 
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {validationErrors.email && <Text style={styles.errorText}>{validationErrors.email}</Text>}
      
      <TextInput 
        style={[styles.input, validationErrors.phone && styles.inputError]} 
        placeholder="Phone Number" 
        value={address.phone} 
        onChangeText={v => setAddress(a => ({ ...a, phone: v }))} 
        keyboardType="phone-pad"
      />
      {validationErrors.phone && <Text style={styles.errorText}>{validationErrors.phone}</Text>}
      
      <TextInput 
        style={[styles.input, validationErrors.street && styles.inputError]} 
        placeholder="Street Address" 
        value={address.street} 
        onChangeText={v => setAddress(a => ({ ...a, street: v }))} 
      />
      {validationErrors.street && <Text style={styles.errorText}>{validationErrors.street}</Text>}
      
      <View style={styles.row}>
        <TextInput 
          style={[styles.input, styles.halfInput, validationErrors.city && styles.inputError]} 
          placeholder="City" 
          value={address.city} 
          onChangeText={v => setAddress(a => ({ ...a, city: v }))} 
        />
        <TextInput 
          style={[styles.input, styles.halfInput, validationErrors.state && styles.inputError]} 
          placeholder="State" 
          value={address.state} 
          onChangeText={v => setAddress(a => ({ ...a, state: v }))} 
        />
      </View>
      {(validationErrors.city || validationErrors.state) && (
        <Text style={styles.errorText}>{validationErrors.city || validationErrors.state}</Text>
      )}
      
      <TextInput 
        style={[styles.input, validationErrors.zip && styles.inputError]} 
        placeholder="ZIP Code" 
        value={address.zip} 
        onChangeText={v => setAddress(a => ({ ...a, zip: v }))} 
        keyboardType="numeric"
      />
      {validationErrors.zip && <Text style={styles.errorText}>{validationErrors.zip}</Text>}
    </View>
  );

  const renderPaymentForm = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Payment Method</Text>
      
      <View style={styles.paymentMethods}>
        {paymentMethods.map(method => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.paymentMethod,
              selectedPaymentMethod?.id === method.id && styles.paymentMethodSelected
            ]}
            onPress={() => setSelectedPaymentMethod(method)}
          >
            <Ionicons 
              name={method.icon as any} 
              size={24} 
              color={selectedPaymentMethod?.id === method.id ? colors.primary : colors.textSecondary} 
            />
            <Text style={[
              styles.paymentMethodText,
              selectedPaymentMethod?.id === method.id && styles.paymentMethodTextSelected
            ]}>
              {method.name}
            </Text>
            {selectedPaymentMethod?.id === method.id && (
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      {validationErrors.paymentMethod && (
        <Text style={styles.errorText}>{validationErrors.paymentMethod}</Text>
      )}
      
      {selectedPaymentMethod?.type === 'card' && (
        <View style={styles.cardForm}>
          <TextInput 
            style={[styles.input, validationErrors.cardNumber && styles.inputError]} 
            placeholder="Card Number" 
            value={paymentDetails.cardNumber} 
            onChangeText={v => setPaymentDetails(p => ({ ...p, cardNumber: formatCardNumber(v) }))} 
            keyboardType="numeric"
            maxLength={19}
          />
          {validationErrors.cardNumber && <Text style={styles.errorText}>{validationErrors.cardNumber}</Text>}
          
          <TextInput 
            style={[styles.input, validationErrors.cardholderName && styles.inputError]} 
            placeholder="Cardholder Name" 
            value={paymentDetails.cardholderName} 
            onChangeText={v => setPaymentDetails(p => ({ ...p, cardholderName: v }))} 
          />
          {validationErrors.cardholderName && <Text style={styles.errorText}>{validationErrors.cardholderName}</Text>}
          
          <View style={styles.row}>
            <TextInput 
              style={[styles.input, styles.halfInput, validationErrors.expiryDate && styles.inputError]} 
              placeholder="MM/YY" 
              value={paymentDetails.expiryDate} 
              onChangeText={v => setPaymentDetails(p => ({ ...p, expiryDate: formatExpiryDate(v) }))} 
              keyboardType="numeric"
              maxLength={5}
            />
            <TextInput 
              style={[styles.input, styles.halfInput, validationErrors.cvv && styles.inputError]} 
              placeholder="CVV" 
              value={paymentDetails.cvv} 
              onChangeText={v => setPaymentDetails(p => ({ ...p, cvv: v }))} 
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
          {(validationErrors.expiryDate || validationErrors.cvv) && (
            <Text style={styles.errorText}>{validationErrors.expiryDate || validationErrors.cvv}</Text>
          )}
        </View>
      )}
    </View>
  );

  const renderOrderReview = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Order Review</Text>
      
      <View style={styles.reviewSection}>
        <Text style={styles.reviewSubtitle}>Shipping Address</Text>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewText}>{address.name}</Text>
          <Text style={styles.reviewText}>{address.street}</Text>
          <Text style={styles.reviewText}>{address.city}, {address.state} {address.zip}</Text>
          <Text style={styles.reviewText}>{address.phone}</Text>
        </View>
      </View>
      
      <View style={styles.reviewSection}>
        <Text style={styles.reviewSubtitle}>Payment Method</Text>
        <View style={styles.reviewItem}>
          <Ionicons name={selectedPaymentMethod?.icon as any} size={20} color={colors.textSecondary} />
          <Text style={styles.reviewText}>{selectedPaymentMethod?.name}</Text>
        </View>
      </View>
      
      <View style={styles.reviewSection}>
        <Text style={styles.reviewSubtitle}>Order Items</Text>
        {cart.map(item => (
          <View key={item.id} style={styles.reviewItem}>
            <Text style={styles.reviewText}>{item.title} x{item.quantity || 1}</Text>
            <Text style={styles.reviewPrice}>${(item.price * (item.quantity || 1)).toFixed(2)}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <HeaderWithMenu />
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 200 }}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <Text style={styles.title}>Checkout</Text>
        
        {renderStepIndicator()}
        
        {currentStep === 1 && renderShippingForm()}
        {currentStep === 2 && renderPaymentForm()}
        {currentStep === 3 && renderOrderReview()}
        
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryItem}>Subtotal</Text>
            <Text style={styles.summaryPrice}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryItem}>Shipping</Text>
            <Text style={styles.summaryPrice}>${shipping.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryItem}>Tax</Text>
            <Text style={styles.summaryPrice}>${tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>${totalPrice.toFixed(2)}</Text>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.backButton} onPress={handlePreviousStep}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          {currentStep < 3 ? (
            <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
              <Text style={styles.nextButtonText}>
                {currentStep === 1 ? 'Continue to Payment' : 'Continue to Review'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.placeOrderBtn, processingPayment && styles.placeOrderBtnDisabled]} 
              onPress={processPayment} 
              disabled={processingPayment || submitting}
            >
              {processingPayment ? (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.checkoutButtonText}>Processing Payment...</Text>
                </View>
              ) : (
                <Text style={styles.checkoutButtonText}>
                  {submitting ? 'Placing Order...' : 'Complete Order'}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
        
        {/* Extra space to ensure scrolling works */}
        <View style={{ height: 200 }} />
        <View style={{ height: 200 }} />
        <View style={{ height: 200 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: 8,
  },
  formGroup: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  summaryBox: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryItem: {
    fontSize: 16,
    color: colors.text,
  },
  summaryPrice: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.primary,
  },
  placeOrderBtn: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#fff',
  },
  // New styles for enhanced checkout
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
    paddingHorizontal: spacing.m,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
  },
  stepCircle: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
  },
  stepTitle: {
    fontSize: scale(12),
    color: colors.textSecondary,
    textAlign: 'center',
  },
  stepTitleActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  stepLine: {
    position: 'absolute',
    top: scale(20),
    left: '50%',
    width: '100%',
    height: 2,
    backgroundColor: colors.border,
    zIndex: -1,
  },
  stepLineActive: {
    backgroundColor: colors.primary,
  },
  formSection: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.m,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    padding: spacing.m,
    fontSize: scale(16),
    color: colors.text,
    marginBottom: spacing.s,
    backgroundColor: colors.background,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: scale(12),
    marginBottom: spacing.s,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  halfInput: {
    flex: 1,
  },
  paymentMethods: {
    marginBottom: spacing.m,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    marginBottom: spacing.s,
    backgroundColor: colors.background,
  },
  paymentMethodSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  paymentMethodText: {
    flex: 1,
    marginLeft: spacing.m,
    fontSize: scale(16),
    color: colors.text,
  },
  paymentMethodTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  cardForm: {
    marginTop: spacing.m,
  },
  reviewSection: {
    marginBottom: spacing.m,
  },
  reviewSubtitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.s,
  },
  reviewItem: {
    padding: spacing.m,
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    marginBottom: spacing.s,
  },
  reviewText: {
    fontSize: scale(14),
    color: colors.text,
    marginBottom: spacing.xs,
  },
  reviewPrice: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.m,
    marginTop: spacing.l,
    marginBottom: spacing.l,
  },
  backButton: {
    flex: 1,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: scale(16),
    color: colors.text,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    padding: spacing.m,
    backgroundColor: colors.primary,
    borderRadius: radii.medium,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: scale(16),
    color: 'white',
    fontWeight: '600',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  placeOrderBtnDisabled: {
    opacity: 0.7,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.s,
    marginTop: spacing.s,
  },
}); 