import 'react-native-gesture-handler';
import React from 'react';
import { LogBox, Platform, UIManager } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import * as Notifications from 'expo-notifications';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Enable screens for better performance
enableScreens();

// Suppress specific warnings
LogBox.ignoreLogs([
  "Warning: Can't perform a React state update on an unmounted component.",
  "Warning: A component is changing an uncontrolled input to be controlled.",
  "[auth/invalid-credential]"
]);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  return (
    <SafeAreaProvider>
      <ActionSheetProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ActionSheetProvider>
    </SafeAreaProvider>
  );
}
