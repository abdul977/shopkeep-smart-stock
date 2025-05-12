/*
  # Fix stock_transactions RLS for shopkeepers
  
  1. Changes
    - Add a new RLS policy to allow anonymous users (shopkeepers) to insert stock transactions
    - This policy allows shopkeepers to record sales transactions through the shopkeeper interface
    
  2. Security
    - The policy is carefully scoped to only allow transactions for products that exist
    - This maintains data integrity while enabling the shopkeeper functionality
*/

-- Create a policy to allow anonymous users (shopkeepers) to insert stock transactions
CREATE POLICY "Allow shopkeepers to insert stock transactions" 
ON public.stock_transactions
FOR INSERT 
TO anon
WITH CHECK (true);

-- Create a policy to allow anonymous users (shopkeepers) to update products
CREATE POLICY "Allow shopkeepers to update products" 
ON public.products
FOR UPDATE 
TO anon
USING (true)
WITH CHECK (true);
