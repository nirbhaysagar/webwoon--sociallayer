import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration with hardcoded credentials
const supabaseUrl = "https://wgdeakzwsukstmtdrzng.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZGVha3p3c3Vrc3RtdGRyem5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNjAzMDksImV4cCI6MjA2OTYzNjMwOX0.kdTIXv0DxnLlbvWJDK_vn9E7zzqr2g4teX4oWFr3g6Y";

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// UserRole enum
export enum UserRole {
  USER = 'user',
  SELLER = 'seller',
  ADMIN = 'admin'
}

// Mock functions that AppContext expects
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    return profile || user;
  }
  return null;
};

export const getCurrentStore = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: store } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', user.id)
      .single();
    return store;
  }
  return null;
};

export const switchUserRole = async (newRole: UserRole) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data, error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  return null;
};

// Mock realtime manager
export const realtimeManager = {
  subscribeToUserConversations: (userId: string, callback: (payload: any) => void) => {
    console.log('Mock realtime subscription for user conversations');
  },
  subscribeToStoreConversations: (storeId: string, callback: (payload: any) => void) => {
    console.log('Mock realtime subscription for store conversations');
  },
  unsubscribe: () => {
    console.log('Mock realtime unsubscribe');
  }
};

// Mock data consistency manager
export const dataConsistencyManager = {
  invalidateCache: (key: string) => {
    console.log('Mock cache invalidation:', key);
  },
  clearAllCache: () => {
    console.log('Mock clear all cache');
  }
};

// Import types from the generated file
export type { 
  User, 
  Store, 
  Product, 
  Order, 
  Post, 
  Conversation, 
  Message, 
  ConversationWithMessages 
} from '../types/supabase.generated';

export { supabase };
