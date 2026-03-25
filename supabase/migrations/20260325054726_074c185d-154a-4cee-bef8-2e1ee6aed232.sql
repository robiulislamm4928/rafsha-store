ALTER TABLE public.product_variants ADD COLUMN variant_type text NOT NULL DEFAULT 'size';

COMMENT ON COLUMN public.product_variants.variant_type IS 'Type of variant: size, color, or weight';