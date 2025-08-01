import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from './components/HeaderWithMenu';
import { useApp } from '../../context/AppContext';
import { scale, verticalScale, moderateScale } from '../../lib/scale';

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

  // --- Analytics Calculations ---
  const ordersDelivered = state.orders.filter(o => o.status === 'delivered').length;
  const ordersShipped = state.orders.filter(o => o.status === 'shipped').length;
  const ordersRefunded = state.orders.filter(o => o.status === 'refunded' || o.status === 'cancelled').length;
  const pendingPayouts = state.orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
  const refundsIssued = state.orders.filter(o => o.status === 'refunded').reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
  const totalCustomers = new Set(state.orders.map(o => o.customer_id)).size;
  const newCustomers = new Set(state.orders.filter(o => new Date(o.created_at) > new Date(new Date().getFullYear(), new Date().getMonth(), 1)).map(o => o.customer_id)).size;
  const repeatCustomers = state.orders.reduce((acc, o) => {
    acc[o.customer_id] = (acc[o.customer_id] || 0) + 1;
    return acc;
  }, {});
  const repeatPurchaseRate = totalCustomers ? (Object.values(repeatCustomers).filter(c => c > 1).length / totalCustomers * 100) : 0;
  const lowStockProducts = state.products.filter(p => p.stock_quantity < (p.low_stock_threshold || 5)).length;
  const outOfStockProducts = state.products.filter(p => p.stock_quantity === 0).length;
  const topProduct = state.products.reduce((top, p) => (p.stock_quantity > (top?.stock_quantity || 0) ? p : top), null);
  const boostedPosts = state.posts.filter(p => p.is_published && p.is_boosted).length;
  const postEngagement = state.posts.reduce((sum, p) => sum + (p.engagement_metrics?.likes || 0) + (p.engagement_metrics?.comments || 0) + (p.engagement_metrics?.shares || 0), 0);
  const mostEngagedPost = state.posts.reduce((top, p) => ((p.engagement_metrics?.engagement_rate || 0) > (top?.engagement_metrics?.engagement_rate || 0) ? p : top), null);
  const totalSales = state.orders.filter(order => order.status === 'delivered').reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
  const totalOrders = state.orders.length;
  const totalProducts = state.products.length;
  const totalPosts = state.posts.length;
  const pendingOrders = state.orders.filter(order => order.status === 'pending').length;
  const activeProducts = state.products.filter(product => product.is_active).length;
  const averageOrderValue = totalOrders ? (totalSales / totalOrders) : 0;
  const salesLastMonth = state.orders.filter(o => {
    const d = new Date(o.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() - 1 && d.getFullYear() === now.getFullYear();
  }).reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
  const salesGrowth = salesLastMonth ? ((totalSales - salesLastMonth) / salesLastMonth * 100) : 0;

  // Mock data for user statistics
  const userStats = {
    totalUsers: 48,
    customers: 32,
    vendors: 12,
    riders: 4
  };

  // Recent activity
  const recentOrders = state.orders.slice(0, 3);
  const recentPosts = state.posts.slice(0, 3);

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
        <Text style={styles.balanceAmount}>${totalSales.toFixed(2)}</Text>
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
      <HeaderWithMenu />
      
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
            <QuickStatPill label="Today's Orders" value={recentOrders.length} icon="calendar-outline" color={colors.success} />
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

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityContainer}>
            {recentOrders.map(order => renderActivityItem(order, 'order'))}
            {recentPosts.map(post => renderActivityItem(post, 'post'))}
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
}); 