/*
  # Ensure stock_transactions table exists

  1. Schema Updates
    - Checks if stock_transactions table exists and creates it if not
    - Ensures all required columns are present
    - Adds RLS policy to allow all authenticated users to perform all operations
*/

-- Create stock_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS stock_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  notes TEXT,
  transaction_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add user_id column if it doesn't exist
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

-- Enable RLS on stock_transactions
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all authenticated users" ON stock_transactions;

-- Create a simple policy that allows all authenticated users to perform all operations
CREATE POLICY "Allow all authenticated users"
  ON stock_transactions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
