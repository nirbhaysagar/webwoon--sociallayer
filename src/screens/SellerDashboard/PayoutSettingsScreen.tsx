import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';

interface PayoutSettings {
  method: 'bank_transfer' | 'paypal' | 'stripe';
  account_name: string;
  account_number: string;
  routing_number: string;
  bank_name: string;
  paypal_email: string;
  stripe_account_id: string;
}

const payoutMethods = [
  { id: 'bank_transfer', name: 'Bank Transfer', icon: 'card-outline' },
  { id: 'paypal', name: 'PayPal', icon: 'logo-paypal' },
  { id: 'stripe', name: 'Stripe', icon: 'card-outline' },
];

export default function PayoutSettingsScreen() {
  const navigation = useNavigation();
  const { state, updatePayoutSettings } = useApp();
  const [saving, setSaving] = useState(false);
  
  const [payoutSettings, setPayoutSettings] = useState<PayoutSettings>({
    method: 'bank_transfer',
    account_name: '',
    account_number: '',
    routing_number: '',
    bank_name: '',
    paypal_email: '',
    stripe_account_id: '',
  });

  const [originalSettings, setOriginalSettings] = useState<PayoutSettings>(payoutSettings);

  useEffect(() => {
    // Load existing payout settings from store settings
    if (state.store?.settings?.payout) {
      setPayoutSettings(state.store.settings.payout);
      setOriginalSettings(state.store.settings.payout);
    }
  }, [state.store]);

  const hasChanges = () => {
    return JSON.stringify(payoutSettings) !== JSON.stringify(originalSettings);
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      navigation.goBack();
      return;
    }

    setSaving(true);
    try {
      // Validate required fields based on selected method
      if (payoutSettings.method === 'bank_transfer') {
        if (!payoutSettings.account_name.trim() || !payoutSettings.account_number.trim() || 
            !payoutSettings.routing_number.trim() || !payoutSettings.bank_name.trim()) {
          Alert.alert('Error', 'Please fill in all required bank transfer fields');
          return;
        }
      } else if (payoutSettings.method === 'paypal') {
        if (!payoutSettings.paypal_email.trim()) {
          Alert.alert('Error', 'PayPal email is required');
          return;
        }
      } else if (payoutSettings.method === 'stripe') {
        if (!payoutSettings.stripe_account_id.trim()) {
          Alert.alert('Error', 'Stripe account ID is required');
          return;
        }
      }

      // Update payout settings in database
      await updatePayoutSettings(payoutSettings);

      setOriginalSettings(payoutSettings);
      Alert.alert('Success', 'Payout settings updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update payout settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const renderBankTransferFields = () => (
    <View style={styles.methodFields}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Account Holder Name *</Text>
        <TextInput
          style={styles.input}
          value={payoutSettings.account_name}
          onChangeText={(text) => setPayoutSettings(prev => ({ ...prev, account_name: text }))}
          placeholder="Enter account holder name"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Account Number *</Text>
        <TextInput
          style={styles.input}
          value={payoutSettings.account_number}
          onChangeText={(text) => setPayoutSettings(prev => ({ ...prev, account_number: text }))}
          placeholder="Enter account number"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.s }]}>
          <Text style={styles.label}>Routing Number *</Text>
          <TextInput
            style={styles.input}
            value={payoutSettings.routing_number}
            onChangeText={(text) => setPayoutSettings(prev => ({ ...prev, routing_number: text }))}
            placeholder="Routing number"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            secureTextEntry
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Bank Name *</Text>
          <TextInput
            style={styles.input}
            value={payoutSettings.bank_name}
            onChangeText={(text) => setPayoutSettings(prev => ({ ...prev, bank_name: text }))}
            placeholder="Bank name"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>
    </View>
  );

  const renderPayPalFields = () => (
    <View style={styles.methodFields}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>PayPal Email *</Text>
        <TextInput
          style={styles.input}
          value={payoutSettings.paypal_email}
          onChangeText={(text) => setPayoutSettings(prev => ({ ...prev, paypal_email: text }))}
          placeholder="your-email@paypal.com"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  const renderStripeFields = () => (
    <View style={styles.methodFields}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Stripe Account ID *</Text>
        <TextInput
          style={styles.input}
          value={payoutSettings.stripe_account_id}
          onChangeText={(text) => setPayoutSettings(prev => ({ ...prev, stripe_account_id: text }))}
          placeholder="acct_xxxxxxxxxxxxx"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payout Settings</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.saveButton, !hasChanges() && styles.saveButtonDisabled]}
          disabled={!hasChanges() || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.saveButtonText, !hasChanges() && styles.saveButtonTextDisabled]}>
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payout Method</Text>
          <Text style={styles.sectionDescription}>
            Choose how you want to receive your earnings from sales.
          </Text>

          <View style={styles.methodsContainer}>
            {payoutMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodCard,
                  payoutSettings.method === method.id && styles.methodCardActive
                ]}
                onPress={() => setPayoutSettings(prev => ({ ...prev, method: method.id as any }))}
              >
                <Ionicons 
                  name={method.icon as any} 
                  size={24} 
                  color={payoutSettings.method === method.id ? colors.primary : colors.textSecondary} 
                />
                <Text style={[
                  styles.methodName,
                  payoutSettings.method === method.id && styles.methodNameActive
                ]}>
                  {method.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          
          {payoutSettings.method === 'bank_transfer' && renderBankTransferFields()}
          {payoutSettings.method === 'paypal' && renderPayPalFields()}
          {payoutSettings.method === 'stripe' && renderStripeFields()}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Security Notice</Text>
          <Text style={styles.infoText}>
            Your payout information is encrypted and stored securely. 
            We never store your full account details in plain text.
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Processing Time</Text>
          <Text style={styles.infoText}>
            Payouts are processed within 2-3 business days after your 
            earnings reach the minimum payout threshold.
          </Text>
        </View>
      </ScrollView>
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
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
  },
  saveButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: radii.small,
    backgroundColor: colors.primary,
  },
  saveButtonDisabled: {
    backgroundColor: colors.border,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: '#fff',
  },
  saveButtonTextDisabled: {
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.textSecondary,
    marginBottom: spacing.m,
  },
  methodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  methodCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.card,
  },
  methodCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  methodName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  methodNameActive: {
    color: colors.primary,
  },
  methodFields: {
    marginTop: spacing.m,
  },
  inputGroup: {
    marginBottom: spacing.m,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
  },
  infoSection: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.m,
    ...shadows.card,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.s,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.textSecondary,
    lineHeight: 20,
  },
}); 