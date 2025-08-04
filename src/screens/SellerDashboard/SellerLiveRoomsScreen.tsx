import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  RefreshControl,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import { supabase } from '../../config/supabase';
import BackButton from '../../components/BackButton';

interface LiveRoom {
  id: string;
  title: string;
  description: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  host_id: string;
  viewer_count: number;
  max_viewers: number;
  scheduled_at: string;
  started_at?: string;
  thumbnail_url?: string;
  stream_url?: string;
  is_private: boolean;
  total_sales?: number;
  total_orders?: number;
}

export default function SellerLiveRoomsScreen() {
  const navigation = useNavigation();
  const [liveRooms, setLiveRooms] = useState<LiveRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    loadMyLiveRooms();
  }, []);

  const loadMyLiveRooms = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // If user is not authenticated, use mock data for demonstration
      if (!user) {
        console.log('User not authenticated, using mock seller data');
        const mockSellerRooms = [
          {
            id: 'seller-1',
            title: 'My First Live Room',
            description: 'This is my first live shopping experience!',
            status: 'scheduled' as const,
            host_id: 'mock-seller-id',
            viewer_count: 0,
            max_viewers: 1000,
            scheduled_at: new Date(Date.now() + 3600000).toISOString(),
            thumbnail_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=400&q=80',
            stream_url: null,
            is_private: false,
            total_sales: 0,
            total_orders: 0
          },
          {
            id: 'seller-2',
            title: 'Product Showcase Live',
            description: 'Showcasing our latest products with special offers!',
            status: 'live' as const,
            host_id: 'mock-seller-id',
            viewer_count: 450,
            max_viewers: 1000,
            scheduled_at: new Date().toISOString(),
            started_at: new Date(Date.now() - 1800000).toISOString(),
            thumbnail_url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=400&q=80',
            stream_url: 'https://example.com/stream-seller',
            is_private: false,
            total_sales: 1250.00,
            total_orders: 8
          },
          {
            id: 'seller-3',
            title: 'Weekly Sale Event',
            description: 'Weekly sale with amazing discounts on all products!',
            status: 'ended' as const,
            host_id: 'mock-seller-id',
            viewer_count: 320,
            max_viewers: 500,
            scheduled_at: new Date(Date.now() - 7200000).toISOString(),
            started_at: new Date(Date.now() - 7200000).toISOString(),
            thumbnail_url: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?auto=format&fit=crop&w=400&q=80',
            stream_url: null,
            is_private: false,
            total_sales: 890.50,
            total_orders: 12
          }
        ];
        setLiveRooms(mockSellerRooms);
        return;
      }

      // Fetch seller's live rooms from Supabase
      const { data: roomsData, error } = await supabase
        .from('live_rooms')
        .select('*')
        .eq('host_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error('Failed to load your live rooms');
      }

      setLiveRooms(roomsData || []);
    } catch (error) {
      console.error('Error loading live rooms:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load your live rooms',
        text2: error.message
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMyLiveRooms();
    setRefreshing(false);
  }, [loadMyLiveRooms]);

  const handleStartRoom = (room: LiveRoom) => {
    if (room.status === 'scheduled') {
      Alert.alert(
        'Start Live Room',
        `Are you sure you want to start "${room.title}" now?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Start', 
            onPress: () => startLiveRoom(room.id),
            style: 'default'
          }
        ]
      );
    } else if (room.status === 'live') {
      navigation.navigate('LiveRoomViewer', { roomId: room.id, isHost: true });
    }
  };

  const startLiveRoom = async (roomId: string) => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // For demo purposes, show success message even without authentication
        Toast.show({
          type: 'success',
          text1: 'Live room started!',
          text2: 'You can now begin streaming'
        });

        // Navigate to the live room viewer as host
        navigation.navigate('LiveRoomViewer', { roomId, isHost: true });
        return;
      }

      const { error } = await supabase
        .from('live_rooms')
        .update({ 
          status: 'live',
          started_at: new Date().toISOString()
        })
        .eq('id', roomId);

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Live room started!',
        text2: 'You can now begin streaming'
      });

      // Navigate to the live room viewer as host
      navigation.navigate('LiveRoomViewer', { roomId, isHost: true });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to start live room',
        text2: error.message
      });
    }
  };

  const handleCreateRoom = () => {
    navigation.navigate('CreateLiveRoom');
  };

  const handleEditRoom = (room: LiveRoom) => {
    if (room.status === 'live') {
      Alert.alert('Cannot Edit', 'Cannot edit a room that is currently live');
      return;
    }
    // Navigate to edit screen (you can reuse CreateLiveRoom with edit mode)
    navigation.navigate('CreateLiveRoom', { roomId: room.id, mode: 'edit' });
  };

  const handleDeleteRoom = (room: LiveRoom) => {
    if (room.status === 'live') {
      Alert.alert('Cannot Delete', 'Cannot delete a room that is currently live');
      return;
    }

    Alert.alert(
      'Delete Live Room',
      `Are you sure you want to delete "${room.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => deleteLiveRoom(room.id),
          style: 'destructive'
        }
      ]
    );
  };

  const deleteLiveRoom = async (roomId: string) => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // For demo purposes, show success message even without authentication
        Toast.show({
          type: 'success',
          text1: 'Live room deleted',
          text2: 'The room has been removed'
        });

        loadMyLiveRooms();
        return;
      }

      const { error } = await supabase
        .from('live_rooms')
        .delete()
        .eq('id', roomId);

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Live room deleted',
        text2: 'The room has been removed'
      });

      loadMyLiveRooms();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to delete live room',
        text2: error.message
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return colors.error;
      case 'scheduled':
        return colors.warning;
      case 'ended':
        return colors.textSecondary;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live':
        return 'radio-button-on';
      case 'scheduled':
        return 'time-outline';
      case 'ended':
        return 'checkmark-circle-outline';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatViewerCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const filteredRooms = selectedFilter === 'all' 
    ? liveRooms 
    : liveRooms.filter(room => room.status === selectedFilter);

  const renderLiveRoomItem = ({ item }: { item: LiveRoom }) => (
    <View style={styles.roomCard}>
      <View style={styles.roomImageContainer}>
        <Image 
          source={{ 
            uri: item.thumbnail_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=400&q=80' 
          }} 
          style={styles.roomImage}
        />
        {item.status === 'live' && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        <View style={styles.viewerCount}>
          <Ionicons name="eye-outline" size={16} color={colors.white} />
          <Text style={styles.viewerCountText}>{formatViewerCount(item.viewer_count)}</Text>
        </View>
      </View>

      <View style={styles.roomInfo}>
        <View style={styles.roomHeader}>
          <Text style={styles.roomTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Ionicons name={getStatusIcon(item.status) as any} size={12} color={colors.white} />
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <Text style={styles.roomDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.roomStats}>
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.statText}>{formatDate(item.scheduled_at)}</Text>
          </View>
          {item.total_sales && (
            <View style={styles.statItem}>
              <Ionicons name="cash-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.statText}>${item.total_sales}</Text>
            </View>
          )}
          {item.total_orders && (
            <View style={styles.statItem}>
              <Ionicons name="bag-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.statText}>{item.total_orders} orders</Text>
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          {item.status === 'scheduled' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.startButton]} 
              onPress={() => handleStartRoom(item)}
            >
              <Ionicons name="play" size={16} color={colors.white} />
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
          )}
          {item.status === 'live' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.joinButton]} 
              onPress={() => handleStartRoom(item)}
            >
              <Ionicons name="videocam" size={16} color={colors.white} />
              <Text style={styles.joinButtonText}>Join</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]} 
            onPress={() => handleEditRoom(item)}
          >
            <Ionicons name="create-outline" size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]} 
            onPress={() => handleDeleteRoom(item)}
          >
            <Ionicons name="trash-outline" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {['all', 'scheduled', 'live', 'ended'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedFilter === filter && styles.filterButtonTextActive
            ]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="videocam-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Live Rooms Yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first live room to start selling to your audience
      </Text>
      <TouchableOpacity style={styles.createFirstButton} onPress={handleCreateRoom}>
        <Ionicons name="add" size={20} color={colors.white} />
        <Text style={styles.createFirstButtonText}>Create Live Room</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backButton} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>My Live Rooms</Text>
          <Text style={styles.subtitle}>
            Manage your live shopping experiences
          </Text>
        </View>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateRoom}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      {renderFilterButtons()}

      {/* Live Rooms List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your live rooms...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRooms}
          renderItem={renderLiveRoomItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.roomsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  createButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: radii.circle,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  filterContainer: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
  },
  filterButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    marginRight: spacing.s,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: scale(12),
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: scale(16),
    color: colors.textSecondary,
  },
  roomsList: {
    padding: spacing.l,
  },
  roomCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    marginBottom: spacing.m,
    overflow: 'hidden',
    ...shadows.sm,
  },
  roomImageContainer: {
    position: 'relative',
    height: 200,
  },
  roomImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  liveIndicator: {
    position: 'absolute',
    top: spacing.s,
    left: spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
    marginRight: spacing.xs,
  },
  liveText: {
    color: colors.white,
    fontSize: scale(10),
    fontWeight: 'bold',
  },
  viewerCount: {
    position: 'absolute',
    top: spacing.s,
    right: spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  viewerCountText: {
    color: colors.white,
    fontSize: scale(12),
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  roomInfo: {
    padding: spacing.m,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  roomTitle: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: spacing.s,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  statusText: {
    color: colors.white,
    fontSize: scale(10),
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },
  roomDescription: {
    fontSize: scale(14),
    color: colors.textSecondary,
    marginBottom: spacing.s,
    lineHeight: 20,
  },
  roomStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  statText: {
    fontSize: scale(12),
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  startButton: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  startButtonText: {
    color: colors.white,
    fontSize: scale(12),
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  joinButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  joinButtonText: {
    color: colors.white,
    fontSize: scale(12),
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  editButton: {
    backgroundColor: 'transparent',
    borderColor: colors.primary,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderColor: colors.error,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  emptySubtitle: {
    fontSize: scale(14),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.l,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: radii.lg,
  },
  createFirstButtonText: {
    color: colors.white,
    fontSize: scale(14),
    fontWeight: '600',
    marginLeft: spacing.s,
  },
}); 