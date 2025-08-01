import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../constants/theme';
import Button from '../components/common/Button';

const { width } = Dimensions.get('window');

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const TextButton = ({ onPress, title, style, textStyle }) => {
    const [scaleValue] = useState(new Animated.Value(1));
  
    const handlePressIn = () => {
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };
  
    const handlePressOut = () => {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };
  
    return (
      <AnimatedTouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[{ transform: [{ scale: scaleValue }] }, style]}
      >
        <Text style={textStyle}>{title}</Text>
      </AnimatedTouchableOpacity>
    );
};

export default function UserOnboardingScreen({ navigation }: any) {
  const [currentStep, setCurrentStep] = useState(0);

  const onboardingSteps = [
    {
      title: 'Welcome to SocialSpark!',
      subtitle: 'Discover amazing products through social shopping',
      icon: 'sparkles',
      color: colors.primary,
      description: 'Swipe through products, follow your favorite stores, and shop with friends.',
    },
    {
      title: 'Swipe to Discover',
      subtitle: 'Find products you love',
      icon: 'heart',
      color: colors.success,
      description: 'Swipe right to like, left to skip. Build your personalized feed.',
    },
    {
      title: 'Follow Stores',
      subtitle: 'Stay updated with your favorites',
      icon: 'people',
      color: colors.secondary,
      description: 'Follow stores you love to see their latest products and updates.',
    },
    {
      title: 'Shop Socially',
      subtitle: 'Share and discover with friends',
      icon: 'share-social',
      color: colors.warning,
      description: 'Share products, comment on posts, and discover trends together.',
    },
  ];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Navigate to main user dashboard
      navigation.navigate('UserDashboard');
    }
  };

  const handleSkip = () => {
    navigation.navigate('UserDashboard');
  };

  const renderStep = (step: any, index: number) => (
    <View key={index} style={styles.stepContainer}>
      <View style={[styles.iconContainer, { backgroundColor: step.color + '20' }]}>
        <Ionicons name={step.icon} size={48} color={step.color} />
      </View>
      
      <Text style={styles.stepTitle}>{step.title}</Text>
      <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
      <Text style={styles.stepDescription}>{step.description}</Text>
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
        <TextButton
            title="Skip"
            onPress={handleSkip}
            style={styles.skipButton}
            textStyle={styles.skipButtonText}
        />

        <Button
            title={currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            style={styles.nextButton}
            textStyle={styles.nextButtonText}
        >
            <Ionicons 
                name={currentStep === onboardingSteps.length - 1 ? 'checkmark' : 'arrow-forward'} 
                size={20} 
                color={colors.white} 
            />
        </Button>
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
    backgroundColor: colors.primary,
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
    backgroundColor: colors.primary,
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
