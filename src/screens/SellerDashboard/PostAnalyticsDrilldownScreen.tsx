import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';

const mockAnalytics = {
  views: [120, 200, 180, 250, 300, 220, 150],
  likes: [10, 20, 15, 30, 25, 18, 12],
  comments: [2, 4, 3, 6, 5, 2, 1],
  saves: [5, 8, 7, 10, 9, 6, 4],
  sales: 24,
  attributedRevenue: '$1,200',
  audience: {
    topCountries: [
      { country: 'USA', percent: 40 },
      { country: 'UK', percent: 25 },
      { country: 'India', percent: 20 },
      { country: 'Other', percent: 15 },
    ],
    ageGroups: [
      { group: '18-24', percent: 30 },
      { group: '25-34', percent: 45 },
      { group: '35-44', percent: 15 },
      { group: '45+', percent: 10 },
    ],
  },
};

export default function PostAnalyticsDrilldownScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Post Analytics</Text>
        {/* Mock Chart (replace with real chart lib later) */}
        <View style={styles.chartCard}>
          <Ionicons name="bar-chart-outline" size={32} color={colors.secondary} style={styles.chartIcon} />
          <Text style={styles.chartTitle}>Views Over Last 7 Days</Text>
          <View style={styles.chartRow}>
            {mockAnalytics.views.map((v, i) => (
              <View key={i} style={styles.barWrap}>
                <View style={[styles.bar, { height: v / 4 }]} />
                <Text style={styles.barLabel}>{v}</Text>
              </View>
            ))}
          </View>
        </View>
        {/* Engagement Breakdown */}
        <Text style={styles.sectionTitle}>Engagement Breakdown</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}><Ionicons name="eye-outline" size={22} color={colors.secondary} /><Text style={styles.statValue}>{mockAnalytics.views.reduce((a, b) => a + b, 0)}</Text><Text style={styles.statLabel}>Views</Text></View>
          <View style={styles.statCard}><Ionicons name="heart-outline" size={22} color={colors.primary} /><Text style={styles.statValue}>{mockAnalytics.likes.reduce((a, b) => a + b, 0)}</Text><Text style={styles.statLabel}>Likes</Text></View>
          <View style={styles.statCard}><Ionicons name="chatbubble-outline" size={22} color={colors.secondary} /><Text style={styles.statValue}>{mockAnalytics.comments.reduce((a, b) => a + b, 0)}</Text><Text style={styles.statLabel}>Comments</Text></View>
          <View style={styles.statCard}><Ionicons name="bookmark-outline" size={22} color={colors.primary} /><Text style={styles.statValue}>{mockAnalytics.saves.reduce((a, b) => a + b, 0)}</Text><Text style={styles.statLabel}>Saves</Text></View>
        </View>
        {/* Sales Attributed */}
        <Text style={styles.sectionTitle}>Sales Attributed</Text>
        <View style={styles.salesCard}>
          <Ionicons name="cart-outline" size={28} color={colors.secondary} style={styles.salesIcon} />
          <Text style={styles.salesValue}>{mockAnalytics.sales} sales</Text>
          <Text style={styles.salesRevenue}>{mockAnalytics.attributedRevenue} revenue</Text>
        </View>
        {/* Audience Breakdown */}
        <Text style={styles.sectionTitle}>Audience Breakdown</Text>
        <View style={styles.audienceRow}>
          <View style={styles.audienceCard}>
            <Text style={styles.audienceTitle}>Top Countries</Text>
            {mockAnalytics.audience.topCountries.map(c => (
              <Text key={c.country} style={styles.audienceText}>{c.country}: {c.percent}%</Text>
            ))}
          </View>
          <View style={styles.audienceCard}>
            <Text style={styles.audienceTitle}>Age Groups</Text>
            {mockAnalytics.audience.ageGroups.map(a => (
              <Text key={a.group} style={styles.audienceText}>{a.group}: {a.percent}%</Text>
            ))}
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.m,
    paddingBottom: 80,
  },
  title: {
    fontSize: typography.title,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  chartCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.l,
    alignItems: 'center',
    ...shadows.card,
  },
  chartIcon: {
    marginBottom: 4,
  },
  chartTitle: {
    fontSize: 15,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    width: '100%',
    justifyContent: 'space-between',
  },
  barWrap: {
    alignItems: 'center',
    width: 28,
  },
  bar: {
    width: 18,
    backgroundColor: colors.primary,
    borderRadius: 6,
    marginBottom: 2,
  },
  barLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: typography.subtitle,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.l,
    marginBottom: spacing.s,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: spacing.m,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    alignItems: 'center',
    padding: spacing.s,
    marginRight: 8,
    ...shadows.card,
  },
  statValue: {
    fontSize: 15,
    color: colors.secondary,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  salesCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    alignItems: 'center',
    marginBottom: spacing.m,
    ...shadows.card,
  },
  salesIcon: {
    marginBottom: 4,
  },
  salesValue: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
  salesRevenue: {
    fontSize: 15,
    color: colors.secondary,
    fontWeight: 'bold',
  },
  audienceRow: {
    flexDirection: 'row',
    marginBottom: spacing.m,
  },
  audienceCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginRight: spacing.s,
    ...shadows.card,
  },
  audienceTitle: {
    fontSize: 14,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  audienceText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  backBtn: {
    position: 'absolute',
    top: 36,
    left: 16,
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 8,
    ...shadows.card,
    zIndex: 10,
  },
}); 