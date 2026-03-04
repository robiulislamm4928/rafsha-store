
CREATE OR REPLACE FUNCTION public.create_order(p_customer_name text, p_customer_phone text, p_customer_email text, p_district text, p_delivery_address text, p_delivery_note text, p_payment_method text, p_user_id uuid, p_items jsonb)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  v_order_id uuid := gen_random_uuid();
  v_order_number text := 'ORD-' || extract(epoch from now())::bigint::text;
  v_subtotal numeric := 0;
  v_delivery_charge numeric := 0;
  v_total numeric;
  v_item jsonb;
  v_product record;
  v_variant record;
  v_unit_price numeric;
  v_item_total numeric;
  v_quantity int;
  v_real_user_id uuid;
  -- Temp storage for items to insert after order
  v_items_to_insert jsonb := '[]'::jsonb;
BEGIN
  -- Handle null/placeholder user_id
  IF p_user_id IS NULL OR p_user_id = '00000000-0000-0000-0000-000000000000' THEN
    v_real_user_id := NULL;
  ELSE
    v_real_user_id := p_user_id;
  END IF;

  -- Validate items array
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RETURN json_build_object('success', false, 'message', 'No items provided');
  END IF;

  -- Validate payment method
  IF p_payment_method NOT IN ('COD', 'PARTIAL_ONLINE') THEN
    RETURN json_build_object('success', false, 'message', 'Invalid payment method');
  END IF;

  -- Look up delivery charge
  SELECT sz.delivery_charge INTO v_delivery_charge
  FROM public.shipping_zones sz
  WHERE sz.zone_name = p_district AND sz.is_active = true;
  IF NOT FOUND THEN v_delivery_charge := 0; END IF;

  -- First pass: validate items and calculate totals
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_quantity := (v_item->>'quantity')::int;
    IF v_quantity IS NULL OR v_quantity <= 0 THEN
      RETURN json_build_object('success', false, 'message', 'Invalid quantity');
    END IF;

    SELECT * INTO v_product FROM public.products
    WHERE id = (v_item->>'product_id')::uuid AND is_active = true;
    IF NOT FOUND THEN
      RETURN json_build_object('success', false, 'message', 'Product not found: ' || (v_item->>'product_id'));
    END IF;

    v_unit_price := COALESCE(v_product.sale_price, v_product.regular_price);

    IF v_item->>'variant_label' IS NOT NULL AND (v_item->>'variant_label') != '' THEN
      SELECT * INTO v_variant FROM public.product_variants
      WHERE product_id = v_product.id AND variant_label = (v_item->>'variant_label') AND is_active = true;
      IF FOUND THEN v_unit_price := v_unit_price + v_variant.price_adjustment; END IF;
    END IF;

    v_item_total := v_unit_price * v_quantity;
    v_subtotal := v_subtotal + v_item_total;

    -- Collect item for later insertion
    v_items_to_insert := v_items_to_insert || jsonb_build_array(jsonb_build_object(
      'product_id', v_product.id,
      'product_name', v_product.name,
      'variant_label', NULLIF(v_item->>'variant_label', ''),
      'unit_price', v_unit_price,
      'quantity', v_quantity,
      'item_total', v_item_total
    ));
  END LOOP;

  v_total := v_subtotal + v_delivery_charge;

  -- INSERT ORDER FIRST (before items)
  INSERT INTO public.orders (
    id, order_number, customer_name, customer_phone, customer_email,
    delivery_address, district, subtotal, delivery_charge, discount_amount,
    total_amount, advance_paid, due_on_delivery, payment_method,
    payment_status, order_status, user_id, delivery_note
  ) VALUES (
    v_order_id, v_order_number, p_customer_name, p_customer_phone,
    NULLIF(p_customer_email, ''),
    p_delivery_address, p_district, v_subtotal, v_delivery_charge, 0,
    v_total, 0, v_total, p_payment_method,
    'Pending', 'Pending', v_real_user_id, NULLIF(p_delivery_note, '')
  );

  -- NOW insert order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_items_to_insert)
  LOOP
    INSERT INTO public.order_items (id, order_id, product_id, product_name_snapshot, variant_label_snapshot, unit_price_snapshot, quantity, item_total)
    VALUES (
      gen_random_uuid(),
      v_order_id,
      (v_item->>'product_id')::uuid,
      v_item->>'product_name',
      v_item->>'variant_label',
      (v_item->>'unit_price')::numeric,
      (v_item->>'quantity')::int,
      (v_item->>'item_total')::numeric
    );
  END LOOP;

  -- Insert status history
  INSERT INTO public.order_status_history (id, order_id, status, note)
  VALUES (gen_random_uuid(), v_order_id, 'Pending', 'অর্ডার গৃহীত হয়েছে');

  RETURN json_build_object(
    'success', true,
    'order_number', v_order_number,
    'total_amount', v_total,
    'subtotal', v_subtotal,
    'delivery_charge', v_delivery_charge
  );
END;
$$;
