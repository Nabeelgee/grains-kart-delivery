
-- Add payment screenshot URL column to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_screenshot_url text;

-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their payment screenshots
CREATE POLICY "Users can upload payment screenshots"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'payment-screenshots'
  AND auth.uid() IS NOT NULL
);

-- Allow public read access to payment screenshots
CREATE POLICY "Payment screenshots are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'payment-screenshots');

-- Allow users to update their own screenshots
CREATE POLICY "Users can update their payment screenshots"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'payment-screenshots'
  AND auth.uid() IS NOT NULL
);
