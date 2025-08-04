import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../constants/theme';
import { AnalyticsService } from '../services/analyticsService';
import AnalyticsBadge from './AnalyticsBadge';

interface QuickAnalyticsWidgetProps {
  onViewFullAnalytics?: () => void;
}

export default function QuickAnalyticsWidget({ onViewFullAnalytics }: QuickAnalyticsWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [quickStats, setQuickStats] = useState({
    revenue: 0,
    orders: 0,
    users: 0,
    conversion: 0,
  });

  useEffect(() => {
    loadQuickStats();
  }, []);

  const loadQuickStats = async () => {
    try {
      setLoading(true);
      const [sales, engagement] = await Promise.all([
        AnalyticsService.getSalesMetrics('week'),
        AnalyticsService.getUserEngagement('week'),
      ]);

      setQuickStats({
        revenue: sales.totalRevenue,
        orders: sales.totalOrders,
        users: engagement.activeUsers,
        conversion: sales.conversionRate,
      });
    } catch (error) {
      console.error('Error loading quick stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Quick Analytics</Text>
          <View style={styles.loadingIndicator}>
            <Ionicons name="refresh" size={16} color={colors.textSecondary} />
          </View>
        </View>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quick Analytics</Text>
        <TouchableOpacity onPress={onViewFullAnalytics} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.badgesContainer}
      >
        <AnalyticsBadge 
          type="revenue" 
          period="week"
          style={styles.badge}
        />
        <AnalyticsBadge 
          type="orders" 
          period="week"
          style={styles.badge}
        />
        <AnalyticsBadge 
          type="users" 
          period="week"
          style={styles.badge}
        />
        <AnalyticsBadge 
          type="conversion" 
          period="week"
          style={styles.badge}
        />
      </ScrollView>

      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>This Week</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Revenue</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>
              {formatCurrency(quickStats.revenue)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Orders</Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {quickStats.orders}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Active Users</Text>
            <Text style={[styles.summaryValue, { color: colors.info }]}>
              {quickStats.users}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Conversion</Text>
            <Text style={[styles.summaryValue, { color: colors.warning }]}>
              {formatPercentage(quickStats.conversion)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.sizes.lg,
    ...typography.weights.semibold,
    color: colors.text,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    ...typography.sizes.sm,
    ...typography.weights.medium,
    color: colors.primary,
    marginRight: spacing.xs,
  },
  loadingIndicator: {
    padding: spacing.xs,
  },
  loadingContent: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  badgesContainer: {
    paddingHorizontal: spacing.xs,
  },
  badge: {
    marginHorizontal: spacing.xs,
  },
  summarySection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryTitle: {
    ...typography.sizes.md,
    ...typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.sizes.xs,
    ...typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography.sizes.md,
    ...typography.weights.bold,
  },
}); 