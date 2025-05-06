/*
  # Add share_id to store_settings table

  1. Schema Updates
    - Add `share_id` column to `store_settings` table
    - This column will store a unique identifier for each store's public share link
    - Set default value to a random UUID
  
  2. Updates
    - Generate share_id for existing records that don't have one
*/

-- Add share_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'store_settings' AND column_name = 'share_id'
  ) THEN
    ALTER TABLE store_settings 
    ADD COLUMN share_id TEXT UNIQUE DEFAULT gen_random_uuid();
  END IF;
END $$;

-- Update existing records to have a share_id if null
UPDATE store_settings 
SET share_id = gen_random_uuid()::text
WHERE share_id IS NULL;
