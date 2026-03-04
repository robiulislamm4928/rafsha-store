
-- Enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'moderator');

-- Categories
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL UNIQUE,
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL UNIQUE,
  short_description TEXT,
  full_description TEXT,
  sku VARCHAR,
  category_id UUID REFERENCES public.categories(id),
  regular_price NUMERIC NOT NULL,
  sale_price NUMERIC,
  stock_quantity INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Product variants
CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_label VARCHAR NOT NULL,
  price_adjustment NUMERIC NOT NULL DEFAULT 0,
  stock_quantity INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Product images
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR NOT NULL,
  customer_name VARCHAR NOT NULL,
  customer_phone VARCHAR NOT NULL,
  customer_email VARCHAR,
  delivery_address TEXT NOT NULL,
  district VARCHAR NOT NULL,
  subtotal NUMERIC NOT NULL,
  delivery_charge NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  advance_paid NUMERIC NOT NULL DEFAULT 0,
  due_on_delivery NUMERIC NOT NULL,
  payment_method VARCHAR NOT NULL,
  payment_status VARCHAR NOT NULL DEFAULT 'Pending',
  order_status VARCHAR NOT NULL DEFAULT 'Pending',
  user_id UUID,
  admin_note TEXT,
  delivery_note TEXT,
  uddoktapay_transaction_id VARCHAR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order items
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_name_snapshot VARCHAR NOT NULL,
  variant_label_snapshot VARCHAR,
  unit_price_snapshot NUMERIC NOT NULL,
  quantity INT NOT NULL,
  item_total NUMERIC NOT NULL
);

-- Order status history
CREATE TABLE public.order_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status VARCHAR NOT NULL,
  note TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users (profiles)
CREATE TABLE public.users (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR,
  default_address TEXT,
  default_district VARCHAR,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID,
  reviewer_name VARCHAR NOT NULL,
  reviewer_location VARCHAR,
  rating INT NOT NULL,
  review_text TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Wishlists
CREATE TABLE public.wishlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Shipping zones
CREATE TABLE public.shipping_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_name VARCHAR NOT NULL,
  delivery_charge NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Banners
CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR NOT NULL,
  heading VARCHAR,
  subtext TEXT,
  cta_label VARCHAR,
  cta_link VARCHAR,
  desktop_image_url TEXT NOT NULL,
  mobile_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Announcements
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Site settings
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Page views
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL DEFAULT '/',
  event_type TEXT NOT NULL DEFAULT 'page_view',
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Login sessions
CREATE TABLE public.login_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  login_success BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  login_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ,
  logged_out_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  browser TEXT,
  device_type TEXT NOT NULL DEFAULT 'desktop',
  location_info TEXT
);

-- Incomplete orders
CREATE TABLE public.incomplete_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone VARCHAR,
  cart_snapshot JSONB,
  total_value NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admins
CREATE TABLE public.admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  password_hash VARCHAR NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomplete_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- update_updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Attach updated_at triggers
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- decrement_variant_stock trigger function
CREATE OR REPLACE FUNCTION public.decrement_variant_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Decrement product stock
  UPDATE public.products
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.product_id;

  -- Decrement variant stock if variant was specified
  IF NEW.variant_label_snapshot IS NOT NULL THEN
    UPDATE public.product_variants
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE product_id = NEW.product_id
      AND variant_label = NEW.variant_label_snapshot;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_decrement_stock_on_order_item
  AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.decrement_variant_stock();

-- track_order function
CREATE OR REPLACE FUNCTION public.track_order(p_order_number TEXT, p_phone TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_items JSON;
  v_history JSON;
BEGIN
  SELECT * INTO v_order
  FROM public.orders
  WHERE order_number = p_order_number AND customer_phone = p_phone;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Order not found');
  END IF;

  SELECT json_agg(row_to_json(i)) INTO v_items
  FROM (
    SELECT product_name_snapshot, variant_label_snapshot, unit_price_snapshot, quantity, item_total
    FROM public.order_items WHERE order_id = v_order.id
  ) i;

  SELECT json_agg(row_to_json(h)) INTO v_history
  FROM (
    SELECT status, note, changed_at
    FROM public.order_status_history WHERE order_id = v_order.id ORDER BY changed_at
  ) h;

  RETURN json_build_object(
    'success', true,
    'order', json_build_object(
      'order_number', v_order.order_number,
      'customer_name', v_order.customer_name,
      'order_status', v_order.order_status,
      'payment_status', v_order.payment_status,
      'total_amount', v_order.total_amount,
      'due_on_delivery', v_order.due_on_delivery,
      'created_at', v_order.created_at
    ),
    'items', COALESCE(v_items, '[]'::json),
    'history', COALESCE(v_history, '[]'::json)
  );
END;
$$;

-- Storage bucket for review images
INSERT INTO storage.buckets (id, name, public) VALUES ('review-images', 'review-images', true);

-- Storage RLS: allow public read
CREATE POLICY "Public read review images" ON storage.objects FOR SELECT USING (bucket_id = 'review-images');

-- Storage RLS: allow authenticated upload
CREATE POLICY "Authenticated upload review images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'review-images');
