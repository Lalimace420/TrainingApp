-- ============================================
-- SCHEMA SUPABASE POUR TRAINING APP
-- ============================================

-- 1. Table des utilisateurs (avec username au lieu d'email)
CREATE TABLE IF NOT EXISTS custom_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide par username
CREATE INDEX IF NOT EXISTS idx_custom_users_username ON custom_users(username);

-- 2. Table des profils
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES custom_users(id) ON DELETE CASCADE,
  full_name TEXT,
  current_weight NUMERIC,
  target_weight NUMERIC,
  height NUMERIC,
  age INTEGER,
  goal TEXT,
  sessions_per_week INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table des pesées
CREATE TABLE IF NOT EXISTS weight_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES custom_users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide par user_id
CREATE INDEX IF NOT EXISTS idx_weight_entries_user_id ON weight_entries(user_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE custom_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;

-- 5. Policies - Pour l'instant on permet tout (tu pourras sécuriser plus tard)
CREATE POLICY "Allow all operations on custom_users" ON custom_users FOR ALL USING (true);
CREATE POLICY "Allow all operations on profiles" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations on weight_entries" ON weight_entries FOR ALL USING (true);

-- ============================================
-- INSTRUCTIONS :
-- ============================================
-- 1. Va sur ton dashboard Supabase
-- 2. Clique sur "SQL Editor" dans le menu de gauche
-- 3. Copie-colle tout ce fichier
-- 4. Clique sur "Run" pour exécuter
-- ============================================
