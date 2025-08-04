-- =============================================
-- MESSAGING SYSTEM SCHEMA
-- =============================================

-- Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.products(id) ON DELETE SET NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    subject TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'resolved')),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, store_id, product_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    sender_type TEXT DEFAULT 'user' CHECK (sender_type IN ('user', 'seller', 'system')),
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'product', 'order')),
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message reactions table
CREATE TABLE IF NOT EXISTS public.message_reactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id, reaction_type)
);

-- Conversation participants (for group chats)
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'participant' CHECK (role IN ('participant', 'admin', 'moderator')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(conversation_id, user_id)
);

-- Message notifications table
CREATE TABLE IF NOT EXISTS public.message_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    notification_type TEXT DEFAULT 'new_message' CHECK (notification_type IN ('new_message', 'message_reaction', 'conversation_archived')),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat settings table
CREATE TABLE IF NOT EXISTS public.chat_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    auto_reply_enabled BOOLEAN DEFAULT FALSE,
    auto_reply_message TEXT,
    office_hours JSONB DEFAULT '{"enabled": false, "schedule": []}',
    notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_store_id ON public.conversations(store_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read);

-- Message reactions indexes
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON public.message_reactions(user_id);

-- Conversation participants indexes
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON public.conversation_participants(user_id);

-- Message notifications indexes
CREATE INDEX IF NOT EXISTS idx_message_notifications_user_id ON public.message_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_message_notifications_is_read ON public.message_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_message_notifications_created_at ON public.message_notifications(created_at);

-- Chat settings indexes
CREATE INDEX IF NOT EXISTS idx_chat_settings_user_id ON public.chat_settings(user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_settings ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view their own conversations" ON public.conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Sellers can view conversations with their store" ON public.conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.stores 
            WHERE stores.id = conversations.store_id 
            AND stores.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON public.conversations
    FOR UPDATE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE conversations.id = messages.conversation_id 
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Sellers can view messages in their store conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            JOIN public.stores ON stores.id = conversations.store_id
            WHERE conversations.id = messages.conversation_id 
            AND stores.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages" ON public.messages
    FOR DELETE USING (auth.uid() = sender_id);

-- Message reactions policies
CREATE POLICY "Users can view message reactions" ON public.message_reactions
    FOR SELECT USING (true);

CREATE POLICY "Users can react to messages" ON public.message_reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own reactions" ON public.message_reactions
    FOR DELETE USING (auth.uid() = user_id);

-- Conversation participants policies
CREATE POLICY "Users can view conversation participants" ON public.conversation_participants
    FOR SELECT USING (true);

CREATE POLICY "Users can join conversations" ON public.conversation_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave conversations" ON public.conversation_participants
    FOR DELETE USING (auth.uid() = user_id);

-- Message notifications policies
CREATE POLICY "Users can view their own notifications" ON public.message_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.message_notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Chat settings policies
CREATE POLICY "Users can view their own chat settings" ON public.chat_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat settings" ON public.chat_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat settings" ON public.chat_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS FOR MESSAGING
-- =============================================

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_message_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM public.messages m
        JOIN public.conversations c ON c.id = m.conversation_id
        WHERE (c.user_id = user_uuid OR 
               EXISTS (SELECT 1 FROM public.stores s WHERE s.id = c.store_id AND s.user_id = user_uuid))
        AND m.sender_id != user_uuid
        AND m.is_read = FALSE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get conversation with latest message
CREATE OR REPLACE FUNCTION get_conversation_with_latest_message(conv_id UUID)
RETURNS TABLE(
    conversation_id UUID,
    user_id UUID,
    store_id UUID,
    subject TEXT,
    status TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    latest_message_content TEXT,
    latest_message_sender_id UUID,
    unread_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.user_id,
        c.store_id,
        c.subject,
        c.status,
        c.last_message_at,
        lm.content as latest_message_content,
        lm.sender_id as latest_message_sender_id,
        (SELECT COUNT(*) FROM public.messages m2 
         WHERE m2.conversation_id = c.id 
         AND m2.sender_id != auth.uid() 
         AND m2.is_read = FALSE) as unread_count
    FROM public.conversations c
    LEFT JOIN LATERAL (
        SELECT content, sender_id
        FROM public.messages m
        WHERE m.conversation_id = c.id
        ORDER BY m.created_at DESC
        LIMIT 1
    ) lm ON true
    WHERE c.id = conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_conversation_as_read(conv_id UUID, user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.messages 
    SET is_read = TRUE, read_at = NOW()
    WHERE conversation_id = conv_id 
    AND sender_id != user_uuid
    AND is_read = FALSE;
    
    -- Update conversation last_message_at
    UPDATE public.conversations 
    SET updated_at = NOW()
    WHERE id = conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create message notification
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Create notification for conversation participants
    INSERT INTO public.message_notifications (user_id, message_id, conversation_id, notification_type)
    SELECT 
        c.user_id,
        NEW.id,
        NEW.conversation_id,
        'new_message'
    FROM public.conversations c
    WHERE c.id = NEW.conversation_id
    AND c.user_id != NEW.sender_id;
    
    -- Also notify store owner if message is from user
    INSERT INTO public.message_notifications (user_id, message_id, conversation_id, notification_type)
    SELECT 
        s.user_id,
        NEW.id,
        NEW.conversation_id,
        'new_message'
    FROM public.conversations c
    JOIN public.stores s ON s.id = c.store_id
    WHERE c.id = NEW.conversation_id
    AND NEW.sender_type = 'user';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Trigger to update conversation last_message_at when new message is added
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations 
    SET last_message_at = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for messages
CREATE TRIGGER trigger_update_conversation_last_message
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- Create trigger for message notifications
CREATE TRIGGER trigger_create_message_notification
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION create_message_notification();

-- =============================================
-- SAMPLE DATA FOR TESTING
-- =============================================

-- Insert sample conversations (if users and stores exist)
-- INSERT INTO public.conversations (user_id, store_id, subject) VALUES 
-- ('user-uuid-1', 'store-uuid-1', 'Question about product'),
-- ('user-uuid-2', 'store-uuid-1', 'Order inquiry'),
-- ('user-uuid-3', 'store-uuid-2', 'Shipping question');

-- Insert sample messages (if conversations exist)
-- INSERT INTO public.messages (conversation_id, sender_id, sender_type, content) VALUES 
-- ('conversation-uuid-1', 'user-uuid-1', 'user', 'Hi, I have a question about this product'),
-- ('conversation-uuid-1', 'store-uuid-1', 'seller', 'Hello! I\'d be happy to help. What would you like to know?'),
-- ('conversation-uuid-2', 'user-uuid-2', 'user', 'When will my order ship?');

-- Insert sample chat settings
-- INSERT INTO public.chat_settings (user_id, auto_reply_enabled, auto_reply_message) VALUES 
-- ('user-uuid-1', FALSE, NULL),
-- ('store-uuid-1', TRUE, 'Thanks for your message! We\'ll get back to you within 24 hours.');

-- =============================================
-- MIGRATION NOTES
-- =============================================

/*
This schema creates a comprehensive messaging system:

1. CONVERSATIONS TABLE:
   - Links users with stores/sellers
   - Tracks conversation status and metadata
   - Supports product and order-specific conversations

2. MESSAGES TABLE:
   - Stores all message content and metadata
   - Supports different message types (text, image, file, product, order)
   - Tracks read status and timestamps

3. MESSAGE REACTIONS:
   - Allows users to react to messages
   - Supports multiple reaction types

4. CONVERSATION PARTICIPANTS:
   - Supports group conversations
   - Tracks participant roles and status

5. MESSAGE NOTIFICATIONS:
   - Real-time notification system
   - Tracks notification status

6. CHAT SETTINGS:
   - Auto-reply functionality for sellers
   - Office hours and notification preferences

KEY FEATURES:
- Real-time messaging with Supabase Realtime
- Message reactions and notifications
- Conversation management and archiving
- Auto-reply and office hours for sellers
- Comprehensive security with RLS
- Performance optimized with indexes

TO APPLY THIS SCHEMA:
1. Run this SQL in your Supabase SQL editor
2. Tables will be created with proper RLS policies
3. Functions and triggers will be automatically set up
4. Sample data can be inserted for testing

NOTE: Make sure you have the uuid-ossp extension enabled:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
*/ 