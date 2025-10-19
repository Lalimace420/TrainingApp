-- Script SQL pour configurer la base de données Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- Table des profils (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  current_weight numeric,
  target_weight numeric,
  height numeric,
  age integer,
  goal text,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table pour suivre les pesées hebdomadaires
CREATE TABLE IF NOT EXISTS weight_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  weight numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes pour améliorer les performances
CREATE INDEX IF NOT EXISTS weight_entries_user_id_idx ON weight_entries(user_id);
CREATE INDEX IF NOT EXISTS weight_entries_date_idx ON weight_entries(date);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;

-- Policies pour profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policies pour weight_entries
DROP POLICY IF EXISTS "Users can view own weight entries" ON weight_entries;
CREATE POLICY "Users can view own weight entries"
  ON weight_entries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own weight entries" ON weight_entries;
CREATE POLICY "Users can insert own weight entries"
  ON weight_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own weight entries" ON weight_entries;
CREATE POLICY "Users can update own weight entries"
  ON weight_entries FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own weight entries" ON weight_entries;
CREATE POLICY "Users can delete own weight entries"
  ON weight_entries FOR DELETE
  USING (auth.uid() = user_id);
