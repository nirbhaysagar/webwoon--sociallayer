import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import BackButton from '../../components/BackButton';

const { width } = Dimensions.get('window');

// Reusable Card Component
const MetricCard = ({ title, value, subtitle, icon, color, isLarge = false }) => (
  <TouchableOpacity style={[styles.metricCard, isLarge && styles.largeMetricCard]}>
    <LinearGradient
      colors={[color + '08', color + '12']}
      style={styles.metricGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.metricContent}>
        <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={isLarge ? 28 : 24} color={color} />
        </View>
        <View style={styles.metricInfo}>
          <Text style={[styles.metricValue, isLarge && styles.largeMetricValue]}>{value}</Text>
          <Text style={[styles.metricTitle, isLarge && styles.largeMetricTitle]}>{title}</Text>
          {subtitle && <Text style={[styles.metricSubtitle, isLarge && styles.largeMetricSubtitle]}>{subtitle}</Text>}
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

// Quick Stats Pill Component
const QuickStatPill = ({ label, value, icon, color }) => (
  <TouchableOpacity style={[styles.quickStatPill, { backgroundColor: color + '15' }]}>
    <View style={[styles.quickStatIcon, { backgroundColor: color + '25' }]}>
      <Ionicons name={icon} size={16} color={color} />
    </View>
    <Text style={[styles.quickStatValue, { color }]}>{value}</Text>
    <Text style={styles.quickStatLabel}>{label}</Text>
  </TouchableOpacity>
);

// User Statistics Chart Component
const UserStatsChart = ({ totalUsers, customers, vendors, riders }) => (
  <View style={styles.chartContainer}>
    <LinearGradient
      colors={['#F8F9FA', '#FFFFFF']}
      style={styles.chartGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>User Statistics</Text>
        <Text style={styles.chartSubtitle}>This week</Text>
      </View>
      <View style={styles.chartContent}>
        <View style={styles.donutChart}>
          <LinearGradient
            colors={['#F0F9FF', '#E0F2FE']}
            style={styles.donutGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.donutCenter}>
              <Text style={styles.donutTotal}>{totalUsers}</Text>
              <Text style={styles.donutLabel}>Total Users</Text>
            </View>
          </LinearGradient>
        </View>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.success }]} />
            <Text style={styles.legendText}>Customers ({customers})</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.purple }]} />
            <Text style={styles.legendText}>Vendors ({vendors})</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.orange }]} />
            <Text style={styles.legendText}>Riders ({riders})</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  </View>
);

export default function HomeScreen() {
  const { state, loadProducts, loadOrders, loadPosts } = useApp();
  
  // Load data on component mount
  useEffect(() => {
    if (state.store) {
      loadProducts();
      loadOrders();
      loadPosts();
    }
  }, [state.store]);

  // Calculate metrics from real data
  const products = state.products || [];
  const orders = state.orders || [];
  const posts = state.posts || [];

  // Basic metrics
  const totalOrders = orders.length;
  const activeProducts = products.filter(p => p.is_active).length;
  const totalPosts = posts.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const recentOrders = orders.filter(o => {
    const orderDate = new Date(o.created_at);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  });

  // Advanced metrics
  const ordersDelivered = orders.filter(o => o.status === 'delivered').length;
  const ordersShipped = orders.filter(o => o.status === 'shipped').length;
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Calculate sales growth (mock data for now)
  const lastMonthRevenue = totalRevenue * 0.8; // Mock: 20% less than current
  const salesGrowth = lastMonthRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

  // Engagement metrics
  const totalLikes = posts.reduce((sum, post) => sum + (post.engagement_metrics?.likes || 0), 0);
  const totalViews = posts.reduce((sum, post) => sum + (post.engagement_metrics?.views || 0), 0);
  const averageEngagement = posts.length > 0 ? (totalLikes / posts.length) : 0;

  // User statistics (mock data for now)
  const userStats = {
    totalUsers: 1250,
    customers: 980,
    vendors: 45,
    riders: 225
  };

  // Performance trends
  const performanceTrends = {
    revenue: { current: totalRevenue, previous: lastMonthRevenue, growth: salesGrowth },
    orders: { current: totalOrders, previous: Math.floor(totalOrders * 0.9), growth: 10 },
    engagement: { current: averageEngagement, previous: averageEngagement * 0.95, growth: 5 }
  };

  // Recent activity (combine orders and posts)
  const recentActivity = [
    ...orders.slice(0, 5).map(order => ({ ...order, type: 'order' })),
    ...posts.slice(0, 5).map(post => ({ ...post, type: 'post' }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);



  // Recent activity for display
  const recentOrdersForDisplay = state.orders.slice(0, 3);
  const recentPostsForDisplay = state.posts.slice(0, 3);

  const renderGreetingHeader = () => (
    <View style={styles.greetingHeader}>
      <View style={styles.greetingContent}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.avatarContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.avatarText}>JS</Text>
        </LinearGradient>
        <View style={styles.greetingText}>
          <Text style={styles.greetingTitle}>Hello, good morning!</Text>
          <Text style={styles.greetingName}>Jack Sparrow</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.notificationButton}>
        <Ionicons name="notifications-outline" size={24} color={colors.gray[700]} />
      </TouchableOpacity>
    </View>
  );

  const renderBalanceSection = () => (
    <View style={styles.balanceSection}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.balanceGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>${totalRevenue.toFixed(2)}</Text>
        <View style={styles.balanceChange}>
          <Ionicons name="trending-up" size={16} color="#fff" />
          <Text style={styles.balanceChangeText}>+${salesGrowth.toFixed(2)} (+{salesGrowth >= 0 ? '+' : ''}{salesGrowth.toFixed(1)}%)</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButtonPrimary}>
            <Ionicons name="arrow-up-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Withdraw</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButtonSecondary}>
            <Ionicons name="arrow-down-circle" size={20} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>Deposit</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderActivityItem = (item, type) => (
    <View key={item.id} style={styles.activityItem}>
      <View style={styles.activityIcon}>
        <Ionicons 
          name={type === 'order' ? 'receipt-outline' : 'camera-outline'} 
          size={20} 
          color={colors.gray[600]} 
        />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>
          {type === 'order' ? `Order #${item.order_number}` : item.title || 'New Post'}
        </Text>
        <Text style={styles.activitySubtitle}>
          {type === 'order' ? `$${item.total}` : item.caption?.substring(0, 50) + '...'}
        </Text>
      </View>
      <Text style={styles.activityTime}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backButton} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Welcome back, Seller!</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Greeting Header */}
        {renderGreetingHeader()}
        
        {/* Balance Section */}
        {renderBalanceSection()}

        {/* Key Metrics Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <MetricCard 
              title="Total Orders" 
              value={totalOrders} 
              subtitle="All time" 
              icon="receipt-outline" 
              color={colors.primary} 
              isLarge={true}
            />
            <MetricCard 
              title="Active Products" 
              value={activeProducts} 
              subtitle="In stock" 
              icon="cube-outline" 
              color={colors.success} 
              isLarge={true}
            />
            <MetricCard 
              title="Total Posts" 
              value={totalPosts} 
              subtitle="Published" 
              icon="camera-outline" 
              color={colors.orange} 
              isLarge={true}
            />
            <MetricCard 
              title="Pending Orders" 
              value={pendingOrders} 
              subtitle="Awaiting" 
              icon="time-outline" 
              color={colors.error} 
              isLarge={true}
            />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.quickStatsGrid}>
            <QuickStatPill label="Unassigned" value={pendingOrders} icon="clipboard-outline" color={colors.primary} />
            <QuickStatPill label="Today's Orders" value={recentOrdersForDisplay.length} icon="calendar-outline" color={colors.success} />
            <QuickStatPill label="Vendors" value={2} icon="storefront-outline" color={colors.purple} />
            <QuickStatPill label="Riders" value={4} icon="bicycle-outline" color={colors.orange} />
          </View>
        </View>

        {/* User Statistics Chart */}
        <View style={styles.section}>
          <UserStatsChart 
            totalUsers={userStats.totalUsers}
            customers={userStats.customers}
            vendors={userStats.vendors}
            riders={userStats.riders}
          />
        </View>

        {/* Performance Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <View style={styles.metricsGrid}>
            <MetricCard title="Orders Delivered" value={ordersDelivered} subtitle="Delivered" icon="checkmark-done-outline" color={colors.success} />
            <MetricCard title="Orders Shipped" value={ordersShipped} subtitle="Shipped" icon="send-outline" color={colors.primary} />
            <MetricCard title="Average Order" value={`$${averageOrderValue.toFixed(2)}`} subtitle="Per order" icon="pricetag-outline" color={colors.purple} />
            <MetricCard title="Sales Growth" value={`${salesGrowth >= 0 ? '+' : ''}${salesGrowth.toFixed(1)}%`} subtitle="vs last month" icon={salesGrowth >= 0 ? 'arrow-up-outline' : 'arrow-down-outline'} color={salesGrowth >= 0 ? colors.success : colors.error} />
          </View>
        </View>

        {/* Revenue Analytics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue Analytics</Text>
          <View style={styles.metricsGrid}>
            <MetricCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} subtitle="All time" icon="cash-outline" color={colors.success} />
            <MetricCard title="Today's Revenue" value={`$${(totalRevenue * 0.1).toFixed(2)}`} subtitle="Today" icon="today-outline" color={colors.primary} />
            <MetricCard title="Monthly Revenue" value={`$${(totalRevenue * 0.3).toFixed(2)}`} subtitle="This month" icon="calendar-outline" color={colors.purple} />
            <MetricCard title="Revenue Growth" value={`${salesGrowth >= 0 ? '+' : ''}${salesGrowth.toFixed(1)}%`} subtitle="vs last month" icon="trending-up-outline" color={salesGrowth >= 0 ? colors.success : colors.error} />
          </View>
        </View>

        {/* Engagement Analytics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Engagement Analytics</Text>
          <View style={styles.metricsGrid}>
            <MetricCard title="Total Likes" value={totalLikes} subtitle="All posts" icon="heart-outline" color={colors.error} />
            <MetricCard title="Total Views" value={totalViews} subtitle="All posts" icon="eye-outline" color={colors.primary} />
            <MetricCard title="Avg Engagement" value={`${averageEngagement.toFixed(1)}`} subtitle="Per post" icon="analytics-outline" color={colors.purple} />
            <MetricCard title="Active Posts" value={posts.filter(p => p.is_published).length} subtitle="Published" icon="camera-outline" color={colors.orange} />
          </View>
        </View>

        {/* Inventory Analytics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inventory Analytics</Text>
          <View style={styles.metricsGrid}>
            <MetricCard title="Total Products" value={products.length} subtitle="All products" icon="cube-outline" color={colors.primary} />
            <MetricCard title="Active Products" value={activeProducts} subtitle="In stock" icon="checkmark-circle-outline" color={colors.success} />
            <MetricCard title="Low Stock" value={products.filter(p => p.stock_quantity < 10).length} subtitle="Need restock" icon="warning-outline" color={colors.warning} />
            <MetricCard title="Out of Stock" value={products.filter(p => p.stock_quantity === 0).length} subtitle="No stock" icon="close-circle-outline" color={colors.error} />
          </View>
        </View>

        {/* Performance Trends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Trends</Text>
          <View style={styles.trendsContainer}>
            <View style={styles.trendItem}>
              <View style={styles.trendHeader}>
                <Text style={styles.trendLabel}>Revenue</Text>
                <Text style={[styles.trendValue, { color: performanceTrends.revenue.growth >= 0 ? colors.success : colors.error }]}>
                  ${performanceTrends.revenue.current.toFixed(2)}
                </Text>
              </View>
              <View style={styles.trendBar}>
                <View style={[styles.trendBarFill, { width: `${Math.min(100, (performanceTrends.revenue.current / 1000) * 100)}%`, backgroundColor: colors.success }]} />
              </View>
              <Text style={[styles.trendGrowth, { color: performanceTrends.revenue.growth >= 0 ? colors.success : colors.error }]}>
                {performanceTrends.revenue.growth >= 0 ? '+' : ''}{performanceTrends.revenue.growth.toFixed(1)}%
              </Text>
            </View>
            
            <View style={styles.trendItem}>
              <View style={styles.trendHeader}>
                <Text style={styles.trendLabel}>Orders</Text>
                <Text style={[styles.trendValue, { color: performanceTrends.orders.growth >= 0 ? colors.success : colors.error }]}>
                  {performanceTrends.orders.current}
                </Text>
              </View>
              <View style={styles.trendBar}>
                <View style={[styles.trendBarFill, { width: `${Math.min(100, (performanceTrends.orders.current / 100) * 100)}%`, backgroundColor: colors.primary }]} />
              </View>
              <Text style={[styles.trendGrowth, { color: performanceTrends.orders.growth >= 0 ? colors.success : colors.error }]}>
                {performanceTrends.orders.growth >= 0 ? '+' : ''}{performanceTrends.orders.growth.toFixed(1)}%
              </Text>
            </View>
            
            <View style={styles.trendItem}>
              <View style={styles.trendHeader}>
                <Text style={styles.trendLabel}>Engagement</Text>
                <Text style={[styles.trendValue, { color: performanceTrends.engagement.growth >= 0 ? colors.success : colors.error }]}>
                  {performanceTrends.engagement.current.toFixed(1)}
                </Text>
              </View>
              <View style={styles.trendBar}>
                <View style={[styles.trendBarFill, { width: `${Math.min(100, (performanceTrends.engagement.current / 10) * 100)}%`, backgroundColor: colors.purple }]} />
              </View>
              <Text style={[styles.trendGrowth, { color: performanceTrends.engagement.growth >= 0 ? colors.success : colors.error }]}>
                {performanceTrends.engagement.growth >= 0 ? '+' : ''}{performanceTrends.engagement.growth.toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityContainer}>
            {recentActivity.length > 0 ? (
              recentActivity.map((item, index) => renderActivityItem(item, item.type))
            ) : (
              <View style={styles.emptyActivity}>
                <Ionicons name="time-outline" size={48} color={colors.textSecondary} />
                <Text style={styles.emptyActivityText}>No recent activity</Text>
                <Text style={styles.emptyActivitySubtext}>Start creating posts and receiving orders to see activity here</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.s,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    ...typography.title2,
    color: colors.gray[900],
  },
  subtitle: {
    ...typography.subheadline,
    color: colors.gray[600],
    marginTop: 2,
  },
  settingsButton: {
    padding: spacing.s,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.m,
    paddingBottom: 120,
  },
  greetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.l,
    paddingTop: spacing.s,
  },
  greetingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
    ...shadows.card,
  },
  avatarText: {
    color: '#fff',
    ...typography.headline,
    fontWeight: '700',
  },
  greetingText: {
    flex: 1,
  },
  greetingTitle: {
    ...typography.subheadline,
    color: colors.gray[600],
    marginBottom: 2,
  },
  greetingName: {
    ...typography.title3,
    color: colors.gray[900],
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  balanceSection: {
    marginBottom: spacing.l,
    borderRadius: radii.xlarge,
    overflow: 'hidden',
    ...shadows.card,
  },
  balanceGradient: {
    padding: spacing.l,
    alignItems: 'center',
  },
  balanceLabel: {
    ...typography.callout,
    color: '#fff',
    opacity: 0.9,
    marginBottom: spacing.s,
  },
  balanceAmount: {
    ...typography.balanceValue,
    color: '#fff',
    marginBottom: spacing.s,
  },
  balanceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  balanceChangeText: {
    ...typography.footnote,
    color: '#fff',
    marginLeft: spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButtonPrimary: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: radii.medium,
    padding: spacing.m,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginRight: spacing.s,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionButtonSecondary: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: radii.medium,
    padding: spacing.m,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginLeft: spacing.s,
  },
  actionButtonText: {
    ...typography.headline,
    color: '#fff',
    marginLeft: spacing.s,
  },
  section: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    ...typography.title3,
    color: colors.gray[900],
    marginBottom: spacing.m,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    marginBottom: spacing.s,
    width: (width - spacing.m * 3) / 2,
    borderRadius: radii.xlarge,
    overflow: 'hidden',
    ...shadows.card,
  },
  largeMetricCard: {
    width: (width - spacing.m * 3) / 2,
  },
  metricGradient: {
    padding: spacing.m,
  },
  metricContent: {
    alignItems: 'center',
  },
  metricIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
  },
  metricInfo: {
    alignItems: 'center',
  },
  metricValue: {
    ...typography.dataValue,
    color: colors.gray[900],
    marginBottom: 2,
  },
  largeMetricValue: {
    ...typography.largeDataValue,
  },
  metricTitle: {
    ...typography.codeLabel,
    color: colors.gray[800],
    marginBottom: 2,
    textAlign: 'center',
  },
  largeMetricTitle: {
    ...typography.headline,
  },
  metricSubtitle: {
    ...typography.caption1,
    color: colors.gray[600],
    textAlign: 'center',
  },
  largeMetricSubtitle: {
    ...typography.footnote,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickStatPill: {
    borderRadius: radii.xlarge,
    padding: spacing.m,
    marginBottom: spacing.s,
    width: (width - spacing.m * 3) / 2,
    alignItems: 'center',
    ...shadows.card,
  },
  quickStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  quickStatValue: {
    ...typography.title3,
    marginBottom: 2,
  },
  quickStatLabel: {
    ...typography.caption1,
    color: colors.gray[600],
  },
  chartContainer: {
    borderRadius: radii.xlarge,
    overflow: 'hidden',
    ...shadows.card,
  },
  chartGradient: {
    padding: spacing.l,
  },
  chartHeader: {
    marginBottom: spacing.m,
  },
  chartTitle: {
    ...typography.title3,
    color: colors.gray[900],
  },
  chartSubtitle: {
    ...typography.subheadline,
    color: colors.gray[600],
  },
  chartContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  donutChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginRight: spacing.l,
    overflow: 'hidden',
  },
  donutGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenter: {
    alignItems: 'center',
  },
  donutTotal: {
    ...typography.title2,
    color: colors.gray[900],
  },
  donutLabel: {
    ...typography.caption1,
    color: colors.gray[600],
  },
  chartLegend: {
    flex: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.s,
  },
  legendText: {
    ...typography.subheadline,
    color: colors.gray[800],
  },
  activityContainer: {
    backgroundColor: '#fff',
    borderRadius: radii.xlarge,
    overflow: 'hidden',
    ...shadows.card,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...typography.subheadline,
    color: colors.gray[900],
    marginBottom: 2,
  },
  activitySubtitle: {
    ...typography.caption1,
    color: colors.gray[600],
  },
  activityTime: {
    ...typography.caption1,
    color: colors.gray[500],
  },
  // Performance Trends Styles
  trendsContainer: {
    backgroundColor: '#fff',
    borderRadius: radii.xlarge,
    padding: spacing.m,
    ...shadows.card,
  },
  trendItem: {
    marginBottom: spacing.m,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  trendLabel: {
    ...typography.subheadline,
    color: colors.gray[700],
    fontWeight: '500',
  },
  trendValue: {
    ...typography.subheadline,
    fontWeight: 'bold',
  },
  trendBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  trendBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  trendGrowth: {
    ...typography.caption1,
    fontWeight: '600',
  },
  // Empty Activity Styles
  emptyActivity: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: '#fff',
    borderRadius: radii.xlarge,
    ...shadows.card,
  },
  emptyActivityText: {
    ...typography.subheadline,
    color: colors.gray[700],
    marginTop: spacing.s,
    fontWeight: '500',
  },
  emptyActivitySubtext: {
    ...typography.caption1,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing.xs,
  },
}); 