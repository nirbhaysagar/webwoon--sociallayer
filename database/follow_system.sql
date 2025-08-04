-- Follow System Database Schema
-- This schema handles user-seller follow relationships

-- Follows table to track user-seller follow relationships
CREATE TABLE IF NOT EXISTS follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique follow relationship
    UNIQUE(follower_id, following_id)
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_follows_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_follows_updated_at
    BEFORE UPDATE ON follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follows_updated_at();

-- Function to get follower count for a user
CREATE OR REPLACE FUNCTION get_follower_count(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM follows
        WHERE following_id = user_id
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get following count for a user
CREATE OR REPLACE FUNCTION get_following_count(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM follows
        WHERE follower_id = user_id
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is following another user
CREATE OR REPLACE FUNCTION is_following(follower_id UUID, following_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1
        FROM follows
        WHERE follower_id = $1 AND following_id = $2
    );
END;
$$ LANGUAGE plpgsql;

-- View to get user's followers with profile information
CREATE OR REPLACE VIEW user_followers AS
SELECT 
    f.id as follow_id,
    f.created_at as followed_at,
    u.id as follower_id,
    u.full_name as follower_name,
    u.username as follower_username,
    u.avatar_url as follower_avatar,
    u.is_verified as follower_verified,
    u.bio as follower_bio
FROM follows f
JOIN users u ON f.follower_id = u.id
ORDER BY f.created_at DESC;

-- View to get users that a user is following with profile information
CREATE OR REPLACE VIEW user_following AS
SELECT 
    f.id as follow_id,
    f.created_at as followed_at,
    u.id as following_id,
    u.full_name as following_name,
    u.username as following_username,
    u.avatar_url as following_avatar,
    u.is_verified as following_verified,
    u.bio as following_bio
FROM follows f
JOIN users u ON f.following_id = u.id
ORDER BY f.created_at DESC;

-- Row Level Security (RLS) policies
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Users can view their own follows and follows where they are the follower
CREATE POLICY "Users can view their own follows" ON follows
    FOR SELECT USING (
        auth.uid() = follower_id OR 
        auth.uid() = following_id
    );

-- Users can insert follows (follow someone)
CREATE POLICY "Users can follow others" ON follows
    FOR INSERT WITH CHECK (
        auth.uid() = follower_id AND
        follower_id != following_id -- Prevent self-following
    );

-- Users can delete their own follows (unfollow)
CREATE POLICY "Users can unfollow" ON follows
    FOR DELETE USING (
        auth.uid() = follower_id
    );

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON follows TO authenticated;
GRANT SELECT ON user_followers TO authenticated;
GRANT SELECT ON user_following TO authenticated;

-- Insert some sample data for testing
INSERT INTO follows (follower_id, following_id) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001'),
    ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002'),
    ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT (follower_id, following_id) DO NOTHING; 