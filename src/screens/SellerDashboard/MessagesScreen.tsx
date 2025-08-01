import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from './components/HeaderWithMenu';
import Toast from 'react-native-toast-message';
import { useApp } from '../../context/AppContext';
import { scale, verticalScale, moderateScale } from '../../lib/scale';

const quickReplies = [
  'Thank you for your order!',
  'We will ship it today.',
  'Let me check and get back to you.',
];

export default function MessagesScreen() {
  const { state, getStoreConversations, getConversation, sendMessage, markMessagesAsRead, deleteConversation } = useApp();
  const [search, setSearch] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const scrollViewRef = useRef(null);

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await getStoreConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
      Toast.show({ type: 'error', text1: 'Failed to load conversations' });
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(
    conv => {
      const customerName = conv.customers?.first_name + ' ' + conv.customers?.last_name;
      return customerName.toLowerCase().includes(search.toLowerCase()) || 
             conv.last_message?.toLowerCase().includes(search.toLowerCase());
    }
  );

  const handleSend = async () => {
    if (!input.trim() || !selectedConversation) return;
    
    setLoading(true);
    try {
      await sendMessage(selectedConversation.id, input.trim());
      setInput('');
      Toast.show({ type: 'success', text1: 'Message sent!' });
      
      // Reload conversation to get updated messages
      const updatedConversation = await getConversation(selectedConversation.id);
      setSelectedConversation(updatedConversation);
    } catch (error) {
      console.error('Error sending message:', error);
      Toast.show({ type: 'error', text1: 'Failed to send message' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteConversation(conversationId);
              setSelectedConversation(null);
              loadConversations(); // Reload conversations
              Toast.show({ type: 'success', text1: 'Conversation deleted!' });
            } catch (error) {
              console.error('Error deleting conversation:', error);
              Toast.show({ type: 'error', text1: 'Failed to delete conversation' });
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleConversationSelect = async (conversation) => {
    try {
      setLoading(true);
      const fullConversation = await getConversation(conversation.id);
      setSelectedConversation(fullConversation);
      
      // Mark messages as read
      await markMessagesAsRead(conversation.id);
    } catch (error) {
      console.error('Error loading conversation:', error);
      Toast.show({ type: 'error', text1: 'Failed to load conversation' });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${minutes}m`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours}h`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getCustomerName = (conversation) => {
    const customer = conversation.customers;
    if (customer) {
      return `${customer.first_name} ${customer.last_name}`.trim();
    }
    return 'Unknown Customer';
  };

  const getCustomerAvatar = (conversation) => {
    const customer = conversation.customers;
    return customer?.avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg';
  };

  // Conversations list view
  if (!selectedConversation) {
    return (
      <View style={styles.container}>
        <HeaderWithMenu />
        
        <View style={styles.header}>
          <Text style={styles.title}>Messages</Text>
          <Text style={styles.subtitle}>Customer conversations</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search conversations..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading conversations...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredConversations}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.conversationCard}
                onPress={() => handleConversationSelect(item)}
              >
                <View style={styles.conversationHeader}>
                  <View style={styles.avatarContainer}>
                    <Image source={{ uri: getCustomerAvatar(item) }} style={styles.avatar} />
                    {item.unread_count > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{item.unread_count}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.conversationInfo}>
                    <View style={styles.nameTimeRow}>
                      <Text style={styles.conversationName}>{getCustomerName(item)}</Text>
                      <Text style={styles.timeText}>{formatTime(item.last_message_at)}</Text>
                    </View>
                    <View style={styles.messageRow}>
                      <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.last_message || 'No messages yet'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.conversationsList}
            showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={loadConversations}
          />
        )}
      </View>
    );
  }

  // Chat view
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => setSelectedConversation(null)} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Image source={{ uri: getCustomerAvatar(selectedConversation) }} style={styles.chatAvatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.chatName}>{getCustomerName(selectedConversation)}</Text>
          <Text style={styles.chatStatus}>
            {selectedConversation.unread_count > 0 ? `${selectedConversation.unread_count} unread` : 'All read'}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => handleDeleteConversation(selectedConversation.id)} 
          style={styles.deleteBtn}
        >
          <Ionicons name="trash-outline" size={20} color={colors.discount} />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.messagesArea}
        contentContainerStyle={styles.messagesContent}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {selectedConversation.messages?.map(msg => (
          <View
            key={msg.id}
            style={[styles.bubble, msg.sender_type === 'store' ? styles.bubbleMe : styles.bubbleThem]}
          >
            <Text style={styles.bubbleText}>{msg.message}</Text>
            <Text style={styles.messageTime}>{formatTime(msg.created_at)}</Text>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.quickRepliesRow}>
        {quickReplies.map(q => (
          <TouchableOpacity key={q} style={styles.quickReplyChip} onPress={() => setInput(q)}>
            <Text style={styles.quickReplyText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || loading}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={input.trim() ? colors.white : colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.m,
    paddingTop: spacing.m,
    paddingBottom: spacing.s,
  },
  title: {
    fontSize: scale(24),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
  },
  subtitle: {
    fontSize: scale(16),
    color: colors.textSecondary,
    marginTop: verticalScale(4),
  },
  searchContainer: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.s,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: scale(15),
    color: colors.text,
    padding: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.l,
  },
  loadingText: {
    fontSize: scale(18),
    color: colors.textSecondary,
  },
  conversationsList: {
    paddingHorizontal: spacing.m,
    paddingBottom: 80,
  },
  conversationCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.m,
  },
  avatar: {
    width: scale(44),
    height: scale(44),
    borderRadius: radii.medium,
  },
  unreadBadge: {
    position: 'absolute',
    top: verticalScale(-5),
    right: scale(-5),
    backgroundColor: colors.primary,
    borderRadius: radii.circle,
    minWidth: scale(20),
    height: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: scale(13),
  },
  conversationInfo: {
    flex: 1,
  },
  nameTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(2),
  },
  conversationName: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: colors.text,
  },
  timeText: {
    fontSize: scale(13),
    color: colors.disabled,
  },
  messageRow: {
    // This style is not used in the new code, but kept for consistency
  },
  lastMessage: {
    fontSize: scale(14),
    color: colors.textSecondary,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingTop: spacing.m,
    paddingBottom: spacing.s,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.card,
  },
  backBtn: {
    marginRight: spacing.m,
  },
  chatAvatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: radii.medium,
    marginRight: spacing.m,
  },
  chatName: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: colors.text,
  },
  chatStatus: {
    fontSize: scale(13),
    color: colors.primary,
  },
  messagesArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesContent: {
    padding: spacing.m,
    paddingBottom: 40,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: radii.medium,
    padding: spacing.s,
    marginBottom: spacing.s,
  },
  bubbleMe: {
    backgroundColor: colors.primary + '22',
    alignSelf: 'flex-end',
  },
  bubbleThem: {
    backgroundColor: colors.card,
    alignSelf: 'flex-start',
  },
  bubbleText: {
    fontSize: scale(15),
    color: colors.text,
  },
  messageTime: {
    fontSize: scale(12),
    color: colors.disabled,
    marginTop: verticalScale(4),
    alignSelf: 'flex-end',
  },
  quickRepliesRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.m,
    marginBottom: spacing.s,
  },
  quickReplyChip: {
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    ...shadows.card,
  },
  quickReplyText: {
    color: colors.textSecondary,
    fontSize: scale(14),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.card,
  },
  input: {
    flex: 1,
    fontSize: scale(15),
    color: colors.text,
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    minHeight: verticalScale(40),
    maxHeight: verticalScale(100),
    textAlignVertical: 'top',
  },
  sendBtn: {
    padding: 8,
    backgroundColor: colors.primary,
    borderRadius: radii.circle,
  },
  sendBtnDisabled: {
    backgroundColor: colors.disabled,
  },
  deleteBtn: {
    marginLeft: spacing.m,
  },
}); 