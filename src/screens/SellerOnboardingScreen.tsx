import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../constants/theme';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

export default function SellerOnboardingScreen({ navigation }: any) {
  const [currentStep, setCurrentStep] = useState(0);
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [storeCategory, setStoreCategory] = useState('');
  const { state } = useApp();

  const onboardingSteps = [
    {
      title: 'Welcome, Seller!',
      subtitle: 'Let\'s set up your store',
      icon: 'storefront',
      color: colors.secondary,
      description: 'Create your store profile and start selling to customers worldwide.',
    },
    {
      title: 'Store Setup',
      subtitle: 'Tell us about your business',
      icon: 'settings',
      color: colors.primary,
      description: 'We\'ll help you create a compelling store profile.',
    },
    {
      title: 'List Products',
      subtitle: 'Start with your best items',
      icon: 'add-circle',
      color: colors.success,
      description: 'Add products, set prices, and create engaging posts.',
    },
    {
      title: 'Grow Your Business',
      subtitle: 'Reach more customers',
      icon: 'trending-up',
      color: colors.warning,
      description: 'Use analytics, promotions, and social features to grow.',
    },
  ];

  const categories = [
    'Fashion & Apparel',
    'Electronics',
    'Home & Garden',
    'Beauty & Personal Care',
    'Sports & Outdoors',
    'Books & Media',
    'Food & Beverages',
    'Health & Wellness',
    'Toys & Games',
    'Automotive',
    'Other',
  ];

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate store setup
      if (!storeName.trim() || !storeDescription.trim() || !storeCategory) {
        Alert.alert('Error', 'Please fill in all store details');
        return;
      }
    }

    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Create store and navigate to seller dashboard
      createStore();
    }
  };

  const createStore = async () => {
    try {
      // Here you would create the store in the database
      // For now, we'll just navigate to the seller dashboard
      Alert.alert(
        'Store Created!',
        'Your store has been set up successfully. Welcome to SocialSpark!',
        [
          {
            text: 'Continue',
            onPress: () => navigation.navigate('SellerDashboard'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create store. Please try again.');
    }
  };

  const handleSkip = () => {
    navigation.navigate('SellerDashboard');
  };

  const renderStep = (step: any, index: number) => (
    <View key={index} style={styles.stepContainer}>
      <View style={[styles.iconContainer, { backgroundColor: step.color + '20' }]}>
        <Ionicons name={step.icon} size={48} color={step.color} />
      </View>
      
      <Text style={styles.stepTitle}>{step.title}</Text>
      <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
      <Text style={styles.stepDescription}>{step.description}</Text>

      {/* Store Setup Form */}
      {index === 1 && (
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Store Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your store name"
              placeholderTextColor={colors.textSecondary}
              value={storeName}
              onChangeText={setStoreName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Store Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your store and what you sell"
              placeholderTextColor={colors.textSecondary}
              value={storeDescription}
              onChangeText={setStoreDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Category</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryContainer}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    storeCategory === category && styles.categoryChipSelected,
                  ]}
                  onPress={() => setStoreCategory(category)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    storeCategory === category && styles.categoryChipTextSelected,
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {currentStep + 1} of {onboardingSteps.length}
        </Text>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderStep(onboardingSteps[currentStep], currentStep)}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentStep === onboardingSteps.length - 1 ? 'Create Store' : 'Next'}
          </Text>
          <Ionicons 
            name={currentStep === onboardingSteps.length - 1 ? 'checkmark' : 'arrow-forward'} 
            size={20} 
            color={colors.white} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressContainer: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l,
    paddingBottom: spacing.m,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: spacing.s,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.l,
  },
  stepContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.l,
  },
  stepTitle: {
    fontSize: typography.h2,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  stepSubtitle: {
    fontSize: typography.subtitle,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  stepDescription: {
    fontSize: typography.bodyFontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.8,
    marginBottom: spacing.l,
  },
  formContainer: {
    width: '100%',
    marginTop: spacing.m,
  },
  inputContainer: {
    marginBottom: spacing.m,
  },
  inputLabel: {
    fontSize: typography.bodyFontSize,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: radii.m,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    fontSize: typography.bodyFontSize,
    color: colors.text,
    ...shadows.card,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    marginTop: spacing.xs,
  },
  categoryChip: {
    backgroundColor: colors.card,
    borderRadius: radii.m,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginRight: spacing.s,
    ...shadows.card,
  },
  categoryChipSelected: {
    backgroundColor: colors.secondary,
  },
  categoryChipText: {
    fontSize: typography.caption,
    color: colors.text,
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: colors.white,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  skipButton: {
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
  },
  skipButtonText: {
    fontSize: typography.bodyFontSize,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radii.m,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    ...shadows.button,
  },
  nextButtonText: {
    fontSize: typography.bodyFontSize,
    fontWeight: '600',
    color: colors.white,
    marginRight: spacing.xs,
  },
}); 