import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii } from '../constants/theme';
import { AnalyticsService } from '../services/analyticsService';

interface AnalyticsBadgeProps {
  onPress?: () => void;
  type: 'revenue' | 'orders' | 'users' | 'conversion';
  period?: 'day' | 'week' | 'month';
  style?: any;
}

export default function AnalyticsBadge({ 
  onPress, 
  type,
  period = 'week',
  style 
}: AnalyticsBadgeProps) {
  const [value, setValue] = useState<string>('--');
  const [trend, setTrend] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [type, period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      switch (type) {
        case 'revenue':
          const sales = await AnalyticsService.getSalesMetrics(period);
          setValue(`$${sales.totalRevenue.toLocaleString()}`);
          break;
        case 'orders':
          const orders = await AnalyticsService.getSalesMetrics(period);
          setValue(orders.totalOrders.toString());
          break;
        case 'users':
          const engagement = await AnalyticsService.getUserEngagement(period);
          setValue(engagement.activeUsers.toString());
          break;
        case 'conversion':
          const conversion = await AnalyticsService.getSalesMetrics(period);
          setValue(`${conversion.conversionRate.toFixed(1)}%`);
          break;
      }
    } catch (error) {
      console.error('Error loading analytics badge:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'revenue':
        return 'cash-outline';
      case 'orders':
        return 'bag-outline';
      case 'users':
        return 'people-outline';
      case 'conversion':
        return 'trending-up-outline';
      default:
        return 'analytics-outline';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'revenue':
        return colors.success;
      case 'orders':
        return colors.primary;
      case 'users':
        return colors.info;
      case 'conversion':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'revenue':
        return 'Revenue';
      case 'orders':
        return 'Orders';
      case 'users':
        return 'Users';
      case 'conversion':
        return 'Conversion';
      default:
        return 'Metric';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={onPress}
      disabled={!onPress || loading}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: getColor() + '20' }]}>
          <Ionicons name={getIcon() as any} size={16} color={getColor()} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{getTitle()}</Text>
          <Text style={[styles.value, { color: getColor() }]}>
            {loading ? '...' : value}
          </Text>
        </View>
        {trend !== 'neutral' && (
          <Ionicons 
            name={trend === 'up' ? 'trending-up' : 'trending-down'} 
            size={12} 
            color={trend === 'up' ? colors.success : colors.error} 
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: radii.sm,
    padding: spacing.sm,
    ...colors.shadows?.xs,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: radii.xs,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.sizes.xs,
    ...typography.weights.medium,
    color: colors.textSecondary,
  },
  value: {
    ...typography.sizes.sm,
    ...typography.weights.bold,
  },
}); 