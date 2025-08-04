import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from '../screens/OnboardingScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import SellerRegisterScreen from '../screens/auth/SellerRegisterScreen';
import SellerSignupScreen from '../screens/SellerSignupScreen';
import UserSignupScreen from '../screens/UserSignupScreen';
import { colors } from '../constants/theme';

export type AuthStackParamList = {
  Onboarding: undefined;
  RoleSelection: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  SellerRegister: undefined;
  SellerSignup: undefined;
  UserSignup: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Onboarding"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="SellerRegister" component={SellerRegisterScreen} />
      <Stack.Screen name="SellerSignup" component={SellerSignupScreen} />
      <Stack.Screen name="UserSignup" component={UserSignupScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator; 