/*
  # Fix store settings table

  1. Ensures Tables Exist
    - `store_settings` - Recreates the table if it doesn't exist
  2. Security
    - Enables RLS on the table
    - Adds appropriate policies
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
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Create policies (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'store_settings' AND policyname = 'Anyone can view store settings'
  ) THEN
    CREATE POLICY "Anyone can view store settings"
      ON store_settings
      FOR SELECT
      TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'store_settings' AND policyname = 'Authenticated users can update store settings'
  ) THEN
    CREATE POLICY "Authenticated users can update store settings"
      ON store_settings
      FOR UPDATE
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'store_settings' AND policyname = 'Authenticated users can insert store settings'
  ) THEN
    CREATE POLICY "Authenticated users can insert store settings"
      ON store_settings
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Insert default store settings if none exist
INSERT INTO store_settings (store_name, location, phone_number, business_hours)
SELECT 'ShopKeep Smart Stock', '123 Main Street, City', '+234 123 456 7890', 'Mon-Sat: 9am - 6pm, Sun: Closed'
WHERE NOT EXISTS (SELECT 1 FROM store_settings);
