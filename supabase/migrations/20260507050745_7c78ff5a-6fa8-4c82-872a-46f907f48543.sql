
-- 1. Remove overly permissive INSERT policies — orders go through create_order() SECURITY DEFINER RPC
DROP POLICY IF EXISTS "anyone_insert_order_items" ON public.order_items;
DROP POLICY IF EXISTS "anyone_insert_orders" ON public.orders;

-- 2. Lock down coupons: no broad SELECT, expose only via validate_coupon RPC
DROP POLICY IF EXISTS "public_select_active_coupons" ON public.coupons;

CREATE OR REPLACE FUNCTION public.validate_coupon(p_code text, p_order_total numeric)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v RECORD;
BEGIN
  SELECT * INTO v
  FROM public.coupons
  WHERE upper(code) = upper(p_code) AND is_active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'কুপন কোড সঠিক নয়');
  END IF;
  IF v.expires_at IS NOT NULL AND v.expires_at < now() THEN
    RETURN json_build_object('success', false, 'message', 'কুপনের মেয়াদ শেষ');
  END IF;
  IF v.max_uses IS NOT NULL AND v.used_count >= v.max_uses THEN
    RETURN json_build_object('success', false, 'message', 'কুপনের সর্বোচ্চ ব্যবহার সীমা পূর্ণ');
  END IF;
  IF p_order_total < v.min_order_amount THEN
    RETURN json_build_object('success', false, 'message', 'মিনিমাম অর্ডার ৳' || v.min_order_amount || ' হতে হবে');
  END IF;

  RETURN json_build_object(
    'success', true,
    'code', v.code,
    'discount_type', v.discount_type,
    'discount_value', v.discount_value,
    'min_order_amount', v.min_order_amount
  );
END;
$$;

REVOKE ALL ON FUNCTION public.validate_coupon(text, numeric) FROM public;
GRANT EXECUTE ON FUNCTION public.validate_coupon(text, numeric) TO anon, authenticated;

-- 3. Public read of safe display keys from site_settings
CREATE POLICY "public_select_display_settings"
  ON public.site_settings
  FOR SELECT
  TO anon, authenticated
  USING (
    key IN (
      'store_name','store_logo_url','phone','email','address','about',
      'facebook_url','instagram_url','youtube_url','whatsapp_number',
      'live_chat_script','bkash_number','nagad_number','site_title','meta_description'
    )
  );

-- 4. Realtime channel authorization
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_realtime_access" ON realtime.messages;
CREATE POLICY "authenticated_realtime_access"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.chat_conversations c
      WHERE realtime.topic() = 'chat-' || c.id::text
        AND c.user_id = auth.uid()
    )
  );

-- 5. Pin search_path on trigger helper function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
