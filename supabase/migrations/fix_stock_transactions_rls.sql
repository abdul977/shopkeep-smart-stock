/*
  # Fix stock_transactions RLS policies

  1. Security Updates
    - Drops and recreates RLS policies for stock_transactions table
    - Ensures shopkeepers can insert transactions on behalf of store owners
    - Fixes 401 Unauthorized errors when checking out
*/

-- First, check if RLS is enabled on stock_transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'stock_transactions' AND rowsecurity = true
  ) THEN
    ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own stock_transactions" ON stock_transactions;
DROP POLICY IF EXISTS "Users can insert their own stock_transactions" ON stock_transactions;
DROP POLICY IF EXISTS "Shopkeepers can view owner stock_transactions" ON stock_transactions;
DROP POLICY IF EXISTS "Shopkeepers can insert owner stock_transactions" ON stock_transactions;

-- Create new policies for authenticated users
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

-- Create a function to check if a user is a shopkeeper for an owner
CREATE OR REPLACE FUNCTION is_shopkeeper_for_owner(shopkeeper_id uuid, owner_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM shopkeepers
    WHERE id = shopkeeper_id AND owner_id = owner_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies for shopkeepers to view and insert transactions for their owners
CREATE POLICY "Shopkeepers can view owner stock_transactions"
  ON stock_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shopkeepers
      WHERE shopkeepers.id = auth.uid() AND shopkeepers.owner_id = stock_transactions.user_id
    )
  );

-- Allow shopkeepers to insert transactions on behalf of their owners
CREATE POLICY "Shopkeepers can insert owner stock_transactions"
  ON stock_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shopkeepers
      WHERE shopkeepers.id = auth.uid() AND shopkeepers.owner_id = user_id
    )
  );

-- Allow shopkeepers to update transactions for their owners
CREATE POLICY "Shopkeepers can update owner stock_transactions"
  ON stock_transactions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shopkeepers
      WHERE shopkeepers.id = auth.uid() AND shopkeepers.owner_id = stock_transactions.user_id
    )
  );
