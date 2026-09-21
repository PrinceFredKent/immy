-- =====================================================
-- IMMY DRINKS — SUPABASE DATABASE SCHEMA
-- Run this in the Supabase SQL Editor to set up all tables, RLS policies, and realtime.
-- =====================================================

-- =====================================================
-- 1. TABLE: profiles (Created FIRST before functions that reference it)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id                          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name                        text NOT NULL DEFAULT '',
  phone                       text NOT NULL DEFAULT '',
  avatar_url                  text NOT NULL DEFAULT '',
  role                        text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  loyalty_tier                text NOT NULL DEFAULT 'Silver Member',
  loyalty_points              integer NOT NULL DEFAULT 0,
  stamps_count                integer NOT NULL DEFAULT 0,
  stamps_required_for_free_drink integer NOT NULL DEFAULT 10,
  favorite_drink_ids          text[] NOT NULL DEFAULT '{}',
  notification_preferences    jsonb NOT NULL DEFAULT '{"pushEnabled":true,"orderUpdates":true,"brewingAlerts":false,"outForDelivery":true,"deliveredAlert":true,"promotionsAndRewards":true,"soundEnabled":true}',
  redeemed_vouchers           jsonb NOT NULL DEFAULT '[]',
  saved_addresses             jsonb NOT NULL DEFAULT '[]',
  saved_payment_methods       jsonb NOT NULL DEFAULT '[]',
  phone_confirmed             boolean NOT NULL DEFAULT false,
  created_at                  timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- 2. TABLE: drinks
-- =====================================================
CREATE TABLE IF NOT EXISTS public.drinks (
  id                    text PRIMARY KEY,
  name                  text NOT NULL DEFAULT '',
  tagline               text NOT NULL DEFAULT '',
  description           text NOT NULL DEFAULT '',
  price                 integer NOT NULL DEFAULT 2000,
  price_large           integer,
  category              text NOT NULL DEFAULT 'blended-juices',
  image                 text NOT NULL DEFAULT '',
  calories              integer NOT NULL DEFAULT 110,
  rating                numeric(3,2) NOT NULL DEFAULT 4.8,
  reviews_count         integer NOT NULL DEFAULT 1,
  is_popular            boolean NOT NULL DEFAULT false,
  is_new                boolean NOT NULL DEFAULT false,
  is_out_of_stock       boolean NOT NULL DEFAULT false,
  flavor_notes          text[] NOT NULL DEFAULT '{}',
  prep_time_minutes     integer NOT NULL DEFAULT 3,
  default_customization jsonb NOT NULL DEFAULT '{"size":"standard","ice":"Regular Ice (70%)","sweetness":"Standard (100%)","milk":"No Milk / Black","selectedAddOns":[]}',
  created_at            timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- 3. TABLE: orders
-- =====================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id                        text PRIMARY KEY,
  order_number              text NOT NULL,
  user_id                   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name             text NOT NULL DEFAULT '',
  customer_phone            text NOT NULL DEFAULT '',
  customer_email            text NOT NULL DEFAULT '',
  items                     jsonb NOT NULL DEFAULT '[]',
  subtotal                  integer NOT NULL DEFAULT 0,
  delivery_fee              integer NOT NULL DEFAULT 0,
  tip                       integer NOT NULL DEFAULT 0,
  discount                  integer NOT NULL DEFAULT 0,
  promo_code                text,
  total                     integer NOT NULL DEFAULT 0,
  status                    text NOT NULL DEFAULT 'placed',
  progress_percent          integer NOT NULL DEFAULT 0,
  estimated_delivery_time   text NOT NULL DEFAULT '',
  courier                   jsonb NOT NULL DEFAULT '{}',
  delivery_address          jsonb NOT NULL DEFAULT '{}',
  timeline                  jsonb NOT NULL DEFAULT '[]',
  courier_coordinates       jsonb,
  created_at                timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- 4. TABLE: hero_slides
-- =====================================================
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id              text PRIMARY KEY,
  title           text NOT NULL DEFAULT '',
  highlight_word  text NOT NULL DEFAULT '',
  subtitle        text NOT NULL DEFAULT '',
  cta_text        text NOT NULL DEFAULT '',
  image           text NOT NULL DEFAULT '',
  tag             text NOT NULL DEFAULT '',
  category_target text NOT NULL DEFAULT 'all',
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- 5. HELPER FUNCTION: is_admin()
-- Defined after public.profiles exists
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    -- Primary check: profiles table row
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    -- Fallback: JWT user_metadata set at sign-up / sign-in
    ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'),
    false
  );
$$;

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drinks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Profiles policies (drop if exist first to ensure idempotence)
DROP POLICY IF EXISTS "profiles_read_own"     ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;

-- Allow authenticated users to insert their own profile row,
-- AND allow service-role/trigger context (auth.uid() IS NULL) for handle_new_user trigger.
CREATE POLICY "profiles_read_own"     ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_insert_own"   ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);
CREATE POLICY "profiles_update_own"   ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_delete_admin" ON public.profiles FOR DELETE USING (public.is_admin());

-- Drinks policies
DROP POLICY IF EXISTS "drinks_read_all"     ON public.drinks;
DROP POLICY IF EXISTS "drinks_write_admin"  ON public.drinks;
DROP POLICY IF EXISTS "drinks_update_admin" ON public.drinks;
DROP POLICY IF EXISTS "drinks_delete_admin" ON public.drinks;

CREATE POLICY "drinks_read_all"     ON public.drinks FOR SELECT USING (true);
CREATE POLICY "drinks_write_admin"  ON public.drinks FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "drinks_update_admin" ON public.drinks FOR UPDATE USING (public.is_admin());
CREATE POLICY "drinks_delete_admin" ON public.drinks FOR DELETE USING (public.is_admin());

-- Orders policies
DROP POLICY IF EXISTS "orders_read"   ON public.orders;
DROP POLICY IF EXISTS "orders_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_update" ON public.orders;
DROP POLICY IF EXISTS "orders_delete" ON public.orders;

CREATE POLICY "orders_read"   ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "orders_insert" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update" ON public.orders FOR UPDATE USING (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "orders_delete" ON public.orders FOR DELETE USING (public.is_admin());

-- Hero slides policies
DROP POLICY IF EXISTS "slides_read_all"     ON public.hero_slides;
DROP POLICY IF EXISTS "slides_write_admin"  ON public.hero_slides;
DROP POLICY IF EXISTS "slides_update_admin" ON public.hero_slides;
DROP POLICY IF EXISTS "slides_delete_admin" ON public.hero_slides;

CREATE POLICY "slides_read_all"     ON public.hero_slides FOR SELECT USING (true);
CREATE POLICY "slides_write_admin"  ON public.hero_slides FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "slides_update_admin" ON public.hero_slides FOR UPDATE USING (public.is_admin());
CREATE POLICY "slides_delete_admin" ON public.hero_slides FOR DELETE USING (public.is_admin());

-- =====================================================
-- 7. REALTIME REPLICATION (Safe idempotent add)
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'drinks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.drinks;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'hero_slides'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.hero_slides;
  END IF;
END $$;

-- =====================================================
-- 8. STORAGE: drink-images bucket
-- =====================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'drink-images',
  'drink-images',
  true,
  8388608,  -- 8MB limit
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "drink_images_read_all"     ON storage.objects;
DROP POLICY IF EXISTS "drink_images_upload_admin" ON storage.objects;
DROP POLICY IF EXISTS "drink_images_delete_admin" ON storage.objects;

CREATE POLICY "drink_images_read_all"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'drink-images');

CREATE POLICY "drink_images_upload_admin"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'drink-images' AND public.is_admin());

CREATE POLICY "drink_images_delete_admin"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'drink-images' AND public.is_admin());

-- =====================================================
-- 9. TRIGGER: auto-create profile row on signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    name,
    phone,
    role,
    saved_addresses,
    saved_payment_methods
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    CASE 
      WHEN NEW.email IN ('admin@immydrinks.com', 'princefredkent@gmail.com') THEN 'admin'
      ELSE 'customer'
    END,
    '[{"id":"addr-home","label":"Acacia Kololo","street":"Acacia Avenue, Plot 14","city":"Kampala, Uganda","isDefault":true}]',
    '[{"id":"pm-cash","type":"cash","label":"Cash on Delivery","subtitle":"Pay with cash upon delivery","isDefault":true,"comingSoon":false}]'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 10. ONE-TIME FIX: Ensure existing admin accounts have role = 'admin'
-- Run this block if admin emails already existed before the trigger was set up.
-- =====================================================
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email IN ('admin@immydrinks.com', 'princefredkent@gmail.com')
)
AND role != 'admin';
