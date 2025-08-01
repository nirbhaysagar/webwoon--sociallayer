-- Complete Authentication Setup for SocialSpark (No Sample Data)
-- This file creates the entire user and seller profile system from scratch

-- ========================================
-- 1. CREATE TABLES
-- ========================================

-- User Profiles Table
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

-- Seller Profiles Table
CREATE TABLE IF NOT EXISTS seller_profiles (
  id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Business Information
  business_name TEXT NOT NULL,
  business_type TEXT,
  business_description TEXT,
  business_address JSONB,
  business_phone TEXT,
  business_email TEXT,
  business_website TEXT,
  business_hours JSONB,
  business_categories TEXT[],
  business_verified BOOLEAN DEFAULT FALSE,
  
  -- Business Statistics
  total_products INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0.00,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  
  -- Business Settings
  commission_rate DECIMAL(5,2) DEFAULT 10.00, -- Default 10% commission
  payout_method TEXT,
  payout_email TEXT,
  tax_id TEXT,
  
  -- Business Status
  is_approved BOOLEAN DEFAULT FALSE,
  approval_date TIMESTAMP WITH TIME ZONE,
  approval_notes TEXT,
  
  -- Business Hours
  business_hours_schedule JSONB DEFAULT '{
    "monday": {"open": "09:00", "close": "17:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
    "thursday": {"open": "09:00", "close": "17:00", "closed": false},
    "friday": {"open": "09:00", "close": "17:00", "closed": false},
    "saturday": {"open": "10:00", "close": "15:00", "closed": false},
    "sunday": {"open": "10:00", "close": "15:00", "closed": true}
  }',
  
  -- Business Policies
  return_policy TEXT,
  shipping_policy TEXT,
  privacy_policy TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. CREATE INDEXES
-- ========================================

-- User profile indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_verified ON user_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_active_at ON user_profiles(last_active_at);

-- Seller profile indexes
CREATE INDEX IF NOT EXISTS idx_seller_profiles_business_name ON seller_profiles(business_name);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_is_approved ON seller_profiles(is_approved);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_business_categories ON seller_profiles USING GIN (business_categories);

-- GIN indexes for JSONB fields
CREATE INDEX IF NOT EXISTS idx_user_profiles_preferences ON user_profiles USING GIN (preferences);
CREATE INDEX IF NOT EXISTS idx_user_profiles_stats ON user_profiles USING GIN (stats);
CREATE INDEX IF NOT EXISTS idx_user_profiles_social_links ON user_profiles USING GIN (social_links);
CREATE INDEX IF NOT EXISTS idx_user_profiles_metadata ON user_profiles USING GIN (metadata);

-- ========================================
-- 3. CREATE FUNCTIONS
-- ========================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update seller profiles updated_at
CREATE OR REPLACE FUNCTION update_seller_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Function to update last_active_at
CREATE OR REPLACE FUNCTION update_last_active_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 4. DROP EXISTING TRIGGERS (SAFE)
-- ========================================

DROP TRIGGER IF EXISTS trigger_update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS trigger_update_seller_profiles_updated_at ON seller_profiles;
DROP TRIGGER IF EXISTS trigger_set_user_profiles_member_since ON user_profiles;
DROP TRIGGER IF EXISTS trigger_update_user_level ON user_profiles;
DROP TRIGGER IF EXISTS trigger_update_last_active_at ON user_profiles;

-- ========================================
-- 5. CREATE TRIGGERS
-- ========================================

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

CREATE TRIGGER trigger_update_seller_profiles_updated_at
  BEFORE UPDATE ON seller_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_seller_profiles_updated_at();

-- Trigger to set member_since on insert
CREATE TRIGGER trigger_set_user_profiles_member_since
  BEFORE INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_user_profiles_member_since();

-- Trigger to update user level when total_spent changes
CREATE TRIGGER trigger_update_user_level
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  WHEN (OLD.stats->>'total_spent' IS DISTINCT FROM NEW.stats->>'total_spent')
  EXECUTE FUNCTION update_user_level();

-- Trigger to update last_active_at on any update
CREATE TRIGGER trigger_update_last_active_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_last_active_at();

-- ========================================
-- 6. ENABLE ROW LEVEL SECURITY
-- ========================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 7. DROP EXISTING POLICIES (SAFE)
-- ========================================

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Sellers can view own seller profile" ON seller_profiles;
DROP POLICY IF EXISTS "Sellers can update own seller profile" ON seller_profiles;
DROP POLICY IF EXISTS "Sellers can insert own seller profile" ON seller_profiles;

-- ========================================
-- 8. CREATE SECURITY POLICIES
-- ========================================

-- User profile policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Simplified public profiles policy (removed complex JSONB access)
CREATE POLICY "Public profiles are viewable" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Seller profile policies
CREATE POLICY "Sellers can view own seller profile" ON seller_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Sellers can update own seller profile" ON seller_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Sellers can insert own seller profile" ON seller_profiles
  FOR INSERT WITH CHECK (auth.uid() = id); 