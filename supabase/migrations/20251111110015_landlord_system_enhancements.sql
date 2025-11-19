-- Location: supabase/migrations/20251111110015_landlord_system_enhancements.sql
-- Schema Analysis: Existing landlord system with user_profiles, plans, subscriptions, properties, units, buildings, tenant_invites, entitlements, feature_flags
-- Integration Type: Enhancement - adding system configuration, notifications, and tenant management
-- Dependencies: user_profiles, properties, units, plans, subscriptions

-- System settings and configuration
CREATE TYPE public.system_language AS ENUM ('hu', 'en');
CREATE TYPE public.notification_type AS ENUM ('success', 'error', 'warning', 'info');
CREATE TYPE public.payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');

-- System configuration table
CREATE TABLE public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL DEFAULT '{}',
    description TEXT,
    category TEXT DEFAULT 'general',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User preferences and settings
CREATE TABLE public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    language public.system_language DEFAULT 'hu',
    theme TEXT DEFAULT 'light',
    timezone TEXT DEFAULT 'Europe/Budapest',
    email_notifications BOOLEAN DEFAULT true,
    browser_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- System notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type public.notification_type DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ
);

-- Tenant payments and rent tracking
CREATE TABLE public.tenant_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
    landlord_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'HUF',
    due_date DATE NOT NULL,
    paid_date DATE,
    status public.payment_status DEFAULT 'pending',
    payment_method TEXT,
    transaction_id TEXT,
    description TEXT,
    late_fee DECIMAL(10,2) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance requests
CREATE TABLE public.maintenance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
    landlord_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'acknowledged', 'in_progress', 'completed', 'cancelled')),
    category TEXT DEFAULT 'general',
    images TEXT[],
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    assigned_to TEXT,
    scheduled_date TIMESTAMPTZ,
    completed_date TIMESTAMPTZ,
    tenant_rating INTEGER CHECK (tenant_rating BETWEEN 1 AND 5),
    landlord_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Activity logs for auditing
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Document storage
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    document_type TEXT,
    is_public BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX idx_tenant_payments_tenant_id ON public.tenant_payments(tenant_id);
CREATE INDEX idx_tenant_payments_unit_id ON public.tenant_payments(unit_id);
CREATE INDEX idx_tenant_payments_due_date ON public.tenant_payments(due_date);
CREATE INDEX idx_tenant_payments_status ON public.tenant_payments(status);
CREATE INDEX idx_maintenance_requests_tenant_id ON public.maintenance_requests(tenant_id);
CREATE INDEX idx_maintenance_requests_unit_id ON public.maintenance_requests(unit_id);
CREATE INDEX idx_maintenance_requests_status ON public.maintenance_requests(status);
CREATE INDEX idx_maintenance_requests_priority ON public.maintenance_requests(priority);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_unit_id ON public.documents(unit_id);

-- Enable RLS on all tables
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "admin_full_access_system_settings"
ON public.system_settings
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'ADMIN'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'ADMIN'
    )
);

CREATE POLICY "public_read_system_settings"
ON public.system_settings
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "users_manage_own_settings"
ON public.user_settings
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_notifications" 
ON public.notifications
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "tenants_view_own_payments"
ON public.tenant_payments
FOR SELECT
TO authenticated
USING (tenant_id = auth.uid());

CREATE POLICY "landlords_manage_tenant_payments"
ON public.tenant_payments
FOR ALL
TO authenticated
USING (landlord_id = auth.uid())
WITH CHECK (landlord_id = auth.uid());

CREATE POLICY "tenants_manage_own_requests"
ON public.maintenance_requests
FOR ALL
TO authenticated
USING (tenant_id = auth.uid())
WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "landlords_manage_maintenance_requests"
ON public.maintenance_requests
FOR ALL
TO authenticated
USING (landlord_id = auth.uid())
WITH CHECK (landlord_id = auth.uid());

CREATE POLICY "users_view_own_activity"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "users_manage_own_documents"
ON public.documents
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Functions for system operations
CREATE OR REPLACE FUNCTION public.log_activity(
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_details)
    RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type public.notification_type DEFAULT 'info',
    p_action_url TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (user_id, title, message, type, action_url, metadata)
    VALUES (p_user_id, p_title, p_message, p_type, p_action_url, p_metadata)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description, category) VALUES
    ('system_name', '{"hu": "Landlord", "en": "Landlord"}', 'Rendszer neve', 'general'),
    ('default_language', '"hu"', 'Alapértelmezett nyelv', 'localization'),
    ('available_languages', '["hu", "en"]', 'Elérhető nyelvek', 'localization'),
    ('color_scheme', '{"primary": "#2563eb", "secondary": "#64748b", "accent": "#059669"}', 'Szín séma beállítások', 'appearance'),
    ('email_enabled', 'true', 'Email küldés engedélyezve', 'email'),
    ('maintenance_categories', '["plumbing", "electrical", "heating", "cleaning", "general"]', 'Karbantartási kategóriák', 'maintenance'),
    ('payment_due_reminder_days', '7', 'Fizetési emlékeztető napok', 'payments'),
    ('late_fee_percentage', '5', 'Késedelmi díj százalék', 'payments'),
    ('company_info', '{"name": "", "address": "", "phone": "", "email": "", "website": ""}', 'Céginformációk', 'company');

-- Sample data for existing demo users
DO $$
DECLARE
    landlord_id UUID;
    tenant_id UUID;
    admin_id UUID;
    sample_unit_id UUID;
    sample_property_id UUID;
BEGIN
    -- Get existing demo user IDs
    SELECT id INTO landlord_id FROM public.user_profiles WHERE email = 'landlord@example.hu' LIMIT 1;
    SELECT id INTO tenant_id FROM public.user_profiles WHERE email = 'tenant@example.hu' LIMIT 1;
    SELECT id INTO admin_id FROM public.user_profiles WHERE role = 'ADMIN' LIMIT 1;
    
    -- Get sample property and unit
    SELECT id INTO sample_property_id FROM public.properties LIMIT 1;
    SELECT id INTO sample_unit_id FROM public.units LIMIT 1;
    
    -- Insert user settings for demo users
    IF landlord_id IS NOT NULL THEN
        INSERT INTO public.user_settings (user_id, language, theme) 
        VALUES (landlord_id, 'hu', 'light');
        
        -- Sample maintenance request
        IF sample_unit_id IS NOT NULL THEN
            INSERT INTO public.maintenance_requests (
                tenant_id, unit_id, landlord_id, title, description, priority, status
            ) VALUES (
                tenant_id, sample_unit_id, landlord_id,
                'Csöpögő csap a konyhában',
                'A konyhai csap folyamatosan csöpög, kérném a javítását.',
                'medium', 'submitted'
            );
        END IF;
    END IF;
    
    IF tenant_id IS NOT NULL THEN
        INSERT INTO public.user_settings (user_id, language, theme) 
        VALUES (tenant_id, 'hu', 'light');
        
        -- Sample payment
        IF sample_unit_id IS NOT NULL AND landlord_id IS NOT NULL THEN
            INSERT INTO public.tenant_payments (
                tenant_id, unit_id, landlord_id, amount, due_date, status, description
            ) VALUES (
                tenant_id, sample_unit_id, landlord_id,
                150000, CURRENT_DATE + INTERVAL '7 days', 'pending',
                'Havi bérleti díj - November 2024'
            );
        END IF;
    END IF;
    
    IF admin_id IS NOT NULL THEN
        INSERT INTO public.user_settings (user_id, language, theme) 
        VALUES (admin_id, 'hu', 'dark');
    END IF;
    
END $$;