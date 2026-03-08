
-- Create key_points table for homepage feature cards
CREATE TABLE public.key_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.key_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_select_active_key_points" ON public.key_points
  FOR SELECT USING (is_active = true);

CREATE POLICY "admin_all_key_points" ON public.key_points
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed default data
INSERT INTO public.key_points (title, description, display_order) VALUES
  ('অথেনটিক পণ্য', 'মানসম্মত ও আসল পণ্য', 0),
  ('দ্রুত ডেলিভারি', 'সারাদেশে পৌঁছে যাবে', 1),
  ('মানি-ব্যাক গ্যারান্টি', 'সন্তুষ্ট না হলে ফেরত', 2),
  ('সাপোর্ট', 'যেকোনো সময় যোগাযোগ', 3);
