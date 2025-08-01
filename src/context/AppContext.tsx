import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase, getCurrentUser, getCurrentStore, realtimeManager, dataConsistencyManager, switchUserRole, UserRole } from '../services/supabase';
import type { User, Store, Product, Order, Post, Conversation, Message, ConversationWithMessages } from '../services/supabase';
import { notificationService } from '../services/notifications';

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  store_id?: string;
  type: 'order_update' | 'product_update' | 'post_update' | 'analytics_alert' | 'system' | 'boost' | 'comment' | 'follower';
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

// =============================================
// STATE TYPES
// =============================================

interface AppState {
  // Authentication
  user: User | null;
  store: Store | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentRole: UserRole;

  // Data
  products: Product[];
  orders: Order[];
  posts: Post[];
  notifications: Notification[];
  
  // Messaging
  conversations: Conversation[];
  userConversations: Conversation[];
  currentConversation: ConversationWithMessages | null;
  messages: Message[];
  
  // UI State
  loadingStates: {
    products: boolean;
    orders: boolean;
    posts: boolean;
    analytics: boolean;
    notifications: boolean;
    conversations: boolean;
    messages: boolean;
  };
  
  // Filters and pagination
  filters: {
    products: any;
    orders: any;
    posts: any;
    notifications: any;
    conversations: any;
  };

  // Realtime state
  realtimeConnected: boolean;
  lastSync: {
    products: number;
    orders: number;
    posts: number;
    notifications: number;
    conversations: number;
    messages: number;
  };
}

// =============================================
// ACTION TYPES
// =============================================

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_STORE'; payload: Store | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CURRENT_ROLE'; payload: UserRole }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'SET_POSTS'; payload: Post[] }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'SET_LOADING_STATE'; payload: { key: keyof AppState['loadingStates']; value: boolean } }
  | { type: 'SET_FILTERS'; payload: { key: keyof AppState['filters']; value: any } }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'ADD_POST'; payload: Post }
  | { type: 'UPDATE_POST'; payload: Post }
  | { type: 'DELETE_POST'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'UPDATE_NOTIFICATION'; payload: { id: string; updates: Partial<Notification> } }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ'; payload: string }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'SET_REALTIME_CONNECTED'; payload: boolean }
  | { type: 'UPDATE_LAST_SYNC'; payload: { key: keyof AppState['lastSync']; value: number } }
  | { type: 'RESET_STATE' }
  // Messaging actions
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'SET_USER_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'SET_CURRENT_CONVERSATION'; payload: ConversationWithMessages | null }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_CONVERSATION'; payload: Conversation }
  | { type: 'UPDATE_CONVERSATION'; payload: Conversation }
  | { type: 'DELETE_CONVERSATION'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: { conversationId: string; message: Message } }
  | { type: 'UPDATE_MESSAGE'; payload: Message }
  | { type: 'DELETE_MESSAGE'; payload: string }
  | { type: 'UPDATE_CONVERSATION_LAST_MESSAGE'; payload: { conversationId: string; lastMessage: string; lastMessageAt: string } }
  | { type: 'MARK_CONVERSATION_AS_READ'; payload: string }
  | { type: 'ADD_MESSAGE_REACTION'; payload: any }
  | { type: 'REMOVE_MESSAGE_REACTION'; payload: { messageId: string; userId: string } };

// =============================================
// INITIAL STATE
// =============================================

const initialState: AppState = {
  // Authentication
  user: null,
  store: null,
  isAuthenticated: false,
  isLoading: true,
  currentRole: UserRole.USER,

  // Data
  products: [],
  orders: [],
  posts: [],
  notifications: [],
  
  // Messaging
  conversations: [],
  userConversations: [],
  currentConversation: null,
  messages: [],
  
  // UI State
  loadingStates: {
    products: false,
    orders: false,
    posts: false,
    analytics: false,
    notifications: false,
    conversations: false,
    messages: false,
  },
  
  // Filters
  filters: {
    products: {},
    orders: {},
    posts: {},
    notifications: {},
    conversations: {},
  },

  // Realtime state
  realtimeConnected: false,
  lastSync: {
    products: 0,
    orders: 0,
    posts: 0,
    notifications: 0,
    conversations: 0,
    messages: 0,
  },
};

// =============================================
// REDUCER
// =============================================

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        currentRole: action.payload?.role || UserRole.USER,
      };

    case 'SET_STORE':
      return {
        ...state,
        store: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_CURRENT_ROLE':
      return {
        ...state,
        currentRole: action.payload,
      };

    case 'SET_PRODUCTS':
      return {
        ...state,
        products: action.payload,
      };

    case 'SET_ORDERS':
      return {
        ...state,
        orders: action.payload,
      };

    case 'SET_POSTS':
      return {
        ...state,
        posts: action.payload,
      };

    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
      };

    case 'SET_LOADING_STATE':
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          [action.payload.key]: action.payload.value,
        },
      };

    case 'SET_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.key]: action.payload.value,
        },
      };

    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [action.payload, ...state.products],
      };

    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.id ? action.payload : product
        ),
      };

    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload),
      };

    case 'ADD_ORDER':
      return {
        ...state,
        orders: [action.payload, ...state.orders],
      };

    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.id ? action.payload : order
        ),
      };

    case 'ADD_POST':
      return {
        ...state,
        posts: [action.payload, ...state.posts],
      };

    case 'UPDATE_POST':
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload.id ? action.payload : post
        ),
      };

    case 'DELETE_POST':
      return {
        ...state,
        posts: state.posts.filter(post => post.id !== action.payload),
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };

    case 'UPDATE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload.id 
            ? { ...notification, ...action.payload.updates }
            : notification
        ),
      };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload 
            ? { ...notification, is_read: true }
            : notification
        ),
      };

    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.user_id === action.payload 
            ? { ...notification, is_read: true }
            : notification
        ),
      };

    case 'DELETE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload),
      };

    case 'SET_REALTIME_CONNECTED':
      return {
        ...state,
        realtimeConnected: action.payload,
      };

    case 'UPDATE_LAST_SYNC':
      return {
        ...state,
        lastSync: {
          ...state.lastSync,
          [action.payload.key]: action.payload.value,
        },
      };

    case 'RESET_STATE':
      return initialState;

    // =============================================
    // MESSAGING REDUCER CASES
    // =============================================

    case 'SET_CONVERSATIONS':
      return {
        ...state,
        conversations: action.payload,
      };

    case 'SET_USER_CONVERSATIONS':
      return {
        ...state,
        userConversations: action.payload,
      };

    case 'SET_CURRENT_CONVERSATION':
      return {
        ...state,
        currentConversation: action.payload,
      };

    case 'SET_MESSAGES':
      return {
        ...state,
        messages: action.payload,
      };

    case 'ADD_CONVERSATION':
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
      };

    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.id ? action.payload : conv
        ),
        userConversations: state.userConversations.map(conv =>
          conv.id === action.payload.id ? action.payload : conv
        ),
        currentConversation: state.currentConversation?.id === action.payload.id
          ? { ...state.currentConversation, ...action.payload }
          : state.currentConversation,
      };

    case 'DELETE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter(conv => conv.id !== action.payload),
        userConversations: state.userConversations.filter(conv => conv.id !== action.payload),
        currentConversation: state.currentConversation?.id === action.payload
          ? null
          : state.currentConversation,
      };

    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload.message],
        currentConversation: state.currentConversation?.id === action.payload.conversationId
          ? {
              ...state.currentConversation,
              messages: [...state.currentConversation.messages, action.payload.message],
            }
          : state.currentConversation,
      };

    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id ? action.payload : msg
        ),
        currentConversation: state.currentConversation
          ? {
              ...state.currentConversation,
              messages: state.currentConversation.messages.map(msg =>
                msg.id === action.payload.id ? action.payload : msg
              ),
            }
          : null,
      };

    case 'DELETE_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter(msg => msg.id !== action.payload),
        currentConversation: state.currentConversation
          ? {
              ...state.currentConversation,
              messages: state.currentConversation.messages.filter(msg => msg.id !== action.payload),
            }
          : null,
      };

    case 'UPDATE_CONVERSATION_LAST_MESSAGE':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.conversationId
            ? {
                ...conv,
                last_message: action.payload.lastMessage,
                last_message_at: action.payload.lastMessageAt,
              }
            : conv
        ),
        userConversations: state.userConversations.map(conv =>
          conv.id === action.payload.conversationId
            ? {
                ...conv,
                last_message: action.payload.lastMessage,
                last_message_at: action.payload.lastMessageAt,
              }
            : conv
        ),
      };

    case 'MARK_CONVERSATION_AS_READ':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload
            ? { ...conv, unread_count: 0 }
            : conv
        ),
        userConversations: state.userConversations.map(conv =>
          conv.id === action.payload
            ? { ...conv, unread_count: 0 }
            : conv
        ),
      };

    case 'ADD_MESSAGE_REACTION':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.message_id
            ? {
                ...msg,
                reactions: [...(msg.reactions || []), action.payload],
              }
            : msg
        ),
        currentConversation: state.currentConversation
          ? {
              ...state.currentConversation,
              messages: state.currentConversation.messages.map(msg =>
                msg.id === action.payload.message_id
                  ? {
                      ...msg,
                      reactions: [...(msg.reactions || []), action.payload],
                    }
                  : msg
              ),
            }
          : null,
      };

    case 'REMOVE_MESSAGE_REACTION':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.messageId
            ? {
                ...msg,
                reactions: (msg.reactions || []).filter(
                  reaction => reaction.user_id !== action.payload.userId
                ),
              }
            : msg
        ),
        currentConversation: state.currentConversation
          ? {
              ...state.currentConversation,
              messages: state.currentConversation.messages.map(msg =>
                msg.id === action.payload.messageId
                  ? {
                      ...msg,
                      reactions: (msg.reactions || []).filter(
                        reaction => reaction.user_id !== action.payload.userId
                      ),
                    }
                  : msg
              ),
            }
          : null,
      };

    default:
      return state;
  }
}

// =============================================
// CONTEXT
// =============================================

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Authentication actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  switchRole: (newRole: UserRole) => Promise<void>;
  
  // Profile management actions
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  updateStoreInfo: (storeData: Partial<Store>) => Promise<void>;
  updatePayoutSettings: (payoutSettings: any) => Promise<void>;
  updateNotificationPreferences: (preferences: any) => Promise<void>;
  updateUserRole: (role: UserRole) => Promise<void>;
  
  // Data actions with consistency
  loadProducts: () => Promise<void>;
  loadOrders: () => Promise<void>;
  loadPosts: () => Promise<void>;
  
  // Product actions with optimistic updates
  createProduct: (productData: Partial<Product>) => Promise<Product>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<Product>;
  deleteProduct: (productId: string) => Promise<void>;
  bulkUpdateProducts: (productIds: string[], updates: Partial<Product>) => Promise<void>;
  bulkDeleteProducts: (productIds: string[]) => Promise<void>;
  
  // Order actions
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<Order>;
  
  // Post actions
  createPost: (postData: Partial<Post>) => Promise<Post>;
  updatePost: (postId: string, updates: Partial<Post>) => Promise<Post>;
  deletePost: (postId: string) => Promise<void>;
  publishPost: (postId: string) => Promise<Post>;
  schedulePost: (postId: string, scheduledAt: string) => Promise<Post>;
  
  // Notification actions
  loadNotifications: () => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: (userId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  createAnalyticsNotification: (milestone: string, value: number, period: string) => Promise<void>;
  
  // Messaging actions
  getStoreConversations: (filters?: any) => Promise<any[]>;
  getUserConversations: (filters?: any) => Promise<any[]>;
  getConversation: (conversationId: string) => Promise<any>;
  sendMessage: (conversationId: string, message: string, messageType?: string, mediaUrl?: string) => Promise<any>;
  markMessagesAsRead: (conversationId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, newMessage: string) => Promise<any>;
  toggleConversationArchive: (conversationId: string, isArchived: boolean) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  addMessageReaction: (messageId: string, reactionType: string) => Promise<any>;
  removeMessageReaction: (messageId: string) => Promise<void>;
  
  // Utility actions
  setFilters: (key: keyof AppState['filters'], value: any) => void;
  setLoadingState: (key: keyof AppState['loadingStates'], value: boolean) => void;
  
  // Realtime management
  connectRealtime: () => void;
  disconnectRealtime: () => void;
  
  // Data consistency
  invalidateCache: (key: string) => void;
  clearAllCache: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// =============================================
// PROVIDER COMPONENT
// =============================================

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize app on mount
  useEffect(() => {
    initializeApp();
    // Initialize notifications
    notificationService.initialize();
    return () => {
      // Cleanup realtime subscriptions
      realtimeManager.unsubscribeAll();
    };
  }, []);

  const initializeApp = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Temporarily skip authentication checks - use mock data
      // const { data: { session } } = await supabase.auth.getSession();
      
      // if (session?.user) {
      //   const user = await getCurrentUser();
      //   const store = await getCurrentStore();
        
      //   dispatch({ type: 'SET_USER', payload: user });
      //   dispatch({ type: 'SET_STORE', payload: store });
        
      //   // Load initial data if authenticated
      //   if (store) {
      //     await Promise.all([
      //       loadProducts(),
      //       loadOrders(),
      //       loadPosts(),
      //     ]);
            
      //     // Connect realtime subscriptions
      //     connectRealtime();
      //   }
      // }

      // Load mock data directly
      await Promise.all([
        loadProducts(),
        loadOrders(),
        loadPosts(),
      ]);
        
      // Connect realtime subscriptions
      connectRealtime();
    } catch (error) {
      console.error('App initialization error:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Realtime connection management
  const connectRealtime = () => {
    if (!state.store) return;

    // Subscribe to products changes
    realtimeManager.subscribeToProducts(state.store.id, (payload) => {
      console.log('Products realtime update received:', payload);
      
      switch (payload.eventType) {
        case 'INSERT':
          dispatch({ type: 'ADD_PRODUCT', payload: payload.new });
          break;
        case 'UPDATE':
          dispatch({ type: 'UPDATE_PRODUCT', payload: payload.new });
          break;
        case 'DELETE':
          dispatch({ type: 'DELETE_PRODUCT', payload: payload.old.id });
          break;
      }
      
      dispatch({ type: 'UPDATE_LAST_SYNC', payload: { key: 'products', value: Date.now() } });
    });

    // Subscribe to orders changes
    realtimeManager.subscribeToOrders(state.store.id, (payload) => {
      console.log('Orders realtime update received:', payload);
      
      switch (payload.eventType) {
        case 'INSERT':
          dispatch({ type: 'ADD_ORDER', payload: payload.new });
          break;
        case 'UPDATE':
          dispatch({ type: 'UPDATE_ORDER', payload: payload.new });
          break;
      }
      
      dispatch({ type: 'UPDATE_LAST_SYNC', payload: { key: 'orders', value: Date.now() } });
    });

    // Subscribe to posts changes
    realtimeManager.subscribeToPosts(state.store.id, (payload) => {
      console.log('Posts realtime update received:', payload);
      
      switch (payload.eventType) {
        case 'INSERT':
          dispatch({ type: 'ADD_POST', payload: payload.new });
          break;
        case 'UPDATE':
          dispatch({ type: 'UPDATE_POST', payload: payload.new });
          break;
        case 'DELETE':
          dispatch({ type: 'DELETE_POST', payload: payload.old.id });
          break;
      }
      
      dispatch({ type: 'UPDATE_LAST_SYNC', payload: { key: 'posts', value: Date.now() } });
    });

    // Subscribe to conversations changes
    realtimeManager.subscribeToConversations(state.store.id, (payload) => {
      console.log('Conversations realtime update received:', payload);
      
      switch (payload.eventType) {
        case 'INSERT':
          dispatch({ type: 'ADD_CONVERSATION', payload: payload.new });
          break;
        case 'UPDATE':
          dispatch({ type: 'UPDATE_CONVERSATION', payload: payload.new });
          break;
        case 'DELETE':
          dispatch({ type: 'DELETE_CONVERSATION', payload: payload.old.id });
          break;
      }
      
      dispatch({ type: 'UPDATE_LAST_SYNC', payload: { key: 'conversations', value: Date.now() } });
    });

    // Subscribe to user conversations (for customer side)
    if (state.user) {
      realtimeManager.subscribeToUserConversations(state.user.id, (payload) => {
        console.log('User conversations realtime update received:', payload);
        
        switch (payload.eventType) {
          case 'INSERT':
            dispatch({ type: 'ADD_CONVERSATION', payload: payload.new });
            break;
          case 'UPDATE':
            dispatch({ type: 'UPDATE_CONVERSATION', payload: payload.new });
            break;
          case 'DELETE':
            dispatch({ type: 'DELETE_CONVERSATION', payload: payload.old.id });
            break;
        }
        
        dispatch({ type: 'UPDATE_LAST_SYNC', payload: { key: 'conversations', value: Date.now() } });
      });
    }

    dispatch({ type: 'SET_REALTIME_CONNECTED', payload: true });
  };

  const disconnectRealtime = () => {
    realtimeManager.unsubscribeAll();
    dispatch({ type: 'SET_REALTIME_CONNECTED', payload: false });
  };

  // Authentication actions
  const signIn = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const user = await getCurrentUser();
      const store = await getCurrentStore();
      
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_STORE', payload: store });
      
      if (store) {
        connectRealtime();
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signOut = async () => {
    try {
      disconnectRealtime();
      await supabase.auth.signOut();
      dispatch({ type: 'RESET_STATE' });
      dataConsistencyManager.clearCache();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const switchRole = async (newRole: UserRole) => {
    try {
      const updatedUser = await switchUserRole(newRole);
      dispatch({ type: 'SET_USER', payload: updatedUser });
      dispatch({ type: 'SET_CURRENT_ROLE', payload: newRole });
      
      // Clear cache when switching roles
      dataConsistencyManager.clearCache();
    } catch (error) {
      console.error('Role switch error:', error);
      throw error;
    }
  };

  // Profile management actions
  const updateUserProfile = async (userData: Partial<User>) => {
    try {
      const { userAPI } = await import('../services/api');
      const updatedUser = await userAPI.updateUserProfile(userData);
      dispatch({ type: 'SET_USER', payload: updatedUser });
      dataConsistencyManager.invalidateCache(`users-${updatedUser.id}`);
      return updatedUser;
    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    }
  };

  const updateStoreInfo = async (storeData: Partial<Store>) => {
    try {
      const { storeAPI } = await import('../services/api');
      const updatedStore = await storeAPI.updateStoreInfo(storeData);
      dispatch({ type: 'SET_STORE', payload: updatedStore });
      dataConsistencyManager.invalidateCache(`stores-${updatedStore.id}`);
      return updatedStore;
    } catch (error) {
      console.error('Update store info error:', error);
      throw error;
    }
  };

  const updatePayoutSettings = async (payoutSettings: any) => {
    try {
      const { userAPI } = await import('../services/api');
      const updatedUser = await userAPI.updatePayoutSettings(payoutSettings);
      dispatch({ type: 'SET_USER', payload: updatedUser });
      dataConsistencyManager.invalidateCache(`users-${updatedUser.id}`);
      return updatedUser;
    } catch (error) {
      console.error('Update payout settings error:', error);
      throw error;
    }
  };

  const updateNotificationPreferences = async (preferences: any) => {
    try {
      const { userAPI } = await import('../services/api');
      const updatedUser = await userAPI.updateNotificationPreferences(preferences);
      dispatch({ type: 'SET_USER', payload: updatedUser });
      dataConsistencyManager.invalidateCache(`users-${updatedUser.id}`);
      return updatedUser;
    } catch (error) {
      console.error('Update notification preferences error:', error);
      throw error;
    }
  };

  const updateUserRole = async (role: UserRole) => {
    try {
      const updatedUser = await switchUserRole(role);
      dispatch({ type: 'SET_USER', payload: updatedUser });
      dispatch({ type: 'SET_CURRENT_ROLE', payload: role });
      dataConsistencyManager.invalidateCache(`users-${updatedUser.id}`);
      return updatedUser;
    } catch (error) {
      console.error('Update user role error:', error);
      throw error;
    }
  };

  // Data loading actions with cache
  const loadProducts = async () => {
    if (!state.store) return;
    
    const cacheKey = `products-${state.store.id}`;
    const cachedData = dataConsistencyManager.getCachedData(cacheKey);
    
    if (cachedData) {
      dispatch({ type: 'SET_PRODUCTS', payload: cachedData });
      return;
    }
    
    try {
      dispatch({ type: 'SET_LOADING_STATE', payload: { key: 'products', value: true } });
      
      const { productAPI } = await import('../services/api');
      const products = await productAPI.getProducts(state.store.id, state.filters.products);
      
      dataConsistencyManager.updateCache(cacheKey, products);
      dispatch({ type: 'SET_PRODUCTS', payload: products });
      dispatch({ type: 'UPDATE_LAST_SYNC', payload: { key: 'products', value: Date.now() } });
    } catch (error) {
      console.error('Load products error:', error);
    } finally {
      dispatch({ type: 'SET_LOADING_STATE', payload: { key: 'products', value: false } });
    }
  };

  const loadOrders = async () => {
    if (!state.store) return;
    
    const cacheKey = `orders-${state.store.id}`;
    const cachedData = dataConsistencyManager.getCachedData(cacheKey);
    
    if (cachedData) {
      dispatch({ type: 'SET_ORDERS', payload: cachedData });
      return;
    }
    
    try {
      dispatch({ type: 'SET_LOADING_STATE', payload: { key: 'orders', value: true } });
      
      const { orderAPI } = await import('../services/api');
      const orders = await orderAPI.getOrders(state.store.id, state.filters.orders);
      
      dataConsistencyManager.updateCache(cacheKey, orders);
      dispatch({ type: 'SET_ORDERS', payload: orders });
      dispatch({ type: 'UPDATE_LAST_SYNC', payload: { key: 'orders', value: Date.now() } });
    } catch (error) {
      console.error('Load orders error:', error);
    } finally {
      dispatch({ type: 'SET_LOADING_STATE', payload: { key: 'orders', value: false } });
    }
  };

  const loadPosts = async () => {
    if (!state.store) return;
    
    const cacheKey = `posts-${state.store.id}`;
    const cachedData = dataConsistencyManager.getCachedData(cacheKey);
    
    if (cachedData) {
      dispatch({ type: 'SET_POSTS', payload: cachedData });
      return;
    }
    
    try {
      dispatch({ type: 'SET_LOADING_STATE', payload: { key: 'posts', value: true } });
      
      const { postAPI } = await import('../services/api');
      const posts = await postAPI.getPosts(state.store.id, state.filters.posts);
      
      dataConsistencyManager.updateCache(cacheKey, posts);
      dispatch({ type: 'SET_POSTS', payload: posts });
      dispatch({ type: 'UPDATE_LAST_SYNC', payload: { key: 'posts', value: Date.now() } });
    } catch (error) {
      console.error('Load posts error:', error);
    } finally {
      dispatch({ type: 'SET_LOADING_STATE', payload: { key: 'posts', value: false } });
    }
  };

  // Product actions with optimistic updates
  const createProduct = async (productData: Partial<Product>) => {
    if (!state.user || !state.store) {
      throw new Error('User or store not found');
    }

    try {
      dispatch({ type: 'SET_LOADING_STATE', payload: { key: 'products', value: true } });
      
      const { productAPI } = await import('../services/api');
      const newProduct = await productAPI.createProduct({
        ...productData,
        store_id: state.store.id,
      });

      // Optimistic update
      dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
      dataConsistencyManager.invalidateCache('products');

      // Create notification for new product
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        user_id: state.user.id,
        store_id: state.store.id,
        type: 'product_update',
        title: 'New product created',
        message: `Product "${newProduct.name}" has been successfully created.`,
        data: { productId: newProduct.id, productName: newProduct.name },
        is_read: false,
        created_at: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });

      return newProduct;
    } catch (error) {
      console.error('Create product error:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING_STATE', payload: { key: 'products', value: false } });
    }
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    // Find current product for optimistic update
    const currentProduct = state.products.find(p => p.id === productId);
    if (!currentProduct) throw new Error('Product not found');
    
    // Optimistic update
    const optimisticProduct = {
      ...currentProduct,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    dispatch({ type: 'UPDATE_PRODUCT', payload: optimisticProduct });
    
    try {
      const { productAPI } = await import('../services/api');
      const product = await productAPI.updateProduct(productId, updates);
      
      // Update with real data
      dispatch({ type: 'UPDATE_PRODUCT', payload: product });
      if (state.store) {
        dataConsistencyManager.invalidateCache(`products-${state.store.id}`);
      }
      
      // Trigger real-time update
      if (state.realtimeConnected) {
        realtimeManager.triggerUpdate('products', {
          eventType: 'UPDATE',
          new: product,
          old: currentProduct,
          store_id: state.store?.id
        });
      }
      
      return product;
    } catch (error) {
      // Rollback optimistic update on error
      dispatch({ type: 'UPDATE_PRODUCT', payload: currentProduct });
      console.error('Update product error:', error);
      throw error;
    }
  };

  const deleteProduct = async (productId: string) => {
    // Find current product for rollback
    const currentProduct = state.products.find(p => p.id === productId);
    if (!currentProduct) throw new Error('Product not found');
    
    // Optimistic delete
    dispatch({ type: 'DELETE_PRODUCT', payload: productId });
    
    try {
      const { productAPI } = await import('../services/api');
      await productAPI.deleteProduct(productId);
      
      if (state.store) {
        dataConsistencyManager.invalidateCache(`products-${state.store.id}`);
      }
      
      // Trigger real-time update
      if (state.realtimeConnected) {
        realtimeManager.triggerUpdate('products', {
          eventType: 'DELETE',
          old: currentProduct,
          store_id: state.store?.id
        });
      }
    } catch (error) {
      // Rollback optimistic delete on error
      dispatch({ type: 'ADD_PRODUCT', payload: currentProduct });
      console.error('Delete product error:', error);
      throw error;
    }
  };

  const bulkUpdateProducts = async (productIds: string[], updates: Partial<Product>) => {
    if (!state.user || !state.store) {
      throw new Error('User or store not found');
    }

    try {
      dispatch({ type: 'SET_LOADING_STATE', payload: { key: 'products', value: true } });
      
      const { productAPI } = await import('../services/api');
      const updatedProducts = await productAPI.bulkUpdateProducts(productIds, updates);
      
      // Update state with new products
      updatedProducts.forEach(product => {
        dispatch({ type: 'UPDATE_PRODUCT', payload: product });
      });
      
      dataConsistencyManager.invalidateCache('products');

      // Create notification for bulk update
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        user_id: state.user.id,
        store_id: state.store.id,
        type: 'product_update',
        title: 'Bulk product update completed',
        message: `${productIds.length} products have been updated successfully.`,
        data: { productIds, updateCount: productIds.length },
        is_read: false,
        created_at: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });

      return updatedProducts;
    } catch (error) {
      console.error('Bulk update products error:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING_STATE', payload: { key: 'products', value: false } });
    }
  };

  const bulkDeleteProducts = async (productIds: string[]) => {
    // Optimistic bulk delete
    const currentProducts = state.products.filter(p => productIds.includes(p.id));
    
    productIds.forEach(id => {
      dispatch({ type: 'DELETE_PRODUCT', payload: id });
    });
    
    try {
      const { productAPI } = await import('../services/api');
      await productAPI.bulkDeleteProducts(productIds);
      
      if (state.store) {
        dataConsistencyManager.invalidateCache(`products-${state.store.id}`);
      }
      
      // Trigger real-time updates
      if (state.realtimeConnected) {
        currentProducts.forEach(product => {
          realtimeManager.triggerUpdate('products', {
            eventType: 'DELETE',
            old: product,
            store_id: state.store?.id
          });
        });
      }
    } catch (error) {
      // Rollback optimistic deletes on error
      currentProducts.forEach(product => {
        dispatch({ type: 'ADD_PRODUCT', payload: product });
      });
      console.error('Bulk delete products error:', error);
      throw error;
    }
  };

  // Order actions
  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    // Find current order for optimistic update
    const currentOrder = state.orders.find(o => o.id === orderId);
    if (!currentOrder) throw new Error('Order not found');
    
    // Optimistic update
    const optimisticOrder = {
      ...currentOrder,
      status,
      updated_at: new Date().toISOString(),
    };
    dispatch({ type: 'UPDATE_ORDER', payload: optimisticOrder });
    
    try {
      const { orderAPI } = await import('../services/api');
      const order = await orderAPI.updateOrderStatus(orderId, status);
      
      // Update with real data
      dispatch({ type: 'UPDATE_ORDER', payload: order });
      if (state.store) {
        dataConsistencyManager.invalidateCache(`orders-${state.store.id}`);
      }
      
      // Create notification for order status update
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        user_id: state.user?.id || '',
        store_id: state.store?.id,
        type: 'order_update',
        title: `Order #${order.order_number} ${status}`,
        message: `Order #${order.order_number} has been ${status.toLowerCase()}.`,
        data: { orderId: order.id, orderNumber: order.order_number, status },
        is_read: false,
        created_at: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
      
      return order;
    } catch (error) {
      // Rollback optimistic update on error
      dispatch({ type: 'UPDATE_ORDER', payload: currentOrder });
      console.error('Update order status error:', error);
      throw error;
    }
  };

  // Post actions
  const createPost = async (postData: Partial<Post>) => {
    if (!state.store) throw new Error('No store found');
    
    try {
      const { postAPI } = await import('../services/api');
      const post = await postAPI.createPost({
        ...postData,
        store_id: state.store.id,
      });
      
      dispatch({ type: 'ADD_POST', payload: post });
      dataConsistencyManager.invalidateCache(`posts-${state.store.id}`);
      return post;
    } catch (error) {
      console.error('Create post error:', error);
      throw error;
    }
  };

  const updatePost = async (postId: string, updates: Partial<Post>) => {
    try {
      const { postAPI } = await import('../services/api');
      const post = await postAPI.updatePost(postId, updates);
      
      dispatch({ type: 'UPDATE_POST', payload: post });
      if (state.store) {
        dataConsistencyManager.invalidateCache(`posts-${state.store.id}`);
      }
      return post;
    } catch (error) {
      console.error('Update post error:', error);
      throw error;
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { postAPI } = await import('../services/api');
      await postAPI.deletePost(postId);
      
      dispatch({ type: 'DELETE_POST', payload: postId });
      if (state.store) {
        dataConsistencyManager.invalidateCache(`posts-${state.store.id}`);
      }
    } catch (error) {
      console.error('Delete post error:', error);
      throw error;
    }
  };

  const publishPost = async (postId: string) => {
    try {
      const { postAPI } = await import('../services/api');
      const updatedPost = await postAPI.publishPost(postId);
      
      dispatch({ type: 'UPDATE_POST', payload: updatedPost });
      if (state.store) {
        dataConsistencyManager.invalidateCache(`posts-${state.store.id}`);
      }
      return updatedPost;
    } catch (error) {
      console.error('Publish post error:', error);
      throw error;
    }
  };

  const schedulePost = async (postId: string, scheduledAt: string) => {
    try {
      const { postAPI } = await import('../services/api');
      const updatedPost = await postAPI.schedulePost(postId, scheduledAt);
      
      dispatch({ type: 'UPDATE_POST', payload: updatedPost });
      if (state.store) {
        dataConsistencyManager.invalidateCache(`posts-${state.store.id}`);
      }
      return updatedPost;
    } catch (error) {
      console.error('Schedule post error:', error);
      throw error;
    }
  };

  // =============================================
  // MESSAGING ACTIONS
  // =============================================

  // Get store conversations
  const getStoreConversations = async (filters?: any) => {
    if (!state.store) throw new Error('No store found');
    
    try {
      const { messagingAPI } = await import('../services/api');
      const conversations = await messagingAPI.getStoreConversations(state.store.id, filters);
      
      dispatch({ type: 'SET_CONVERSATIONS', payload: conversations });
      dataConsistencyManager.updateCache(`conversations-${state.store.id}`, conversations);
      return conversations;
    } catch (error) {
      console.error('Get store conversations error:', error);
      throw error;
    }
  };

  // Get user conversations
  const getUserConversations = async (filters?: any) => {
    if (!state.user) throw new Error('No user found');
    
    try {
      const { messagingAPI } = await import('../services/api');
      const conversations = await messagingAPI.getUserConversations(state.user.id, filters);
      
      dispatch({ type: 'SET_USER_CONVERSATIONS', payload: conversations });
      dataConsistencyManager.updateCache(`user-conversations-${state.user.id}`, conversations);
      return conversations;
    } catch (error) {
      console.error('Get user conversations error:', error);
      throw error;
    }
  };

  // Get conversation with messages
  const getConversation = async (conversationId: string) => {
    try {
      const { messagingAPI } = await import('../services/api');
      const conversation = await messagingAPI.getConversation(conversationId);
      
      dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: conversation });
      return conversation;
    } catch (error) {
      console.error('Get conversation error:', error);
      throw error;
    }
  };

  // Send message
  const sendMessage = async (conversationId: string, message: string, messageType: string = 'text', mediaUrl?: string) => {
    if (!state.user && !state.store) throw new Error('No user or store found');
    
    try {
      const { messagingAPI } = await import('../services/api');
      
      const messageData = {
        conversation_id: conversationId,
        sender_type: state.store ? 'store' : 'customer',
        sender_id: state.store ? state.store.id : state.user!.id,
        message,
        message_type: messageType as any,
        media_url: mediaUrl,
      };
      
      const newMessage = await messagingAPI.sendMessage(messageData);
      
      // Add message to current conversation
      dispatch({ type: 'ADD_MESSAGE', payload: { conversationId, message: newMessage } });
      
      // Update conversation last message
      dispatch({ type: 'UPDATE_CONVERSATION_LAST_MESSAGE', payload: { 
        conversationId, 
        lastMessage: message,
        lastMessageAt: newMessage.created_at 
      } });
      
      return newMessage;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (conversationId: string) => {
    if (!state.user && !state.store) throw new Error('No user or store found');
    
    try {
      const { messagingAPI } = await import('../services/api');
      const userId = state.store ? state.store.id : state.user!.id;
      
      await messagingAPI.markMessagesAsRead(conversationId, userId);
      
      dispatch({ type: 'MARK_CONVERSATION_AS_READ', payload: conversationId });
    } catch (error) {
      console.error('Mark messages as read error:', error);
      throw error;
    }
  };

  // Delete message
  const deleteMessage = async (messageId: string) => {
    if (!state.user && !state.store) throw new Error('No user or store found');
    
    try {
      const { messagingAPI } = await import('../services/api');
      const deletedBy = state.store ? state.store.id : state.user!.id;
      
      await messagingAPI.deleteMessage(messageId, deletedBy);
      
      dispatch({ type: 'DELETE_MESSAGE', payload: messageId });
    } catch (error) {
      console.error('Delete message error:', error);
      throw error;
    }
  };

  // Edit message
  const editMessage = async (messageId: string, newMessage: string) => {
    try {
      const { messagingAPI } = await import('../services/api');
      const updatedMessage = await messagingAPI.editMessage(messageId, newMessage);
      
      dispatch({ type: 'UPDATE_MESSAGE', payload: updatedMessage });
      return updatedMessage;
    } catch (error) {
      console.error('Edit message error:', error);
      throw error;
    }
  };

  // Archive/unarchive conversation
  const toggleConversationArchive = async (conversationId: string, isArchived: boolean) => {
    try {
      const { messagingAPI } = await import('../services/api');
      const conversation = await messagingAPI.toggleConversationArchive(conversationId, isArchived);
      
      dispatch({ type: 'UPDATE_CONVERSATION', payload: conversation });
    } catch (error) {
      console.error('Toggle conversation archive error:', error);
      throw error;
    }
  };

  // Delete conversation
  const deleteConversation = async (conversationId: string) => {
    try {
      const { messagingAPI } = await import('../services/api');
      await messagingAPI.deleteConversation(conversationId);
      
      dispatch({ type: 'DELETE_CONVERSATION', payload: conversationId });
    } catch (error) {
      console.error('Delete conversation error:', error);
      throw error;
    }
  };

  // Add message reaction
  const addMessageReaction = async (messageId: string, reactionType: string) => {
    if (!state.user) throw new Error('No user found');
    
    try {
      const { messagingAPI } = await import('../services/api');
      const reaction = await messagingAPI.addMessageReaction(messageId, state.user.id, reactionType);
      
      dispatch({ type: 'ADD_MESSAGE_REACTION', payload: reaction });
      return reaction;
    } catch (error) {
      console.error('Add message reaction error:', error);
      throw error;
    }
  };

  // Remove message reaction
  const removeMessageReaction = async (messageId: string) => {
    if (!state.user) throw new Error('No user found');
    
    try {
      const { messagingAPI } = await import('../services/api');
      await messagingAPI.removeMessageReaction(messageId, state.user.id);
      
      dispatch({ type: 'REMOVE_MESSAGE_REACTION', payload: { messageId, userId: state.user.id } });
    } catch (error) {
      console.error('Remove message reaction error:', error);
      throw error;
    }
  };

  // Notification actions
  const loadNotifications = async () => {
    if (!state.user) return;

    const cacheKey = `notifications-${state.user.id}`;
    const cachedData = dataConsistencyManager.getCachedData(cacheKey);

    if (cachedData) {
      dispatch({ type: 'SET_NOTIFICATIONS', payload: cachedData });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING_STATE', payload: { key: 'notifications', value: true } });
      const { notificationAPI } = await import('../services/api');
      const notifications = await notificationAPI.getNotifications(state.user.id);
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
      dataConsistencyManager.updateCache(cacheKey, notifications);
      dispatch({ type: 'UPDATE_LAST_SYNC', payload: { key: 'notifications', value: Date.now() } });
    } catch (error) {
      console.error('Load notifications error:', error);
    } finally {
      dispatch({ type: 'SET_LOADING_STATE', payload: { key: 'notifications', value: false } });
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      const { notificationAPI } = await import('../services/api');
      const updatedNotification = await notificationAPI.markNotificationRead(notificationId);
      dispatch({ type: 'UPDATE_NOTIFICATION', payload: { id: notificationId, updates: updatedNotification } });
      dataConsistencyManager.invalidateCache(`notifications-${state.user?.id}`);
      return updatedNotification;
    } catch (error) {
      console.error('Mark notification read error:', error);
      throw error;
    }
  };

  const markAllNotificationsRead = async (userId: string) => {
    try {
      const { notificationAPI } = await import('../services/api');
      const updatedNotifications = await notificationAPI.markAllNotificationsRead(userId);
      dispatch({ type: 'SET_NOTIFICATIONS', payload: updatedNotifications });
      dataConsistencyManager.invalidateCache(`notifications-${userId}`);
      return updatedNotifications;
    } catch (error) {
      console.error('Mark all notifications read error:', error);
      throw error;
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { notificationAPI } = await import('../services/api');
      await notificationAPI.deleteNotification(notificationId);
      dispatch({ type: 'DELETE_NOTIFICATION', payload: notificationId });
      dataConsistencyManager.invalidateCache(`notifications-${state.user?.id}`);
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  };

  const createAnalyticsNotification = async (milestone: string, value: number, period: string) => {
    if (!state.user || !state.store) {
      throw new Error('User or store not found');
    }

    const notification: Notification = {
      id: `notif-${Date.now()}`,
      user_id: state.user.id,
      store_id: state.store.id,
      type: 'analytics_alert',
      title: `${milestone} milestone reached!`,
      message: `Congratulations! You've reached $${value.toLocaleString()} in ${period}.`,
      data: { milestone, value, period, currency: 'USD' },
      is_read: false,
      created_at: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  // Utility actions
  const setFilters = (key: keyof AppState['filters'], value: any) => {
    dispatch({ type: 'SET_FILTERS', payload: { key, value } });
  };

  const setLoadingState = (key: keyof AppState['loadingStates'], value: boolean) => {
    dispatch({ type: 'SET_LOADING_STATE', payload: { key, value } });
  };

  const invalidateCache = (key: string) => {
    dataConsistencyManager.invalidateCache(key);
  };

  const clearAllCache = () => {
    dataConsistencyManager.clearCache();
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    signIn,
    signUp,
    signOut,
    switchRole,
    updateUserProfile,
    updateStoreInfo,
    updatePayoutSettings,
    updateNotificationPreferences,
    updateUserRole,
    loadProducts,
    loadOrders,
    loadPosts,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkUpdateProducts,
    bulkDeleteProducts,
    updateOrderStatus,
    createPost,
    updatePost,
    deletePost,
    publishPost,
    schedulePost,
    loadNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    createAnalyticsNotification,
    getStoreConversations,
    getUserConversations,
    getConversation,
    sendMessage,
    markMessagesAsRead,
    deleteMessage,
    editMessage,
    toggleConversationArchive,
    deleteConversation,
    addMessageReaction,
    removeMessageReaction,
    setFilters,
    setLoadingState,
    connectRealtime,
    disconnectRealtime,
    invalidateCache,
    clearAllCache,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// =============================================
// HOOK
// =============================================

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}; 