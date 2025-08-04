-- User Profile Management Database Schema
-- Supabase PostgreSQL Schema for complete user profile system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- USER PROFILE MANAGEMENT
-- =============================================

-- Enhanced users table with profile fields
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'non-binary', 'prefer_not_to_say'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS interests TEXT[];
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- User profile update history
CREATE TABLE IF NOT EXISTS public.user_profile_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email change requests
CREATE TABLE IF NOT EXISTS public.email_change_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    old_email TEXT NOT NULL,
    new_email TEXT NOT NULL,
    verification_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Phone verification codes
CREATE TABLE IF NOT EXISTS public.phone_verification_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    verification_code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipping addresses
CREATE TABLE IF NOT EXISTS public.shipping_addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'United States',
    address_type TEXT CHECK (address_type IN ('home', 'work', 'other')) DEFAULT 'home',
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions (for security)
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_user_profile_history_user_id ON public.user_profile_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profile_history_created_at ON public.user_profile_history(created_at);
CREATE INDEX IF NOT EXISTS idx_email_change_requests_user_id ON public.email_change_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_email_change_requests_token ON public.email_change_requests(verification_token);
CREATE INDEX IF NOT EXISTS idx_email_change_requests_expires_at ON public.email_change_requests(expires_at);
CREATE INDEX IF NOT EXISTS idx_phone_verification_codes_user_id ON public.phone_verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_verification_codes_expires_at ON public.phone_verification_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_user_id ON public.shipping_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_default ON public.shipping_addresses(user_id, is_default) WHERE is_default = TRUE;
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for shipping addresses
CREATE TRIGGER trigger_shipping_addresses_updated_at
    BEFORE UPDATE ON public.shipping_addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = TRUE THEN
        UPDATE public.shipping_addresses 
        SET is_default = FALSE 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for shipping addresses default constraint
CREATE TRIGGER trigger_ensure_single_default_address
    BEFORE INSERT OR UPDATE ON public.shipping_addresses
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_default_address();

-- Function to log profile changes
CREATE OR REPLACE FUNCTION log_profile_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.full_name IS DISTINCT FROM NEW.full_name THEN
        INSERT INTO public.user_profile_history (user_id, field_name, old_value, new_value)
        VALUES (NEW.id, 'full_name', OLD.full_name, NEW.full_name);
    END IF;
    
    IF OLD.email IS DISTINCT FROM NEW.email THEN
        INSERT INTO public.user_profile_history (user_id, field_name, old_value, new_value)
        VALUES (NEW.id, 'email', OLD.email, NEW.email);
    END IF;
    
    IF OLD.phone IS DISTINCT FROM NEW.phone THEN
        INSERT INTO public.user_profile_history (user_id, field_name, old_value, new_value)
        VALUES (NEW.id, 'phone', OLD.phone, NEW.phone);
    END IF;
    
    IF OLD.avatar_url IS DISTINCT FROM NEW.avatar_url THEN
        INSERT INTO public.user_profile_history (user_id, field_name, old_value, new_value)
        VALUES (NEW.id, 'avatar_url', OLD.avatar_url, NEW.avatar_url);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user profile changes
CREATE TRIGGER trigger_log_profile_changes
    AFTER UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION log_profile_change();

-- Function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM public.email_change_requests WHERE expires_at < NOW();
    DELETE FROM public.phone_verification_codes WHERE expires_at < NOW();
    DELETE FROM public.password_reset_tokens WHERE expires_at < NOW();
    DELETE FROM public.user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.user_profile_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- User profile history policies
CREATE POLICY "Users can view their own profile history" ON public.user_profile_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile history" ON public.user_profile_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Email change requests policies
CREATE POLICY "Users can manage their own email change requests" ON public.email_change_requests
    FOR ALL USING (auth.uid() = user_id);

-- Phone verification codes policies
CREATE POLICY "Users can manage their own phone verification codes" ON public.phone_verification_codes
    FOR ALL USING (auth.uid() = user_id);

-- Shipping addresses policies
CREATE POLICY "Users can manage their own shipping addresses" ON public.shipping_addresses
    FOR ALL USING (auth.uid() = user_id);

-- Password reset tokens policies
CREATE POLICY "Users can manage their own password reset tokens" ON public.password_reset_tokens
    FOR ALL USING (auth.uid() = user_id);

-- User sessions policies
CREATE POLICY "Users can manage their own sessions" ON public.user_sessions
    FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get user's default shipping address
CREATE OR REPLACE FUNCTION get_default_shipping_address(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT,
    address_type TEXT,
    is_default BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sa.id,
        sa.name,
        sa.phone,
        sa.address,
        sa.city,
        sa.state,
        sa.zip_code,
        sa.country,
        sa.address_type,
        sa.is_default
    FROM public.shipping_addresses sa
    WHERE sa.user_id = user_uuid AND sa.is_default = TRUE AND sa.is_active = TRUE
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's active shipping addresses
CREATE OR REPLACE FUNCTION get_user_shipping_addresses(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT,
    address_type TEXT,
    is_default BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sa.id,
        sa.name,
        sa.phone,
        sa.address,
        sa.city,
        sa.state,
        sa.zip_code,
        sa.country,
        sa.address_type,
        sa.is_default,
        sa.created_at
    FROM public.shipping_addresses sa
    WHERE sa.user_id = user_uuid AND sa.is_active = TRUE
    ORDER BY sa.is_default DESC, sa.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to check if email is available
CREATE OR REPLACE FUNCTION is_email_available(email_address TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM public.users WHERE email = email_address
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if username is available
CREATE OR REPLACE FUNCTION is_username_available(username_text TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM public.users WHERE username = username_text
    );
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profile_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_change_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.phone_verification_codes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipping_addresses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.password_reset_tokens TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_sessions TO authenticated;

GRANT EXECUTE ON FUNCTION get_default_shipping_address(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_shipping_addresses(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_email_available(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION is_username_available(TEXT) TO authenticated;

-- =============================================
-- SAMPLE DATA (for testing) - OPTIONAL
-- =============================================

-- Note: The sample data below is commented out to avoid foreign key constraint errors.
-- To use sample data, first create a user in the auth.users table, then uncomment and modify the user_id.

/*
-- Insert sample shipping addresses for testing (uncomment and modify user_id as needed)
INSERT INTO public.shipping_addresses (user_id, name, phone, address, city, state, zip_code, country, address_type, is_default) VALUES
    ('YOUR_USER_ID_HERE', 'Jane Doe', '+1 (555) 123-4567', '123 Main Street', 'New York', 'NY', '10001', 'United States', 'home', TRUE),
    ('YOUR_USER_ID_HERE', 'Jane Doe', '+1 (555) 123-4567', '456 Business Ave', 'New York', 'NY', '10002', 'United States', 'work', FALSE)
ON CONFLICT DO NOTHING;
*/ 