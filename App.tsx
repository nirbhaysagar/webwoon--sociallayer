import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SellerDashboardNavigator from './src/navigation/SellerDashboardNavigator';
import UserDashboardNavigator from './src/navigation/UserDashboardNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import { colors } from './src/constants/theme';
import { AppProvider } from './src/context/AppContext';
import { UserShopProvider } from './src/context/UserShopContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';

function AppContent() {
  const [isUserMode, setIsUserMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved mode from AsyncStorage
  useEffect(() => {
    loadSavedMode();
  }, []);

  const loadSavedMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('appMode');
      if (savedMode !== null) {
        setIsUserMode(savedMode === 'user');
      }
    } catch (error) {
      console.error('Error loading saved mode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = async () => {
    const newMode = !isUserMode;
    setIsUserMode(newMode);
    
    // Save mode to AsyncStorage
    try {
      await AsyncStorage.setItem('appMode', newMode ? 'user' : 'seller');
    } catch (error) {
      console.error('Error saving mode:', error);
    }
  };

  // Show loading while restoring state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Bypass authentication completely - go directly to user dashboard
  return (
    <View style={styles.container}>
      <NavigationContainer>
        {isUserMode ? <UserDashboardNavigator /> : <SellerDashboardNavigator />}
      </NavigationContainer>
      
      {/* Development Mode Switch Button */}
      <TouchableOpacity 
        style={styles.modeSwitchButton}
        onPress={toggleMode}
        activeOpacity={0.8}
      >
        <Text style={styles.modeSwitchText}>
          {isUserMode ? 'USER' : 'SELLER'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <UserShopProvider>
          <AppContent />
        </UserShopProvider>
      </AuthProvider>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  modeSwitchButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  modeSwitchText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
