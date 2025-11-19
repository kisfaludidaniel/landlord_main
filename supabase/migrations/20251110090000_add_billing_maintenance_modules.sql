-- Location: supabase/migrations/20251110090000_add_billing_maintenance_modules.sql
-- Schema Analysis: Existing auth, properties, units, tenant_invites tables
-- Integration Type: Addition of billing, maintenance, rent collection modules
-- Dependencies: user_profiles, properties, units tables

-- 1. Create New ENUMs
CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE public.rent_charge_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
CREATE TYPE public.payment_method AS ENUM ('bank_transfer', 'card', 'cash', 'other');
CREATE TYPE public.maintenance_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.task_status AS ENUM ('pending', 'completed', 'cancelled');
CREATE TYPE public.activity_type AS ENUM ('invoice_created', 'payment_received', 'maintenance_created', 'maintenance_updated', 'tenant_invited', 'property_created');

-- 2. Create Core Tables

-- Invoices table for billing management
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landlord_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    lines JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    vat_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'HUF',
    status public.invoice_status NOT NULL DEFAULT 'draft'::public.invoice_status,
    pdf_url TEXT,
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Rent charges table for rent collection
CREATE TABLE public.rent_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'HUF',
    status public.rent_charge_status NOT NULL DEFAULT 'pending'::public.rent_charge_status,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Payments table for payment tracking
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rent_charge_id UUID REFERENCES public.rent_charges(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'HUF',
    method public.payment_method NOT NULL DEFAULT 'bank_transfer'::public.payment_method,
    paid_at TIMESTAMPTZ NOT NULL,
    reference_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance requests table
CREATE TABLE public.maintenance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    created_by_tenant_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    assigned_to_landlord_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 1,
    status public.maintenance_status NOT NULL DEFAULT 'open'::public.maintenance_status,
    events JSONB NOT NULL DEFAULT '[]'::jsonb,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Activity log table for tracking all activities
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    type public.activity_type NOT NULL,
    ref_id UUID,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table for upcoming tasks
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_at TIMESTAMPTZ,
    status public.task_status NOT NULL DEFAULT 'pending'::public.task_status,
    priority INTEGER NOT NULL DEFAULT 1,
    related_type TEXT,
    related_id UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Indexes
CREATE INDEX idx_invoices_landlord_id ON public.invoices(landlord_id);
CREATE INDEX idx_invoices_tenant_id ON public.invoices(tenant_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);
CREATE UNIQUE INDEX idx_invoices_number_landlord ON public.invoices(invoice_number, landlord_id);

CREATE INDEX idx_rent_charges_unit_id ON public.rent_charges(unit_id);
CREATE INDEX idx_rent_charges_tenant_id ON public.rent_charges(tenant_id);
CREATE INDEX idx_rent_charges_status ON public.rent_charges(status);
CREATE INDEX idx_rent_charges_due_date ON public.rent_charges(due_date);

CREATE INDEX idx_payments_rent_charge_id ON public.payments(rent_charge_id);
CREATE INDEX idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX idx_payments_paid_at ON public.payments(paid_at);

CREATE INDEX idx_maintenance_requests_unit_id ON public.maintenance_requests(unit_id);
CREATE INDEX idx_maintenance_requests_tenant_id ON public.maintenance_requests(created_by_tenant_id);
CREATE INDEX idx_maintenance_requests_landlord_id ON public.maintenance_requests(assigned_to_landlord_id);
CREATE INDEX idx_maintenance_requests_status ON public.maintenance_requests(status);

CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON public.activity_logs(type);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);

CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_at ON public.tasks(due_at);

-- 4. Helper Functions (BEFORE RLS Policies)
CREATE OR REPLACE FUNCTION public.has_landlord_role()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'LANDLORD'
)
$$;

CREATE OR REPLACE FUNCTION public.has_tenant_role()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'TENANT'
)
$$;

CREATE OR REPLACE FUNCTION public.owns_property_with_unit(unit_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.units u
    JOIN public.properties p ON u.property_id = p.id
    WHERE u.id = unit_uuid AND p.landlord_id = auth.uid()
)
$$;

-- 5. Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rent_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Invoices policies
CREATE POLICY "landlords_manage_own_invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (landlord_id = auth.uid())
WITH CHECK (landlord_id = auth.uid());

CREATE POLICY "tenants_view_own_invoices"
ON public.invoices
FOR SELECT
TO authenticated
USING (tenant_id = auth.uid());

-- Rent charges policies
CREATE POLICY "landlords_manage_property_rent_charges"
ON public.rent_charges
FOR ALL
TO authenticated
USING (public.owns_property_with_unit(unit_id))
WITH CHECK (public.owns_property_with_unit(unit_id));

CREATE POLICY "tenants_view_own_rent_charges"
ON public.rent_charges
FOR SELECT
TO authenticated
USING (tenant_id = auth.uid());

-- Payments policies
CREATE POLICY "landlords_view_property_payments"
ON public.payments
FOR SELECT
TO authenticated
USING (
    (rent_charge_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.rent_charges rc
        WHERE rc.id = rent_charge_id AND public.owns_property_with_unit(rc.unit_id)
    )) OR
    (invoice_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.invoices i
        WHERE i.id = invoice_id AND i.landlord_id = auth.uid()
    ))
);

CREATE POLICY "tenants_view_own_payments"
ON public.payments
FOR SELECT
TO authenticated
USING (
    (rent_charge_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.rent_charges rc
        WHERE rc.id = rent_charge_id AND rc.tenant_id = auth.uid()
    )) OR
    (invoice_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.invoices i
        WHERE i.id = invoice_id AND i.tenant_id = auth.uid()
    ))
);

-- Maintenance requests policies
CREATE POLICY "landlords_manage_property_maintenance"
ON public.maintenance_requests
FOR ALL
TO authenticated
USING (public.owns_property_with_unit(unit_id))
WITH CHECK (public.owns_property_with_unit(unit_id));

CREATE POLICY "tenants_manage_own_maintenance"
ON public.maintenance_requests
FOR ALL
TO authenticated
USING (created_by_tenant_id = auth.uid())
WITH CHECK (created_by_tenant_id = auth.uid());

-- Activity logs policies
CREATE POLICY "users_view_own_activity_logs"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "users_create_own_activity_logs"
ON public.activity_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Tasks policies
CREATE POLICY "users_manage_own_tasks"
ON public.tasks
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 7. Triggers for automatic invoice numbering
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    next_number INTEGER;
    year_suffix TEXT;
BEGIN
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        year_suffix := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
        
        SELECT COALESCE(MAX(
            CASE WHEN invoice_number ~ '^[0-9]+/' || year_suffix || '$'
            THEN (regexp_match(invoice_number, '^([0-9]+)/'))[1]::INTEGER
            ELSE 0 END
        ), 0) + 1
        INTO next_number
        FROM public.invoices
        WHERE landlord_id = NEW.landlord_id;
        
        NEW.invoice_number := next_number || '/' || year_suffix;
    END IF;
    
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_generate_invoice_number
    BEFORE INSERT OR UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_invoice_number();

-- 8. Mock Data
DO $$
DECLARE
    landlord_id UUID;
    tenant_id UUID;
    property_id UUID;
    unit_id UUID;
    invoice_id UUID;
    rent_charge_id UUID;
    maintenance_id UUID;
BEGIN
    -- Get existing users and properties
    SELECT id INTO landlord_id FROM public.user_profiles WHERE role = 'LANDLORD' LIMIT 1;
    SELECT id INTO tenant_id FROM public.user_profiles WHERE role = 'TENANT' LIMIT 1;
    SELECT id INTO property_id FROM public.properties LIMIT 1;
    SELECT id INTO unit_id FROM public.units LIMIT 1;

    IF landlord_id IS NOT NULL AND property_id IS NOT NULL THEN
        -- Create sample invoice
        INSERT INTO public.invoices (
            id, landlord_id, tenant_id, property_id, unit_id,
            lines, total_amount, vat_amount, status, due_date, notes
        ) VALUES (
            gen_random_uuid(), landlord_id, tenant_id, property_id, unit_id,
            '[{"description": "Bérleti díj - 2025 január", "quantity": 1, "unit_price": 150000, "total": 150000}, {"description": "Közös költség", "quantity": 1, "unit_price": 25000, "total": 25000}]'::jsonb,
            175000.00, 0.00, 'sent'::public.invoice_status,
            CURRENT_DATE + INTERVAL '30 days',
            'Havi bérleti díj és közös költség'
        ) RETURNING id INTO invoice_id;

        -- Create sample rent charge
        INSERT INTO public.rent_charges (
            id, unit_id, tenant_id, due_date, amount, description
        ) VALUES (
            gen_random_uuid(), unit_id, tenant_id,
            CURRENT_DATE + INTERVAL '15 days',
            150000.00, 'Bérleti díj - 2025 február'
        ) RETURNING id INTO rent_charge_id;

        -- Create sample payment
        INSERT INTO public.payments (
            rent_charge_id, amount, method, paid_at, reference_number
        ) VALUES (
            rent_charge_id, 150000.00, 'bank_transfer'::public.payment_method,
            CURRENT_DATE - INTERVAL '5 days', 'REF-2025-001'
        );

        -- Create sample maintenance request
        INSERT INTO public.maintenance_requests (
            id, unit_id, created_by_tenant_id, assigned_to_landlord_id,
            title, description, priority, status,
            events
        ) VALUES (
            gen_random_uuid(), unit_id, tenant_id, landlord_id,
            'Csapóvíz probléma', 'A konyhában nem folyik a meleg víz megfelelően',
            2, 'open'::public.maintenance_status,
            '[{"timestamp": "2025-01-10T10:00:00Z", "user": "tenant", "action": "created", "message": "Kérés létrehozva"}]'::jsonb
        ) RETURNING id INTO maintenance_id;

        -- Create sample activity logs
        INSERT INTO public.activity_logs (user_id, type, ref_id, message) VALUES
            (landlord_id, 'invoice_created'::public.activity_type, invoice_id, 'Számla létrehozva: ' || COALESCE((SELECT invoice_number FROM public.invoices WHERE id = invoice_id), 'N/A')),
            (tenant_id, 'maintenance_created'::public.activity_type, maintenance_id, 'Karbantartási kérés beküldve: Csapóvíz probléma'),
            (landlord_id, 'property_created'::public.activity_type, property_id, 'Új ingatlan hozzáadva a portfólióhoz');

        -- Create sample tasks
        INSERT INTO public.tasks (user_id, title, description, due_at, priority) VALUES
            (landlord_id, 'Havi számlák kiküldése', 'Február havi bérleti díjak számlázása', CURRENT_DATE + INTERVAL '7 days', 2),
            (landlord_id, 'Karbantartási kérés feldolgozása', 'Csapóvíz probléma megoldása - ' || COALESCE(unit_id::TEXT, 'Ismeretlen egység'), CURRENT_DATE + INTERVAL '3 days', 3),
            (tenant_id, 'Bérleti díj fizetése', 'Február havi bérleti díj átutalása', CURRENT_DATE + INTERVAL '15 days', 2);
    END IF;
END $$;

-- 9. Cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_billing_maintenance_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.payments WHERE amount = 150000.00;
    DELETE FROM public.rent_charges WHERE description LIKE '%2025 február%';
    DELETE FROM public.maintenance_requests WHERE title = 'Csapóvíz probléma';
    DELETE FROM public.invoices WHERE total_amount = 175000.00;
    DELETE FROM public.activity_logs WHERE message LIKE '%Számla létrehozva%' OR message LIKE '%Csapóvíz probléma%';
    DELETE FROM public.tasks WHERE title LIKE '%Havi számlák%' OR title LIKE '%Karbantartási kérés%' OR title LIKE '%Bérleti díj fizetése%';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup failed: %', SQLERRM;
END;
$$;