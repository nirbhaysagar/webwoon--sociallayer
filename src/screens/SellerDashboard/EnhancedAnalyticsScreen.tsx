import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from './components/HeaderWithMenu';
import { useApp } from '../../context/AppContext';
import { analyticsAPI } from '../../services/api';
import { scale, verticalScale, moderateScale } from '../../lib/scale';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  revenue: {
    total: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  orders: {
    total: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  customers: {
    total: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  engagement: {
    total: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
    growth: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'order' | 'sale' | 'follower' | 'review';
    title: string;
    description: string;
    amount?: number;
    timestamp: string;
  }>;
  salesChart: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  customerSegments: Array<{
    segment: string;
    count: number;
    percentage: number;
    revenue: number;
  }>;
}

export default function EnhancedAnalyticsScreen() {
  const { state } = useApp();
  const storeId = state.store?.id;
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedView, setSelectedView] = useState('overview');
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [liveUpdates, setLiveUpdates] = useState({
    newOrders: 0,
    newRevenue: 0,
    newCustomers: 0,
  });
  
  // Animation refs for live updates
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // Real-time update interval
  const realTimeInterval = useRef<NodeJS.Timeout | null>(null);

  const periods = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
    { id: '1y', label: '1 Year' },
  ];

  const views = [
    { id: 'overview', label: 'Overview', icon: 'grid-outline' },
    { id: 'sales', label: 'Sales', icon: 'trending-up-outline' },
    { id: 'customers', label: 'Customers', icon: 'people-outline' },
    { id: 'products', label: 'Products', icon: 'cube-outline' },
  ];

  useEffect(() => {
    if (storeId) {
      loadAnalytics();
    }
    
    // Start real-time updates if enabled
    if (realTimeMode) {
      startRealTimeUpdates();
    }
    
    return () => {
      if (realTimeInterval.current) {
        clearInterval(realTimeInterval.current);
      }
    };
  }, [storeId, selectedPeriod, realTimeMode]);

  // Real-time update functions
  const startRealTimeUpdates = () => {
    realTimeInterval.current = setInterval(() => {
      updateLiveData();
    }, 30000); // Update every 30 seconds
  };

  const updateLiveData = async () => {
    try {
      // Simulate live data updates
      const newData = {
        newOrders: Math.floor(Math.random() * 3),
        newRevenue: Math.floor(Math.random() * 50) + 10,
        newCustomers: Math.floor(Math.random() * 2),
      };
      
      setLiveUpdates(newData);
      setLastUpdate(new Date());
      
      // Animate the updates
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Slide animation for new data
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        slideAnim.setValue(0);
      });
      
    } catch (error) {
      console.error('Real-time update error:', error);
    }
  };

  const loadAnalytics = async () => {
    if (!storeId) return;

    try {
      setLoading(true);
      
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock analytics data with realistic values
      const mockData: AnalyticsData = {
        revenue: {
          total: 15420.50,
          change: 12.5,
          trend: 'up' as const,
        },
        orders: {
          total: 342,
          change: 8.2,
          trend: 'up' as const,
        },
        customers: {
          total: 156,
          change: 15.3,
          trend: 'up' as const,
        },
        engagement: {
          total: 2847,
          change: -2.1,
          trend: 'down' as const,
        },
        topProducts: [
          { id: '1', name: 'Summer Collection Sneakers', sales: 45, revenue: 4045.50, growth: 23.4 },
          { id: '2', name: 'Smart Home Bundle', sales: 32, revenue: 9596.68, growth: 18.7 },
          { id: '3', name: 'Organic Skincare Set', sales: 28, revenue: 4199.72, growth: 12.3 },
          { id: '4', name: 'Premium Yoga Mat', sales: 25, revenue: 1999.75, growth: 8.9 },
        ],
        recentActivity: [
          { id: '1', type: 'order', title: 'New Order #1234', description: 'Summer Collection Sneakers', amount: 89.99, timestamp: '2 minutes ago' },
          { id: '2', type: 'sale', title: 'Sale Completed', description: 'Smart Home Bundle', amount: 299.99, timestamp: '5 minutes ago' },
          { id: '3', type: 'follower', title: 'New Follower', description: 'Sarah Johnson started following your store', timestamp: '8 minutes ago' },
          { id: '4', type: 'review', title: '5-Star Review', description: 'Amazing quality! Highly recommend.', timestamp: '12 minutes ago' },
        ],
        salesChart: [
          { date: 'Mon', revenue: 1200, orders: 15 },
          { date: 'Tue', revenue: 1800, orders: 22 },
          { date: 'Wed', revenue: 1400, orders: 18 },
          { date: 'Thu', revenue: 2200, orders: 28 },
          { date: 'Fri', revenue: 1900, orders: 24 },
          { date: 'Sat', revenue: 2500, orders: 32 },
          { date: 'Sun', revenue: 2100, orders: 26 },
        ],
        customerSegments: [
          { segment: 'New Customers', count: 45, percentage: 28.8, revenue: 4050 },
          { segment: 'Returning', count: 78, percentage: 50.0, revenue: 7020 },
          { segment: 'VIP', count: 33, percentage: 21.2, revenue: 4350.50 },
        ],
      };
      
      setAnalyticsData(mockData);
      
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  // Enhanced metric card with live updates
  const renderMetricCard = (title: string, value: any, change: number, trend: 'up' | 'down' | 'stable', isLive = false) => {
    const displayValue = isLive && liveUpdates[title.toLowerCase()] 
      ? value + liveUpdates[title.toLowerCase()]
      : value;
      
    return (
      <Animated.View 
        style={[
          styles.metricCard,
          isLive && { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <View style={styles.metricHeader}>
          <Text style={styles.metricTitle}>{title}</Text>
          {isLive && (
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>
        <Text style={styles.metricValue}>
          {title === 'Revenue' ? formatCurrency(displayValue) : formatNumber(displayValue)}
        </Text>
        <View style={styles.metricChange}>
          <Ionicons 
            name={getTrendIcon(trend)} 
            size={16} 
            color={trend === 'up' ? colors.success : trend === 'down' ? colors.error : colors.textSecondary} 
          />
          <Text style={[
            styles.changeText, 
            { color: trend === 'up' ? colors.success : trend === 'down' ? colors.error : colors.textSecondary }
          ]}>
            {change > 0 ? '+' : ''}{change}%
          </Text>
        </View>
      </Animated.View>
    );
  };

  const renderTopProducts = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Top Products</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      {analyticsData?.topProducts.map((product, index) => (
        <View key={product.id} style={styles.productItem}>
          <View style={styles.productRank}>
            <Text style={styles.rankText}>#{index + 1}</Text>
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productStats}>
              {formatNumber(product.sales)} sales • {formatCurrency(product.revenue)}
            </Text>
          </View>
          <View style={styles.productGrowth}>
            <Text style={[
              styles.growthText,
              { color: product.growth >= 0 ? colors.success : colors.error }
            ]}>
              {product.growth >= 0 ? '+' : ''}{product.growth}%
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderRecentActivity = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {analyticsData?.recentActivity.map((activity) => (
        <View key={activity.id} style={styles.activityItem}>
          <View style={styles.activityIcon}>
            <Ionicons 
              name={getActivityIcon(activity.type)} 
              size={20} 
              color={getActivityColor(activity.type)} 
            />
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>{activity.title}</Text>
            <Text style={styles.activityDescription}>{activity.description}</Text>
            <Text style={styles.activityTime}>{activity.timestamp}</Text>
          </View>
          {activity.amount && (
            <Text style={styles.activityAmount}>
              {formatCurrency(activity.amount)}
            </Text>
          )}
        </View>
      ))}
    </View>
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return 'bag-outline';
      case 'sale': return 'card-outline';
      case 'follower': return 'person-add-outline';
      case 'review': return 'star-outline';
      default: return 'notifications-outline';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'order': return colors.primary;
      case 'sale': return colors.success;
      case 'follower': return colors.secondary;
      case 'review': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const renderCustomerSegments = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Customer Segments</Text>
      {analyticsData?.customerSegments.map((segment) => (
        <View key={segment.segment} style={styles.segmentItem}>
          <View style={styles.segmentInfo}>
            <Text style={styles.segmentName}>{segment.segment}</Text>
            <Text style={styles.segmentCount}>
              {formatNumber(segment.count)} customers ({segment.percentage}%)
            </Text>
          </View>
          <Text style={styles.segmentRevenue}>
            {formatCurrency(segment.revenue)}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderPeriodSelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.periodSelector}
    >
      {periods.map((period) => (
        <TouchableOpacity
          key={period.id}
          style={[
            styles.periodButton,
            selectedPeriod === period.id && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod(period.id)}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === period.id && styles.periodButtonTextActive,
          ]}>
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderViewSelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.viewSelector}
    >
      {views.map((view) => (
        <TouchableOpacity
          key={view.id}
          style={[
            styles.viewButton,
            selectedView === view.id && styles.viewButtonActive,
          ]}
          onPress={() => setSelectedView(view.id)}
        >
          <Ionicons 
            name={view.icon} 
            size={20} 
            color={selectedView === view.id ? colors.white : colors.textSecondary} 
          />
          <Text style={[
            styles.viewButtonText,
            selectedView === view.id && styles.viewButtonTextActive,
          ]}>
            {view.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Live updates banner
  const renderLiveUpdatesBanner = () => {
    if (!realTimeMode || !liveUpdates) return null;
    
    const hasUpdates = liveUpdates.newOrders > 0 || liveUpdates.newRevenue > 0 || liveUpdates.newCustomers > 0;
    
    if (!hasUpdates) return null;
    
    return (
      <Animated.View 
        style={[
          styles.liveUpdatesBanner,
          {
            transform: [{ translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 0],
            })}],
          }
        ]}
      >
        <Ionicons name="radio-outline" size={16} color="white" />
        <Text style={styles.liveUpdatesText}>
          Live: {liveUpdates.newOrders} new orders, ${liveUpdates.newRevenue} revenue, {liveUpdates.newCustomers} new customers
        </Text>
        <Text style={styles.lastUpdateText}>
          Updated {lastUpdate.toLocaleTimeString()}
        </Text>
      </Animated.View>
    );
  };

  // Real-time toggle
  const renderRealTimeToggle = () => (
    <View style={styles.realTimeToggle}>
      <Text style={styles.realTimeLabel}>Real-time Updates</Text>
      <TouchableOpacity 
        style={[styles.toggleButton, realTimeMode && styles.toggleButtonActive]}
        onPress={() => setRealTimeMode(!realTimeMode)}
      >
        <Ionicons 
          name={realTimeMode ? "radio" : "radio-outline"} 
          size={20} 
          color={realTimeMode ? "white" : colors.textSecondary} 
        />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <HeaderWithMenu />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your analytics...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderWithMenu />
      
      {renderLiveUpdatesBanner()}
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Analytics</Text>
          {renderRealTimeToggle()}
        </View>
        
        {renderPeriodSelector()}
        {renderViewSelector()}
        
        {selectedView === 'overview' && analyticsData && (
          <>
            <View style={styles.metricsGrid}>
              {renderMetricCard('Revenue', analyticsData.revenue.total, analyticsData.revenue.change, analyticsData.revenue.trend, true)}
              {renderMetricCard('Orders', analyticsData.orders.total, analyticsData.orders.change, analyticsData.orders.trend, true)}
              {renderMetricCard('Customers', analyticsData.customers.total, analyticsData.customers.change, analyticsData.customers.trend, true)}
              {renderMetricCard('Engagement', analyticsData.engagement.total, analyticsData.engagement.change, analyticsData.engagement.trend)}
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top Performing Products</Text>
              {renderTopProducts()}
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              {renderRecentActivity()}
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customer Segments</Text>
              {renderCustomerSegments()}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.m,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  periodSelector: {
    marginBottom: spacing.m,
  },
  periodButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginRight: spacing.s,
    backgroundColor: colors.card,
    borderRadius: radii.m,
    ...shadows.card,
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    fontSize: typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: colors.white,
  },
  viewSelector: {
    marginBottom: spacing.l,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginRight: spacing.s,
    backgroundColor: colors.card,
    borderRadius: radii.m,
    ...shadows.card,
  },
  viewButtonActive: {
    backgroundColor: colors.primary,
  },
  viewButtonText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  viewButtonTextActive: {
    color: colors.white,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.l,
  },
  metricCard: {
    width: (width - spacing.m * 3) / 2,
    backgroundColor: colors.card,
    borderRadius: radii.m,
    padding: spacing.m,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  metricTitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: typography.h3,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: typography.caption,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  changeLabel: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.l,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  sectionTitle: {
    fontSize: typography.subtitle,
    fontWeight: '600',
    color: colors.text,
  },
  viewAllText: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: '500',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.m,
    padding: spacing.m,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  rankText: {
    fontSize: typography.caption,
    fontWeight: 'bold',
    color: colors.primary,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  productStats: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  productGrowth: {
    alignItems: 'flex-end',
  },
  growthText: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.m,
    padding: spacing.m,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  activityDescription: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  activityTime: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  activityAmount: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.success,
  },
  segmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.m,
    padding: spacing.m,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  segmentInfo: {
    flex: 1,
  },
  segmentName: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  segmentCount: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  segmentRevenue: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.success,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: (width - spacing.m * 3) / 2,
    backgroundColor: colors.card,
    borderRadius: radii.m,
    padding: spacing.m,
    alignItems: 'center',
    marginBottom: spacing.s,
    ...shadows.card,
  },
  quickActionText: {
    fontSize: typography.caption,
    color: colors.text,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
  // New styles for enhanced analytics
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  realTimeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  realTimeLabel: {
    fontSize: scale(14),
    color: colors.textSecondary,
    marginRight: spacing.s,
  },
  toggleButton: {
    width: scale(40),
    height: scale(24),
    borderRadius: scale(12),
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  liveUpdatesBanner: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginHorizontal: spacing.m,
    borderRadius: radii.medium,
    marginBottom: spacing.s,
  },
  liveUpdatesText: {
    color: 'white',
    fontSize: scale(14),
    fontWeight: '600',
    marginLeft: spacing.s,
    flex: 1,
  },
  lastUpdateText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: scale(12),
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: colors.success,
    marginRight: spacing.xs,
  },
  liveText: {
    fontSize: scale(10),
    color: colors.success,
    fontWeight: '600',
  },
}); 