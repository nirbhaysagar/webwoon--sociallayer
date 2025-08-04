import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import { View, Text } from 'react-native';

// Import screens
import UserHomeScreen from '../screens/UserDashboard/UserHomeScreen';
import ProductDiscoveryScreen from '../screens/UserDashboard/ProductDiscoveryScreen';
import ProductSearchScreen from '../screens/UserDashboard/ProductSearchScreen';
import AdvancedSearchScreen from '../screens/UserDashboard/AdvancedSearchScreen';
import ProductDetailScreen from '../screens/UserDashboard/ProductDetailScreen';
import ShoppingCartScreen from '../screens/UserDashboard/ShoppingCartScreen';
import UserOrdersScreen from '../screens/UserDashboard/UserOrdersScreen';
import UserProfileScreen from '../screens/UserDashboard/UserProfileScreen';
import CheckoutScreen from '../screens/UserDashboard/CheckoutScreen';
import EnhancedCheckoutScreen from '../screens/UserDashboard/EnhancedCheckoutScreen';
import OrderHistoryScreen from '../screens/UserDashboard/OrderHistoryScreen';
import OrderManagementScreen from '../screens/UserDashboard/OrderManagementScreen';
import OrderTrackingScreen from '../screens/UserDashboard/OrderTrackingScreen';
import LiveRoomsScreen from '../screens/UserDashboard/LiveRoomsScreen';
import LiveRoomViewerScreen from '../screens/UserDashboard/LiveRoomViewerScreen';
import CreateLiveRoomScreen from '../screens/UserDashboard/CreateLiveRoomScreen';
import NotificationHistoryScreen from '../screens/UserDashboard/NotificationHistoryScreen';
import NotificationSettingsScreen from '../screens/UserDashboard/NotificationSettingsScreen';

// Sidebar screens
import UserSavedScreen from '../screens/UserDashboard/UserSavedScreen';
import UserFollowingScreen from '../screens/UserDashboard/UserFollowingScreen';
import UserMessagesScreen from '../screens/UserDashboard/UserMessagesScreen';
import UserNotificationsScreen from '../screens/UserDashboard/UserNotificationsScreen';
import UserSettingsScreen from '../screens/UserDashboard/UserSettingsScreen';
import UserHelpScreen from '../screens/UserDashboard/UserHelpScreen';
import PrivacySettingsScreen from '../screens/UserDashboard/PrivacySettingsScreen';
import SecurityScreen from '../screens/UserDashboard/SecurityScreen';
import DataStorageScreen from '../screens/UserDashboard/DataStorageScreen';
import HelpCenterScreen from '../screens/UserDashboard/HelpCenterScreen';
import ContactSupportScreen from '../screens/UserDashboard/ContactSupportScreen';
import SendFeedbackScreen from '../screens/UserDashboard/SendFeedbackScreen';
import TermsOfServiceScreen from '../screens/UserDashboard/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../screens/UserDashboard/PrivacyPolicyScreen';
import SellerProfileScreen from '../screens/UserDashboard/SellerProfileScreen';
import MessagingScreen from '../screens/UserDashboard/MessagingScreen';
import ChatScreen from '../screens/UserDashboard/ChatScreen';

// Components
import NotificationBadge from '../components/NotificationBadge';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: 24,
          backgroundColor: colors.card,
          borderRadius: 32,
          height: 64,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: colors.shadow,
          shadowOpacity: 1,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 16,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName = 'home-outline';
          switch (route.name) {
            case 'Home': iconName = 'home-outline'; break;
            case 'Discover': iconName = 'search-outline'; break;
            case 'Cart': iconName = 'cart-outline'; break;
            case 'Live': iconName = 'videocam-outline'; break;
            case 'Profile': iconName = 'person-outline'; break;
          }
          return (
            <View style={{
              backgroundColor: focused ? colors.primary : 'transparent',
              borderRadius: 24,
              padding: focused ? 8 : 0,
              alignItems: 'center',
              justifyContent: 'center',
              width: focused ? 48 : 40,
              height: focused ? 48 : 40,
            }}>
              <Ionicons name={iconName} size={focused ? 28 : 24} color={focused ? colors.text : colors.textSecondary} />
              {route.name === 'Cart' && (
                <View style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  backgroundColor: colors.discount,
                  borderRadius: 8,
                  minWidth: 16,
                  height: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 4,
                }}>
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>2</Text>
                </View>
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={UserHomeScreen} />
      <Tab.Screen name="Discover" component={ProductDiscoveryScreen} />
      <Tab.Screen name="Cart" component={ShoppingCartScreen} />
      <Tab.Screen name="Live" component={LiveRoomsScreen} />
      <Tab.Screen name="Profile" component={UserProfileScreen} />
    </Tab.Navigator>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Main"
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
        drawerStyle: { backgroundColor: colors.background },
      }}
    >
      <Drawer.Screen name="Main" component={BottomTabs} options={{ drawerLabel: 'Home', drawerIcon: ({color, size}) => <Ionicons name="home-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="LiveRooms" component={LiveRoomsScreen} options={{ drawerLabel: 'Live Rooms', drawerIcon: ({color, size}) => <Ionicons name="videocam-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Saved" component={UserSavedScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="heart-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Following" component={UserFollowingScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="people-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Messages" component={MessagingScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="chatbubble-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Notifications" component={UserNotificationsScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="notifications-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Settings" component={UserSettingsScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="settings-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Help" component={UserHelpScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="help-circle-outline" size={size} color={color} /> }} />
    </Drawer.Navigator>
  );
}

export default function UserDashboardNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainApp" component={DrawerNavigator} />
      <Stack.Screen name="ProductSearch" component={ProductSearchScreen} />
      <Stack.Screen name="AdvancedSearch" component={AdvancedSearchScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="SellerProfileScreen" component={SellerProfileScreen} />
      <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
      <Stack.Screen name="EnhancedCheckout" component={EnhancedCheckoutScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="OrderManagement" component={OrderManagementScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <Stack.Screen name="LiveRooms" component={LiveRoomsScreen} />
      <Stack.Screen name="LiveRoomViewer" component={LiveRoomViewerScreen} />
      <Stack.Screen name="CreateLiveRoom" component={CreateLiveRoomScreen} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="DataStorage" component={DataStorageScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
      <Stack.Screen name="SendFeedback" component={SendFeedbackScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="NotificationHistory" component={NotificationHistoryScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="Messaging" component={MessagingScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
} 