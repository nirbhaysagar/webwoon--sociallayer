import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import UserDashboardNavigator from './UserDashboardNavigator';
import SellerDashboardNavigator from './SellerDashboardNavigator';
import OnboardingScreen from '../screens/OnboardingScreen';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, profile, loading } = useAuth();
  // TODO: Replace with persistent storage check (e.g., AsyncStorage)
  const [showOnboarding, setShowOnboarding] = React.useState(true); 

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : user && profile ? (
          profile.is_seller ? (
            <Stack.Screen name="SellerDashboard" component={SellerDashboardNavigator} />
          ) : (
            <Stack.Screen name="UserDashboard" component={UserDashboardNavigator} />
          )
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F5FF',
  },
});

export default AppNavigator;
