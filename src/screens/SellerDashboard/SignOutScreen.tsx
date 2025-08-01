import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from './components/HeaderWithMenu';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';

export default function SignOutScreen() {
  const navigation = useNavigation();
  const { signOut } = useApp();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? You will need to sign in again to access your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              // Navigation will be handled by the auth state change
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        },
      ]
    );
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithMenu />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="log-out-outline" size={80} color={colors.error} />
        </View>
        
        <Text style={styles.title}>Sign Out</Text>
        <Text style={styles.subtitle}>
          Are you sure you want to sign out of your account? You will need to sign in again to access your dashboard.
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color={colors.white} />
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>What happens when you sign out?</Text>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
            <Text style={styles.infoText}>Your session will end</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
            <Text style={styles.infoText}>You'll need to sign in again</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
            <Text style={styles.infoText}>Your data remains safe</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.m,
    paddingTop: spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: spacing.l,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.m,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.m,
    marginBottom: spacing.xl,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.text,
  },
  signOutButton: {
    flex: 1,
    backgroundColor: colors.error,
    borderRadius: radii.medium,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.s,
    ...shadows.card,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.white,
  },
  infoContainer: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    width: '100%',
    ...shadows.card,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.s,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: spacing.s,
    fontFamily: 'monospace',
  },
}); 