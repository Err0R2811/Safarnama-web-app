-- 👤 ADD PROFILES TABLE TO EXISTING DATABASE
-- This script will add the profiles table to your existing Safarnama database
-- ⚠️ Safe to run - will NOT delete existing trips or expenses data

-- Check if profiles table already exists and drop it if needed
DROP TABLE IF EXISTS profiles CASCADE;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  phone TEXT,
  address TEXT,
  bio TEXT,
  profile_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updating updated_at on profiles
-- (This reuses the existing update_updated_at_column function)
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX profiles_user_id_idx ON profiles(user_id);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Profiles table added successfully!';
    RAISE NOTICE '👤 Users can now create and manage profiles';
    RAISE NOTICE '🔐 Row Level Security enabled';
    RAISE NOTICE '⚡ Triggers and indexes created';
    RAISE NOTICE '📱 Profile feature ready to use!';
END $$;