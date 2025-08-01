-- =============================================
-- VERIFY SCHEMA CREATION
-- =============================================

-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'product_%' 
OR table_name = 'stores'
ORDER BY table_name;

-- Check table structure for main tables
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Count tables created
SELECT COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE 'product_%' OR table_name = 'stores'); 