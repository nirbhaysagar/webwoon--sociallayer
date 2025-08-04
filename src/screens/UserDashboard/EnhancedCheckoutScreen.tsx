import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert,
  SafeAreaView, StatusBar, ActivityIndicator, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { UnifiedPaymentService, PaymentProvider, PaymentMethod } from '../../services/unifiedPaymentService';
import { getPaymentConfig, getAvailablePaymentProviders, isPaymentProviderEnabled } from '../../config/paymentConfig';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import BackButton from '../../components/BackButton';

interface CheckoutData {
  items: Array<{
    id: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function EnhancedCheckoutScreen({ navigation, route }) {
  const checkoutData: CheckoutData = route.params?.checkoutData;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  // Form states
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });
  
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState<PaymentProvider>('stripe');
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [useNewPaymentMethod, setUseNewPaymentMethod] = useState(false);
  
  // New payment method form
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    cardholderName: '',
  });
  
  const [orderNotes, setOrderNotes] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    initializePaymentServices();
    loadSavedPaymentMethods();
  }, []);

  const initializePaymentServices = async () => {
    try {
      setLoading(true);
      await UnifiedPaymentService.initialize();
      
      // Check available providers
      const availableProviders = getAvailablePaymentProviders();
      if (availableProviders.length > 0) {
        setSelectedPaymentProvider(availableProviders[0]);
      }
    } catch (error) {
      console.error('Error initializing payment services:', error);
      Alert.alert('Error', 'Failed to initialize payment services');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedPaymentMethods = async () => {
    try {
      // In a real app, you'd get the user ID from auth
      const userId = 'user-123';
      const methods = await UnifiedPaymentService.getPaymentMethods(userId);
      setSavedPaymentMethods(methods);
      
      if (methods.length > 0) {
        setSelectedPaymentMethod(methods[0]);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateShippingAddress = (): boolean => {
    const required = ['firstName', 'lastName', 'email', 'street', 'city', 'state', 'zipCode'];
    return required.every(field => shippingAddress[field as keyof ShippingAddress]?.trim());
  };

  const validatePaymentMethod = (): boolean => {
    if (useNewPaymentMethod) {
      const required = ['cardNumber', 'expiryMonth', 'expiryYear', 'cvc', 'cardholderName'];
      return required.every(field => newPaymentMethod[field as keyof typeof newPaymentMethod]?.trim());
    }
    return !!selectedPaymentMethod;
  };

  const handleProcessPayment = async () => {
    if (!validatePaymentMethod()) {
      Alert.alert('Error', 'Please complete payment information');
      return;
    }

    if (!acceptTerms) {
      Alert.alert('Error', 'Please accept the terms and conditions');
      return;
    }

    try {
      setPaymentProcessing(true);
      setShowPaymentModal(true);

      const paymentRequest = {
        amount: checkoutData.total,
        currency: 'USD',
        items: checkoutData.items.map(item => ({
          name: item.title,
          quantity: item.quantity,
          price: item.price,
        })),
        metadata: {
          orderType: 'checkout',
          items: checkoutData.items.length,
        },
      };

      const paymentResponse = await UnifiedPaymentService.processPayment(
        paymentRequest,
        selectedPaymentProvider
      );

      if (paymentResponse.success) {
        // Create order in database
        const orderData = {
          userId: 'user-123', // Get from auth
          items: checkoutData.items,
          subtotal: checkoutData.subtotal,
          tax: checkoutData.tax,
          shipping: checkoutData.shipping,
          total: checkoutData.total,
          shippingAddress,
        };

        const order = await UnifiedPaymentService.createOrderFromPayment(paymentResponse, orderData);

        setShowPaymentModal(false);
        Alert.alert(
          'Payment Successful!',
          `Order #${order.id} has been placed successfully.`,
          [
            {
              text: 'View Orders',
              onPress: () => navigation.navigate('OrderHistory'),
            },
            {
              text: 'Continue Shopping',
              onPress: () => navigation.navigate('UserHome'),
            },
          ]
        );
      } else {
        throw new Error(paymentResponse.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setShowPaymentModal(false);
      Alert.alert('Payment Failed', error instanceof Error ? error.message : 'Payment processing failed');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((step) => (
        <View key={step} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            currentStep >= step ? styles.activeStep : styles.inactiveStep
          ]}>
            <Text style={[
              styles.stepNumber,
              currentStep >= step ? styles.activeStepText : styles.inactiveStepText
            ]}>
              {step}
            </Text>
          </View>
          <Text style={[
            styles.stepLabel,
            currentStep >= step ? styles.activeStepText : styles.inactiveStepText
          ]}>
            {step === 1 ? 'Shipping' : step === 2 ? 'Payment' : 'Review'}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderShippingStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Shipping Information</Text>
      
      <View style={styles.formRow}>
        <View style={styles.halfInput}>
          <Text style={styles.inputLabel}>First Name</Text>
          <TextInput
            style={styles.textInput}
            value={shippingAddress.firstName}
            onChangeText={(text) => setShippingAddress({...shippingAddress, firstName: text})}
            placeholder="First Name"
          />
        </View>
        <View style={styles.halfInput}>
          <Text style={styles.inputLabel}>Last Name</Text>
          <TextInput
            style={styles.textInput}
            value={shippingAddress.lastName}
            onChangeText={(text) => setShippingAddress({...shippingAddress, lastName: text})}
            placeholder="Last Name"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.textInput}
          value={shippingAddress.email}
          onChangeText={(text) => setShippingAddress({...shippingAddress, email: text})}
          placeholder="Email"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Phone</Text>
        <TextInput
          style={styles.textInput}
          value={shippingAddress.phone}
          onChangeText={(text) => setShippingAddress({...shippingAddress, phone: text})}
          placeholder="Phone"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Street Address</Text>
        <TextInput
          style={styles.textInput}
          value={shippingAddress.street}
          onChangeText={(text) => setShippingAddress({...shippingAddress, street: text})}
          placeholder="Street Address"
        />
      </View>

      <View style={styles.formRow}>
        <View style={styles.halfInput}>
          <Text style={styles.inputLabel}>City</Text>
          <TextInput
            style={styles.textInput}
            value={shippingAddress.city}
            onChangeText={(text) => setShippingAddress({...shippingAddress, city: text})}
            placeholder="City"
          />
        </View>
        <View style={styles.halfInput}>
          <Text style={styles.inputLabel}>State</Text>
          <TextInput
            style={styles.textInput}
            value={shippingAddress.state}
            onChangeText={(text) => setShippingAddress({...shippingAddress, state: text})}
            placeholder="State"
          />
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.halfInput}>
          <Text style={styles.inputLabel}>ZIP Code</Text>
          <TextInput
            style={styles.textInput}
            value={shippingAddress.zipCode}
            onChangeText={(text) => setShippingAddress({...shippingAddress, zipCode: text})}
            placeholder="ZIP Code"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.halfInput}>
          <Text style={styles.inputLabel}>Country</Text>
          <TextInput
            style={styles.textInput}
            value={shippingAddress.country}
            onChangeText={(text) => setShippingAddress({...shippingAddress, country: text})}
            placeholder="Country"
          />
        </View>
      </View>
    </View>
  );

  const renderPaymentStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Payment Method</Text>
      
      {/* Payment Provider Selection */}
      <View style={styles.paymentProviderSection}>
        <Text style={styles.sectionTitle}>Payment Provider</Text>
        {getAvailablePaymentProviders().map((provider) => (
          <TouchableOpacity
            key={provider}
            style={[
              styles.providerOption,
              selectedPaymentProvider === provider && styles.selectedProvider
            ]}
            onPress={() => setSelectedPaymentProvider(provider)}
          >
            <Ionicons
              name={provider === 'stripe' ? 'card-outline' : 'logo-paypal'}
              size={24}
              color={selectedPaymentProvider === provider ? colors.primary : colors.textSecondary}
            />
            <Text style={[
              styles.providerText,
              selectedPaymentProvider === provider && styles.selectedProviderText
            ]}>
              {provider === 'stripe' ? 'Credit/Debit Cards' : 'PayPal'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Saved Payment Methods */}
      {savedPaymentMethods.length > 0 && (
        <View style={styles.savedMethodsSection}>
          <Text style={styles.sectionTitle}>Saved Payment Methods</Text>
          {savedPaymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethodOption,
                selectedPaymentMethod?.id === method.id && styles.selectedPaymentMethod
              ]}
              onPress={() => {
                setSelectedPaymentMethod(method);
                setUseNewPaymentMethod(false);
              }}
            >
              <Ionicons
                name="card-outline"
                size={20}
                color={selectedPaymentMethod?.id === method.id ? colors.primary : colors.textSecondary}
              />
              <Text style={[
                styles.paymentMethodText,
                selectedPaymentMethod?.id === method.id && styles.selectedPaymentMethodText
              ]}>
                {method.displayName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* New Payment Method */}
      <View style={styles.newPaymentMethodSection}>
        <TouchableOpacity
          style={styles.newPaymentMethodToggle}
          onPress={() => setUseNewPaymentMethod(!useNewPaymentMethod)}
        >
          <Ionicons
            name={useNewPaymentMethod ? 'checkmark-circle' : 'ellipse-outline'}
            size={20}
            color={useNewPaymentMethod ? colors.primary : colors.textSecondary}
          />
          <Text style={styles.newPaymentMethodText}>Use new payment method</Text>
        </TouchableOpacity>

        {useNewPaymentMethod && (
          <View style={styles.newPaymentMethodForm}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput
                style={styles.textInput}
                value={newPaymentMethod.cardNumber}
                onChangeText={(text) => setNewPaymentMethod({...newPaymentMethod, cardNumber: text})}
                placeholder="1234 5678 9012 3456"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Expiry Month</Text>
                <TextInput
                  style={styles.textInput}
                  value={newPaymentMethod.expiryMonth}
                  onChangeText={(text) => setNewPaymentMethod({...newPaymentMethod, expiryMonth: text})}
                  placeholder="MM"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Expiry Year</Text>
                <TextInput
                  style={styles.textInput}
                  value={newPaymentMethod.expiryYear}
                  onChangeText={(text) => setNewPaymentMethod({...newPaymentMethod, expiryYear: text})}
                  placeholder="YYYY"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>CVC</Text>
                <TextInput
                  style={styles.textInput}
                  value={newPaymentMethod.cvc}
                  onChangeText={(text) => setNewPaymentMethod({...newPaymentMethod, cvc: text})}
                  placeholder="123"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Cardholder Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={newPaymentMethod.cardholderName}
                  onChangeText={(text) => setNewPaymentMethod({...newPaymentMethod, cardholderName: text})}
                  placeholder="Cardholder Name"
                />
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderReviewStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Order Review</Text>
      
      {/* Order Summary */}
      <View style={styles.orderSummary}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {checkoutData.items.map((item, index) => (
          <View key={index} style={styles.orderItem}>
            <Text style={styles.itemName}>{item.title}</Text>
            <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
            <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Shipping Address */}
      <View style={styles.shippingSummary}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>
        <Text style={styles.addressText}>
          {shippingAddress.firstName} {shippingAddress.lastName}
        </Text>
        <Text style={styles.addressText}>{shippingAddress.street}</Text>
        <Text style={styles.addressText}>
          {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
        </Text>
        <Text style={styles.addressText}>{shippingAddress.country}</Text>
        <Text style={styles.addressText}>{shippingAddress.email}</Text>
        <Text style={styles.addressText}>{shippingAddress.phone}</Text>
      </View>

      {/* Payment Method */}
      <View style={styles.paymentSummary}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <Text style={styles.paymentText}>
          {selectedPaymentProvider === 'stripe' ? 'Credit/Debit Card' : 'PayPal'}
        </Text>
        {selectedPaymentMethod && (
          <Text style={styles.paymentText}>{selectedPaymentMethod.displayName}</Text>
        )}
      </View>

      {/* Order Notes */}
      <View style={styles.notesSection}>
        <Text style={styles.sectionTitle}>Order Notes</Text>
        <TextInput
          style={styles.notesInput}
          value={orderNotes}
          onChangeText={setOrderNotes}
          placeholder="Add any special instructions..."
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Terms and Conditions */}
      <View style={styles.termsSection}>
        <TouchableOpacity
          style={styles.termsToggle}
          onPress={() => setAcceptTerms(!acceptTerms)}
        >
          <Ionicons
            name={acceptTerms ? 'checkmark-circle' : 'ellipse-outline'}
            size={20}
            color={acceptTerms ? colors.primary : colors.textSecondary}
          />
          <Text style={styles.termsText}>
            I agree to the terms and conditions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Total */}
      <View style={styles.totalSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>${checkoutData.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tax</Text>
          <Text style={styles.totalValue}>${checkoutData.tax.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Shipping</Text>
          <Text style={styles.totalValue}>${checkoutData.shipping.toFixed(2)}</Text>
        </View>
        <View style={[styles.totalRow, styles.finalTotal]}>
          <Text style={styles.finalTotalLabel}>Total</Text>
          <Text style={styles.finalTotalValue}>${checkoutData.total.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  const renderPaymentModal = () => (
    <Modal
      visible={showPaymentModal}
      transparent
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.modalText}>Processing Payment...</Text>
          <Text style={styles.modalSubtext}>Please don't close this window</Text>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Initializing payment services...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backButton} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Checkout</Text>
          <Text style={styles.subtitle}>
            Complete your purchase securely
          </Text>
        </View>
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 1 && renderShippingStep()}
        {currentStep === 2 && renderPaymentStep()}
        {currentStep === 3 && renderReviewStep()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={styles.previousButton}
            onPress={handlePreviousStep}
          >
            <Text style={styles.previousButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        
        {currentStep < 3 ? (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNextStep}
            disabled={
              (currentStep === 1 && !validateShippingAddress()) ||
              (currentStep === 2 && !validatePaymentMethod())
            }
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextButton, !acceptTerms && styles.disabledButton]}
            onPress={handleProcessPayment}
            disabled={!acceptTerms || paymentProcessing}
          >
            <Text style={styles.nextButtonText}>
              {paymentProcessing ? 'Processing...' : 'Place Order'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

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
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    backgroundColor: colors.card,
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  activeStep: {
    backgroundColor: colors.primary,
  },
  inactiveStep: {
    backgroundColor: colors.border,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeStepText: {
    color: colors.primary,
  },
  inactiveStepText: {
    color: colors.textSecondary,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: spacing.m,
  },
  stepContent: {
    marginBottom: spacing.l,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.m,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  halfInput: {
    flex: 1,
  },
  inputContainer: {
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
    paddingVertical: spacing.s,
    fontSize: 16,
    backgroundColor: colors.card,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.m,
  },
  paymentProviderSection: {
    marginBottom: spacing.l,
  },
  providerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    marginBottom: spacing.s,
    backgroundColor: colors.card,
  },
  selectedProvider: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  providerText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.m,
  },
  selectedProviderText: {
    color: colors.primary,
  },
  savedMethodsSection: {
    marginBottom: spacing.l,
  },
  paymentMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    marginBottom: spacing.s,
    backgroundColor: colors.card,
  },
  selectedPaymentMethod: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  paymentMethodText: {
    fontSize: 16,
    marginLeft: spacing.m,
  },
  selectedPaymentMethodText: {
    color: colors.primary,
    fontWeight: '600',
  },
  newPaymentMethodSection: {
    marginBottom: spacing.l,
  },
  newPaymentMethodToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  newPaymentMethodText: {
    fontSize: 16,
    marginLeft: spacing.s,
  },
  newPaymentMethodForm: {
    padding: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    backgroundColor: colors.card,
  },
  orderSummary: {
    marginBottom: spacing.l,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  shippingSummary: {
    marginBottom: spacing.l,
  },
  addressText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  paymentSummary: {
    marginBottom: spacing.l,
  },
  paymentText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  notesSection: {
    marginBottom: spacing.l,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    padding: spacing.m,
    fontSize: 14,
    backgroundColor: colors.card,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  termsSection: {
    marginBottom: spacing.l,
  },
  termsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  termsText: {
    fontSize: 14,
    marginLeft: spacing.s,
  },
  totalSection: {
    marginBottom: spacing.l,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  finalTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.s,
    marginTop: spacing.s,
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  navigationButtons: {
    flexDirection: 'row',
    padding: spacing.m,
    gap: spacing.m,
  },
  previousButton: {
    flex: 1,
    paddingVertical: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    alignItems: 'center',
  },
  previousButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  nextButton: {
    flex: 1,
    paddingVertical: spacing.m,
    backgroundColor: colors.primary,
    borderRadius: radii.medium,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.m,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    padding: spacing.l,
    borderRadius: radii.large,
    alignItems: 'center',
    margin: spacing.l,
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.m,
  },
  modalSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.s,
  },
}); 