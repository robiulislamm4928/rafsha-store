
ALTER TABLE public.reviews
ADD COLUMN reviewer_image_url text DEFAULT NULL,
ADD COLUMN social_link text DEFAULT NULL,
ADD COLUMN social_platform text DEFAULT NULL;
