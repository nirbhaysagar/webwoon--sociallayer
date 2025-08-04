import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from './constants/theme';
import AppNavigator from './navigation/AppNavigator';
import { AppProvider } from './context/AppContext';
import { UserShopProvider } from './context/UserShopContext';
import { NotificationService } from './services/notificationService';
import { AnalyticsService } from './services/analyticsService';

export default function App() {
  const [isUserMode, setIsUserMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAppMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('appMode');
        if (savedMode) {
          setIsUserMode(savedMode === 'user');
        }
      } catch (error) {
        console.error('Error loading app mode:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAppMode();
    
    // Initialize notification service
    NotificationService.initialize().catch(error => {
      console.error('Error initializing notifications:', error);
    });

    // Initialize analytics service
    AnalyticsService.initializeSession().catch(error => {
      console.error('Error initializing analytics:', error);
    });
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <AppProvider>
        <UserShopProvider>
          <AppNavigator initialMode={isUserMode ? 'user' : 'seller'} />
        </UserShopProvider>
      </AppProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 18,
    color: colors.text,
  },
}); 