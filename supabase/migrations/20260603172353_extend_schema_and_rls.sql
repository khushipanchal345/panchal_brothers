/*
  # Extend existing schema with missing columns and enable RLS on new tables

  ## Changes
  1. Add sale_price and is_featured columns to products
  2. Add sort_order and is_active columns to categories
  3. Enable RLS and add policies on brands, cart_items, wishlist_items, order_items
  4. Add admin auth support via Supabase Auth
  5. Update admins table to support password-based login
*/

-- Add missing columns to products
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='sale_price') THEN
    ALTER TABLE products ADD COLUMN sale_price numeric(10,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='is_featured') THEN
    ALTER TABLE products ADD COLUMN is_featured boolean DEFAULT false;
  END IF;
END $$;

-- Add missing columns to categories
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='sort_order') THEN
    ALTER TABLE categories ADD COLUMN sort_order integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='is_active') THEN
    ALTER TABLE categories ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- Update categories sort order
UPDATE categories SET sort_order = CASE slug
  WHEN 'running' THEN 1
  WHEN 'training' THEN 2
  WHEN 'lifestyle' THEN 3
  WHEN 'basketball' THEN 4
  WHEN 'soccer' THEN 5
  WHEN 'tennis' THEN 6
  ELSE 99
END WHERE sort_order = 0;

-- Enable RLS on brands table
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Brands public read" ON brands FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Brands auth insert" ON brands FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Brands auth update" ON brands FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Brands auth delete" ON brands FOR DELETE TO authenticated USING (true);

-- Enable RLS on cart_items table
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cart items public read" ON cart_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Cart items public insert" ON cart_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Cart items public update" ON cart_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Cart items public delete" ON cart_items FOR DELETE TO anon, authenticated USING (true);

-- Enable RLS on wishlist_items table
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Wishlist items public read" ON wishlist_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Wishlist items public insert" ON wishlist_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Wishlist items public delete" ON wishlist_items FOR DELETE TO anon, authenticated USING (true);

-- Enable RLS on order_items table
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order items public read" ON order_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Order items public insert" ON order_items FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Update admins table: add email and password_hash columns for standalone auth
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admins' AND column_name='email') THEN
    ALTER TABLE admins ADD COLUMN email text UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admins' AND column_name='password_hash') THEN
    ALTER TABLE admins ADD COLUMN password_hash text;
  END IF;
END $$;

-- Create pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert default admin (username: admin, password: Admin@123)
INSERT INTO admins (username, email, password_hash)
VALUES ('admin', 'admin@sneakstore.com', crypt('Admin@123', gen_salt('bf')))
ON CONFLICT (username) DO UPDATE SET 
  password_hash = crypt('Admin@123', gen_salt('bf')),
  email = 'admin@sneakstore.com';

-- Add RLS policy for admins to allow password verification via anon role
DROP POLICY IF EXISTS "No public access to admins" ON admins;
CREATE POLICY "Allow admin login check" ON admins FOR SELECT TO anon, authenticated USING (true);

-- Mark some products as featured
UPDATE products SET is_featured = true WHERE name IN ('Batman--The Dark Knight Running Shoes', 'Ultraboost 24', 'MB.03 "Rick Minaj"');

-- Add sale prices to some products
UPDATE products SET sale_price = price * 0.85 WHERE name IN ('Stan Smith', 'RS-X Efekt', 'Predator Accuracy');
