-- Add benefits column to menu_items for product benefits
ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS benefits TEXT[] DEFAULT '{}';

-- Update order_status enum to e-commerce flow
-- First drop and recreate the enum with new values
ALTER TYPE public.order_status RENAME TO order_status_old;

CREATE TYPE public.order_status AS ENUM (
  'placed',
  'confirmed', 
  'dispatched',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled'
);

-- Update orders table to use new enum
ALTER TABLE public.orders 
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status TYPE public.order_status USING 
    CASE status::text
      WHEN 'pending' THEN 'placed'::public.order_status
      WHEN 'confirmed' THEN 'confirmed'::public.order_status
      WHEN 'preparing' THEN 'confirmed'::public.order_status
      WHEN 'out_for_delivery' THEN 'out_for_delivery'::public.order_status
      WHEN 'delivered' THEN 'delivered'::public.order_status
      WHEN 'cancelled' THEN 'cancelled'::public.order_status
      ELSE 'placed'::public.order_status
    END,
  ALTER COLUMN status SET DEFAULT 'placed'::public.order_status;

-- Drop old enum
DROP TYPE public.order_status_old;

-- Add UPI payment info column to store settings (we'll use a simple approach)
-- Add upi_number to a new store_settings table
CREATE TABLE IF NOT EXISTS public.store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upi_number TEXT DEFAULT '6379658082',
  store_name TEXT DEFAULT 'GRAINSKART',
  store_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view store settings
CREATE POLICY "Anyone can view store settings"
ON public.store_settings FOR SELECT
USING (true);

-- Only admins can manage store settings
CREATE POLICY "Admins can manage store settings"
ON public.store_settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO public.store_settings (upi_number, store_name)
VALUES ('6379658082', 'GRAINSKART')
ON CONFLICT DO NOTHING;