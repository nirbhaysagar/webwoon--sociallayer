-- =============================================
-- MESSAGING SYSTEM DIAGNOSTIC AND FIX SCRIPT
-- =============================================

-- First, let's check what tables currently exist
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('messages', 'conversations', 'message_reactions', 'conversation_participants')
ORDER BY table_name, ordinal_position;

-- Check if the old messages table exists and what columns it has
SELECT 
    'Current messages table structure:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'messages'
ORDER BY ordinal_position;

-- =============================================
-- FIX: DROP OLD TABLES AND RECREATE WITH NEW SCHEMA
-- =============================================

-- Drop existing messaging tables (if they exist) to recreate with proper schema
DROP TABLE IF EXISTS public.message_reactions CASCADE;
DROP TABLE IF EXISTS public.conversation_participants CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;

-- =============================================
-- RECREATE MESSAGING TABLES WITH PROPER SCHEMA
-- =============================================

-- Conversations/Threads table (like WhatsApp/Instagram)
CREATE TABLE public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id),
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    unread_count INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table (enhanced for WhatsApp/Instagram-like functionality)
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_type TEXT CHECK (sender_type IN ('customer', 'store')),
    sender_id UUID, -- Can be customer_id or store_id
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'order_link', 'product_link')),
    media_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID, -- Who deleted the message
    reply_to_message_id UUID REFERENCES public.messages(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message reactions (like WhatsApp/Instagram)
CREATE TABLE public.message_reactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Conversation participants (for future group chat support)
CREATE TABLE public.conversation_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    participant_id UUID, -- Can be customer_id or store_id
    participant_type TEXT CHECK (participant_type IN ('customer', 'store')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- =============================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Messages indexes
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_type ON public.messages(sender_type);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_messages_is_deleted ON public.messages(is_deleted);

-- Conversations indexes
CREATE INDEX idx_conversations_store_id ON public.conversations(store_id);
CREATE INDEX idx_conversations_customer_id ON public.conversations(customer_id);
CREATE INDEX idx_conversations_last_message_at ON public.conversations(last_message_at);
CREATE INDEX idx_conversations_is_deleted ON public.conversations(is_deleted);

-- Message reactions indexes
CREATE INDEX idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX idx_message_reactions_user_id ON public.message_reactions(user_id);

-- Conversation participants indexes
CREATE INDEX idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_participant_id ON public.conversation_participants(participant_id);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on messaging tables
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CREATE FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update conversation metadata when messages are added/updated
CREATE OR REPLACE FUNCTION update_conversation_metadata()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update conversation with last message info
        UPDATE public.conversations 
        SET last_message = NEW.message,
            last_message_at = NEW.created_at,
            updated_at = NOW()
        WHERE id = NEW.conversation_id;
        
        -- Increment unread count for other participants
        UPDATE public.conversations 
        SET unread_count = unread_count + 1
        WHERE id = NEW.conversation_id;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- If message is marked as read, decrease unread count
        IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
            UPDATE public.conversations 
            SET unread_count = GREATEST(0, unread_count - 1)
            WHERE id = NEW.conversation_id;
        END IF;
        
        -- If message is deleted, update conversation
        IF NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
            -- Get the last non-deleted message
            UPDATE public.conversations 
            SET last_message = (
                SELECT message 
                FROM public.messages 
                WHERE conversation_id = NEW.conversation_id 
                AND is_deleted = FALSE 
                ORDER BY created_at DESC 
                LIMIT 1
            ),
            last_message_at = (
                SELECT created_at 
                FROM public.messages 
                WHERE conversation_id = NEW.conversation_id 
                AND is_deleted = FALSE 
                ORDER BY created_at DESC 
                LIMIT 1
            )
            WHERE id = NEW.conversation_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation metadata
CREATE TRIGGER update_conversation_metadata_trigger
    AFTER INSERT OR UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_metadata();

-- Function to handle message reactions
CREATE OR REPLACE FUNCTION handle_message_reaction()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Could add logic here for reaction notifications
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Could add logic here for reaction removal
        RETURN OLD;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for message reactions
CREATE TRIGGER handle_message_reaction_trigger
    AFTER INSERT OR DELETE ON public.message_reactions
    FOR EACH ROW EXECUTE FUNCTION handle_message_reaction();

-- =============================================
-- CREATE ROW LEVEL SECURITY POLICIES
-- =============================================

-- Policy for messages - users can only see messages in conversations they're part of
CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM public.conversations 
            WHERE (customer_id = auth.uid()) OR 
                  (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()))
        )
    );

-- Policy for messages - users can insert messages in their conversations
CREATE POLICY "Users can insert messages in their conversations" ON public.messages
    FOR INSERT WITH CHECK (
        conversation_id IN (
            SELECT id FROM public.conversations 
            WHERE (customer_id = auth.uid()) OR 
                  (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()))
        )
    );

-- Policy for messages - users can update their own messages
CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE USING (
        sender_id = auth.uid()
    );

-- Policy for conversations - users can view their conversations
CREATE POLICY "Users can view their conversations" ON public.conversations
    FOR SELECT USING (
        (customer_id = auth.uid()) OR 
        (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()))
    );

-- Policy for conversations - users can insert conversations
CREATE POLICY "Users can insert conversations" ON public.conversations
    FOR INSERT WITH CHECK (
        (customer_id = auth.uid()) OR 
        (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()))
    );

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check if messaging tables were created successfully
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('conversations', 'messages', 'message_reactions', 'conversation_participants') 
        THEN '✅ Created' 
        ELSE '❌ Missing' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'messages', 'message_reactions', 'conversation_participants');

-- Check if conversation_id column exists in messages table
SELECT 
    column_name,
    data_type,
    CASE 
        WHEN column_name = 'conversation_id' 
        THEN '✅ Exists' 
        ELSE '❌ Missing' 
    END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'messages' 
AND column_name = 'conversation_id';

-- Check all columns in the new messages table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'messages'
ORDER BY ordinal_position; 