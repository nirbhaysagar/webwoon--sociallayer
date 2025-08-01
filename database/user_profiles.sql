-- User Profiles Table
-- This table stores extended user profile information beyond the basic auth user

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'seller', 'admin')),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User preferences stored as JSONB for flexibility
  preferences JSONB DEFAULT '{
    "notifications": {
      "orders": true,
      "promotions": true,
      "products": true,
      "messages": true,
      "system": true,
      "marketing": false
    },
    "privacy": {
      "profile_visible": true,
      "show_email": false,
      "show_phone": false
    },
    "theme": "auto",
    "language": "en"
  }',
  
  -- User statistics and achievements
  stats JSONB DEFAULT '{
    "total_orders": 0,
    "total_spent": 0,
    "member_since": null,
    "level": "bronze",
    "points": 0
  }',
  
  -- Additional profile fields
  bio TEXT,
  location TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{}',
  
  -- Seller-specific fields (null for regular users)
  business_name TEXT,
  business_type TEXT,
  business_description TEXT,
  business_address JSONB,
  business_phone TEXT,
  business_email TEXT,
  business_website TEXT,
  business_hours JSONB,
  business_categories TEXT[],
  business_verified BOOLEAN DEFAULT FALSE,
  
  -- Account status
  is_active BOOLEAN DEFAULT TRUE,
  is_suspended BOOLEAN DEFAULT FALSE,
  suspension_reason TEXT,
  suspension_until TIMESTAMP WITH TIME ZONE,
  
  -- Verification fields
  email_verified_at TIMESTAMP WITH TIME ZONE,
  phone_verified_at TIMESTAMP WITH TIME ZONE,
  identity_verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Last activity tracking
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_active_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_verified ON user_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_active_at ON user_profiles(last_active_at);

-- GIN indexes for JSONB fields
CREATE INDEX IF NOT EXISTS idx_user_profiles_preferences ON user_profiles USING GIN (preferences);
CREATE INDEX IF NOT EXISTS idx_user_profiles_stats ON user_profiles USING GIN (stats);
CREATE INDEX IF NOT EXISTS idx_user_profiles_social_links ON user_profiles USING GIN (social_links);
CREATE INDEX IF NOT EXISTS idx_user_profiles_metadata ON user_profiles USING GIN (metadata);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Function to set member_since on insert
CREATE OR REPLACE FUNCTION set_user_profiles_member_since()
RETURNS TRIGGER AS $$
BEGIN
  NEW.stats = jsonb_set(
    COALESCE(NEW.stats, '{}'),
    '{member_since}',
    to_jsonb(NOW())
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set member_since on insert
CREATE TRIGGER trigger_set_user_profiles_member_since
  BEFORE INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_user_profiles_member_since();

-- Row Level Security (RLS) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Public profiles can be viewed by anyone (if profile_visible is true)
CREATE POLICY "Public profiles are viewable" ON user_profiles
  FOR SELECT USING (
    (preferences->>'privacy'->>'profile_visible')::boolean = true
  );

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to get user level based on total spent
CREATE OR REPLACE FUNCTION get_user_level(total_spent NUMERIC)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE
    WHEN total_spent >= 10000 THEN 'platinum'
    WHEN total_spent >= 5000 THEN 'gold'
    WHEN total_spent >= 1000 THEN 'silver'
    ELSE 'bronze'
  END;
END;
$$ LANGUAGE plpgsql;

-- Function to update user level based on total spent
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.stats = jsonb_set(
    NEW.stats,
    '{level}',
    to_jsonb(get_user_level((NEW.stats->>'total_spent')::NUMERIC))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user level when total_spent changes
CREATE TRIGGER trigger_update_user_level
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  WHEN (OLD.stats->>'total_spent' IS DISTINCT FROM NEW.stats->>'total_spent')
  EXECUTE FUNCTION update_user_level();

-- Function to update last_active_at
CREATE OR REPLACE FUNCTION update_last_active_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_active_at on any update
CREATE TRIGGER trigger_update_last_active_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_last_active_at();

-- Insert some sample user profiles for testing
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  username,
  role,
  is_verified,
  preferences,
  stats,
  bio,
  location
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440001',
  'john.doe@example.com',
  'John Doe',
  'johndoe',
  'user',
  true,
  '{
    "notifications": {
      "orders": true,
      "promotions": true,
      "products": true,
      "messages": true,
      "system": true,
      "marketing": false
    },
    "privacy": {
      "profile_visible": true,
      "show_email": false,
      "show_phone": false
    },
    "theme": "auto",
    "language": "en"
  }',
  '{
    "total_orders": 15,
    "total_spent": 2500.00,
    "member_since": "2023-01-15T00:00:00Z",
    "level": "silver",
    "points": 1250
  }',
  'Tech enthusiast and avid online shopper',
  'New York, NY'
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'jane.smith@example.com',
  'Jane Smith',
  'janesmith',
  'seller',
  true,
  '{
    "notifications": {
      "orders": true,
      "promotions": true,
      "products": true,
      "messages": true,
      "system": true,
      "marketing": true
    },
    "privacy": {
      "profile_visible": true,
      "show_email": true,
      "show_phone": false
    },
    "theme": "light",
    "language": "en"
  }',
  '{
    "total_orders": 0,
    "total_spent": 0,
    "member_since": "2023-03-20T00:00:00Z",
    "level": "bronze",
    "points": 0
  }',
  'Fashion designer and boutique owner',
  'Los Angeles, CA'
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'admin@socialspark.com',
  'Admin User',
  'admin',
  'admin',
  true,
  '{
    "notifications": {
      "orders": true,
      "promotions": true,
      "products": true,
      "messages": true,
      "system": true,
      "marketing": true
    },
    "privacy": {
      "profile_visible": false,
      "show_email": false,
      "show_phone": false
    },
    "theme": "dark",
    "language": "en"
  }',
  '{
    "total_orders": 0,
    "total_spent": 0,
    "member_since": "2023-01-01T00:00:00Z",
    "level": "bronze",
    "points": 0
  }',
  'System Administrator',
  'San Francisco, CA'
)
ON CONFLICT (id) DO NOTHING; 