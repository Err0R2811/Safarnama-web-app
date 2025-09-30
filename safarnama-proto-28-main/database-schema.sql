-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trip_number TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  travel_mode TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  notes TEXT,
  travelers TEXT[] DEFAULT '{}',
  total_expenses DECIMAL(10,2) DEFAULT 0,
  status TEXT CHECK (status IN ('planning', 'in_progress', 'completed')) DEFAULT 'planning',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT CHECK (category IN ('transport', 'food', 'accommodation', 'entertainment', 'other')) NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating updated_at
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update total_expenses on trips table
CREATE OR REPLACE FUNCTION update_trip_total_expenses()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE trips 
    SET total_expenses = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM expenses 
        WHERE trip_id = COALESCE(NEW.trip_id, OLD.trip_id)
    )
    WHERE id = COALESCE(NEW.trip_id, OLD.trip_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create triggers for updating total expenses
CREATE TRIGGER update_trip_expenses_insert AFTER INSERT ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_trip_total_expenses();

CREATE TRIGGER update_trip_expenses_update AFTER UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_trip_total_expenses();

CREATE TRIGGER update_trip_expenses_delete AFTER DELETE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_trip_total_expenses();

-- Enable Row Level Security
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trips
CREATE POLICY "Users can view own trips" ON trips
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trips" ON trips
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips" ON trips
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips" ON trips
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for expenses
CREATE POLICY "Users can view own expenses" ON expenses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON expenses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON expenses
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX trips_user_id_idx ON trips(user_id);
CREATE INDEX trips_status_idx ON trips(status);
CREATE INDEX trips_created_at_idx ON trips(created_at);
CREATE INDEX expenses_trip_id_idx ON expenses(trip_id);
CREATE INDEX expenses_user_id_idx ON expenses(user_id);
CREATE INDEX expenses_category_idx ON expenses(category);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
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
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX profiles_user_id_idx ON profiles(user_id);

-- Create function to generate trip numbers
CREATE OR REPLACE FUNCTION generate_trip_number(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    trip_count INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO trip_count
    FROM trips
    WHERE user_id = user_uuid;
    
    RETURN 'TR' || LPAD(trip_count::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;
