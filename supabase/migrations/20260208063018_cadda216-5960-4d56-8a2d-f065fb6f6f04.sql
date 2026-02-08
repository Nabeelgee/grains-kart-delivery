
-- Allow users to update their own order's payment_screenshot_url
CREATE POLICY "Users can update own order screenshot"
ON public.orders
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
