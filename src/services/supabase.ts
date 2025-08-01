import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || supabaseUrl === 'your-supabase-url' || supabaseUrl === 'https://your-project.supabase.co') {
  console.warn('⚠️ EXPO_PUBLIC_SUPABASE_URL is not configured. Using mock client.');
  console.warn('📝 To fix this:');
  console.warn('1. Create a .env file in your project root');
  console.warn('2. Add: EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.warn('3. Add: EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here');
  console.warn('4. Replace with your actual Supabase credentials');
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
  console.warn('⚠️ EXPO_PUBLIC_SUPABASE_ANON_KEY is not configured. Using mock client.');
  console.warn('📝 To fix this:');
  console.warn('1. Create a .env file in your project root');
  console.warn('2. Add: EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.warn('3. Add: EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here');
  console.warn('4. Replace with your actual Supabase credentials');
}

// Create Supabase client with fallback for development
let supabase;

if (supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'your-supabase-url' && 
    supabaseUrl !== 'https://your-project.supabase.co' && 
    supabaseAnonKey !== 'your-anon-key-here') {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
} else {
  // Create a mock client for development without Supabase
  console.warn('⚠️ Using mock Supabase client. Please configure your environment variables.');
  
  // Mock data storage
  let mockData = {
    products: [],
    orders: [],
    posts: [],
    users: [],
    stores: [],
    user_profiles: [],
    seller_profiles: []
  };
  
  // Helper to generate IDs
  const generateId = () => Math.random().toString(36).substr(2, 9);
  
  // Store auth state change callbacks
  let authStateCallbacks: Array<(event: string, session: any) => void> = [];
  
  // Mock auth state - PERSISTED IN LOCAL STORAGE
  let mockCurrentUser: any = null;
  let mockCurrentSession: any = null;
  
  // Try to load persisted auth state from localStorage
  try {
    const persistedAuth = localStorage.getItem('mockAuthState');
    if (persistedAuth) {
      const authState = JSON.parse(persistedAuth);
      mockCurrentUser = authState.user;
      mockCurrentSession = authState.session;
    }
  } catch (error) {
    console.log('No persisted auth state found');
  }
  
  // Helper to persist auth state
  const persistAuthState = (user: any, session: any) => {
    try {
      localStorage.setItem('mockAuthState', JSON.stringify({ user, session }));
    } catch (error) {
      console.log('Could not persist auth state');
    }
  };
  
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: mockCurrentSession }, error: null }),
      signInWithPassword: async (credentials) => { 
        // Simulate successful login
        const mockUser = { 
          id: generateId(), 
          email: credentials.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const mockSession = {
          user: mockUser,
          access_token: 'mock-token',
          refresh_token: 'mock-refresh-token',
          expires_at: Date.now() + 3600000, // 1 hour from now
        };
        
        // Update mock auth state
        mockCurrentUser = mockUser;
        mockCurrentSession = mockSession;
        
        // PERSIST AUTH STATE
        persistAuthState(mockUser, mockSession);
        
        // Store in mock data
        mockData.users = mockData.users || [];
        mockData.users.push(mockUser);
        
        // Trigger auth state change
        setTimeout(() => {
          authStateCallbacks.forEach(callback => {
            callback('SIGNED_IN', mockSession);
          });
        }, 100);
        
        return { 
          data: { user: mockUser, session: mockSession }, 
          error: null 
        };
      },
      signUp: async (credentials) => { 
        // Simulate successful signup
        const mockUser = { 
          id: generateId(), 
          email: credentials.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const mockSession = {
          user: mockUser,
          access_token: 'mock-token',
          refresh_token: 'mock-refresh-token',
          expires_at: Date.now() + 3600000, // 1 hour from now
        };
        
        // Update mock auth state
        mockCurrentUser = mockUser;
        mockCurrentSession = mockSession;
        
        // PERSIST AUTH STATE
        persistAuthState(mockUser, mockSession);
        
        // Store in mock data
        mockData.users = mockData.users || [];
        mockData.users.push(mockUser);
        
        // Trigger auth state change
        setTimeout(() => {
          authStateCallbacks.forEach(callback => {
            callback('SIGNED_IN', mockSession);
          });
        }, 100);
        
        return { 
          data: { user: mockUser, session: mockSession }, 
          error: null 
        };
      },
      signOut: async () => {
        // Clear mock auth state
        mockCurrentUser = null;
        mockCurrentSession = null;
        
        // CLEAR PERSISTED AUTH STATE
        try {
          localStorage.removeItem('mockAuthState');
        } catch (error) {
          console.log('Could not clear persisted auth state');
        }
        
        // Trigger auth state change
        setTimeout(() => {
          authStateCallbacks.forEach(callback => {
            callback('SIGNED_OUT', null);
          });
        }, 100);
        
        return { error: null };
      },
      getUser: async () => ({ data: { user: mockCurrentUser }, error: null }),
      onAuthStateChange: (callback) => {
        // Store the callback
        authStateCallbacks.push(callback);
        
        // Check if there's an existing session and trigger the correct initial state
        setTimeout(() => {
          if (mockCurrentSession && mockCurrentUser) {
            // If we have a persisted session, trigger SIGNED_IN
            callback('SIGNED_IN', mockCurrentSession);
          } else {
            // If no session, trigger SIGNED_OUT
            callback('SIGNED_OUT', null);
          }
        }, 100);
        
        return { 
          data: { 
            subscription: { 
              unsubscribe: () => {
                // Remove callback when unsubscribed
                const index = authStateCallbacks.indexOf(callback);
                if (index > -1) {
                  authStateCallbacks.splice(index, 1);
                }
              } 
            } 
          } 
        };
      },
    },
    from: (table) => ({
      select: (columns = '*') => ({
        eq: (column, value) => ({
          single: async () => {
            const data = mockData[table]?.find(item => item[column] === value);
            return { data, error: null };
          },
          order: (column, options) => ({
            limit: (count) => ({
              then: (callback) => {
                const data = mockData[table]?.slice(0, count) || [];
                callback({ data, error: null });
              }
            })
          })
        }),
        order: (column, options) => ({
          then: (callback) => {
            const data = mockData[table] || [];
            callback({ data, error: null });
          }
        }),
        then: (callback) => {
          const data = mockData[table] || [];
          callback({ data, error: null });
        }
      }),
      insert: (data) => ({
        select: (columns = '*') => ({
          single: async () => {
            const newItem = {
              id: data.id || generateId(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...data
            };
            mockData[table] = mockData[table] || [];
            mockData[table].push(newItem);
            return { data: newItem, error: null };
          }
        })
      }),
      upsert: (data) => ({
        select: (columns = '*') => ({
          single: async () => {
            const existingIndex = mockData[table]?.findIndex(item => item.id === data.id);
            const newItem = {
              id: data.id || generateId(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...data
            };
            
            mockData[table] = mockData[table] || [];
            
            if (existingIndex !== -1) {
              mockData[table][existingIndex] = newItem;
            } else {
              mockData[table].push(newItem);
            }
            
            return { data: newItem, error: null };
          }
        })
      }),
      update: (updates) => ({
        eq: (column, value) => ({
          select: (columns = '*') => ({
            single: async () => {
              const index = mockData[table]?.findIndex(item => item[column] === value);
              if (index !== -1) {
                mockData[table][index] = {
                  ...mockData[table][index],
                  ...updates,
                  updated_at: new Date().toISOString()
                };
                return { data: mockData[table][index], error: null };
              }
              return { data: null, error: new Error('Item not found') };
            }
          })
        })
      }),
      delete: () => ({
        eq: async (column, value) => {
          const index = mockData[table]?.findIndex(item => item[column] === value);
          if (index !== -1) {
            mockData[table].splice(index, 1);
            return { error: null };
          }
          return { error: new Error('Item not found') };
        }
      })
    }),
    channel: () => ({
      on: () => ({ subscribe: () => ({}) }),
    }),
    removeChannel: () => {},
  };
}

export { supabase };
