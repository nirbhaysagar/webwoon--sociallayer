import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, FlatList, ActivityIndicator, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import HeaderWithMenu from '../SellerDashboard/components/HeaderWithMenu';
import PostCommentsModal from '../SellerDashboard/components/PostCommentsModal';
import SharePostModal from '../SellerDashboard/components/SharePostModal';
import { scale, verticalScale, moderateScale } from '../../lib/scale';

// Mock data for user-specific content
const mockFeedItems = [
  // ... (mock data remains the same)
];

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const ActionButton = ({ onPress, iconName, label, isLiked }) => {
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleValue, { toValue: 0.9, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
  };
  
  return (
    <AnimatedTouchableOpacity 
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.actionButton, { transform: [{ scale: scaleValue }] }]}
    >
      <Ionicons
        name={iconName}
        size={20}
        color={isLiked ? '#FF6B6B' : '#64748B'}
      />
      <Text style={styles.actionText}>{label}</Text>
    </AnimatedTouchableOpacity>
  );
};

export default function UserHomeScreen() {
  const { profile } = useAuth();
  const navigation = useNavigation();
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setFeedItems(mockFeedItems);
      setLoading(false);
    }, 1200);
  }, []);

  // ... (handler functions remain the same: handleLike, handleSave, etc.)

  const renderFeedItem = ({ item }) => (
    <View style={styles.feedCard}>
      {/* ... (rest of the renderFeedItem remains the same) */}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithMenu />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Hello, {profile?.first_name || 'Guest'}</Text>
          <Text style={styles.subtitleText}>Discover amazing products</Text>
          
          <TouchableOpacity 
            style={styles.searchBar}
            onPress={() => navigation.navigate('UserSearchScreen')}
          >
            <Ionicons name="search" size={20} color="#64748B" />
            <Text style={styles.searchPlaceholder}>Search for products...</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#4A90E2" />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Ionicons name="alert-circle-outline" size={scale(48)} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={feedItems}
            renderItem={renderFeedItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        )}
      </ScrollView>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    paddingHorizontal: moderateScale(16),
  },
  header: {
    paddingVertical: verticalScale(24),
  },
  welcomeText: {
    fontSize: scale(24),
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: verticalScale(4),
  },
  subtitleText: {
    fontSize: scale(16),
    color: '#475569',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchPlaceholder: {
    marginLeft: 10,
    fontSize: scale(16),
    color: '#9CA3AF',
  },
  feedCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: verticalScale(20),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  // ... (rest of the styles remain largely the same, but colors would be updated)
  storeName: {
    fontWeight: '600',
    color: '#1F2937',
    fontSize: scale(16),
  },
  postTime: {
    color: '#6B7280',
    fontSize: scale(12),
  },
  feedTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  feedPrice: {
    fontSize: scale(15),
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: verticalScale(12),
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(60),
  },
  errorText: {
    color: '#DC2626',
    fontSize: scale(16),
    marginTop: verticalScale(12),
    textAlign: 'center',
  },
});
