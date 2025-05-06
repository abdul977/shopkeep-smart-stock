/*
  # Fix user_id columns and tables

  1. Schema Updates
    - Create `store_settings` table if it doesn't exist
    - Add `user_id` column to all tables that need it
    - Set default value for `user_id` to the current authenticated user
    - Add foreign key constraints to link to auth.users
  
  2. Security
    - Update RLS policies to restrict access to user's own data
    - Add policies for authenticated users to manage their own data
*/

-- Create store_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT NOT NULL DEFAULT 'ShopKeep Smart Stock',
  location TEXT,
  phone_number TEXT,
  logo_url TEXT,
  business_hours TEXT DEFAULT 'Mon-Sat: 9am - 6pm, Sun: Closed',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add user_id to categories table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE categories 
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add user_id to products table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add user_id to stock_transactions table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stock_transactions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE stock_transactions 
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add user_id to reports table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE reports 
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create or replace function to set user_id on insert
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for each table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'set_store_settings_user_id'
  ) THEN
    CREATE TRIGGER set_store_settings_user_id
    BEFORE INSERT ON store_settings
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'set_categories_user_id'
  ) THEN
    CREATE TRIGGER set_categories_user_id
    BEFORE INSERT ON categories
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'set_products_user_id'
  ) THEN
    CREATE TRIGGER set_products_user_id
    BEFORE INSERT ON products
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'set_stock_transactions_user_id'
  ) THEN
    CREATE TRIGGER set_stock_transactions_user_id
    BEFORE INSERT ON stock_transactions
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'set_reports_user_id'
  ) THEN
    CREATE TRIGGER set_reports_user_id
    BEFORE INSERT ON reports
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id();
  END IF;
END $$;

-- Enable Row Level Security on all tables
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view store settings" ON store_settings;
DROP POLICY IF EXISTS "Authenticated users can update store settings" ON store_settings;
DROP POLICY IF EXISTS "Authenticated users can insert store settings" ON store_settings;
DROP POLICY IF EXISTS "Users can view their own store settings" ON store_settings;
DROP POLICY IF EXISTS "Users can update their own store settings" ON store_settings;
DROP POLICY IF EXISTS "Users can insert their own store settings" ON store_settings;

-- Create new RLS policies for store_settings
CREATE POLICY "Users can view their own store settings"
  ON store_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own store settings"
  ON store_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own store settings"
  ON store_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for categories
DROP POLICY IF EXISTS "Users can view their own categories" ON categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;

CREATE POLICY "Users can view their own categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for products
DROP POLICY IF EXISTS "Users can view their own products" ON products;
DROP POLICY IF EXISTS "Users can update their own products" ON products;
DROP POLICY IF EXISTS "Users can insert their own products" ON products;
DROP POLICY IF EXISTS "Users can delete their own products" ON products;

CREATE POLICY "Users can view their own products"
  ON products
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
  ON products
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for stock_transactions
DROP POLICY IF EXISTS "Users can view their own stock_transactions" ON stock_transactions;
DROP POLICY IF EXISTS "Users can insert their own stock_transactions" ON stock_transactions;

CREATE POLICY "Users can view their own stock_transactions"
  ON stock_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stock_transactions"
  ON stock_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for reports
DROP POLICY IF EXISTS "Users can view their own reports" ON reports;
DROP POLICY IF EXISTS "Users can insert their own reports" ON reports;
DROP POLICY IF EXISTS "Users can delete their own reports" ON reports;

CREATE POLICY "Users can view their own reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
  ON reports
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert default store settings if none exist for the user
INSERT INTO store_settings (store_name, location, phone_number, business_hours)
SELECT 'ShopKeep Smart Stock', '123 Main Street, City', '+234 123 456 7890', 'Mon-Sat: 9am - 6pm, Sun: Closed'
WHERE NOT EXISTS (SELECT 1 FROM store_settings);
