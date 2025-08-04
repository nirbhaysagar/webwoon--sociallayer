import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, ScrollView, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../../constants/theme';

const shareOptions = [
  {
    id: 'copy_link',
    title: 'Copy Link',
    icon: 'link-outline',
    color: colors.primary,
    action: 'copy',
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp',
    icon: 'logo-whatsapp',
    color: '#25D366',
    action: 'share',
  },
  {
    id: 'instagram',
    title: 'Instagram',
    icon: 'logo-instagram',
    color: '#E4405F',
    action: 'share',
  },
  {
    id: 'facebook',
    title: 'Facebook',
    icon: 'logo-facebook',
    color: '#1877F2',
    action: 'share',
  },
  {
    id: 'twitter',
    title: 'Twitter',
    icon: 'logo-twitter',
    color: '#1DA1F2',
    action: 'share',
  },
  {
    id: 'telegram',
    title: 'Telegram',
    icon: 'paper-plane-outline',
    color: '#0088CC',
    action: 'share',
  },
  {
    id: 'email',
    title: 'Email',
    icon: 'mail-outline',
    color: colors.textSecondary,
    action: 'share',
  },
  {
    id: 'sms',
    title: 'SMS',
    icon: 'chatbubble-outline',
    color: colors.success,
    action: 'share',
  },
];

const mockFollowers = [
  {
    id: 'user1',
    name: 'Sarah Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    username: '@sarahj',
  },
  {
    id: 'user2',
    name: 'Mike Chen',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    username: '@mikechen',
  },
  {
    id: 'user3',
    name: 'Emma Davis',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    username: '@emmadavis',
  },
  {
    id: 'user4',
    name: 'Alex Thompson',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    username: '@alexthompson',
  },
];

export default function SharePostModal({ visible, onClose, post }) {
  const [selectedFollowers, setSelectedFollowers] = useState([]);
  const [sharing, setSharing] = useState(false);

  const handleShare = async (option) => {
    if (option.action === 'copy') {
      try {
        const postUrl = `https://socialspark.ai/post/${post?.id || 'demo'}`;
        // In a real app, you'd use Clipboard API
        Alert.alert('Link Copied', 'Post link copied to clipboard!');
      } catch (error) {
        Alert.alert('Error', 'Failed to copy link');
      }
    } else {
      setSharing(true);
      try {
        const shareMessage = `Check out this amazing product: ${post?.title || 'Product Title'}\n\n${post?.description || 'Great product from SocialSpark!'}\n\nhttps://socialspark.ai/post/${post?.id || 'demo'}`;
        
        await Share.share({
          message: shareMessage,
          title: post?.title || 'Product from SocialSpark',
        });
      } catch (error) {
        console.error('Error sharing:', error);
      } finally {
        setSharing(false);
      }
    }
  };

  const handleDirectShare = async () => {
    if (selectedFollowers.length === 0) {
      Alert.alert('No Recipients', 'Please select at least one follower to share with.');
      return;
    }

    setSharing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Shared!', `Shared with ${selectedFollowers.length} followers`);
      setSelectedFollowers([]);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to share with followers');
    } finally {
      setSharing(false);
    }
  };

  const toggleFollower = (followerId) => {
    setSelectedFollowers(prev => 
      prev.includes(followerId)
        ? prev.filter(id => id !== followerId)
        : [...prev, followerId]
    );
  };

  const renderShareOption = (option) => (
    <TouchableOpacity
      key={option.id}
      style={styles.shareOption}
      onPress={() => handleShare(option)}
      disabled={sharing}
    >
      <View style={[styles.shareIcon, { backgroundColor: option.color + '20' }]}>
        <Ionicons name={option.icon} size={24} color={option.color} />
      </View>
      <Text style={styles.shareOptionText}>{option.title}</Text>
    </TouchableOpacity>
  );

  const renderFollower = (follower) => (
    <TouchableOpacity
      key={follower.id}
      style={styles.followerItem}
      onPress={() => toggleFollower(follower.id)}
    >
      <Image source={{ uri: follower.avatar }} style={styles.followerAvatar} />
      <View style={styles.followerInfo}>
        <Text style={styles.followerName}>{follower.name}</Text>
        <Text style={styles.followerUsername}>{follower.username}</Text>
      </View>
      <View style={[
        styles.checkbox,
        selectedFollowers.includes(follower.id) && styles.checkboxSelected
      ]}>
        {selectedFollowers.includes(follower.id) && (
          <Ionicons name="checkmark" size={16} color="#fff" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Share Post</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Post Preview */}
        <View style={styles.postPreview}>
          <Image 
            source={{ uri: post?.image_url || 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80' }} 
            style={styles.postImage} 
          />
          <View style={styles.postInfo}>
            <Text style={styles.postTitle}>{post?.title || 'Product Title'}</Text>
            <Text style={styles.postStore}>{post?.store_name || 'Store Name'}</Text>
            <Text style={styles.postPrice}>{post?.price ? `$${post.price}` : ''}</Text>
          </View>
        </View>

        {/* Share Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share to</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shareOptions}>
            {shareOptions.map(renderShareOption)}
          </ScrollView>
        </View>

        {/* Direct Share to Followers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share with followers</Text>
          <ScrollView style={styles.followersList} showsVerticalScrollIndicator={false}>
            {mockFollowers.map(renderFollower)}
          </ScrollView>
        </View>

        {/* Direct Share Button */}
        {selectedFollowers.length > 0 && (
          <View style={styles.directShareContainer}>
            <TouchableOpacity
              style={[styles.directShareButton, sharing && styles.directShareButtonDisabled]}
              onPress={handleDirectShare}
              disabled={sharing}
            >
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.directShareText}>
                {sharing ? 'Sharing...' : `Share with ${selectedFollowers.length} followers`}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
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
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: spacing.s,
  },
  headerTitle: {
    fontSize: typography.subtitle,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSpacer: {
    width: 44,
  },
  postPreview: {
    flexDirection: 'row',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  postImage: {
    width: 80,
    height: 80,
    borderRadius: radii.m,
    marginRight: spacing.m,
  },
  postInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  postTitle: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  postStore: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  postPrice: {
    fontSize: typography.subtitle,
    fontWeight: 'bold',
    color: colors.discount,
  },
  section: {
    padding: spacing.m,
  },
  sectionTitle: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.m,
  },
  shareOptions: {
    flexDirection: 'row',
  },
  shareOption: {
    alignItems: 'center',
    marginRight: spacing.l,
    minWidth: 80,
  },
  shareIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  shareOptionText: {
    fontSize: typography.caption,
    color: colors.text,
    textAlign: 'center',
  },
  followersList: {
    maxHeight: 200,
  },
  followerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  followerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.m,
  },
  followerInfo: {
    flex: 1,
  },
  followerName: {
    fontSize: typography.body,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  followerUsername: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  directShareContainer: {
    padding: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  directShareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.m,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
  },
  directShareButtonDisabled: {
    opacity: 0.6,
  },
  directShareText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: typography.body,
    marginLeft: spacing.xs,
  },
}); 