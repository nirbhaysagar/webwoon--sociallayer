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
  host?: {
    full_name: string;
    avatar_url: string;
  };
}

export default function LiveRoomsScreen() {
  const navigation = useNavigation();
  const [liveRooms, setLiveRooms] = useState<LiveRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    loadLiveRooms();
  }, []);

  const loadLiveRooms = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // If user is not authenticated, use mock data for demonstration
      if (!user) {
        console.log('User not authenticated, using mock data');
        const mockRooms = [
          {
            id: '1',
            title: 'Live Shopping Event',
            description: 'Join us for an amazing live shopping experience with exclusive deals!',
            status: 'live' as const,
            host_id: 'mock-host-1',
            viewer_count: 1250,
            max_viewers: 2000,
            scheduled_at: new Date().toISOString(),
            started_at: new Date(Date.now() - 300000).toISOString(),
            thumbnail_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=400&q=80',
            stream_url: 'https://example.com/stream1',
            is_private: false,
            host: {
              full_name: 'Sarah Johnson',
              avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=100&q=80'
            }
          },
          {
            id: '2',
            title: 'Tech Product Launch',
            description: 'Exclusive first look at our latest tech products with special pricing!',
            status: 'scheduled' as const,
            host_id: 'mock-host-2',
            viewer_count: 0,
            max_viewers: 1500,
            scheduled_at: new Date(Date.now() + 3600000).toISOString(),
            thumbnail_url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=400&q=80',
            stream_url: null,
            is_private: false,
            host: {
              full_name: 'Mike Chen',
              avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80'
            }
          },
          {
            id: '3',
            title: 'Fashion Show Live',
            description: 'Watch our latest fashion collection live with instant purchase options!',
            status: 'ended' as const,
            host_id: 'mock-host-3',
            viewer_count: 850,
            max_viewers: 1000,
            scheduled_at: new Date(Date.now() - 7200000).toISOString(),
            started_at: new Date(Date.now() - 7200000).toISOString(),
            thumbnail_url: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?auto=format&fit=crop&w=400&q=80',
            stream_url: null,
            is_private: false,
            host: {
              full_name: 'Emma Davis',
              avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80'
            }
          }
        ];
        setLiveRooms(mockRooms);
        return;
      }

      // Fetch live rooms from Supabase
      const { data: roomsData, error } = await supabase
        .from('live_rooms')
        .select(`
          *,
          host:users(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error('Failed to load live rooms');
      }

      setLiveRooms(roomsData || []);
    } catch (error) {
      console.error('Error loading live rooms:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load live rooms',
        text2: error.message
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLiveRooms();
    setRefreshing(false);
  }, [loadLiveRooms]);

  const handleJoinRoom = (room: LiveRoom) => {
    if (room.status === 'live') {
      navigation.navigate('LiveRoomViewer', { roomId: room.id });
    } else if (room.status === 'scheduled') {
      Alert.alert(
        'Scheduled Room',
        `This room is scheduled for ${formatDate(room.scheduled_at)}. Would you like to set a reminder?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Set Reminder', onPress: () => {
            Toast.show({
              type: 'success',
              text1: 'Reminder set',
              text2: 'You\'ll be notified when this room goes live'
            });
          }}
        ]
      );
    } else {
      Toast.show({
        type: 'info',
        text1: 'Room ended',
        text2: 'This live room has already ended'
      });
    }
  };

  const handleCreateRoom = () => {
    navigation.navigate('CreateLiveRoom');
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
    <TouchableOpacity
      style={styles.roomCard}
      onPress={() => handleJoinRoom(item)}
      activeOpacity={0.7}
    >
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

        <View style={styles.roomFooter}>
          <View style={styles.hostInfo}>
            <Image 
              source={{ uri: item.host?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80' }} 
              style={styles.hostAvatar}
            />
            <Text style={styles.hostName}>
              {item.host?.full_name || 'Unknown Host'}
            </Text>
          </View>

          {item.status === 'scheduled' && (
            <Text style={styles.scheduledTime}>
              {formatDate(item.scheduled_at)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {['all', 'live', 'scheduled', 'ended'].map((filter) => (
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
      <Ionicons name="radio-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No live rooms available</Text>
      <Text style={styles.emptySubtitle}>
        {selectedFilter === 'live' 
          ? 'No rooms are currently live. Check back later!' 
          : 'No rooms match your current filter.'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backButton} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Live Rooms</Text>
          <Text style={styles.subtitle}>
            Join live shopping experiences
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
          <Text style={styles.loadingText}>Loading live rooms...</Text>
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
    padding: spacing.m,
  },
  roomCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    marginBottom: spacing.s,
    overflow: 'hidden',
    ...shadows.card,
  },
  roomImageContainer: {
    position: 'relative',
    height: 200,
  },
  roomImage: {
    width: '100%',
    height: '100%',
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
    borderRadius: radii.circle,
    backgroundColor: colors.white,
    marginRight: spacing.xs,
  },
  liveText: {
    fontSize: scale(10),
    fontWeight: 'bold',
    color: colors.white,
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
    fontSize: scale(12),
    color: colors.white,
    marginLeft: spacing.xs,
  },
  roomInfo: {
    padding: spacing.m,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.s,
  },
  roomTitle: {
    fontSize: scale(16),
    fontWeight: '600',
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
    fontSize: scale(10),
    color: colors.white,
    fontWeight: '600',
    marginLeft: spacing.xxs,
  },
  roomDescription: {
    fontSize: scale(14),
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.s,
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostAvatar: {
    width: 24,
    height: 24,
    borderRadius: radii.circle,
    marginRight: spacing.xs,
  },
  hostName: {
    fontSize: scale(12),
    color: colors.textSecondary,
  },
  scheduledTime: {
    fontSize: scale(12),
    color: colors.primary,
    fontWeight: '500',
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
  },
}); 