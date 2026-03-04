
-- Create storage bucket for banner images
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true);

-- Allow public read access to banner images
CREATE POLICY "public_read_banners" ON storage.objects FOR SELECT USING (bucket_id = 'banners');

-- Allow admin upload/delete banner images
CREATE POLICY "admin_upload_banners" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_update_banners" ON storage.objects FOR UPDATE USING (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_delete_banners" ON storage.objects FOR DELETE USING (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'));

-- Add public read policy for site_settings (needed for footer/header to read store info)
CREATE POLICY "public_select_site_settings" ON public.site_settings FOR SELECT USING (true);

-- Add public insert policy for order_status_history (used by create_order RPC)
-- Already handled by SECURITY DEFINER function, no change needed

-- Add public read policy for announcements (already exists as restrictive, let's add permissive)
DROP POLICY IF EXISTS "public_select_active_announcements" ON public.announcements;
CREATE POLICY "public_select_active_announcements" ON public.announcements FOR SELECT TO anon, authenticated USING (is_active = true);

-- Fix banners public select policy to be permissive
DROP POLICY IF EXISTS "public_select_active_banners" ON public.banners;
CREATE POLICY "public_select_active_banners" ON public.banners FOR SELECT TO anon, authenticated USING (is_active = true);
