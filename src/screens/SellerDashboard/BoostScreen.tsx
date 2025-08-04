import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ScrollView, TextInput, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows, icon, button } from '../../constants/theme';
import HeaderWithMenu from './components/HeaderWithMenu';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { scale, verticalScale, moderateScale } from '../../lib/scale';

const TABS = [
  { id: 'posts', label: 'Boost Posts', count: 0 },
  { id: 'products', label: 'Boost Products', count: 0 },
  { id: 'campaigns', label: 'Campaigns', count: 0 },
  { id: 'analytics', label: 'Analytics', count: 0 }
];

const BOOST_GOALS = [
  { id: 'reach', label: 'Reach', icon: 'people-outline', description: 'Increase visibility' },
  { id: 'engagement', label: 'Engagement', icon: 'heart-outline', description: 'Boost interactions' },
  { id: 'conversions', label: 'Conversions', icon: 'cart-outline', description: 'Drive sales' },
  { id: 'traffic', label: 'Traffic', icon: 'link-outline', description: 'Increase website visits' }
];

const AUDIENCE_TYPES = [
  { id: 'all', label: 'All Followers', count: '2.5K' },
  { id: 'engaged', label: 'Engaged Users', count: '1.2K' },
  { id: 'custom', label: 'Custom Audience', count: '500' },
  { id: 'lookalike', label: 'Lookalike', count: '5K' }
];

const mockBoostables = [
  {
    id: '1',
    title: 'Summer Collection Reel',
    description: 'Showcasing our latest summer collection with trending styles.',
    type: 'post',
    media: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80'],
    metrics: { views: 1200, saves: 80, shares: 45, engagement: 12.5 },
    status: 'published',
    boosted: false,
    category: 'fashion',
    tags: ['summer', 'collection', 'trending']
  },
  {
    id: '2',
    title: 'Premium Handbag Collection',
    description: 'Luxury handbags crafted with premium materials.',
    type: 'product',
    media: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80'],
    metrics: { views: 800, saves: 45, shares: 23, engagement: 8.2 },
    status: 'active',
    boosted: false,
    category: 'accessories',
    tags: ['luxury', 'handbag', 'premium']
  },
  {
    id: '3',
    title: 'Jacket Drop Image',
    description: 'Limited edition jacket collection now available.',
    type: 'post',
    media: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80'],
    metrics: { views: 500, saves: 30, shares: 12, engagement: 8.2 },
    status: 'published',
    boosted: false,
    category: 'outerwear',
    tags: ['jacket', 'limited-edition', 'premium']
  },
  {
    id: '4',
    title: 'Signature Sneakers',
    description: 'Comfortable and stylish sneakers for everyday wear.',
    type: 'product',
    media: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80'],
    metrics: { views: 650, saves: 38, shares: 18, engagement: 9.1 },
    status: 'active',
    boosted: false,
    category: 'footwear',
    tags: ['sneakers', 'comfort', 'style']
  }
];

const mockCampaigns = [
  {
    id: '1',
    title: 'Summer Collection Reel',
    type: 'post',
    goal: 'reach',
    budget: 50,
    spent: 35,
    status: 'active',
    duration: '7 days',
    startDate: '2024-01-15',
    endDate: '2024-01-22',
    media: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80'],
    analytics: {
      reach: 1200,
      impressions: 3500,
      clicks: 156,
      conversions: 23,
      ctr: 4.5,
      cpc: 0.22,
      roi: 2.1,
      engagement: 12.5
    },
    audience: 'all',
    targeting: {
      age: '18-35',
      gender: 'all',
      interests: ['fashion', 'lifestyle'],
      location: 'United States'
    }
  },
  {
    id: '2',
    title: 'Premium Handbag Collection',
    type: 'product',
    goal: 'conversions',
    budget: 30,
    spent: 28,
    status: 'paused',
    duration: '14 days',
    startDate: '2024-01-10',
    endDate: '2024-01-24',
    media: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80'],
    analytics: {
      reach: 400,
      impressions: 1200,
      clicks: 89,
      conversions: 12,
      ctr: 7.4,
      cpc: 0.31,
      roi: 1.3,
      engagement: 8.2
    },
    audience: 'engaged',
    targeting: {
      age: '25-45',
      gender: 'female',
      interests: ['luxury', 'fashion'],
      location: 'United States'
    }
  },
  {
    id: '3',
    title: 'Jacket Drop Image',
    type: 'post',
    goal: 'engagement',
    budget: 25,
    spent: 15,
    status: 'active',
    duration: '5 days',
    startDate: '2024-01-18',
    endDate: '2024-01-23',
    media: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80'],
    analytics: {
      reach: 800,
      impressions: 2200,
      clicks: 134,
      conversions: 18,
      ctr: 6.1,
      cpc: 0.18,
      roi: 1.8,
      engagement: 10.2
    },
    audience: 'custom',
    targeting: {
      age: '18-40',
      gender: 'all',
      interests: ['fashion', 'outerwear'],
      location: 'United States'
    }
  }
];

export default function BoostScreen() {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('posts');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    goal: 'all',
    budget: 'all'
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filter and search boostables
  const filteredBoostables = mockBoostables.filter(item => {
    const matchesTab = selectedTab === 'posts' ? item.type === 'post' : item.type === 'product';
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                         item.description.toLowerCase().includes(search.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = filters.category === 'all' || item.category === filters.category;
    const matchesStatus = filters.status === 'all' || item.status === filters.status;
    
    return matchesTab && matchesSearch && matchesCategory && matchesStatus;
  });

  // Filter campaigns
  const filteredCampaigns = mockCampaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(search.toLowerCase());
    const matchesGoal = filters.goal === 'all' || campaign.goal === filters.goal;
    const matchesStatus = filters.status === 'all' || campaign.status === filters.status;
    
    return matchesSearch && matchesGoal && matchesStatus;
  });

  // Update tab counts
  useEffect(() => {
    TABS.forEach(tab => {
      if (tab.id === 'posts') {
        tab.count = mockBoostables.filter(item => item.type === 'post').length;
      } else if (tab.id === 'products') {
        tab.count = mockBoostables.filter(item => item.type === 'product').length;
      } else if (tab.id === 'campaigns') {
        tab.count = mockCampaigns.length;
      }
    });
  }, [mockBoostables, mockCampaigns]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setRefreshing(false);
    }
  };

  const handleBoost = (item) => {
    Alert.alert(
      'Boost Item',
      `Would you like to boost "${item.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Boost', onPress: () => {
          Toast.show({ type: 'success', text1: `Boosted ${item.title}` });
        }}
      ]
    );
  };

  const handleCampaignAction = (campaign, action) => {
    const actionText = {
      pause: 'paused',
      resume: 'resumed',
      edit: 'edited',
      duplicate: 'duplicated'
    }[action];
    
    Toast.show({ type: 'success', text1: `Campaign ${actionText}` });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return colors.success;
      case 'paused': return colors.warning;
      case 'completed': return colors.textSecondary;
      case 'draft': return colors.disabled;
      default: return colors.textSecondary;
    }
  };

  const renderBoostableCard = ({ item }) => (
    <View style={styles.boostableCard}>
      <Image source={{ uri: item.media[0] }} style={styles.boostableImg} />
      <View style={styles.boostableInfo}>
        <Text style={styles.boostableTitle}>{item.title}</Text>
        <Text style={styles.boostableDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Ionicons name="eye-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metricText}>{formatNumber(item.metrics.views)}</Text>
          </View>
          <View style={styles.metricItem}>
            <Ionicons name="heart-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metricText}>{formatNumber(item.metrics.saves)}</Text>
          </View>
          <View style={styles.metricItem}>
            <Ionicons name="trending-up-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metricText}>{item.metrics.engagement}%</Text>
          </View>
        </View>
        
        <View style={styles.tagsRow}>
          {item.tags.slice(0, 2).map((tag, index) => (
            <Text key={index} style={styles.tagText}>#{tag}</Text>
          ))}
          {item.tags.length > 2 && (
            <Text style={styles.moreTagsText}>+{item.tags.length - 2}</Text>
          )}
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.boostBtn} 
        onPress={() => handleBoost(item)}
      >
        <Ionicons name="rocket-outline" size={18} color="#fff" />
        <Text style={styles.boostBtnText}>Boost</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCampaignCard = ({ item }) => (
    <View style={styles.campaignCard}>
      <Image source={{ uri: item.media[0] }} style={styles.campaignImg} />
      
      <View style={styles.campaignInfo}>
        <View style={styles.campaignHeader}>
          <Text style={styles.campaignTitle}>{item.title}</Text>
          <Text style={[styles.campaignStatus, { backgroundColor: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
        
        <View style={styles.campaignMeta}>
          <Text style={styles.campaignMetaText}>
            Goal: {BOOST_GOALS.find(g => g.id === item.goal)?.label} | Budget: {formatCurrency(item.budget)}
          </Text>
          <Text style={styles.campaignMetaText}>
            Duration: {item.duration} | Spent: {formatCurrency(item.spent)}
          </Text>
        </View>
        
        <View style={styles.analyticsRow}>
          <View style={styles.analyticsItem}>
            <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.analyticsText}>Reach: {formatNumber(item.analytics.reach)}</Text>
          </View>
          <View style={styles.analyticsItem}>
            <Ionicons name="trending-up-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.analyticsText}>ROI: {item.analytics.roi}x</Text>
          </View>
          <View style={styles.analyticsItem}>
            <Ionicons name="cart-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.analyticsText}>Conv: {item.analytics.conversions}</Text>
          </View>
        </View>
        
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(item.spent / item.budget) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {formatCurrency(item.spent)} of {formatCurrency(item.budget)} spent
        </Text>
      </View>
      
      <View style={styles.campaignActions}>
        <TouchableOpacity 
          style={styles.campaignAction} 
          onPress={() => handleCampaignAction(item, item.status === 'active' ? 'pause' : 'resume')}
        >
          <Ionicons 
            name={item.status === 'active' ? 'pause-outline' : 'play-outline'} 
            size={18} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.campaignAction} 
          onPress={() => handleCampaignAction(item, 'edit')}
        >
          <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.campaignAction} 
          onPress={() => handleCampaignAction(item, 'duplicate')}
        >
          <Ionicons name="copy-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAnalyticsCard = () => (
    <View style={styles.analyticsCard}>
      <Text style={styles.analyticsTitle}>Campaign Performance</Text>
      
      <View style={styles.analyticsGrid}>
        <View style={styles.analyticsItem}>
          <Text style={styles.analyticsValue}>$1,250</Text>
          <Text style={styles.analyticsLabel}>Total Spent</Text>
        </View>
        <View style={styles.analyticsItem}>
          <Text style={styles.analyticsValue}>2.4K</Text>
          <Text style={styles.analyticsLabel}>Total Reach</Text>
        </View>
        <View style={styles.analyticsItem}>
          <Text style={styles.analyticsValue}>156</Text>
          <Text style={styles.analyticsLabel}>Conversions</Text>
        </View>
        <View style={styles.analyticsItem}>
          <Text style={styles.analyticsValue}>1.8x</Text>
          <Text style={styles.analyticsLabel}>Avg ROI</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.viewAllBtn}>
        <Text style={styles.viewAllText}>View Detailed Analytics</Text>
        <Ionicons name="arrow-forward" size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <HeaderWithMenu />
      
      {/* Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.tabsRow} 
        contentContainerStyle={styles.tabsContent}
      >
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, selectedTab === tab.id && styles.tabActive]}
            onPress={() => setSelectedTab(tab.id)}
          >
            <Text style={[styles.tabText, selectedTab === tab.id && styles.tabTextActive]}>
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={[styles.tabCount, selectedTab === tab.id && styles.tabCountActive]}>
                <Text style={[styles.tabCountText, selectedTab === tab.id && styles.tabCountTextActive]}>
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Search and Filters */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search boostable items..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.clearSearchBtn}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.filterBtn, showFilters && styles.filterBtnActive]} 
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={18} color={showFilters ? colors.background : colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {selectedTab === 'posts' && (
          <>
            <Text style={styles.sectionTitle}>Boostable Posts</Text>
            <FlatList
              data={filteredBoostables}
              keyExtractor={item => item.id}
              renderItem={renderBoostableCard}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.boostableList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="rocket-outline" size={48} color={colors.textSecondary} />
                  <Text style={styles.emptyTitle}>No posts to boost</Text>
                  <Text style={styles.emptyText}>Create some posts first to boost them</Text>
                </View>
              }
            />
          </>
        )}
        
        {selectedTab === 'products' && (
          <>
            <Text style={styles.sectionTitle}>Boostable Products</Text>
            <FlatList
              data={filteredBoostables}
              keyExtractor={item => item.id}
              renderItem={renderBoostableCard}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.boostableList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="cube-outline" size={48} color={colors.textSecondary} />
                  <Text style={styles.emptyTitle}>No products to boost</Text>
                  <Text style={styles.emptyText}>Add some products first to boost them</Text>
                </View>
              }
            />
          </>
        )}
        
        {selectedTab === 'campaigns' && (
          <>
            <Text style={styles.sectionTitle}>Active Campaigns</Text>
            <FlatList
              data={filteredCampaigns}
              keyExtractor={item => item.id}
              renderItem={renderCampaignCard}
              contentContainerStyle={styles.campaignList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="trending-up-outline" size={48} color={colors.textSecondary} />
                  <Text style={styles.emptyTitle}>No active campaigns</Text>
                  <Text style={styles.emptyText}>Start boosting your content to see campaigns here</Text>
                </View>
              }
            />
          </>
        )}
        
        {selectedTab === 'analytics' && (
          <>
            {renderAnalyticsCard()}
            <Text style={styles.sectionTitle}>Recent Performance</Text>
            <FlatList
              data={filteredCampaigns}
              keyExtractor={item => item.id}
              renderItem={renderCampaignCard}
              contentContainerStyle={styles.campaignList}
            />
          </>
        )}
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('CreateCampaign')}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
      
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.m,
    marginTop: spacing.m,
    marginBottom: 2,
  },
  tabsContent: {
    alignItems: 'center',
    height: 40,
  },
  tab: {
    height: 32,
    minWidth: 56,
    paddingVertical: 0,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  tabActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  tabText: {
    fontSize: scale(13),
    fontWeight: '500',
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  tabCount: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 4,
  },
  tabCountText: {
    color: '#fff',
    fontSize: scale(11),
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  tabCountActive: {
    backgroundColor: colors.primaryDark,
  },
  tabCountTextActive: {
    color: '#fff',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    marginBottom: spacing.s,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    paddingHorizontal: spacing.s,
    flex: 1,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
    paddingVertical: 6,
    backgroundColor: 'transparent',
  },
  clearSearchBtn: {
    padding: 4,
  },
  filterBtn: {
    padding: 8,
    marginLeft: 8,
    borderRadius: radii.pill,
  },
  filterBtnActive: {
    backgroundColor: colors.primary,
  },
  content: {
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: scale(18),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginLeft: spacing.m,
    marginBottom: spacing.s,
    marginTop: spacing.l,
  },
  boostableList: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.s,
  },
  boostableCard: {
    width: scale(200),
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginRight: spacing.s,
    ...shadows.card,
  },
  boostableImg: {
    width: 100,
    height: 100,
    borderRadius: radii.medium,
    marginBottom: spacing.s,
    alignSelf: 'center',
  },
  boostableInfo: {
    flex: 1,
  },
  boostableTitle: {
    fontSize: scale(15),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  boostableDescription: {
    fontSize: scale(13),
    color: colors.textSecondary,
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.s,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    fontSize: scale(12),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.textSecondary,
    marginLeft: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: spacing.s,
  },
  tagText: {
    fontSize: scale(11),
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  moreTagsText: {
    fontSize: scale(11),
    color: colors.textSecondary,
    marginLeft: 4,
  },
  boostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: 8,
    paddingHorizontal: 16,
    ...shadows.card,
  },
  boostBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: scale(14),
    fontFamily: 'monospace',
    marginLeft: 6,
  },
  campaignList: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.s,
  },
  campaignCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  campaignImg: {
    width: 60,
    height: 60,
    borderRadius: radii.medium,
    marginRight: spacing.m,
  },
  campaignInfo: {
    flex: 1,
  },
  campaignHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  campaignTitle: {
    fontSize: scale(16),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    flex: 1,
  },
  campaignStatus: {
    fontSize: scale(11),
    fontWeight: '700',
    fontFamily: 'monospace',
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    color: '#fff',
  },
  campaignMeta: {
    marginBottom: spacing.s,
  },
  campaignMetaText: {
    fontSize: scale(12),
    color: colors.textSecondary,
    marginBottom: 2,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  analyticsItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analyticsText: {
    fontSize: scale(12),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.textSecondary,
    marginLeft: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: scale(11),
    color: colors.textSecondary,
    textAlign: 'right',
  },
  campaignActions: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: spacing.s,
  },
  campaignAction: {
    padding: 6,
    marginBottom: 4,
    borderRadius: radii.pill,
  },
  analyticsCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginHorizontal: spacing.m,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  analyticsTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.m,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
  },
  analyticsItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  analyticsValue: {
    fontSize: scale(24),
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: scale(12),
    color: colors.textSecondary,
    textAlign: 'center',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.s,
  },
  viewAllText: {
    color: colors.primary,
    fontWeight: 'bold',
    marginRight: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    fontSize: scale(20),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginTop: spacing.s,
  },
  emptyText: {
    fontSize: scale(14),
    color: colors.textSecondary,
    marginTop: spacing.s,
    textAlign: 'center',
    paddingHorizontal: spacing.m,
  },
  fab: {
    position: 'absolute',
    right: spacing.l,
    bottom: spacing.l,
    backgroundColor: colors.primary,
    borderRadius: 32,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.floating,
  },
}); 