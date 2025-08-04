import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context/AppContext';

// Import navigators
import AuthNavigator from './AuthNavigator';
import UserDashboardNavigator from './UserDashboardNavigator';
import SellerDashboardNavigator from './SellerDashboardNavigator';

// Import screens
import OnboardingScreen from '../screens/OnboardingScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';

const Stack = createStackNavigator();

interface AppNavigatorProps {
  initialMode: 'user' | 'seller';
}

export default function AppNavigator({ initialMode }: AppNavigatorProps) {
  const { state } = useApp();
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [selectedRole, setSelectedRole] = useState<'user' | 'seller' | null>(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const onboarded = await AsyncStorage.getItem('isOnboarded');
        const role = await AsyncStorage.getItem('selectedRole');
        
        setIsOnboarded(onboarded === 'true');
        setSelectedRole(role as 'user' | 'seller' | null);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsOnboarded(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  // Show loading while checking onboarding status
  if (isOnboarded === null) {
    return null;
  }

  // Show onboarding if not completed
  if (!isOnboarded) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      </Stack.Navigator>
    );
  }

  // Show role selection if role not selected
  if (!selectedRole) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      </Stack.Navigator>
    );
  }

  // Show auth if not authenticated
  if (!state.isAuthenticated) {
    return <AuthNavigator />;
  }

  // Show appropriate dashboard based on role
  if (selectedRole === 'seller') {
    return <SellerDashboardNavigator />;
  } else {
    return <UserDashboardNavigator />;
  }
} 