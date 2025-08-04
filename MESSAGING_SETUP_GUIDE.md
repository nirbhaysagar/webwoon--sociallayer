# 💬 **MESSAGING SYSTEM SETUP GUIDE**

## 🎯 **OVERVIEW**

The messaging system provides real-time communication between users and sellers, including:
- **Live Chat**: Real-time messaging with typing indicators
- **Conversations**: User-to-seller chat with product/order context
- **Message Notifications**: Push notifications for new messages
- **Message Reactions**: Like, love, laugh, wow, sad, angry reactions
- **Chat Settings**: Auto-reply, office hours, notification preferences

## ✅ **PHASE 1: DATABASE SETUP**

### **Step 1: Run Messaging Schema**
1. **Open Supabase Dashboard**
2. **Go to SQL Editor**
3. **Copy and paste** the contents of `database/messaging_schema.sql`
4. **Click "Run"** - This will create all messaging tables and functions

### **Step 2: Verify Setup**
After running the schema, you should see:
- ✅ **Tables created**: `conversations`, `messages`, `message_reactions`, `conversation_participants`, `message_notifications`, `chat_settings`
- ✅ **Policies applied**: RLS security for all tables
- ✅ **Functions created**: `get_unread_message_count`, `mark_conversation_as_read`, etc.
- ✅ **Triggers set up**: Automatic engagement updates

## ✅ **PHASE 2: BACKEND INTEGRATION**

### **Step 1: Add Messaging Routes**
The messaging routes are already added to `backend/server.js`:
```javascript
app.use('/api/messaging', authenticateToken, messagingRoutes);
```

### **Step 2: Test Backend Endpoints**
```bash
# Test health check
curl http://localhost:3001/health

# Test messaging endpoints (with JWT token)
curl -X GET http://localhost:3001/api/messaging/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

curl -X GET http://localhost:3001/api/messaging/unread-count \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## ✅ **PHASE 3: FRONTEND INTEGRATION**

### **Step 1: Navigation Setup**
The messaging screens are already added to `src/navigation/UserDashboardNavigator.tsx`:
```typescript
<Stack.Screen name="Messaging" component={MessagingScreen} />
<Stack.Screen name="Chat" component={ChatScreen} />
```

### **Step 2: Add Messaging Tab**
Add a messaging tab to your bottom navigation or main menu:
```typescript
// In your navigation component
<Tab.Screen 
  name="Messages" 
  component={MessagingScreen}
  options={{
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="chatbubbles-outline" size={size} color={color} />
    ),
  }}
/>
```

### **Step 3: Update API Integration**
Replace mock data with real API calls in the screens:

**In MessagingScreen.tsx:**
```typescript
// Replace mock data with real API call
const loadConversations = useCallback(async () => {
  try {
    setLoading(true);
    const response = await messagingService.getConversations();
    setConversations(response.data);
    setUnreadCount(response.data.reduce((sum, conv) => sum + conv.unread_count, 0));
  } catch (error) {
    console.error('Error loading conversations:', error);
    Toast.show({
      type: 'error',
      text1: 'Failed to load conversations',
      text2: error.message
    });
  } finally {
    setLoading(false);
  }
}, []);
```

**In ChatScreen.tsx:**
```typescript
// Replace mock data with real API call
const loadMessages = useCallback(async () => {
  try {
    setLoading(true);
    const response = await messagingService.getConversation(conversationId);
    setConversation(response.conversation);
    setMessages(response.messages);
  } catch (error) {
    console.error('Error loading messages:', error);
    Toast.show({
      type: 'error',
      text1: 'Failed to load messages',
      text2: error.message
    });
  } finally {
    setLoading(false);
  }
}, [conversationId]);

const sendMessage = useCallback(async () => {
  if (!newMessage.trim()) return;

  try {
    setSending(true);
    const message = await messagingService.sendMessage(conversationId, {
      content: newMessage.trim(),
      message_type: 'text'
    });
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    Toast.show({
      type: 'success',
      text1: 'Message sent',
      text2: 'Your message has been sent successfully'
    });
  } catch (error) {
    console.error('Error sending message:', error);
    Toast.show({
      type: 'error',
      text1: 'Failed to send message',
      text2: error.message
    });
  } finally {
    setSending(false);
  }
}, [newMessage, conversationId]);
```

## ✅ **PHASE 4: REAL-TIME FEATURES**

### **Step 1: Supabase Realtime Setup**
Enable real-time subscriptions in your Supabase project:
1. **Go to Supabase Dashboard**
2. **Database → Replication**
3. **Enable real-time for**: `messages`, `conversations`, `message_notifications`

### **Step 2: Real-time Message Updates**
Add real-time subscriptions to ChatScreen:
```typescript
useEffect(() => {
  // Subscribe to real-time messages
  const subscription = messagingService.subscribeToMessages(conversationId, (newMessage) => {
    setMessages(prev => [...prev, newMessage]);
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  });

  return () => {
    // Cleanup subscription
    messagingService.unsubscribeFromMessages();
  };
}, [conversationId]);
```

### **Step 3: Real-time Notifications**
Add real-time notification updates to MessagingScreen:
```typescript
useEffect(() => {
  // Subscribe to real-time notifications
  const subscription = supabase
    .channel('message_notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'message_notifications',
      filter: `user_id=eq.${supabase.auth.user()?.id}`
    }, (payload) => {
      // Update unread count
      setUnreadCount(prev => prev + 1);
      
      // Show notification
      Toast.show({
        type: 'info',
        text1: 'New message',
        text2: payload.new.messages?.content || 'You have a new message'
      });
    })
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}, []);
```

## ✅ **PHASE 5: ADVANCED FEATURES**

### **Step 1: Message Reactions**
Add reaction functionality to ChatScreen:
```typescript
const handleReaction = async (messageId: string, reactionType: string) => {
  try {
    await messagingService.reactToMessage(messageId, reactionType);
    Toast.show({
      type: 'success',
      text1: 'Reaction added',
      text2: `You reacted with ${reactionType}`
    });
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Failed to add reaction',
      text2: error.message
    });
  }
};
```

### **Step 2: Chat Settings**
Add chat settings management:
```typescript
const loadChatSettings = async () => {
  try {
    const settings = await messagingService.getChatSettings();
    setChatSettings(settings);
  } catch (error) {
    console.error('Error loading chat settings:', error);
  }
};

const updateChatSettings = async (newSettings: Partial<ChatSettings>) => {
  try {
    await messagingService.updateChatSettings(newSettings);
    Toast.show({
      type: 'success',
      text1: 'Settings updated',
      text2: 'Your chat settings have been saved'
    });
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Failed to update settings',
      text2: error.message
    });
  }
};
```

### **Step 3: Push Notifications**
Integrate with your existing notification system:
```typescript
// In your notification service
const handleMessageNotification = async (notification: MessageNotification) => {
  // Show local notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'New Message',
      body: notification.messages?.content || 'You have a new message',
      data: { conversationId: notification.conversation_id }
    },
    trigger: null
  });
};
```

## 🎯 **TESTING CHECKLIST**

### **Database Tests**
- [ ] Run messaging schema successfully
- [ ] Verify all tables created
- [ ] Test RLS policies
- [ ] Test database functions

### **Backend Tests**
- [ ] Start backend server
- [ ] Test messaging endpoints
- [ ] Verify authentication
- [ ] Test error handling

### **Frontend Tests**
- [ ] Load messaging screen
- [ ] Create new conversation
- [ ] Send and receive messages
- [ ] Test real-time updates
- [ ] Test message reactions
- [ ] Test notifications

### **Real-time Tests**
- [ ] Enable Supabase real-time
- [ ] Test live message updates
- [ ] Test typing indicators
- [ ] Test notification delivery

## 🚀 **PRODUCTION DEPLOYMENT**

### **Environment Variables**
Add to your `.env`:
```env
# Supabase Realtime
SUPABASE_REALTIME_URL=your_realtime_url
SUPABASE_REALTIME_KEY=your_realtime_key

# Push Notifications
EXPO_PUSH_TOKEN=your_expo_push_token
```

### **Performance Optimization**
- [ ] Implement message pagination
- [ ] Add message caching
- [ ] Optimize real-time subscriptions
- [ ] Add offline support

### **Security**
- [ ] Verify RLS policies
- [ ] Test authentication
- [ ] Validate message content
- [ ] Rate limiting

## 📞 **SUPPORT**

If you encounter issues:
1. **Check console logs** for error messages
2. **Verify database connection** in Supabase
3. **Test individual endpoints** with curl/Postman
4. **Check real-time subscriptions** in Supabase Dashboard

---

**🎉 Your messaging system is now ready for production use!**

## 📋 **API ENDPOINTS REFERENCE**

### **Conversations**
- `GET /api/messaging/conversations` - Get user conversations
- `GET /api/messaging/conversations/:id` - Get single conversation
- `POST /api/messaging/conversations` - Create new conversation

### **Messages**
- `POST /api/messaging/conversations/:id/messages` - Send message
- `POST /api/messaging/messages/:id/reactions` - React to message
- `DELETE /api/messaging/messages/:id/reactions` - Remove reaction

### **Notifications**
- `GET /api/messaging/notifications` - Get message notifications
- `PUT /api/messaging/notifications/read` - Mark as read
- `GET /api/messaging/unread-count` - Get unread count

### **Settings**
- `GET /api/messaging/settings` - Get chat settings
- `PUT /api/messaging/settings` - Update chat settings 