import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';

type BusinessType = 'individual' | 'company';

export default function SellerApplicationScreen({ navigation }: any) {
  const { user, profile, refreshProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'individual' as BusinessType,
    taxId: '',
    businessPhone: '',
    businessEmail: user?.email || '',
  });

  const [errors, setErrors] = useState({
    businessName: '',
    businessEmail: '',
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    let newErrors = { businessName: '', businessEmail: '' };
    let isValid = true;
    const emailRegex = /\S+@\S+\.\S+/;

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required.';
      isValid = false;
    }
    if (!formData.businessEmail.trim() || !emailRegex.test(formData.businessEmail)) {
      newErrors.businessEmail = 'A valid business email is required.';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleApply = async () => {
    if (!validateForm()) return;

    if (!user) {
      Alert.alert('Error', 'You must be logged in to apply.');
      return;
    }

    setLoading(true);

    const sellerResult = await userService.becomeSeller(user.id);

    if (sellerResult.success) {
      await refreshProfile();
      Alert.alert(
        'Application Submitted!',
        'Congratulations! You are now a seller. Let\'s set up your store.',
        [{ text: 'Continue', onPress: () => navigation.navigate('StoreCreationWizard') }]
      );
    } else {
      Alert.alert('Application Failed', sellerResult.error || 'Failed to process your application.');
    }

    setLoading(false);
  };

  if (profile?.is_seller) {
    return (
      <LinearGradient colors={['#FFFFFF', '#F0F5FF', '#E6EEFF']} style={styles.container}>
        <SafeAreaView style={styles.centered}>
          <Ionicons name="checkmark-circle" size={64} color="#22C55E" />
          <Text style={styles.title}>You're Already a Seller!</Text>
          <Text style={styles.subtitle}>You can manage your store and products from your dashboard.</Text>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton, { marginTop: 30 }]} 
            onPress={() => navigation.navigate('SellerDashboard')}
          >
            <Text style={styles.buttonText}>Go to Dashboard</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#FFFFFF', '#F0F5FF', '#E6EEFF']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back-circle" size={40} color="#4A90E2" />
            </TouchableOpacity>
            
            <View style={styles.header}>
              <Ionicons name="briefcase-outline" size={48} color="#4A90E2" />
              <Text style={styles.title}>Become a Seller</Text>
              <Text style={styles.subtitle}>Tell us a bit about your business to get started.</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons name="business-outline" size={22} color="#8A9BCA" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Business Name"
                  placeholderTextColor="#8A9BCA"
                  value={formData.businessName}
                  onChangeText={(value) => handleInputChange('businessName', value)}
                />
              </View>
              {errors.businessName ? <Text style={styles.errorText}>{errors.businessName}</Text> : null}

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={22} color="#8A9BCA" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Business Email"
                  placeholderTextColor="#8A9BCA"
                  value={formData.businessEmail}
                  onChangeText={(value) => handleInputChange('businessEmail', value)}
                  keyboardType="email-address"
                />
              </View>
              {errors.businessEmail ? <Text style={styles.errorText}>{errors.businessEmail}</Text> : null}

              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={22} color="#8A9BCA" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Business Phone (Optional)"
                  placeholderTextColor="#8A9BCA"
                  value={formData.businessPhone}
                  onChangeText={(value) => handleInputChange('businessPhone', value)}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="document-text-outline" size={22} color="#8A9BCA" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Tax ID (Optional)"
                  placeholderTextColor="#8A9BCA"
                  value={formData.taxId}
                  onChangeText={(value) => handleInputChange('taxId', value)}
                />
              </View>

              <Text style={styles.label}>Business Type</Text>
              <View style={styles.businessTypeContainer}>
                <TouchableOpacity
                  style={[styles.businessTypeButton, formData.businessType === 'individual' && styles.selected]}
                  onPress={() => handleInputChange('businessType', 'individual')}
                >
                  <Ionicons name="person-outline" size={20} color={formData.businessType === 'individual' ? 'white' : '#4A90E2'} />
                  <Text style={[styles.businessTypeText, formData.businessType === 'individual' && styles.selectedText]}>Individual</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.businessTypeButton, formData.businessType === 'company' && styles.selected]}
                  onPress={() => handleInputChange('businessType', 'company')}
                >
                  <Ionicons name="business-outline" size={20} color={formData.businessType === 'company' ? 'white' : '#4A90E2'} />
                  <Text style={[styles.businessTypeText, formData.businessType === 'company' && styles.selectedText]}>Company</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleApply} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Submit Application</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D9E6',
    marginBottom: 4,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E3A8A',
    paddingVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 10,
    color: '#374151',
  },
  businessTypeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  businessTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D9E6',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  selected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  businessTypeText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
    marginLeft: 8,
  },
  selectedText: {
    color: 'white',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
    marginLeft: 12,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
