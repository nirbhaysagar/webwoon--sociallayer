import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { AnalyticsService, SalesMetrics, UserEngagement, ProductAnalytics, SearchAnalytics, NotificationAnalytics } from '../../services/analyticsService';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import BackButton from '../../components/BackButton';

interface AnalyticsDashboardProps {
  navigation: any;
}

export default function AnalyticsDashboard({ navigation }: AnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics | null>(null);
  const [userEngagement, setUserEngagement] = useState<UserEngagement | null>(null);
  const [productAnalytics, setProductAnalytics] = useState<ProductAnalytics[]>([]);
  const [searchAnalytics, setSearchAnalytics] = useState<SearchAnalytics | null>(null);
  const [notificationAnalytics, setNotificationAnalytics] = useState<NotificationAnalytics | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [
        sales,
        engagement,
        products,
        search,
        notifications,
        realTime
      ] = await Promise.all([
        AnalyticsService.getSalesMetrics(selectedPeriod),
        AnalyticsService.getUserEngagement(selectedPeriod),
        AnalyticsService.getProductAnalytics(),
        AnalyticsService.getSearchAnalytics(),
        AnalyticsService.getNotificationAnalytics(),
        AnalyticsService.getRealTimeMetrics(),
      ]);

      setSalesMetrics(sales);
      setUserEngagement(engagement);
      setProductAnalytics(products);
      setSearchAnalytics(search);
      setNotificationAnalytics(notifications);
      setRealTimeMetrics(realTime);
    } catch (error) {
      console.error('Error loading analytics:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const renderMetricCard = (title: string, value: string, subtitle: string, icon: string, color: string) => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricSubtitle}>{subtitle}</Text>
    </View>
  );

  const renderSalesMetrics = () => {
    if (!salesMetrics) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sales Metrics</Text>
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            'Total Revenue',
            formatCurrency(salesMetrics.totalRevenue),
            `${selectedPeriod} period`,
            'cash-outline',
            colors.success
          )}
          {renderMetricCard(
            'Total Orders',
            formatNumber(salesMetrics.totalOrders),
            'orders placed',
            'bag-outline',
            colors.primary
          )}
          {renderMetricCard(
            'Avg Order Value',
            formatCurrency(salesMetrics.averageOrderValue),
            'per order',
            'trending-up-outline',
            colors.warning
          )}
          {renderMetricCard(
            'Conversion Rate',
            formatPercentage(salesMetrics.conversionRate),
            'visitor to buyer',
            'analytics-outline',
            colors.info
          )}
        </View>
      </View>
    );
  };

  const renderUserEngagement = () => {
    if (!userEngagement) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Engagement</Text>
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            'Active Users',
            formatNumber(userEngagement.activeUsers),
            'unique visitors',
            'people-outline',
            colors.primary
          )}
          {renderMetricCard(
            'Page Views',
            formatNumber(userEngagement.pageViews),
            'total views',
            'eye-outline',
            colors.info
          )}
          {renderMetricCard(
            'Session Duration',
            `${Math.floor(userEngagement.sessionDuration / 60)}m ${userEngagement.sessionDuration % 60}s`,
            'average time',
            'time-outline',
            colors.warning
          )}
          {renderMetricCard(
            'Retention Rate',
            formatPercentage(userEngagement.retentionRate),
            'user retention',
            'repeat-outline',
            colors.success
          )}
        </View>
      </View>
    );
  };

  const renderTopProducts = () => {
    if (!salesMetrics?.topProducts.length) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Products</Text>
        <View style={styles.productList}>
          {salesMetrics.topProducts.map((product, index) => (
            <View key={product.productId} style={styles.productItem}>
              <View style={styles.productRank}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productStats}>
                  {product.sales} sales • {formatCurrency(product.revenue)}
                </Text>
              </View>
              <View style={styles.productRevenue}>
                <Text style={styles.revenueText}>{formatCurrency(product.revenue)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderSearchAnalytics = () => {
    if (!searchAnalytics) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Search Analytics</Text>
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            'Total Searches',
            formatNumber(searchAnalytics.totalSearches),
            'search queries',
            'search-outline',
            colors.primary
          )}
          {renderMetricCard(
            'Unique Searches',
            formatNumber(searchAnalytics.uniqueSearches),
            'different queries',
            'funnel-outline',
            colors.info
          )}
          {renderMetricCard(
            'Conversion Rate',
            formatPercentage(searchAnalytics.searchConversionRate),
            'search to purchase',
            'trending-up-outline',
            colors.success
          )}
          {renderMetricCard(
            'Avg Results',
            searchAnalytics.averageResultsPerSearch.toFixed(1),
            'per search',
            'list-outline',
            colors.warning
          )}
        </View>
      </View>
    );
  };

  const renderNotificationAnalytics = () => {
    if (!notificationAnalytics) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Performance</Text>
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            'Sent',
            formatNumber(notificationAnalytics.sentCount),
            'notifications sent',
            'send-outline',
            colors.primary
          )}
          {renderMetricCard(
            'Opened',
            formatNumber(notificationAnalytics.openedCount),
            'notifications opened',
            'eye-outline',
            colors.success
          )}
          {renderMetricCard(
            'Click Rate',
            formatPercentage(notificationAnalytics.clickRate),
            'open rate',
            'analytics-outline',
            colors.info
          )}
        </View>
      </View>
    );
  };

  const renderRealTimeMetrics = () => {
    if (!realTimeMetrics) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Real-Time Activity</Text>
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            'Active Users',
            formatNumber(realTimeMetrics.activeUsers),
            'last hour',
            'people-outline',
            colors.success
          )}
          {renderMetricCard(
            'Current Sessions',
            formatNumber(realTimeMetrics.currentSessions),
            'last 5 minutes',
            'radio-outline',
            colors.primary
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="analytics-outline" size={48} color={colors.primary} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backButton} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>
            Track your business performance
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(['day', 'week', 'month'] as const).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[
              styles.periodText,
              selectedPeriod === period && styles.periodTextActive
            ]}>
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {renderSalesMetrics()}
        {renderUserEngagement()}
        {renderTopProducts()}
        {renderSearchAnalytics()}
        {renderNotificationAnalytics()}
        {renderRealTimeMetrics()}
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
    fontSize: scale(24),
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: scale(14),
    color: colors.textSecondary,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: radii.circle,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.xs,
    borderRadius: radii.sm,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: colors.primary + '20',
  },
  periodText: {
    ...typography.sizes.sm,
    ...typography.weights.medium,
    color: colors.textSecondary,
  },
  periodTextActive: {
    color: colors.primary,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.sizes.md,
    ...typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    ...shadows.sm,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  metricTitle: {
    ...typography.sizes.xs,
    ...typography.weights.medium,
    color: colors.textSecondary,
    flex: 1,
  },
  metricValue: {
    ...typography.sizes.lg,
    ...typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  metricSubtitle: {
    ...typography.sizes.xs,
    ...typography.weights.regular,
    color: colors.textSecondary,
  },
  productList: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  rankNumber: {
    ...typography.sizes.sm,
    ...typography.weights.bold,
    color: colors.primary,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    ...typography.sizes.sm,
    ...typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  productStats: {
    ...typography.sizes.xs,
    ...typography.weights.regular,
    color: colors.textSecondary,
  },
  productRevenue: {
    alignItems: 'flex-end',
  },
  revenueText: {
    ...typography.sizes.sm,
    ...typography.weights.semibold,
    color: colors.success,
  },
}); 