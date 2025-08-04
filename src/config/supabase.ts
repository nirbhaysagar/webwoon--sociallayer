import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration with hardcoded credentials
const supabaseUrl = "https://wgdeakzwsukstmtdrzng.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZGVha3p3c3Vrc3RtdGRyem5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNjAzMDksImV4cCI6MjA2OTYzNjMwOX0.kdTIXv0DxnLlbvWJDK_vn9E7zzqr2g4teX4oWFr3g6Y";

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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

export default supabase; 