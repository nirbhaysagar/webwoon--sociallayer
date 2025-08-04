import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

export interface UserEvent {
  id: string;
  userId?: string;
  eventType: 'page_view' | 'product_view' | 'add_to_cart' | 'purchase' | 'search' | 'like' | 'share' | 'notification_open';
  eventData: any;
  timestamp: number;
  sessionId: string;
  userAgent?: string;
  platform: 'ios' | 'android' | 'web';
}

export interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: Array<{ productId: string; name: string; sales: number; revenue: number }>;
  salesByPeriod: Array<{ period: string; revenue: number; orders: number }>;
}

export interface UserEngagement {
  activeUsers: number;
  sessionDuration: number;
  pageViews: number;
  bounceRate: number;
  retentionRate: number;
  topPages: Array<{ page: string; views: number; uniqueViews: number }>;
}

export interface ProductAnalytics {
  productId: string;
  views: number;
  addToCartCount: number;
  purchaseCount: number;
  conversionRate: number;
  revenue: number;
  averageRating: number;
  reviewCount: number;
}

export interface SearchAnalytics {
  totalSearches: number;
  uniqueSearches: number;
  popularQueries: Array<{ query: string; count: number }>;
  searchConversionRate: number;
  averageResultsPerSearch: number;
}

export interface NotificationAnalytics {
  sentCount: number;
  openedCount: number;
  clickRate: number;
  byType: Array<{ type: string; sent: number; opened: number; rate: number }>;
}

export class AnalyticsService {
  private static readonly EVENTS_KEY = 'analytics_events';
  private static readonly SESSION_KEY = 'analytics_session';
  private static readonly MAX_EVENTS = 1000;

  // Initialize analytics session
  static async initializeSession(): Promise<string> {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(this.SESSION_KEY, sessionId);
      return sessionId;
    } catch (error) {
      console.error('Error initializing analytics session:', error);
      return `session_${Date.now()}`;
    }
  }

  // Track user event
  static async trackEvent(eventType: UserEvent['eventType'], eventData: any = {}): Promise<void> {
    try {
      const sessionId = await this.getSessionId();
      const event: UserEvent = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        eventType,
        eventData,
        timestamp: Date.now(),
        sessionId,
        platform: 'web', // In a real app, detect platform
      };

      // Save to local storage
      await this.saveEvent(event);

      // Send to server (in a real app)
      await this.sendEventToServer(event);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  // Get current session ID
  private static async getSessionId(): Promise<string> {
    try {
      const sessionId = await AsyncStorage.getItem(this.SESSION_KEY);
      if (sessionId) {
        return sessionId;
      }
      return await this.initializeSession();
    } catch (error) {
      console.error('Error getting session ID:', error);
      return `session_${Date.now()}`;
    }
  }

  // Save event to local storage
  private static async saveEvent(event: UserEvent): Promise<void> {
    try {
      const events = await this.getEvents();
      events.unshift(event);

      // Keep only the latest events
      if (events.length > this.MAX_EVENTS) {
        events.splice(this.MAX_EVENTS);
      }

      await AsyncStorage.setItem(this.EVENTS_KEY, JSON.stringify(events));
    } catch (error) {
      console.error('Error saving event:', error);
    }
  }

  // Get all events
  private static async getEvents(): Promise<UserEvent[]> {
    try {
      const events = await AsyncStorage.getItem(this.EVENTS_KEY);
      return events ? JSON.parse(events) : [];
    } catch (error) {
      console.error('Error getting events:', error);
      return [];
    }
  }

  // Send event to server
  private static async sendEventToServer(event: UserEvent): Promise<void> {
    try {
      // In a real app, send to your analytics server
      console.log('Sending event to server:', event);
      
      // Example API call:
      // await fetch('/api/analytics/events', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event)
      // });
    } catch (error) {
      console.error('Error sending event to server:', error);
    }
  }

  // Get sales metrics
  static async getSalesMetrics(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<SalesMetrics> {
    try {
      // In a real app, fetch from your database
      const mockData: SalesMetrics = {
        totalRevenue: 15420.50,
        totalOrders: 89,
        averageOrderValue: 173.26,
        conversionRate: 3.2,
        topProducts: [
          { productId: '1', name: 'Wireless Headphones', sales: 15, revenue: 2250.00 },
          { productId: '2', name: 'Smart Watch', sales: 12, revenue: 1800.00 },
          { productId: '3', name: 'Laptop Stand', sales: 8, revenue: 320.00 },
        ],
        salesByPeriod: [
          { period: 'Week 1', revenue: 4200.00, orders: 24 },
          { period: 'Week 2', revenue: 3800.00, orders: 22 },
          { period: 'Week 3', revenue: 5100.00, orders: 29 },
          { period: 'Week 4', revenue: 2320.50, orders: 14 },
        ],
      };

      return mockData;
    } catch (error) {
      console.error('Error getting sales metrics:', error);
      return {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        conversionRate: 0,
        topProducts: [],
        salesByPeriod: [],
      };
    }
  }

  // Get user engagement metrics
  static async getUserEngagement(period: 'day' | 'week' | 'month' = 'week'): Promise<UserEngagement> {
    try {
      const events = await this.getEvents();
      const now = Date.now();
      const periodMs = period === 'day' ? 86400000 : period === 'week' ? 604800000 : 2592000000;
      const filteredEvents = events.filter(event => now - event.timestamp < periodMs);

      const uniqueUsers = new Set(filteredEvents.map(e => e.userId || e.sessionId)).size;
      const pageViews = filteredEvents.filter(e => e.eventType === 'page_view').length;
      const sessions = new Set(filteredEvents.map(e => e.sessionId)).size;

      const mockData: UserEngagement = {
        activeUsers: uniqueUsers,
        sessionDuration: 450, // seconds
        pageViews: pageViews,
        bounceRate: 35.2,
        retentionRate: 68.5,
        topPages: [
          { page: 'Home', views: 1250, uniqueViews: 890 },
          { page: 'Product Discovery', views: 980, uniqueViews: 720 },
          { page: 'Product Detail', views: 650, uniqueViews: 520 },
          { page: 'Cart', views: 320, uniqueViews: 280 },
        ],
      };

      return mockData;
    } catch (error) {
      console.error('Error getting user engagement:', error);
      return {
        activeUsers: 0,
        sessionDuration: 0,
        pageViews: 0,
        bounceRate: 0,
        retentionRate: 0,
        topPages: [],
      };
    }
  }

  // Get product analytics
  static async getProductAnalytics(productId?: string): Promise<ProductAnalytics[]> {
    try {
      const mockData: ProductAnalytics[] = [
        {
          productId: '1',
          views: 1250,
          addToCartCount: 89,
          purchaseCount: 15,
          conversionRate: 1.2,
          revenue: 2250.00,
          averageRating: 4.5,
          reviewCount: 23,
        },
        {
          productId: '2',
          views: 980,
          addToCartCount: 67,
          purchaseCount: 12,
          conversionRate: 1.2,
          revenue: 1800.00,
          averageRating: 4.3,
          reviewCount: 18,
        },
        {
          productId: '3',
          views: 750,
          addToCartCount: 45,
          purchaseCount: 8,
          conversionRate: 1.1,
          revenue: 320.00,
          averageRating: 4.7,
          reviewCount: 12,
        },
      ];

      if (productId) {
        return mockData.filter(p => p.productId === productId);
      }

      return mockData;
    } catch (error) {
      console.error('Error getting product analytics:', error);
      return [];
    }
  }

  // Get search analytics
  static async getSearchAnalytics(): Promise<SearchAnalytics> {
    try {
      const events = await this.getEvents();
      const searchEvents = events.filter(e => e.eventType === 'search');
      
      const mockData: SearchAnalytics = {
        totalSearches: searchEvents.length,
        uniqueSearches: new Set(searchEvents.map(e => e.eventData.query)).size,
        popularQueries: [
          { query: 'headphones', count: 45 },
          { query: 'smartphone', count: 32 },
          { query: 'laptop', count: 28 },
          { query: 'wireless', count: 25 },
          { query: 'gaming', count: 20 },
        ],
        searchConversionRate: 2.8,
        averageResultsPerSearch: 12.5,
      };

      return mockData;
    } catch (error) {
      console.error('Error getting search analytics:', error);
      return {
        totalSearches: 0,
        uniqueSearches: 0,
        popularQueries: [],
        searchConversionRate: 0,
        averageResultsPerSearch: 0,
      };
    }
  }

  // Get notification analytics
  static async getNotificationAnalytics(): Promise<NotificationAnalytics> {
    try {
      const mockData: NotificationAnalytics = {
        sentCount: 1250,
        openedCount: 890,
        clickRate: 71.2,
        byType: [
          { type: 'order', sent: 450, opened: 320, rate: 71.1 },
          { type: 'product', sent: 380, opened: 280, rate: 73.7 },
          { type: 'promotion', sent: 320, opened: 220, rate: 68.8 },
          { type: 'social', sent: 100, opened: 70, rate: 70.0 },
        ],
      };

      return mockData;
    } catch (error) {
      console.error('Error getting notification analytics:', error);
      return {
        sentCount: 0,
        openedCount: 0,
        clickRate: 0,
        byType: [],
      };
    }
  }

  // Get real-time metrics
  static async getRealTimeMetrics(): Promise<{
    activeUsers: number;
    currentSessions: number;
    recentEvents: UserEvent[];
  }> {
    try {
      const events = await this.getEvents();
      const now = Date.now();
      const lastHour = events.filter(e => now - e.timestamp < 3600000);
      const last5Minutes = events.filter(e => now - e.timestamp < 300000);

      return {
        activeUsers: new Set(lastHour.map(e => e.userId || e.sessionId)).size,
        currentSessions: new Set(last5Minutes.map(e => e.sessionId)).size,
        recentEvents: last5Minutes.slice(0, 10),
      };
    } catch (error) {
      console.error('Error getting real-time metrics:', error);
      return {
        activeUsers: 0,
        currentSessions: 0,
        recentEvents: [],
      };
    }
  }

  // Export analytics data
  static async exportAnalytics(period: 'day' | 'week' | 'month'): Promise<any> {
    try {
      const [salesMetrics, userEngagement, searchAnalytics, notificationAnalytics] = await Promise.all([
        this.getSalesMetrics(period),
        this.getUserEngagement(period),
        this.getSearchAnalytics(),
        this.getNotificationAnalytics(),
      ]);

      return {
        period,
        timestamp: Date.now(),
        salesMetrics,
        userEngagement,
        searchAnalytics,
        notificationAnalytics,
      };
    } catch (error) {
      console.error('Error exporting analytics:', error);
      return null;
    }
  }

  // Clear analytics data
  static async clearAnalytics(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.EVENTS_KEY);
      await AsyncStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      console.error('Error clearing analytics:', error);
    }
  }
} 