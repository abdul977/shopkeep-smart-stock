/*
  # Create store settings table

  1. New Tables
    - `store_settings`
      - `id` (uuid, primary key)
      - `store_name` (text)
      - `location` (text)
      - `phone_number` (text)
      - `logo_url` (text)
      - `business_hours` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
  2. Security
    - Enable RLS on `store_settings` table
    - Add policies for authenticated users to read and update store settings
*/

-- Create store_settings table
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

-- Create policies
CREATE POLICY "Anyone can view store settings"
  ON store_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update store settings"
  ON store_settings
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert store settings"
  ON store_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default store settings if none exist
INSERT INTO store_settings (store_name, location, phone_number, business_hours)
VALUES ('ShopKeep Smart Stock', '123 Main Street, City', '+234 123 456 7890', 'Mon-Sat: 9am - 6pm, Sun: Closed')
ON CONFLICT DO NOTHING;
