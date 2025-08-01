// =============================================
// USER TYPES
// =============================================

// Base User (from Supabase auth)
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  user_metadata?: any;
}

// User Profile (extends auth.users)
export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  
  // Contact Info
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  
  // Profile Info
  avatar_url?: string;
  bio?: string;
  website_url?: string;
  
  // Account Status
  is_verified: boolean;
  is_seller: boolean;
  is_admin: boolean;
  account_status: 'active' | 'suspended' | 'banned';
  
  // Preferences
  language: string;
  timezone: string;
  currency: string;
  
  // Privacy
  is_public_profile: boolean;
  allow_marketing_emails: boolean;
  allow_notifications: boolean;
  
  // Analytics
  last_login_at?: string;
  login_count: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// User Address
export interface UserAddress {
  id: string;
  user_id: string;
  
  // Address Info
  address_type: 'shipping' | 'billing' | 'both';
  is_default: boolean;
  
  // Contact
  first_name: string;
  last_name: string;
  company?: string;
  phone?: string;
  
  // Address
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  
  // Additional Info
  instructions?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// User Preferences
export interface UserPreferences {
  id: string;
  user_id: string;
  
  // Shopping Preferences
  preferred_categories?: string[];
  preferred_brands?: string[];
  price_range_min?: number;
  price_range_max?: number;
  
  // Notification Preferences
  email_notifications?: any;
  push_notifications?: any;
  sms_notifications?: any;
  
  // Display Preferences
  theme: 'light' | 'dark';
  compact_mode: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// User Session
export interface UserSession {
  id: string;
  user_id: string;
  
  // Session Info
  session_token: string;
  device_type?: string;
  device_id?: string;
  user_agent?: string;
  ip_address?: string;
  
  // Location
  country?: string;
  city?: string;
  timezone?: string;
  
  // Status
  is_active: boolean;
  expires_at: string;
  
  // Timestamps
  created_at: string;
  last_activity_at: string;
}

// Store (Seller-specific)
export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  owner_id: string;
  store_status: 'active' | 'inactive' | 'suspended';
  is_verified: boolean;
  settings: any;
  
  // Business Info
  business_type: 'individual' | 'company' | 'partnership';
  tax_id?: string;
  business_phone?: string;
  business_email?: string;
  business_address?: any;
  
  // Settings
  payment_settings: any;
  shipping_settings: any;
  commission_rate: number;
  
  // Verification
  verification_documents?: any;
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_notes?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// =============================================
// AUTHENTICATION TYPES
// =============================================

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  username?: string;
}

// =============================================
// SELLER ONBOARDING TYPES
// =============================================

export interface SellerApplication {
  id: string;
  user_id: string;
  business_name: string;
  business_type: 'individual' | 'company' | 'partnership';
  business_address: any;
  tax_id?: string;
  business_phone: string;
  business_email: string;
  documents: any[];
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StoreSetupData {
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  business_type: 'individual' | 'company' | 'partnership';
  business_phone?: string;
  business_email?: string;
  business_address?: any;
  payment_settings?: any;
  shipping_settings?: any;
}

// =============================================
// USER DASHBOARD TYPES
// =============================================

export interface UserDashboardStats {
  profile: UserProfile;
  isSeller: boolean;
  storeCount: number;
  addressCount: number;
  lastLogin?: string;
  accountAge: string;
  // Add more stats as needed
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  metadata?: any;
  created_at: string;
}

// =============================================
// NOTIFICATION TYPES
// =============================================

export interface UserNotification {
  id: string;
  user_id: string;
  type: 'email' | 'push' | 'sms' | 'in_app';
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

// =============================================
// PREFERENCES TYPES
// =============================================

export interface NotificationPreferences {
  order_updates: boolean;
  product_updates: boolean;
  marketing_emails: boolean;
  security_alerts: boolean;
  new_features: boolean;
}

export interface ShoppingPreferences {
  preferred_categories: string[];
  preferred_brands: string[];
  price_range_min?: number;
  price_range_max?: number;
  shipping_preferences: any;
  payment_preferences: any;
}

// =============================================
// UTILITY TYPES
// =============================================

export interface UserSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: {
    is_seller?: boolean;
    account_status?: string;
    is_verified?: boolean;
  };
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface UserStats {
  total_users: number;
  active_users: number;
  sellers: number;
  verified_sellers: number;
  new_users_today: number;
  new_users_this_week: number;
  new_users_this_month: number;
} 