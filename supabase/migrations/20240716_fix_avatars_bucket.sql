/*
  # Fix avatars storage bucket

  1. Ensures Storage Buckets Exist
    - `avatars` - For storing user profile avatars
  2. Security
    - Enables public access for avatars
    - Adds appropriate policies for authenticated users
*/

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies to recreate them
DO $$
BEGIN
  -- Drop existing policies if they exist
  BEGIN
    DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Anyone can read avatars" ON storage.objects;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Authenticated users can delete avatars" ON storage.objects;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist, continue
  END;
END $$;

-- Create policy to allow authenticated users to upload avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Create policy to allow authenticated users to update avatars
CREATE POLICY "Authenticated users can update avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- Create policy to allow anyone to read avatars
CREATE POLICY "Anyone can read avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Create policy to allow authenticated users to delete their avatars
CREATE POLICY "Authenticated users can delete avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');
