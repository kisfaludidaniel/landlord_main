-- Location: supabase/migrations/20250110083231_microlanlord_auth_complete.sql
-- Schema Analysis: Fresh project (no existing schema)
-- Integration Type: Complete authentication & RBAC system
-- Dependencies: None (fresh schema creation)

-- 1. Create custom types
CREATE TYPE public.user_role AS ENUM ('ADMIN', 'LANDLORD', 'TENANT');
CREATE TYPE public.plan_tier AS ENUM ('free', 'starter', 'pro', 'unlimited');
CREATE TYPE public.subscription_status AS ENUM ('active', 'inactive', 'cancelled', 'past_due');

-- 2. Core tables (no foreign keys)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role public.user_role NOT NULL DEFAULT 'LANDLORD'::public.user_role,
    company_name TEXT,
    company_vat_id TEXT,
    company_address TEXT,
    stripe_customer_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Plans table
CREATE TABLE public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code public.plan_tier NOT NULL UNIQUE,
    name TEXT NOT NULL,
    price_huf INTEGER NOT NULL DEFAULT 0,
    property_limit INTEGER,
    ai_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    features JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    tier INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Subscriptions table
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
    status public.subscription_status NOT NULL DEFAULT 'active'::public.subscription_status,
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 month'),
    stripe_subscription_id TEXT UNIQUE,
    provider TEXT DEFAULT 'stripe',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Feature flags table
CREATE TABLE public.feature_flags (
    key TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Entitlements table
CREATE TABLE public.entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    key TEXT NOT NULL REFERENCES public.feature_flags(key) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, key)
);

-- 7. Properties table (basic structure for property limits)
CREATE TABLE public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landlord_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Essential Indexes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_profiles_stripe_customer ON public.user_profiles(stripe_customer_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_entitlements_user_id ON public.entitlements(user_id);
CREATE INDEX idx_entitlements_key ON public.entitlements(key);
CREATE INDEX idx_properties_landlord_id ON public.properties(landlord_id);

-- 9. Functions (BEFORE RLS policies)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    default_plan_id UUID;
BEGIN
    -- Get free plan ID
    SELECT id INTO default_plan_id FROM public.plans WHERE code = 'free' LIMIT 1;
    
    -- Create user profile
    INSERT INTO public.user_profiles (
        id, 
        email, 
        full_name,
        role
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'LANDLORD'::public.user_role)
    );
    
    -- Create default subscription for landlords
    IF COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'LANDLORD'::public.user_role) = 'LANDLORD' AND default_plan_id IS NOT NULL THEN
        INSERT INTO public.subscriptions (user_id, plan_id, status)
        VALUES (NEW.id, default_plan_id, 'active'::public.subscription_status);
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_property_limit(landlord_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 
    FROM public.subscriptions s
    JOIN public.plans p ON s.plan_id = p.id
    JOIN public.properties pr ON pr.landlord_id = s.user_id
    WHERE s.user_id = landlord_uuid 
    AND s.status = 'active'
    AND (
        p.property_limit IS NULL 
        OR (SELECT COUNT(*) FROM public.properties WHERE landlord_id = landlord_uuid) < p.property_limit
    )
)
$$;

-- 10. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policies (Pattern 1 for user_profiles)
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pattern 2 for subscriptions
CREATE POLICY "users_manage_own_subscriptions"
ON public.subscriptions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 2 for entitlements
CREATE POLICY "users_manage_own_entitlements"
ON public.entitlements
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 2 for properties
CREATE POLICY "landlords_manage_own_properties"
ON public.properties
FOR ALL
TO authenticated
USING (landlord_id = auth.uid())
WITH CHECK (landlord_id = auth.uid());

-- Pattern 4 for plans (public read, admin write)
CREATE POLICY "public_can_read_plans"
ON public.plans
FOR SELECT
TO public
USING (true);

CREATE POLICY "public_can_read_feature_flags"
ON public.feature_flags
FOR SELECT
TO public
USING (true);

-- 12. Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 13. Insert default plans
INSERT INTO public.plans (code, name, price_huf, property_limit, ai_enabled, features, description, tier) VALUES
    ('free', 'Ingyenes', 0, 1, FALSE, '["ingatlan_kezeles", "berlok_kezeles", "alapveto_riportok"]'::jsonb, 'Alapfunkciók, manuális adminisztráció, AI nélkül.', 0),
    ('starter', 'Starter', 4990, 3, FALSE, '["ingatlan_kezeles", "berlok_kezeles", "riportok", "dokumentum_kezeles"]'::jsonb, 'Kis bérbeadóknak. Teljes funkcionalitás, AI nélkül.', 1),
    ('pro', 'Pro', 9900, 10, TRUE, '["ingatlan_kezeles", "berlok_kezeles", "fejlett_riportok", "ai_asszisztens", "automatizalas"]'::jsonb, 'Kisebb portfóliót kezelőknek, automatizált és AI-asszisztens funkciókkal.', 2),
    ('unlimited', 'Korlátlan', 34990, NULL, TRUE, '["ingatlan_kezeles", "berlok_kezeles", "teljes_riportok", "ai_asszisztens", "teljes_automatizalas", "prioritasos_support"]'::jsonb, 'Profi bérbeadóknak és cégeknek, teljes automatizálással és prioritásos supporttal.', 3);

-- 14. Insert default feature flags
INSERT INTO public.feature_flags (key, description) VALUES
    ('export_properties', 'Ingatlanok exportálása'),
    ('finance_reports', 'Pénzügyi riportok'),
    ('auto_invoicing', 'Automatikus számlázás'),
    ('maintenance_module', 'Karbantartási modul'),
    ('pro_analytics', 'Pro analitika'),
    ('ai_assistant', 'AI asszisztens'),
    ('priority_support', 'Prioritásos support');

-- 15. Complete Mock Data with auth.users
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    landlord_uuid UUID := gen_random_uuid();
    tenant_uuid UUID := gen_random_uuid();
    free_plan_id UUID;
    pro_plan_id UUID;
BEGIN
    -- Get plan IDs
    SELECT id INTO free_plan_id FROM public.plans WHERE code = 'free';
    SELECT id INTO pro_plan_id FROM public.plans WHERE code = 'pro';

    -- Create complete auth.users records with all required fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        -- Admin user
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@microlanlord.hu', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Admin Felhasználó", "role": "ADMIN"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        
        -- Landlord user
        (landlord_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'landlord@example.hu', crypt('landlord123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Főbérlő Példa", "role": "LANDLORD"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        
        -- Tenant user
        (tenant_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'tenant@example.hu', crypt('tenant123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Bérlő Példa", "role": "TENANT"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Manual profile creation for specific admin user (trigger handles others)
    UPDATE public.user_profiles 
    SET role = 'ADMIN'::public.user_role 
    WHERE id = admin_uuid;

    -- Create sample property for landlord
    INSERT INTO public.properties (landlord_id, name, address, description) VALUES
        (landlord_uuid, 'Budapesti Lakás', '1051 Budapest, Sas utca 12.', 'Központi lakás a belvárosban');

    -- Create entitlements for pro user
    INSERT INTO public.entitlements (user_id, key, enabled)
    SELECT landlord_uuid, key, true
    FROM public.feature_flags 
    WHERE key IN ('export_properties', 'finance_reports', 'pro_analytics');

END $$;

-- 16. Create cleanup function for development
CREATE OR REPLACE FUNCTION public.cleanup_test_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auth_user_ids_to_delete UUID[];
BEGIN
    -- Get auth user IDs to delete
    SELECT ARRAY_AGG(id) INTO auth_user_ids_to_delete
    FROM auth.users
    WHERE email LIKE '%@example.hu' OR email LIKE '%@microlanlord.hu';

    -- Delete in dependency order (children first)
    DELETE FROM public.properties WHERE landlord_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.entitlements WHERE user_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.subscriptions WHERE user_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.user_profiles WHERE id = ANY(auth_user_ids_to_delete);

    -- Delete auth.users last
    DELETE FROM auth.users WHERE id = ANY(auth_user_ids_to_delete);
    
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key constraint prevents deletion: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup failed: %', SQLERRM;
END;
$$;

COMMENT ON FUNCTION public.cleanup_test_data() IS 'Törli a teszt adatokat a fejlesztési környezetből';