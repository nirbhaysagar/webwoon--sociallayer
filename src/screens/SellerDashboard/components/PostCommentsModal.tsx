import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, FlatList, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../../constants/theme';

const mockComments = [
  {
    id: '1',
    user_id: 'user1',
    user_name: 'Sarah Johnson',
    user_avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    comment: 'Love this product! The quality is amazing. Would definitely recommend!',
    created_at: '2024-01-15T10:30:00Z',
    likes: 12,
    is_liked: false,
  },
  {
    id: '2',
    user_id: 'user2',
    user_name: 'Mike Chen',
    user_avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    comment: 'How does the sizing run? I\'m usually a medium.',
    created_at: '2024-01-15T09:15:00Z',
    likes: 5,
    is_liked: true,
  },
  {
    id: '3',
    user_id: 'user3',
    user_name: 'Emma Davis',
    user_avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    comment: 'Just ordered this! Can\'t wait to try it out.',
    created_at: '2024-01-15T08:45:00Z',
    likes: 8,
    is_liked: false,
  },
];

export default function PostCommentsModal({ visible, onClose, post }) {
  const [comments, setComments] = useState(mockComments);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const comment = {
        id: Date.now().toString(),
        user_id: 'current_user',
        user_name: 'You',
        user_avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        comment: newComment.trim(),
        created_at: new Date().toISOString(),
        likes: 0,
        is_liked: false,
      };
      
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = (commentId) => {
    setComments(prev => 
      prev.map(comment => 
        comment.id === commentId 
          ? { 
              ...comment, 
              likes: comment.is_liked ? comment.likes - 1 : comment.likes + 1,
              is_liked: !comment.is_liked 
            }
          : comment
      )
    );
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <Image source={{ uri: item.user_avatar }} style={styles.avatar} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.userName}>{item.user_name}</Text>
          <Text style={styles.timeAgo}>{formatTimeAgo(item.created_at)}</Text>
        </View>
        <Text style={styles.commentText}>{item.comment}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLikeComment(item.id)}
          >
            <Ionicons 
              name={item.is_liked ? 'heart' : 'heart-outline'} 
              size={16} 
              color={item.is_liked ? colors.error : colors.textSecondary} 
            />
            <Text style={[styles.actionText, item.is_liked && styles.likedText]}>
              {item.likes > 0 ? item.likes : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.actionText}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comments</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Comments List */}
        <FlatList
          data={comments}
          keyExtractor={item => item.id}
          renderItem={renderComment}
          contentContainerStyle={styles.commentsList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.postPreview}>
              <Text style={styles.postTitle}>{post?.title || 'Post Title'}</Text>
              <Text style={styles.commentCount}>{comments.length} comments</Text>
            </View>
          }
        />

        {/* Comment Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            placeholderTextColor={colors.textSecondary}
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, (!newComment.trim() || submitting) && styles.sendButtonDisabled]}
            onPress={handleSubmitComment}
            disabled={!newComment.trim() || submitting}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={newComment.trim() && !submitting ? colors.primary : colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  commentsList: {
    padding: spacing.m,
  },
  postPreview: {
    paddingBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.m,
  },
  postTitle: {
    fontSize: typography.subtitle,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  commentCount: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: spacing.m,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.s,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.s,
  },
  timeAgo: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  commentText: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.m,
    paddingVertical: spacing.xs,
  },
  actionText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  likedText: {
    color: colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radii.m,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    fontSize: typography.body,
    color: colors.text,
    maxHeight: 100,
    marginRight: spacing.s,
  },
  sendButton: {
    padding: spacing.s,
    borderRadius: radii.s,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
}); 