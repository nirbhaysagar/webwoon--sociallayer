import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, FlatList, Image, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows, icon } from '../../constants/theme';
import HeaderWithMenu from './components/HeaderWithMenu';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useApp } from '../../context/AppContext';
import { usePostsSync } from '../../hooks/useDataSync';
import PostCommentsModal from './components/PostCommentsModal';
import SharePostModal from './components/SharePostModal';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import BackButton from '../../components/BackButton';

const TABS = [
  { id: 'all', label: 'All', count: 0 },
  { id: 'published', label: 'Published', count: 0 },
  { id: 'draft', label: 'Draft', count: 0 },
  { id: 'scheduled', label: 'Scheduled', count: 0 },
  { id: 'archived', label: 'Archived', count: 0 }
];

const SORT_OPTIONS = [
  { id: 'recent', label: 'Most Recent' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'popular', label: 'Most Popular' },
  { id: 'engagement', label: 'Highest Engagement' },
  { id: 'scheduled', label: 'Scheduled Date' }
];

export default function PostsScreen() {
  const navigation = useNavigation();
  const { state, loadPosts, createAnalyticsNotification } = useApp();
  const { data: posts, isLoading, isRealtimeConnected, lastSyncTime, refresh } = usePostsSync({
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    onDataChange: (data) => {
      console.log('Posts data updated:', data.length, 'items');
    },
    onError: (error) => {
      Toast.show({ type: 'error', text1: 'Failed to load posts', text2: error.message });
    }
  });

  // State management
  const [selectedTab, setSelectedTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    dateRange: 'all',
    boosted: 'all',
    engagement: 'all'
  });
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Update tab counts
  const [tabCounts, setTabCounts] = useState({
    all: 0,
    published: 0,
    draft: 0,
    scheduled: 0,
    archived: 0
  });

  useEffect(() => {
    const counts = {
      all: posts.length,
      published: posts.filter(post => post.status === 'published').length,
      draft: posts.filter(post => post.status === 'draft').length,
      scheduled: posts.filter(post => post.status === 'scheduled').length,
      archived: posts.filter(post => post.status === 'archived').length
    };
    setTabCounts(counts);
  }, [posts]);

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const handlePostMilestoneNotification = async () => {
    try {
      await createAnalyticsNotification('Post Engagement', 1000, 'week');
      console.log('Post milestone notification created!');
    } catch (error) {
      console.error('Error creating post notification:', error);
    }
  };

  // Filter and sort posts
  const filteredPosts = posts.filter(post => {
    const matchesTab = selectedTab === 'all' || post.status === selectedTab;
    const matchesSearch = post.title?.toLowerCase().includes(search.toLowerCase()) ||
                         post.content?.toLowerCase().includes(search.toLowerCase()) ||
                         post.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = filters.category === 'all' || post.category === filters.category;
    const matchesBoosted = filters.boosted === 'all' ||
                          (filters.boosted === 'boosted' && post.boosted) ||
                          (filters.boosted === 'not-boosted' && !post.boosted);

    return matchesTab && matchesSearch && matchesCategory && matchesBoosted;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'popular':
        return (b.engagement_metrics?.views || 0) - (a.engagement_metrics?.views || 0);
      case 'engagement':
        return (b.engagement_metrics?.engagement_rate || 0) - (a.engagement_metrics?.engagement_rate || 0);
      case 'scheduled':
        if (a.scheduled_at && b.scheduled_at) {
          return new Date(a.scheduled_at) - new Date(b.scheduled_at);
        }
        return 0;
      default:
        return 0;
    }
  });

  // Calculate filtered posts count for debugging
  const filteredPostsCount = filteredPosts.length;
  const totalPostsCount = posts.length;

  // Handlers
  const toggleSelect = (id) => {
    setSelectedPosts((prev) =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action) => {
    setLoading(true);
    try {
      await new Promise(res => setTimeout(res, 1000));
      const actionText = {
        delete: 'deleted',
        archive: 'archived',
        boost: 'boosted',
        schedule: 'scheduled',
        pin: 'pinned',
        feature: 'featured'
      }[action];

      Toast.show({
        type: 'success',
        text1: `Posts ${actionText}: ${selectedPosts.length} items`
      });
      setSelectedPosts([]);
      setMultiSelect(false);
    } catch (e) {
      Toast.show({ type: 'error', text1: `Failed to ${action} posts` });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return colors.success;
      case 'draft': return colors.disabled;
      case 'scheduled': return colors.secondary;
      case 'archived': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  const handleCommentPress = (post) => {
    setSelectedPost(post);
    setShowComments(true);
  };

  const handleSharePress = (post) => {
    setSelectedPost(post);
    setShowShare(true);
  };

  const handleDeletePost = async (postId) => {
    try {
      // Show confirmation dialog
      Alert.alert(
        'Delete Post',
        'Are you sure you want to delete this post? This action cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                // In a real app, you would call deletePost from AppContext
                // For now, we'll just show a success message
                console.log('Deleting post:', postId);
                
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 500));
                
                Toast.show({ 
                  type: 'success', 
                  text1: 'Post deleted successfully!' 
                });
                
                // Refresh the posts list
                await refresh();
              } catch (error) {
                console.error('Error deleting post:', error);
                Toast.show({ 
                  type: 'error', 
                  text1: 'Failed to delete post', 
                  text2: error.message 
                });
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error in delete confirmation:', error);
      Toast.show({ 
        type: 'error', 
        text1: 'Failed to delete post', 
        text2: error.message 
      });
    }
  };

  const handlePublishPost = async (postId) => {
    try {
      // Find the post and update its status
      const postIndex = posts.findIndex(p => p.id === postId);
      if (postIndex !== -1) {
        const updatedPosts = [...posts];
        updatedPosts[postIndex] = {
          ...updatedPosts[postIndex],
          status: 'published',
          is_published: true,
          updated_at: new Date().toISOString()
        };
        
        // Update the posts in the context
        // In a real app, you would call updatePost from AppContext
        console.log('Publishing post:', postId);
        Toast.show({ type: 'success', text1: 'Post published successfully!' });
        
        // Force a refresh to show the updated status
        refresh();
      }
    } catch (error) {
      console.error('Error publishing post:', error);
      Toast.show({ type: 'error', text1: 'Failed to publish post', text2: error.message });
    }
  };

  const renderPostCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => !multiSelect && navigation.navigate('PostDetail', { postId: item.id })}
      style={[styles.postCard, multiSelect && styles.postCardSelectable]}
      activeOpacity={multiSelect ? 1 : 0.7}
    >
      {multiSelect && (
        <TouchableOpacity onPress={() => toggleSelect(item.id)} style={styles.checkboxWrap}>
          <Ionicons
            name={selectedPosts.includes(item.id) ? 'checkbox' : 'square-outline'}
            size={20}
            color={colors.primary}
          />
        </TouchableOpacity>
      )}

      <Image
        source={{ uri: item.media_urls?.[0] || 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80' }}
        style={styles.postImg}
      />

      <View style={styles.postInfo}>
        <View style={styles.postHeader}>
          <Text style={styles.postTitle}>{item.title || 'Untitled Post'}</Text>
          {item.is_pinned && (
            <Ionicons name="pin" size={16} color={colors.primary} style={styles.pinIcon} />
          )}
          {item.is_featured && (
            <Ionicons name="star" size={16} color={colors.warning} style={styles.featuredIcon} />
          )}
        </View>

        <Text style={styles.postDescription} numberOfLines={2}>
          {item.content}
        </Text>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Ionicons name="eye-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metricText}>
              {formatNumber(item.engagement_metrics?.views || 0)}
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Ionicons name="heart-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metricText}>
              {formatNumber(item.engagement_metrics?.likes || 0)}
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Ionicons name="share-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metricText}>
              {formatNumber(item.engagement_metrics?.shares || 0)}
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Ionicons name="trending-up-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metricText}>
              {(item.engagement_metrics?.engagement_rate || 0).toFixed(1)}%
            </Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
          {item.boosted && <Text style={styles.boostBadge}>Boosted</Text>}
          {item.scheduled_at && (
            <Text style={styles.scheduledText}>
              {formatDate(item.scheduled_at)}
            </Text>
          )}
        </View>

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <Text key={index} style={styles.tagText}>#{tag}</Text>
            ))}
            {item.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{item.tags.length - 3}</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.actionsCol}>
        {/* Primary Actions */}
        <View style={styles.primaryActions}>
          {item.status === 'draft' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.publishBtn]}
              onPress={(e) => {
                e.stopPropagation();
                handlePublishPost(item.id);
              }}
            >
              <Ionicons name="send-outline" size={18} color={colors.white} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate('CreateEditPost', { postId: item.id });
            }}
          >
            <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Secondary Actions */}
        <View style={styles.secondaryActions}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={(e) => {
              e.stopPropagation();
              console.log('Duplicate button pressed');
            }}
          >
            <Ionicons name="duplicate-outline" size={18} color={colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={(e) => {
              e.stopPropagation();
              handleCommentPress(item);
            }}
          >
            <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={(e) => {
              e.stopPropagation();
              handleSharePress(item);
            }}
          >
            <Ionicons name="share-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={(e) => {
              e.stopPropagation();
              console.log('Boost button pressed');
            }}
          >
            <Ionicons name="rocket-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={(e) => {
              e.stopPropagation(); // Prevent parent TouchableOpacity from triggering
              console.log('Delete button pressed for post:', item.id);
              handleDeletePost(item.id);
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.discount} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Test function to add new posts (for testing filter functionality)
  const addTestPost = async (status = 'draft') => {
    const newPost = {
      id: `test-post-${Date.now()}`,
      store_id: 'mock-store-id',
      title: `Test Post - ${status}`,
      content: `This is a test ${status} post created at ${new Date().toLocaleTimeString()}`,
      media_urls: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80'],
      status: status,
      is_published: status === 'published',
      is_featured: false,
      scheduled_at: status === 'scheduled' ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null,
      published_at: status === 'published' ? new Date().toISOString() : null,
      engagement_metrics: { likes: 0, comments: 0, shares: 0, views: 0 },
      seo_data: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await loadPosts(newPost); // Assuming loadPosts is the correct function to add
      Toast.show({
        type: 'success',
        text1: `Test ${status} post added successfully!`,
        text2: 'Check the filter tabs to see the updated counts.'
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to add test post',
        text2: error.message
      });
    }
  };

  // Add multiple test posts for better testing
  const addMultipleTestPosts = async () => {
    const testPosts = [
      {
        id: `test-draft-${Date.now()}`,
        title: 'Draft Post - Summer Collection',
        content: 'This is a draft post about our new summer collection. Features trendy designs and comfortable fabrics.',
        status: 'draft',
        tags: ['summer', 'fashion', 'collection']
      },
      {
        id: `test-published-${Date.now()}`,
        title: 'Published Post - New Arrivals',
        content: 'Check out our latest arrivals! Fresh styles for every occasion.',
        status: 'published',
        tags: ['new', 'arrivals', 'fashion']
      },
      {
        id: `test-scheduled-${Date.now()}`,
        title: 'Scheduled Post - Weekend Sale',
        content: 'Big weekend sale coming up! Don\'t miss out on amazing deals.',
        status: 'scheduled',
        tags: ['sale', 'weekend', 'deals']
      }
    ];

    try {
      for (const post of testPosts) {
        const newPost = {
          ...post,
          store_id: 'mock-store-id',
          media_urls: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80'],
          is_published: post.status === 'published',
          is_featured: false,
          scheduled_at: post.status === 'scheduled' ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null,
          published_at: post.status === 'published' ? new Date().toISOString() : null,
          engagement_metrics: { likes: Math.floor(Math.random() * 100), comments: Math.floor(Math.random() * 50), shares: Math.floor(Math.random() * 30), views: Math.floor(Math.random() * 1000) },
          seo_data: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await loadPosts(newPost);
      }
      
      Toast.show({
        type: 'success',
        text1: 'Test posts added successfully!',
        text2: 'You now have draft, published, and scheduled posts to test with.'
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to add test posts',
        text2: error.message
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backButton} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Posts</Text>
          <Text style={styles.subtitle}>
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CreateEditPost')}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Sync Status */}
      <View style={styles.syncStatus}>
        <Ionicons
          name={isRealtimeConnected ? "wifi" : "wifi-outline"}
          size={16}
          color={isRealtimeConnected ? colors.success : colors.textSecondary}
        />
        <Text style={[styles.syncText, { color: isRealtimeConnected ? colors.success : colors.textSecondary }]}>
          {isRealtimeConnected ? 'Live Sync' : 'Offline'}
        </Text>
        {lastSyncTime && (
          <Text style={styles.lastSyncText}>
            Last sync: {new Date(lastSyncTime).toLocaleTimeString()}
          </Text>
        )}
      </View>

      {/* Bulk Actions Bar */}
      {multiSelect && (
        <View style={styles.bulkBar}>
          <Text style={styles.bulkText}>{selectedPosts.length} selected</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={styles.bulkBtn} onPress={() => handleBulkAction('delete')}>
              <Ionicons name="trash-outline" size={16} color={colors.discount} />
              <Text style={styles.bulkBtnText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bulkBtn} onPress={() => handleBulkAction('archive')}>
              <Ionicons name="archive-outline" size={16} color={colors.secondary} />
              <Text style={styles.bulkBtnText}>Archive</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bulkBtn} onPress={() => handleBulkAction('boost')}>
              <Ionicons name="rocket-outline" size={16} color={colors.primary} />
              <Text style={styles.bulkBtnText}>Boost</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bulkBtn} onPress={() => handleBulkAction('pin')}>
              <Ionicons name="pin-outline" size={16} color={colors.warning} />
              <Text style={styles.bulkBtnText}>Pin</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bulkBtn} onPress={() => handleBulkAction('feature')}>
              <Ionicons name="star-outline" size={16} color={colors.warning} />
              <Text style={styles.bulkBtnText}>Feature</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bulkBtn}
              onPress={() => { setMultiSelect(false); setSelectedPosts([]); }}
            >
              <Ionicons name="close" size={16} color={colors.textSecondary} />
              <Text style={styles.bulkBtnText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

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
            {tabCounts[tab.id] > 0 && (
              <View style={[styles.tabCount, selectedTab === tab.id && styles.tabCountActive]}>
                <Text style={[styles.tabCountText, selectedTab === tab.id && styles.tabCountTextActive]}>
                  {tabCounts[tab.id]}
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
            placeholder="Search posts, tags, or descriptions..."
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

        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => setShowSortMenu(!showSortMenu)}
        >
          <Ionicons name="swap-vertical" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.multiSelectBtn, multiSelect && styles.multiSelectBtnActive]}
          onPress={() => setMultiSelect(!multiSelect)}
        >
          <Ionicons
            name={multiSelect ? 'checkbox' : 'square-outline'}
            size={18}
            color={multiSelect ? colors.background : colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Test Button - Add this for testing */}
      <View style={styles.testButtonContainer}>
        <TouchableOpacity
          style={styles.testButton}
          onPress={addMultipleTestPosts}
        >
          <Ionicons name="add-circle" size={16} color={colors.white} />
          <Text style={styles.testButtonText}>Add Test Posts</Text>
        </TouchableOpacity>
      </View>

      {/* Sort Menu */}
      {showSortMenu && (
        <View style={styles.sortMenu}>
          {SORT_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[styles.sortOption, sortBy === option.id && styles.sortOptionActive]}
              onPress={() => { setSortBy(option.id); setShowSortMenu(false); }}
            >
              <Text style={[styles.sortOptionText, sortBy === option.id && styles.sortOptionTextActive]}>
                {option.label}
              </Text>
              {sortBy === option.id && (
                <Ionicons name="checkmark" size={16} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <FlatList
          data={filteredPosts}
          keyExtractor={item => item.id}
          renderItem={renderPostCard}
          contentContainerStyle={styles.postsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No posts found</Text>
              <Text style={styles.emptyText}>
                {search ? 'Try adjusting your search' : 'Create your first post to get started'}
              </Text>
            </View>
          }
        />
      </ScrollView>

      {/* Floating Action Button - always visible and above bottom nav */}
      <View pointerEvents="box-none" style={{ position: 'absolute', right: 24, bottom: 96, zIndex: 100 }}>
        <TouchableOpacity
          style={[styles.fab, { position: 'relative', right: 0, bottom: 0, zIndex: 101 }]}
          onPress={() => navigation.navigate('CreateEditPost')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Test Button - Remove in production */}
      <View style={styles.testSection}>
        <Text style={styles.testTitle}>Test Filter Functionality</Text>
        <View style={styles.testButtons}>
          <TouchableOpacity style={styles.testButton} onPress={() => addTestPost('draft')}>
            <Text style={styles.testButtonText}>Add Draft</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.testButton} onPress={() => addTestPost('published')}>
            <Text style={styles.testButtonText}>Add Published</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.testButton} onPress={() => addTestPost('scheduled')}>
            <Text style={styles.testButtonText}>Add Scheduled</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Toast />

      {/* Social Feature Modals */}
      <PostCommentsModal
        visible={showComments}
        onClose={() => setShowComments(false)}
        post={selectedPost}
      />
      
      <SharePostModal
        visible={showShare}
        onClose={() => setShowShare(false)}
        post={selectedPost}
      />
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('CreateEditPost')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
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
    fontSize: scale(20),
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: scale(14),
    color: colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    padding: 8,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    margin: spacing.m,
    ...shadows.card,
  },
  syncText: {
    fontSize: scale(13),
    fontWeight: '700',
    fontFamily: 'monospace',
    marginLeft: 4,
  },
  lastSyncText: {
    fontSize: scale(11),
    color: colors.textSecondary,
    marginLeft: 8,
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
    fontSize: scale(15),
    fontWeight: '400',
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
    fontWeight: 'bold',
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
    paddingHorizontal: 12,
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
  sortBtn: {
    padding: 8,
    marginLeft: 8,
    borderRadius: radii.pill,
  },
  multiSelectBtn: {
    padding: 8,
    marginLeft: 8,
    borderRadius: radii.pill,
  },
  multiSelectBtnActive: {
    backgroundColor: colors.primary,
  },
  sortMenu: {
    position: 'absolute',
    top: 50,
    left: spacing.m,
    right: spacing.m,
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    paddingVertical: spacing.s,
    ...shadows.card,
    zIndex: 10,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
  },
  sortOptionActive: {
    backgroundColor: colors.secondary,
    borderRadius: radii.pill,
  },
  sortOptionText: {
    fontSize: scale(15),
    color: colors.text,
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: '#fff',
  },
  content: {
    // Removed flexGrow to prevent unnecessary vertical stretching
    // Only add padding if needed
    paddingBottom: 8,
  },
  postsList: {
    paddingHorizontal: spacing.m,
    paddingBottom: 80,
  },
  postCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  postCardSelectable: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  checkboxWrap: {
    marginRight: 8,
  },
  postImg: {
    width: 64,
    height: 64,
    borderRadius: radii.medium,
    marginRight: spacing.m,
  },
  postInfo: {
    flex: 1,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  postTitle: {
    fontSize: scale(15),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    flex: 1,
  },
  pinIcon: {
    marginLeft: 4,
  },
  featuredIcon: {
    marginLeft: 4,
  },
  postDescription: {
    fontSize: scale(13),
    color: colors.textSecondary,
    marginBottom: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metricText: {
    fontSize: scale(13),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.textSecondary,
    marginLeft: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusBadge: {
    fontSize: scale(12),
    fontWeight: '700',
    fontFamily: 'monospace',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginRight: 8,
    overflow: 'hidden',
    color: '#fff',
  },
  boostBadge: {
    fontSize: scale(11),
    color: '#fff',
    backgroundColor: colors.secondary,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 4,
    overflow: 'hidden',
  },
  scheduledText: {
    fontSize: scale(11),
    color: colors.textSecondary,
    marginLeft: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
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
  actionsCol: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginLeft: spacing.s,
  },
  actionBtn: {
    padding: 4,
    marginBottom: 2,
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
  bulkBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.m,
    paddingVertical: 10,
    margin: spacing.m,
    ...shadows.card,
    zIndex: 10,
  },
  bulkText: {
    color: colors.text,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginRight: 12,
  },
  bulkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  bulkBtnText: {
    fontSize: scale(12),
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
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
  createFirstBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.l,
    marginTop: spacing.l,
    ...shadows.floating,
  },
  createFirstText: {
    color: colors.background,
    fontSize: scale(16),
    fontWeight: 'bold',
    marginLeft: 8,
  },
  testSection: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    margin: spacing.m,
    ...shadows.card,
  },
  testTitle: {
    fontSize: scale(14),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.s,
  },
  testButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  testButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.small,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
  },
  testButtonText: {
    fontSize: scale(12),
    fontWeight: '600',
    fontFamily: 'monospace',
    color: '#fff',
  },
  primaryActions: {
    flexDirection: 'row',
    marginBottom: spacing.s,
  },
  publishBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    marginRight: spacing.s,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  testButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.s,
    marginBottom: spacing.s,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    ...shadows.floating,
  },
  testButtonText: {
    color: colors.white,
    fontSize: scale(14),
    fontWeight: '600',
    fontFamily: 'monospace',
    marginLeft: spacing.xs,
  },
}); 