-- Location: supabase/migrations/20251110100000_financial_module_complete.sql
-- Schema Analysis: Existing properties, units, user_profiles, buildings, tenant_invites
-- Integration Type: Addition - Creating financial module tables
-- Dependencies: user_profiles, properties, units

-- 1. Create ENUM types for financial module
CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE public.rent_charge_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
CREATE TYPE public.payment_method AS ENUM ('bank_transfer', 'cash', 'card', 'cheque', 'online');
CREATE TYPE public.maintenance_status AS ENUM ('requested', 'assigned', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.activity_type AS ENUM ('invoice_created', 'payment_received', 'maintenance_requested', 'tenant_invite_sent', 'property_added', 'task_created', 'task_completed');

-- 2. Financial tables (NEW tables only - don't recreate existing ones)

-- Invoices table for bill generation
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landlord_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    lines JSONB DEFAULT '[]'::jsonb,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    vat_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'HUF',
    status public.invoice_status DEFAULT 'draft'::public.invoice_status,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    pdf_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Rent charges table for rent collection
CREATE TABLE public.rent_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'HUF',
    status public.rent_charge_status DEFAULT 'pending'::public.rent_charge_status,
    description TEXT,
    late_fee DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Payments table for payment tracking
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rent_charge_id UUID REFERENCES public.rent_charges(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'HUF',
    method public.payment_method DEFAULT 'bank_transfer'::public.payment_method,
    reference_number TEXT,
    paid_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance requests table
CREATE TABLE public.maintenance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
    created_by_tenant_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status public.maintenance_status DEFAULT 'requested'::public.maintenance_status,
    priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
    assigned_to UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    scheduled_date DATE,
    completed_date DATE,
    events JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Activity log table for tracking important operations
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    type public.activity_type NOT NULL,
    ref_id UUID,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table for upcoming tasks
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_at TIMESTAMPTZ,
    status public.task_status DEFAULT 'pending'::public.task_status,
    priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
    related_property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    related_unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Essential Indexes
CREATE INDEX idx_invoices_landlord_id ON public.invoices(landlord_id);
CREATE INDEX idx_invoices_tenant_id ON public.invoices(tenant_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX idx_invoices_invoice_number ON public.invoices(invoice_number);

CREATE INDEX idx_rent_charges_unit_id ON public.rent_charges(unit_id);
CREATE INDEX idx_rent_charges_due_date ON public.rent_charges(due_date);
CREATE INDEX idx_rent_charges_status ON public.rent_charges(status);

CREATE INDEX idx_payments_rent_charge_id ON public.payments(rent_charge_id);
CREATE INDEX idx_payments_paid_at ON public.payments(paid_at);

CREATE INDEX idx_maintenance_requests_unit_id ON public.maintenance_requests(unit_id);
CREATE INDEX idx_maintenance_requests_tenant_id ON public.maintenance_requests(created_by_tenant_id);
CREATE INDEX idx_maintenance_requests_status ON public.maintenance_requests(status);
CREATE INDEX idx_maintenance_requests_assigned_to ON public.maintenance_requests(assigned_to);

CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON public.activity_logs(type);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);

CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_at ON public.tasks(due_at);
CREATE INDEX idx_tasks_property_id ON public.tasks(related_property_id);

-- 4. Enable RLS for all new tables
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rent_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 5. Helper functions for complex access patterns
CREATE OR REPLACE FUNCTION public.user_owns_property_for_unit(unit_uuid UUID)
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

CREATE OR REPLACE FUNCTION public.user_is_tenant_for_unit(unit_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.tenant_invites ti
    WHERE ti.unit_id = unit_uuid 
    AND ti.invited_by = auth.uid()
    AND ti.status = 'accepted'::public.invite_status
)
$$;

-- 6. RLS Policies using correct patterns

-- Pattern 2: Simple user ownership for invoices
CREATE POLICY "landlords_manage_own_invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (landlord_id = auth.uid())
WITH CHECK (landlord_id = auth.uid());

-- Pattern 2: Simple user ownership for activity_logs
CREATE POLICY "users_manage_own_activity_logs"
ON public.activity_logs
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 2: Simple user ownership for tasks
CREATE POLICY "users_manage_own_tasks"
ON public.tasks
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 7: Complex access for rent_charges (landlords can manage, tenants can view)
CREATE POLICY "landlords_manage_rent_charges"
ON public.rent_charges
FOR ALL
TO authenticated
USING (public.user_owns_property_for_unit(unit_id))
WITH CHECK (public.user_owns_property_for_unit(unit_id));

CREATE POLICY "tenants_view_own_rent_charges"
ON public.rent_charges
FOR SELECT
TO authenticated
USING (public.user_is_tenant_for_unit(unit_id));

-- Pattern 7: Complex access for payments
CREATE POLICY "landlords_manage_payments"
ON public.payments
FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.rent_charges rc
    WHERE rc.id = rent_charge_id
    AND public.user_owns_property_for_unit(rc.unit_id)
));

CREATE POLICY "tenants_view_own_payments"
ON public.payments
FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.rent_charges rc
    WHERE rc.id = rent_charge_id
    AND public.user_is_tenant_for_unit(rc.unit_id)
));

-- Pattern 7: Complex access for maintenance_requests
CREATE POLICY "landlords_manage_maintenance_requests"
ON public.maintenance_requests
FOR ALL
TO authenticated
USING (public.user_owns_property_for_unit(unit_id))
WITH CHECK (public.user_owns_property_for_unit(unit_id));

CREATE POLICY "tenants_manage_own_maintenance_requests"
ON public.maintenance_requests
FOR ALL
TO authenticated
USING (created_by_tenant_id = auth.uid())
WITH CHECK (created_by_tenant_id = auth.uid());

-- 7. Helper function to log activities
CREATE OR REPLACE FUNCTION public.log_activity(
    activity_type public.activity_type,
    message_text TEXT,
    ref_uuid UUID DEFAULT NULL,
    metadata_json JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.activity_logs (user_id, type, ref_id, message, metadata)
    VALUES (auth.uid(), activity_type, ref_uuid, message_text, metadata_json);
END;
$$;

-- 8. Mock data for financial module
DO $$
DECLARE
    landlord_uuid UUID;
    tenant_uuid UUID;
    property_uuid UUID;
    unit_uuid UUID;
    invoice_uuid UUID := gen_random_uuid();
    rent_charge_uuid UUID := gen_random_uuid();
    maintenance_uuid UUID := gen_random_uuid();
    task_uuid UUID := gen_random_uuid();
BEGIN
    -- Get existing user and property IDs
    SELECT id INTO landlord_uuid FROM public.user_profiles WHERE role = 'LANDLORD' LIMIT 1;
    SELECT id INTO tenant_uuid FROM public.user_profiles WHERE role = 'TENANT' LIMIT 1;
    SELECT id INTO property_uuid FROM public.properties LIMIT 1;
    SELECT id INTO unit_uuid FROM public.units LIMIT 1;

    -- Create sample invoice
    INSERT INTO public.invoices (
        id, landlord_id, tenant_id, property_id, invoice_number, 
        lines, subtotal, vat_amount, total, due_date
    ) VALUES (
        invoice_uuid,
        landlord_uuid,
        tenant_uuid,
        property_uuid,
        'INV-2025-001',
        '[{"description": "Bérleti díj - január", "quantity": 1, "unit_price": 150000, "total": 150000}]'::jsonb,
        150000,
        40500,
        190500,
        CURRENT_DATE + INTERVAL '30 days'
    );

    -- Create sample rent charge
    INSERT INTO public.rent_charges (
        id, unit_id, due_date, amount, description
    ) VALUES (
        rent_charge_uuid,
        unit_uuid,
        CURRENT_DATE + INTERVAL '30 days',
        150000,
        'Havi bérleti díj - 2025 január'
    );

    -- Create sample payment
    INSERT INTO public.payments (
        rent_charge_id, amount, method, reference_number
    ) VALUES (
        rent_charge_uuid,
        150000,
        'bank_transfer'::public.payment_method,
        'PAY-2025-001'
    );

    -- Create sample maintenance request
    INSERT INTO public.maintenance_requests (
        id, unit_id, created_by_tenant_id, title, description, priority
    ) VALUES (
        maintenance_uuid,
        unit_uuid,
        tenant_uuid,
        'Csöpögő csap a konyhában',
        'A konyhai csap folyamatosan csöpög, javítás szükséges.',
        2
    );

    -- Create sample tasks
    INSERT INTO public.tasks (
        id, user_id, title, description, due_at, related_property_id, priority
    ) VALUES (
        task_uuid,
        landlord_uuid,
        'Éves biztosítás megújítása',
        'A tulajdonosi biztosítás megújítása a következő hónapban esedékes.',
        CURRENT_DATE + INTERVAL '15 days',
        property_uuid,
        2
    );

    -- Create sample activity logs
    INSERT INTO public.activity_logs (user_id, type, ref_id, message) VALUES
        (landlord_uuid, 'invoice_created'::public.activity_type, invoice_uuid, 'Új számla létrehozva: INV-2025-001'),
        (landlord_uuid, 'payment_received'::public.activity_type, rent_charge_uuid, 'Bérleti díj beérkezett: 150,000 HUF'),
        (tenant_uuid, 'maintenance_requested'::public.activity_type, maintenance_uuid, 'Karbantartási kérés beküldve: Csöpögő csap'),
        (landlord_uuid, 'task_created'::public.activity_type, task_uuid, 'Új feladat létrehozva: Biztosítás megújítása');

END $$;

-- 9. Cleanup function for financial module data
CREATE OR REPLACE FUNCTION public.cleanup_financial_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete in dependency order (children first)
    DELETE FROM public.payments WHERE rent_charge_id IN (
        SELECT id FROM public.rent_charges
    );
    DELETE FROM public.activity_logs WHERE type IN (
        'invoice_created', 'payment_received', 'maintenance_requested', 'task_created'
    );
    DELETE FROM public.maintenance_requests;
    DELETE FROM public.rent_charges;
    DELETE FROM public.invoices;
    DELETE FROM public.tasks;
    
    RAISE NOTICE 'Financial module test data cleaned up successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Financial cleanup failed: %', SQLERRM;
END;
$$;