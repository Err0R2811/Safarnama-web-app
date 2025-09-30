-- 🔍 DATABASE STATUS CHECK
-- Run this script to see the current state of your Safarnama database

-- Check if UUID extension is installed
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') 
        THEN '✅ UUID extension is installed'
        ELSE '❌ UUID extension is NOT installed'
    END AS uuid_status;

-- List all tables in your database
SELECT 
    '📊 Current Tables:' AS info,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if required functions exist
SELECT 
    '⚡ Functions Status:' AS info,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('update_updated_at_column', 'update_trip_total_expenses', 'generate_trip_number');

-- Check if profiles table exists and its structure
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public')
        THEN '✅ Profiles table exists'
        ELSE '❌ Profiles table does NOT exist'
    END AS profiles_status;

-- If profiles table exists, show its columns
SELECT 
    '👤 Profiles Table Structure:' AS info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check RLS policies on profiles table
SELECT 
    '🔐 Profiles Table Policies:' AS info,
    schemaname,
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'profiles';

-- Check if Row Level Security is enabled
SELECT 
    '🛡️ RLS Status:' AS info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    forcerowsecurity as force_rls
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('trips', 'expenses', 'profiles');

-- Check current user permissions
SELECT 
    '👤 Current User:' AS info,
    current_user as username,
    current_database() as database_name;

-- Test basic functionality
DO $$
BEGIN
    -- Test if we can create a UUID
    PERFORM uuid_generate_v4();
    RAISE NOTICE '✅ UUID generation works';
    
    -- Test if update function exists
    PERFORM update_updated_at_column();
    RAISE NOTICE '❌ update_updated_at_column function call failed';
EXCEPTION
    WHEN undefined_function THEN
        RAISE NOTICE '❌ update_updated_at_column function does not exist';
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ update_updated_at_column function exists but needs trigger context';
END $$;