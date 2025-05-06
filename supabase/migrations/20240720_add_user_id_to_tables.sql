/*
  # Add user_id to tables for data isolation

  1. Schema Updates
    - Add `user_id` column to `store_settings`, `categories`, and `products` tables
    - Set default value for `user_id` to the current authenticated user
    - Add foreign key constraints to link to auth.users
  
  2. Security
    - Update RLS policies to restrict access to user's own data
    - Add policies for authenticated users to manage their own data
*/

-- Add user_id to store_settings table
ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing store_settings to have a user_id if null
-- This is a placeholder migration - in production, you'd need to handle this differently
UPDATE store_settings 
SET user_id = (SELECT id FROM auth.users LIMIT 1)
WHERE user_id IS NULL;

-- Make user_id NOT NULL after updating existing records
ALTER TABLE store_settings 
ALTER COLUMN user_id SET NOT NULL;

-- Add user_id to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing categories to have a user_id if null
UPDATE categories 
SET user_id = (SELECT id FROM auth.users LIMIT 1)
WHERE user_id IS NULL;

-- Make user_id NOT NULL after updating existing records
ALTER TABLE categories 
ALTER COLUMN user_id SET NOT NULL;

-- Add user_id to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing products to have a user_id if null
UPDATE products 
SET user_id = (SELECT id FROM auth.users LIMIT 1)
WHERE user_id IS NULL;

-- Make user_id NOT NULL after updating existing records
ALTER TABLE products 
ALTER COLUMN user_id SET NOT NULL;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Anyone can view store settings" ON store_settings;
DROP POLICY IF EXISTS "Authenticated users can update store settings" ON store_settings;
DROP POLICY IF EXISTS "Authenticated users can insert store settings" ON store_settings;

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
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

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
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

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
ALTER TABLE stock_transactions 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing stock_transactions to have a user_id if null
UPDATE stock_transactions 
SET user_id = (SELECT id FROM auth.users LIMIT 1)
WHERE user_id IS NULL;

-- Make user_id NOT NULL after updating existing records
ALTER TABLE stock_transactions 
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;

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

-- Add default trigger to set user_id on insert
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for each table
CREATE TRIGGER set_store_settings_user_id
BEFORE INSERT ON store_settings
FOR EACH ROW
EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_categories_user_id
BEFORE INSERT ON categories
FOR EACH ROW
EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_products_user_id
BEFORE INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_stock_transactions_user_id
BEFORE INSERT ON stock_transactions
FOR EACH ROW
EXECUTE FUNCTION set_user_id();
