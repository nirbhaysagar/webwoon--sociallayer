import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, radii, shadows } from '../constants/theme';
import { scale, verticalScale, moderateScale } from '../lib/scale';

const RoleSelectionScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleSignUpAsSeller = () => {
    navigation.navigate('SellerRegister' as never);
  };

  const handleSignUpAsUser = () => {
    navigation.navigate('UserSignup' as never);
  };

  const handleSignIn = () => {
    navigation.navigate('Login' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Path</Text>
        <Text style={styles.subtitle}>
          Join our community as a seller or discover amazing products as a buyer
        </Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Seller Card */}
        <TouchableOpacity style={styles.card} onPress={handleSignUpAsSeller}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
              <Text style={styles.iconText}>🏪</Text>
            </View>
            <Text style={styles.cardTitle}>Sign Up as Seller</Text>
          </View>
          <Text style={styles.cardDescription}>
            Create your online store, manage products, and reach customers worldwide
          </Text>
          <View style={styles.cardFeatures}>
            <Text style={styles.featureText}>• Product catalog management</Text>
            <Text style={styles.featureText}>• Order processing</Text>
            <Text style={styles.featureText}>• Analytics & insights</Text>
            <Text style={styles.featureText}>• Customer engagement tools</Text>
          </View>
        </TouchableOpacity>

        {/* User Card */}
        <TouchableOpacity style={styles.card} onPress={handleSignUpAsUser}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.secondary }]}>
              <Text style={styles.iconText}>🛍️</Text>
            </View>
            <Text style={styles.cardTitle}>Sign Up as User</Text>
          </View>
          <Text style={styles.cardDescription}>
            Discover amazing products, follow your favorite sellers, and shop with confidence
          </Text>
          <View style={styles.cardFeatures}>
            <Text style={styles.featureText}>• Browse curated collections</Text>
            <Text style={styles.featureText}>• Follow favorite sellers</Text>
            <Text style={styles.featureText}>• Secure checkout</Text>
            <Text style={styles.featureText}>• Order tracking</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>
        
        <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
          <Text style={styles.signInButtonText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.text,
    fontSize: moderateScale(28),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: moderateScale(22),
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.large,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  iconContainer: {
    width: scale(48),
    height: scale(48),
    borderRadius: radii.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  iconText: {
    fontSize: moderateScale(24),
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: moderateScale(20),
    fontWeight: '600',
  },
  cardDescription: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.m,
    lineHeight: moderateScale(20),
  },
  cardFeatures: {
    marginTop: spacing.s,
  },
  featureText: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontSize: moderateScale(14),
  },
  bottomSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginHorizontal: spacing.m,
  },
  signInButton: {
    paddingVertical: spacing.m,
    alignItems: 'center',
  },
  signInButtonText: {
    ...typography.body2,
    color: colors.primary,
    fontSize: moderateScale(16),
    fontWeight: '500',
  },
});

export default RoleSelectionScreen; 