import { NavigatorScreenParams } from '@react-navigation/native';

// Seller Dashboard Navigation Types
export type SellerTabParamList = {
  Home: undefined;
  Products: NavigatorScreenParams<SellerProductStackParamList>;
  Posts: NavigatorScreenParams<SellerPostsStackParamList>;
  Boost: undefined;
  Analytics: undefined;
};

export type SellerProductStackParamList = {
  ProductsMain: undefined;
  AddEditProduct: { productId?: string };
};

export type SellerPostsStackParamList = {
  PostsMain: undefined;
  PostDetail: { postId: string };
  CreateEditPost: { postId?: string };
  PostAnalyticsDrilldown: { postId: string };
};

export type SellerProfileStackParamList = {
  ProfileMain: undefined;
  PersonalInfoScreen: undefined;
  BusinessInfoScreen: undefined;
  PayoutSettingsScreen: undefined;
  NotificationPreferencesScreen: undefined;
  RoleManagementScreen: undefined;
  SettingsScreen: undefined;
};

export type SellerDrawerParamList = {
  Main: NavigatorScreenParams<SellerTabParamList>;
  Orders: undefined;
  Messages: undefined;
  Notifications: undefined;
  'Storefront Preview': undefined;
  'Profile/Settings': NavigatorScreenParams<SellerProfileStackParamList>;
  'Help/Support': undefined;
};

// User Dashboard Navigation Types
export type UserTabParamList = {
  Home: undefined;
  Explore: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type UserStackParamList = {
  CheckoutScreen: undefined;
  OrderConfirmationScreen: { order: any };
  SellerProfileScreen: { 
    storeId: string; 
    storeName?: string; 
    storeAvatar?: string; 
    storeCategory?: string; 
  };
};

export type UserDrawerParamList = {
  Main: NavigatorScreenParams<UserTabParamList>;
  Saved: undefined;
  Following: undefined;
  Messages: undefined;
  Notifications: undefined;
  Settings: undefined;
  Help: undefined;
};

// Auth Navigation Types
export type AuthStackParamList = {
  Welcome: undefined;
  AuthOptions: undefined;
  AuthScreen: { mode: 'login' | 'signup' };
  RoleSelection: undefined;
  UserSignup: undefined;
  SellerSignup: undefined;
  UserOnboarding: undefined;
  SellerOnboarding: undefined;
};

// Root Navigation Types
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  SellerDashboard: NavigatorScreenParams<SellerDrawerParamList>;
  UserDashboard: NavigatorScreenParams<UserDrawerParamList>;
  MainApp: NavigatorScreenParams<UserTabParamList>;
};

// Navigation Props Types
export type NavigationProps<T extends keyof any> = {
  navigate: (screen: T, params?: any) => void;
  goBack: () => void;
  canGoBack: () => boolean;
};

// Screen Props Types
export type ScreenProps<T extends keyof any, P = undefined> = {
  navigation: NavigationProps<T>;
  route: {
    params: P;
    key: string;
    name: string;
  };
};

// Common Navigation Types
export type CommonNavigationProps = {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
  canGoBack: () => boolean;
  setOptions: (options: any) => void;
  addListener: (event: string, callback: any) => () => void;
  isFocused: () => boolean;
  reset: (state: any) => void;
  push: (screen: string, params?: any) => void;
  pop: (count?: number) => void;
  popToTop: () => void;
  replace: (screen: string, params?: any) => void;
  dispatch: (action: any) => void;
  getState: () => any;
  getParent: () => any;
  getId: () => string | undefined;
};

// Route Params Types
export type RouteParams<T = any> = {
  params: T;
  key: string;
  name: string;
};

// Navigation Hook Types
export type UseNavigationHook = () => CommonNavigationProps;
export type UseRouteHook<T = any> = () => RouteParams<T>; 