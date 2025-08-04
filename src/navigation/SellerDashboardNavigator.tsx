import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/SellerDashboard/HomeScreen';
import PostsScreen from '../screens/SellerDashboard/PostsScreen';
import ProductsScreen from '../screens/SellerDashboard/ProductsScreen';
import BoostScreen from '../screens/SellerDashboard/BoostScreen';
import AnalyticsScreen from '../screens/SellerDashboard/AnalyticsScreen';
import AIIntegrationScreen from '../screens/SellerDashboard/AIIntegrationScreen';
import ProfileScreen from '../screens/SellerDashboard/ProfileScreen';
import PersonalInfoScreen from '../screens/SellerDashboard/PersonalInfoScreen';
import BusinessInfoScreen from '../screens/SellerDashboard/BusinessInfoScreen';
import PayoutSettingsScreen from '../screens/SellerDashboard/PayoutSettingsScreen';
import NotificationPreferencesScreen from '../screens/SellerDashboard/NotificationPreferencesScreen';
import RoleManagementScreen from '../screens/SellerDashboard/RoleManagementScreen';
import SettingsScreen from '../screens/SellerDashboard/SettingsScreen';
import UserProfileScreen from '../screens/SellerDashboard/UserProfileScreen';
import SignOutScreen from '../screens/SellerDashboard/SignOutScreen';
import StoreIntegrationScreen from '../screens/SellerDashboard/StoreIntegrationScreen';
import IntegrationSettingsScreen from '../screens/SellerDashboard/IntegrationSettingsScreen';
import OrdersScreen from '../screens/SellerDashboard/OrdersScreen';
import MessagesScreen from '../screens/SellerDashboard/MessagesScreen';
import NotificationsScreen from '../screens/SellerDashboard/NotificationsScreen';
import StorefrontPreviewScreen from '../screens/SellerDashboard/StorefrontPreviewScreen';
import HelpSupportScreen from '../screens/SellerDashboard/HelpSupportScreen';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import AddEditProductScreen from '../screens/SellerDashboard/AddEditProductScreen';
import { createStackNavigator } from '@react-navigation/stack';
import PostDetailScreen from '../screens/SellerDashboard/PostDetailScreen';
import CreateEditPostScreen from '../screens/SellerDashboard/CreateEditPostScreen';
import PostAnalyticsDrilldownScreen from '../screens/SellerDashboard/PostAnalyticsDrilldownScreen';
import { View, Text } from 'react-native';
import AnalyticsDashboard from '../screens/SellerDashboard/AnalyticsDashboard';
import InventoryManagementScreen from '../screens/SellerDashboard/InventoryManagementScreen';
import SupplierManagementScreen from '../screens/SellerDashboard/SupplierManagementScreen';
import PurchaseOrdersScreen from '../screens/SellerDashboard/PurchaseOrdersScreen';
import SellerMessagingScreen from '../screens/SellerDashboard/SellerMessagingScreen';
import SellerLiveRoomsScreen from '../screens/SellerDashboard/SellerLiveRoomsScreen';
import CreateLiveRoomScreen from '../screens/UserDashboard/CreateLiveRoomScreen';
import LiveRoomViewerScreen from '../screens/UserDashboard/LiveRoomViewerScreen';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const ProductStack = createStackNavigator();
const PostsStackNav = createStackNavigator();
const ProfileStack = createStackNavigator();
const Stack = createStackNavigator();

function ProductsStack() {
  return (
    <ProductStack.Navigator screenOptions={{ headerShown: false }}>
      <ProductStack.Screen name="ProductsMain" component={ProductsScreen} />
      <ProductStack.Screen name="AddEditProduct" component={AddEditProductScreen} />
    </ProductStack.Navigator>
  );
}

function PostsStack() {
  return (
    <PostsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <PostsStackNav.Screen name="PostsMain" component={PostsScreen} />
      <PostsStackNav.Screen name="PostDetail" component={PostDetailScreen} />
      <PostsStackNav.Screen name="CreateEditPost" component={CreateEditPostScreen} />
      <PostsStackNav.Screen name="PostAnalyticsDrilldown" component={PostAnalyticsDrilldownScreen} />
    </PostsStackNav.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="UserProfileScreen" component={UserProfileScreen} />
      <ProfileStack.Screen name="PersonalInfoScreen" component={PersonalInfoScreen} />
      <ProfileStack.Screen name="BusinessInfoScreen" component={BusinessInfoScreen} />
      <ProfileStack.Screen name="PayoutSettingsScreen" component={PayoutSettingsScreen} />
      <ProfileStack.Screen name="NotificationPreferencesScreen" component={NotificationPreferencesScreen} />
      <ProfileStack.Screen name="RoleManagementScreen" component={RoleManagementScreen} />
      <ProfileStack.Screen name="SettingsScreen" component={SettingsScreen} />
      <ProfileStack.Screen name="SignOutScreen" component={SignOutScreen} />
      <ProfileStack.Screen name="IntegrationSettings" component={IntegrationSettingsScreen} />
    </ProfileStack.Navigator>
  );
}

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
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
          switch (route.name) {
            case 'Home': iconName = 'home-outline'; break;
            case 'Products': iconName = 'cube-outline'; break;
            case 'Posts': iconName = 'images-outline'; break;
            case 'Boost': iconName = 'rocket-outline'; break;
            case 'Analytics': iconName = 'bar-chart-outline'; break;
            case 'Integration': iconName = 'link-outline'; break;
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
              {route.name === 'Posts' && (
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
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>4</Text>
                </View>
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Products" component={ProductsStack} />
      <Tab.Screen name="Posts" component={PostsStack} />
      <Tab.Screen name="Boost" component={BoostScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsDashboard} />
      <Tab.Screen name="Integration" component={StoreIntegrationScreen} />
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
      <Drawer.Screen name="Main" component={BottomTabs} options={{ drawerLabel: 'Dashboard', drawerIcon: ({color, size}) => <Ionicons name="grid-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="LiveRooms" component={SellerLiveRoomsScreen} options={{ drawerLabel: 'Live Rooms', drawerIcon: ({color, size}) => <Ionicons name="videocam-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Inventory Management" component={InventoryManagementScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="cube-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Supplier Management" component={SupplierManagementScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="people-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Purchase Orders" component={PurchaseOrdersScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="document-text-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Store Integration" component={StoreIntegrationScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="link-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="AI Integration" component={AIIntegrationScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="sparkles-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Orders" component={OrdersScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="receipt-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Messages" component={SellerMessagingScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="chatbubble-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Notifications" component={NotificationsScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="notifications-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Storefront Preview" component={StorefrontPreviewScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="eye-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Profile/Settings" component={ProfileStackNavigator} options={{ drawerIcon: ({color, size}) => <Ionicons name="person-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Help/Support" component={HelpSupportScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="help-circle-outline" size={size} color={color} /> }} />
    </Drawer.Navigator>
  );
}

export default function SellerDashboardNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainApp" component={DrawerNavigator} />
      <Stack.Screen name="LiveRoomViewer" component={LiveRoomViewerScreen} />
      <Stack.Screen name="CreateLiveRoom" component={CreateLiveRoomScreen} />
    </Stack.Navigator>
  );
} 