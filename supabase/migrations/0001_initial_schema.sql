-- Create tables
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  theme_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE contact_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  icon TEXT,
  enabled BOOLEAN DEFAULT TRUE NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX idx_contact_methods_profile_id ON contact_methods(profile_id);
CREATE INDEX idx_contact_methods_enabled ON contact_methods(enabled);
CREATE INDEX idx_contact_methods_sort_order ON contact_methods(sort_order);

-- Setup Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_methods ENABLE ROW LEVEL SECURITY;

-- 
-- RLS Policies for `profiles`
--

-- Public can read all profiles (only fields intended for public display are in this table anyway)
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile."
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile."
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- 
-- RLS Policies for `contact_methods`
--

-- Public can read ONLY enabled contact methods
CREATE POLICY "Public contact methods are viewable by everyone if enabled."
  ON contact_methods FOR SELECT
  USING (enabled = true);

-- Owners can read ALL their own contact methods (including disabled ones)
CREATE POLICY "Users can view all their own contact methods."
  ON contact_methods FOR SELECT
  USING (auth.uid() = profile_id);

-- Owners can insert their own contact methods
CREATE POLICY "Users can insert their own contact methods."
  ON contact_methods FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Owners can update their own contact methods
CREATE POLICY "Users can update their own contact methods."
  ON contact_methods FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- Owners can delete their own contact methods
CREATE POLICY "Users can delete their own contact methods."
  ON contact_methods FOR DELETE
  USING (auth.uid() = profile_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$ language 'plpgsql';

-- Add triggers to update updated_at automatically
CREATE TRIGGER update_profiles_modtime 
BEFORE UPDATE ON profiles 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_contact_methods_modtime 
BEFORE UPDATE ON contact_methods 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
