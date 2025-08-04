import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../constants/theme';
import { AdvancedSearchService, SearchAnalytics as SearchAnalyticsType } from '../services/advancedSearchService';

interface SearchAnalyticsProps {
  visible: boolean;
  onClose: () => void;
}

interface AnalyticsSummary {
  totalSearches: number;
  uniqueQueries: number;
  averageResults: number;
  topCategories: string[];
  popularSearches: Array<{ query: string; count: number }>;
  recentSearches: Array<{ query: string; timestamp: number }>;
}

export default function SearchAnalyticsDashboard({ visible, onClose }: SearchAnalyticsProps) {
  const [analytics, setAnalytics] = useState<SearchAnalyticsType[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalSearches: 0,
    uniqueQueries: 0,
    averageResults: 0,
    topCategories: [],
    popularSearches: [],
    recentSearches: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadAnalytics();
    }
  }, [visible]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const analyticsData = await AdvancedSearchService.getSearchAnalytics();
      setAnalytics(analyticsData);
      
      // Calculate summary
      const queryCounts: { [key: string]: number } = {};
      const categories: { [key: string]: number } = {};
      let totalResults = 0;
      
      analyticsData.forEach(entry => {
        if (entry.query) {
          queryCounts[entry.query] = (queryCounts[entry.query] || 0) + 1;
        }
        totalResults += entry.resultCount;
        
        // Extract categories from filters
        if (entry.filters.categories) {
          entry.filters.categories.forEach(cat => {
            categories[cat] = (categories[cat] || 0) + 1;
          });
        }
      });

      const popularSearches = Object.entries(queryCounts)
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const topCategories = Object.entries(categories)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([category]) => category);

      const recentSearches = analyticsData
        .filter(entry => entry.query)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10)
        .map(entry => ({
          query: entry.query,
          timestamp: entry.timestamp
        }));

      setSummary({
        totalSearches: analyticsData.length,
        uniqueQueries: Object.keys(queryCounts).length,
        averageResults: analyticsData.length > 0 ? Math.round(totalResults / analyticsData.length) : 0,
        topCategories,
        popularSearches,
        recentSearches
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const renderMetricCard = (title: string, value: string | number, icon: string, color: string) => (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.metricContent}>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
    </View>
  );

  const renderPopularSearch = ({ item }: { item: { query: string; count: number } }) => (
    <View style={styles.popularSearchItem}>
      <View style={styles.searchRank}>
        <Text style={styles.rankText}>{item.count}</Text>
      </View>
      <View style={styles.searchInfo}>
        <Text style={styles.searchQuery}>{item.query}</Text>
        <Text style={styles.searchCount}>{item.count} searches</Text>
      </View>
      <Ionicons name="trending-up" size={16} color={colors.primary} />
    </View>
  );

  const renderRecentSearch = ({ item }: { item: { query: string; timestamp: number } }) => (
    <View style={styles.recentSearchItem}>
      <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
      <View style={styles.recentSearchInfo}>
        <Text style={styles.recentSearchQuery}>{item.query}</Text>
        <Text style={styles.recentSearchTime}>{formatTimestamp(item.timestamp)}</Text>
      </View>
    </View>
  );

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Analytics</Text>
        <TouchableOpacity onPress={loadAnalytics} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="analytics-outline" size={48} color={colors.primary} />
            <Text style={styles.loadingText}>Loading analytics...</Text>
          </View>
        ) : (
          <>
            {/* Summary Metrics */}
            <View style={styles.metricsSection}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <View style={styles.metricsGrid}>
                {renderMetricCard('Total Searches', summary.totalSearches, 'search', colors.primary)}
                {renderMetricCard('Unique Queries', summary.uniqueQueries, 'document-text', colors.success)}
                {renderMetricCard('Avg Results', summary.averageResults, 'stats-chart', colors.warning)}
                {renderMetricCard('Categories', summary.topCategories.length, 'grid', colors.info)}
              </View>
            </View>

            {/* Popular Searches */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popular Searches</Text>
              {summary.popularSearches.length > 0 ? (
                <FlatList
                  data={summary.popularSearches}
                  renderItem={renderPopularSearch}
                  keyExtractor={(item) => item.query}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="trending-up-outline" size={32} color={colors.textSecondary} />
                  <Text style={styles.emptyText}>No search data yet</Text>
                </View>
              )}
            </View>

            {/* Recent Searches */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              {summary.recentSearches.length > 0 ? (
                <FlatList
                  data={summary.recentSearches}
                  renderItem={renderRecentSearch}
                  keyExtractor={(item) => item.query + item.timestamp}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="time-outline" size={32} color={colors.textSecondary} />
                  <Text style={styles.emptyText}>No recent searches</Text>
                </View>
              )}
            </View>

            {/* Top Categories */}
            {summary.topCategories.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Categories</Text>
                <View style={styles.categoriesGrid}>
                  {summary.topCategories.map((category, index) => (
                    <View key={category} style={styles.categoryTag}>
                      <Text style={styles.categoryText}>{category}</Text>
                      <Text style={styles.categoryRank}>#{index + 1}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  closeButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.sizes.lg,
    ...typography.weights.semibold,
    color: colors.text,
  },
  refreshButton: {
    padding: spacing.xs,
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
  metricsSection: {
    marginBottom: spacing.lg,
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
    gap: spacing.sm,
  },
  metricCard: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    ...shadows.sm,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  metricContent: {
    flex: 1,
  },
  metricValue: {
    ...typography.sizes.lg,
    ...typography.weights.bold,
    color: colors.text,
  },
  metricTitle: {
    ...typography.sizes.xs,
    ...typography.weights.medium,
    color: colors.textSecondary,
    marginTop: 2,
  },
  popularSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    ...shadows.xs,
  },
  searchRank: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  rankText: {
    ...typography.sizes.sm,
    ...typography.weights.bold,
    color: colors.white,
  },
  searchInfo: {
    flex: 1,
  },
  searchQuery: {
    ...typography.sizes.sm,
    ...typography.weights.medium,
    color: colors.text,
  },
  searchCount: {
    ...typography.sizes.xs,
    ...typography.weights.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    ...shadows.xs,
  },
  recentSearchInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  recentSearchQuery: {
    ...typography.sizes.sm,
    ...typography.weights.medium,
    color: colors.text,
  },
  recentSearchTime: {
    ...typography.sizes.xs,
    ...typography.weights.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryTag: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    ...typography.sizes.sm,
    ...typography.weights.medium,
    color: colors.white,
    marginRight: spacing.xs,
  },
  categoryRank: {
    ...typography.sizes.xs,
    ...typography.weights.bold,
    color: colors.white,
    opacity: 0.8,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
}); 