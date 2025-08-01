import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing, radii } from '../constants/theme';

const AuthTest: React.FC = () => {
  const { user, isAuthenticated, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      Alert.alert('Success', 'Signed out successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleTestAuth = () => {
    Alert.alert(
      'Authentication Status',
      `User: ${user ? user.email : 'Not signed in'}\nAuthenticated: ${isAuthenticated()}\nLoading: ${loading}`
    );
  };

  if (!isAuthenticated()) {
    return null; // Don't show test component when not authenticated
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Auth Test Panel</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Status:</Text>
        <Text style={styles.value}>
          {loading ? 'Loading...' : isAuthenticated() ? 'Authenticated' : 'Not Authenticated'}
        </Text>
      </View>

      {user && (
        <View style={styles.infoContainer}>
          <Text style={styles.label}>User:</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleTestAuth}>
          <Text style={styles.buttonText}>Test Auth Status</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.signOutButton]} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    ...colors.shadows?.card,
  },
  title: {
    ...typography.headline6,
    color: colors.text,
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  value: {
    ...typography.body2,
    color: colors.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.s,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radii.small,
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  signOutButton: {
    backgroundColor: colors.error,
  },
  buttonText: {
    ...typography.button,
    color: colors.text,
    textAlign: 'center',
  },
});

export default AuthTest; 