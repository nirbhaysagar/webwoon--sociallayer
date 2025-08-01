-- =============================================
-- UPDATE STORES TABLE FOR USER INTEGRATION
-- =============================================

-- First, let's update the stores table to properly reference user_profiles
ALTER TABLE stores 
DROP CONSTRAINT IF EXISTS stores_owner_id_fkey;

-- Add proper foreign key constraint
ALTER TABLE stores 
ADD CONSTRAINT stores_owner_id_fkey 
FOREIGN KEY (owner_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Add seller-specific fields to stores table
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS business_type VARCHAR(50) DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS business_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS business_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS business_address JSONB,
ADD COLUMN IF NOT EXISTS payment_settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS shipping_settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS verification_documents JSONB,
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Add indexes for seller functionality
CREATE INDEX IF NOT EXISTS idx_stores_business_type ON stores(business_type);
CREATE INDEX IF NOT EXISTS idx_stores_verification_status ON stores(verification_status);
CREATE INDEX IF NOT EXISTS idx_stores_commission_rate ON stores(commission_rate);

-- Update RLS policies for stores
DROP POLICY IF EXISTS "Store owners can manage their stores" ON stores;
DROP POLICY IF EXISTS "Public can view active stores" ON stores;

CREATE POLICY "Store owners can manage their stores" ON stores
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Public can view active stores" ON stores
    FOR SELECT USING (store_status = 'active' AND verification_status = 'verified');

-- Function to create store for seller
CREATE OR REPLACE FUNCTION create_seller_store(
    p_owner_id UUID,
    p_store_data JSONB
) RETURNS UUID AS $$
DECLARE
    v_store_id UUID;
BEGIN
    -- Check if user is a seller
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = p_owner_id AND is_seller = true) THEN
        RAISE EXCEPTION 'User must be a seller to create a store';
    END IF;
    
    -- Create store
    INSERT INTO stores (
        name,
        slug,
        description,
        logo_url,
        banner_url,
        owner_id,
        business_type,
        business_phone,
        business_email,
        business_address,
        payment_settings,
        shipping_settings
    ) VALUES (
        p_store_data->>'name',
        p_store_data->>'slug',
        p_store_data->>'description',
        p_store_data->>'logo_url',
        p_store_data->>'banner_url',
        p_owner_id,
        COALESCE(p_store_data->>'business_type', 'individual'),
        p_store_data->>'business_phone',
        p_store_data->>'business_email',
        p_store_data->>'business_address',
        p_store_data->>'payment_settings',
        p_store_data->>'shipping_settings'
    ) RETURNING id INTO v_store_id;
    
    RETURN v_store_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update seller status
CREATE OR REPLACE FUNCTION update_seller_status(
    p_user_id UUID,
    p_is_seller BOOLEAN
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE user_profiles 
    SET 
        is_seller = p_is_seller,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 