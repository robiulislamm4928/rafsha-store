
-- Product Q&A table
CREATE TABLE public.product_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID,
  question_text TEXT NOT NULL,
  answer_text TEXT,
  asked_by_name VARCHAR(100) NOT NULL,
  is_answered BOOLEAN NOT NULL DEFAULT false,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  answered_at TIMESTAMPTZ
);

ALTER TABLE public.product_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_select_visible_questions" ON public.product_questions
  FOR SELECT TO public USING (is_visible = true);

CREATE POLICY "anyone_insert_questions" ON public.product_questions
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "admin_all_questions" ON public.product_questions
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- User addresses table
CREATE TABLE public.user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  label VARCHAR(50) NOT NULL DEFAULT 'Home',
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  district VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_select_own_addresses" ON public.user_addresses
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_insert_own_addresses" ON public.user_addresses
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_update_own_addresses" ON public.user_addresses
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_delete_own_addresses" ON public.user_addresses
  FOR DELETE TO authenticated USING (user_id = auth.uid());
