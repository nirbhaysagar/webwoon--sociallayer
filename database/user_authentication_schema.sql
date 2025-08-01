-- =============================================
-- USER AUTHENTICATION & PROFILES SCHEMA
-- =============================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;

-- User Profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic Info
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(150),
    
    -- Contact Info
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    
    -- Profile Info
    avatar_url TEXT,
    bio TEXT,
    website_url TEXT,
    
    -- Account Status
    is_verified BOOLEAN DEFAULT false,
    is_seller BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    account_status VARCHAR(50) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'banned')),
    
    -- Preferences
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Privacy
    is_public_profile BOOLEAN DEFAULT true,
    allow_marketing_emails BOOLEAN DEFAULT true,
    allow_notifications BOOLEAN DEFAULT true,
    
    -- Analytics
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Addresses
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Address Info
    address_type VARCHAR(20) DEFAULT 'shipping' CHECK (address_type IN ('shipping', 'billing', 'both')),
    is_default BOOLEAN DEFAULT false,
    
    -- Contact
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(100),
    phone VARCHAR(20),
    
    -- Address
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    
    -- Additional Info
    instructions TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Preferences
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Shopping Preferences
    preferred_categories TEXT[],
    preferred_brands TEXT[],
    price_range_min DECIMAL(10,2),
    price_range_max DECIMAL(10,2),
    
    -- Notification Preferences
    email_notifications JSONB DEFAULT '{}',
    push_notifications JSONB DEFAULT '{}',
    sms_notifications JSONB DEFAULT '{}',
    
    -- Display Preferences
    theme VARCHAR(20) DEFAULT 'light',
    compact_mode BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- User Sessions (for tracking)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Session Info
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_type VARCHAR(50),
    device_id VARCHAR(255),
    user_agent TEXT,
    ip_address INET,
    
    -- Location
    country VARCHAR(100),
    city VARCHAR(100),
    timezone VARCHAR(50),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- User Profiles Indexes
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_is_seller ON user_profiles(is_seller);
CREATE INDEX idx_user_profiles_account_status ON user_profiles(account_status);
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at);

-- User Addresses Indexes
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_address_type ON user_addresses(address_type);
CREATE INDEX idx_user_addresses_is_default ON user_addresses(is_default);

-- User Sessions Indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Public profiles can be viewed by anyone
CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles
    FOR SELECT USING (is_public_profile = true);

-- User Addresses Policies
CREATE POLICY "Users can manage their own addresses" ON user_addresses
    FOR ALL USING (auth.uid() = user_id);

-- User Preferences Policies
CREATE POLICY "Users can manage their own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- User Sessions Policies
CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON user_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update user profile
CREATE OR REPLACE FUNCTION update_user_profile(
    p_user_id UUID,
    p_data JSONB
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE user_profiles 
    SET 
        first_name = COALESCE(p_data->>'first_name', first_name),
        last_name = COALESCE(p_data->>'last_name', last_name),
        display_name = COALESCE(p_data->>'display_name', display_name),
        phone = COALESCE(p_data->>'phone', phone),
        date_of_birth = COALESCE((p_data->>'date_of_birth')::DATE, date_of_birth),
        gender = COALESCE(p_data->>'gender', gender),
        avatar_url = COALESCE(p_data->>'avatar_url', avatar_url),
        bio = COALESCE(p_data->>'bio', bio),
        website_url = COALESCE(p_data->>'website_url', website_url),
        language = COALESCE(p_data->>'language', language),
        timezone = COALESCE(p_data->>'timezone', timezone),
        currency = COALESCE(p_data->>'currency', currency),
        is_public_profile = COALESCE((p_data->>'is_public_profile')::BOOLEAN, is_public_profile),
        allow_marketing_emails = COALESCE((p_data->>'allow_marketing_emails')::BOOLEAN, allow_marketing_emails),
        allow_notifications = COALESCE((p_data->>'allow_notifications')::BOOLEAN, allow_notifications),
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email, username, first_name, last_name, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        COALESCE(
            NEW.raw_user_meta_data->>'display_name',
            CONCAT(
                COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
                ' ',
                COALESCE(NEW.raw_user_meta_data->>'last_name', '')
            )
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update last login
CREATE OR REPLACE FUNCTION update_last_login(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE user_profiles 
    SET 
        last_login_at = NOW(),
        login_count = login_count + 1
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 