/*
  # Create shopkeepers table

  1. New Tables
    - `shopkeepers`
      - `id` (uuid, primary key)
      - `owner_id` (uuid, references auth.users.id) - The store owner who created this shopkeeper
      - `email` (text, unique) - Email for the shopkeeper
      - `password` (text) - Hashed password for the shopkeeper
      - `name` (text) - Name of the shopkeeper
      - `active` (boolean) - Whether the shopkeeper account is active
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
  
  2. Security
    - Enable RLS on `shopkeepers` table
    - Add policies for store owners to manage their shopkeepers
*/

-- Create shopkeepers table
CREATE TABLE IF NOT EXISTS shopkeepers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE shopkeepers ENABLE ROW LEVEL SECURITY;

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_shopkeepers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shopkeepers_updated_at
BEFORE UPDATE ON shopkeepers
FOR EACH ROW
EXECUTE FUNCTION update_shopkeepers_updated_at();

-- Create policies for store owners to manage their shopkeepers
CREATE POLICY "Store owners can view their shopkeepers"
  ON shopkeepers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Store owners can insert shopkeepers"
  ON shopkeepers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Store owners can update their shopkeepers"
  ON shopkeepers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Store owners can delete their shopkeepers"
  ON shopkeepers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);
