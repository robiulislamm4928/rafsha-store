
-- 1. Drop the overly permissive site_settings policy; allowlist policy remains
DROP POLICY IF EXISTS "public_select_site_settings" ON public.site_settings;

-- 2. Allow users to view their own login sessions
CREATE POLICY "user_select_own_login_sessions"
ON public.login_sessions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 3. Restrict Realtime subscriptions on order channels to order owners
DROP POLICY IF EXISTS "authenticated_realtime_access" ON realtime.messages;

CREATE POLICY "authenticated_realtime_access"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    realtime.topic() LIKE 'chat-%'
    AND EXISTS (
      SELECT 1 FROM public.chat_conversations
      WHERE id::text = substring(realtime.topic() from 6)
        AND user_id = auth.uid()
    )
  )
  OR (
    realtime.topic() LIKE 'order-%'
    AND EXISTS (
      SELECT 1 FROM public.orders
      WHERE id::text = substring(realtime.topic() from 7)
        AND user_id = auth.uid()
    )
  )
);
