
-- ============ ADMINS ============
CREATE POLICY "admin_all_admins" ON public.admins FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ SITE_SETTINGS ============
CREATE POLICY "admin_all_site_settings" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ PRODUCTS ============
CREATE POLICY "public_select_active_products" ON public.products FOR SELECT
  USING (is_active = true);
CREATE POLICY "admin_all_products" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ CATEGORIES ============
CREATE POLICY "public_select_active_categories" ON public.categories FOR SELECT
  USING (is_active = true);
CREATE POLICY "admin_all_categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ BANNERS ============
CREATE POLICY "public_select_active_banners" ON public.banners FOR SELECT
  USING (is_active = true);
CREATE POLICY "admin_all_banners" ON public.banners FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ ANNOUNCEMENTS ============
CREATE POLICY "public_select_active_announcements" ON public.announcements FOR SELECT
  USING (is_active = true);
CREATE POLICY "admin_all_announcements" ON public.announcements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ SHIPPING_ZONES ============
CREATE POLICY "public_select_active_shipping_zones" ON public.shipping_zones FOR SELECT
  USING (is_active = true);
CREATE POLICY "admin_all_shipping_zones" ON public.shipping_zones FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ PRODUCT_IMAGES ============
CREATE POLICY "public_select_product_images" ON public.product_images FOR SELECT
  USING (true);
CREATE POLICY "admin_all_product_images" ON public.product_images FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ PRODUCT_VARIANTS ============
CREATE POLICY "public_select_active_variants" ON public.product_variants FOR SELECT
  USING (is_active = true);
CREATE POLICY "admin_all_product_variants" ON public.product_variants FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ ORDERS ============
CREATE POLICY "anyone_insert_orders" ON public.orders FOR INSERT
  WITH CHECK (true);
CREATE POLICY "user_select_own_orders" ON public.orders FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "admin_all_orders" ON public.orders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ ORDER_ITEMS ============
CREATE POLICY "anyone_insert_order_items" ON public.order_items FOR INSERT
  WITH CHECK (true);
CREATE POLICY "user_select_own_order_items" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  ));
CREATE POLICY "admin_all_order_items" ON public.order_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ ORDER_STATUS_HISTORY ============
CREATE POLICY "user_select_own_order_history" ON public.order_status_history FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders WHERE orders.id = order_status_history.order_id AND orders.user_id = auth.uid()
  ));
CREATE POLICY "admin_all_order_status_history" ON public.order_status_history FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ USERS ============
CREATE POLICY "user_select_own_profile" ON public.users FOR SELECT TO authenticated
  USING (id = auth.uid());
CREATE POLICY "user_insert_own_profile" ON public.users FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "user_update_own_profile" ON public.users FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "admin_all_users" ON public.users FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ USER_ROLES ============
CREATE POLICY "user_select_own_role" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "admin_all_user_roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ REVIEWS ============
CREATE POLICY "anyone_insert_reviews" ON public.reviews FOR INSERT
  WITH CHECK (true);
CREATE POLICY "public_select_approved_reviews" ON public.reviews FOR SELECT
  USING (is_approved = true);
CREATE POLICY "admin_all_reviews" ON public.reviews FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ WISHLISTS ============
CREATE POLICY "user_select_own_wishlist" ON public.wishlists FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "user_insert_own_wishlist" ON public.wishlists FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_delete_own_wishlist" ON public.wishlists FOR DELETE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "admin_select_wishlists" ON public.wishlists FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ PAGE_VIEWS ============
CREATE POLICY "anyone_insert_page_views" ON public.page_views FOR INSERT
  WITH CHECK (true);
CREATE POLICY "admin_select_page_views" ON public.page_views FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ LOGIN_SESSIONS ============
CREATE POLICY "user_insert_own_login_session" ON public.login_sessions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "admin_select_login_sessions" ON public.login_sessions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_update_login_sessions" ON public.login_sessions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_delete_login_sessions" ON public.login_sessions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ INCOMPLETE_ORDERS ============
CREATE POLICY "anyone_insert_incomplete_orders" ON public.incomplete_orders FOR INSERT
  WITH CHECK (true);
CREATE POLICY "admin_all_incomplete_orders" ON public.incomplete_orders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
