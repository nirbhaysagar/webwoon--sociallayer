import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, radii, shadows } from '../constants/theme';
import { scale, verticalScale, moderateScale } from '../lib/scale';

const { width, height } = Dimensions.get('window');

interface OnboardingCard {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  backgroundColor: string;
  accentColor: string;
}

const onboardingCards: OnboardingCard[] = [
  {
    id: 1,
    title: 'Welcome to SocialSpark',
    subtitle: 'Your Complete Social Commerce Platform',
    description: 'Connect, sell, and grow your business with our powerful social commerce tools designed for modern entrepreneurs.',
    icon: 'SPARK',
    backgroundColor: colors.primary,
    accentColor: '#0056CC',
  },
  {
    id: 2,
    title: 'For Sellers',
    subtitle: 'Build Your Online Store',
    description: 'Create stunning product catalogs, manage inventory, and reach customers worldwide with our comprehensive seller tools.',
    icon: 'STORE',
    backgroundColor: colors.secondary,
    accentColor: '#4A4AFF',
  },
  {
    id: 3,
    title: 'For Buyers',
    subtitle: 'Discover Amazing Products',
    description: 'Browse curated collections, follow your favorite sellers, and shop with confidence on our secure platform.',
    icon: 'SHOP',
    backgroundColor: colors.accent,
    accentColor: '#FF6B35',
  },
];

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < onboardingCards.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    } else {
      navigation.navigate('RoleSelection' as never);
    }
  };

  const handleSkip = () => {
    navigation.navigate('RoleSelection' as never);
  };

  const handleDotPress = (index: number) => {
    setCurrentIndex(index);
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.logo}>SocialSpark</Text>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cards */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {onboardingCards.map((card, index) => (
          <View key={card.id} style={styles.card}>
            <View style={[styles.cardBackground, { backgroundColor: card.backgroundColor }]}>
              <View style={styles.cardContent}>
                <View style={[styles.iconContainer, { backgroundColor: card.accentColor }]}>
                  <Text style={styles.iconText}>{card.icon}</Text>
                </View>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                <Text style={styles.cardDescription}>{card.description}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {onboardingCards.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.activeDot,
            ]}
            onPress={() => handleDotPress(index)}
          />
        ))}
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex === onboardingCards.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl + spacing.l,
    paddingBottom: spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: moderateScale(28),
    fontWeight: '700',
    color: colors.text,
    fontFamily: typography.fontFamily,
    letterSpacing: 1,
  },
  skipButton: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    ...shadows.subtle,
  },
  skipText: {
    fontSize: moderateScale(16),
    color: colors.textSecondary,
    fontFamily: typography.fontFamily,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    width,
    height: height * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBackground: {
    width: width * 0.92,
    height: height * 0.65,
    borderRadius: radii.xlarge,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    ...shadows.floating,
  },
  cardContent: {
    alignItems: 'center',
    maxWidth: width * 0.85,
  },
  iconContainer: {
    width: scale(100),
    height: scale(100),
    borderRadius: radii.circle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
    ...shadows.floating,
  },
  iconText: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: colors.text,
    fontFamily: typography.fontFamily,
    letterSpacing: 2,
  },
  cardTitle: {
    fontSize: moderateScale(36),
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.m,
    fontFamily: typography.fontFamily,
    lineHeight: moderateScale(42),
  },
  cardSubtitle: {
    fontSize: moderateScale(22),
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.l,
    fontFamily: typography.fontFamily,
    fontWeight: '600',
    lineHeight: moderateScale(28),
  },
  cardDescription: {
    fontSize: moderateScale(18),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: moderateScale(26),
    fontFamily: typography.fontFamily,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  dot: {
    width: scale(12),
    height: scale(12),
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    marginHorizontal: spacing.s,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: scale(32),
  },
  bottomSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl + spacing.l,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.l,
    borderRadius: radii.medium,
    alignItems: 'center',
    ...shadows.button,
  },
  nextButtonText: {
    fontSize: moderateScale(18),
    color: colors.text,
    fontWeight: '600',
    fontFamily: typography.fontFamily,
  },
});

export default OnboardingScreen; 