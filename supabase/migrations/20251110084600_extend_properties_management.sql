-- Schema Analysis: Existing properties table with basic fields (name, address, description)
-- Integration Type: Extension - Adding property types, buildings, units, tenant invites
-- Dependencies: user_profiles (existing), properties (existing)

-- Step 1: Create property-related enums
CREATE TYPE public.property_type AS ENUM (
    'lakas',         -- Lakás
    'haz',           -- Ház
    'kereskedelmi',  -- Kereskedelmi
    'iroda',         -- Iroda
    'raktar',        -- Raktár
    'tarsashaz',     -- Társasház
    'egyeb'          -- Egyéb
);

CREATE TYPE public.unit_type AS ENUM (
    'lakas',         -- Lakás típusú egység
    'uzlet',         -- Üzlet
    'iroda',         -- Iroda
    'raktar',        -- Raktár
    'egyeb'          -- Egyéb
);

CREATE TYPE public.invite_status AS ENUM (
    'pending',       -- Függőben
    'accepted',      -- Elfogadva
    'declined',      -- Elutasítva
    'expired'        -- Lejárt
);

-- Step 2: Extend existing properties table
ALTER TABLE public.properties 
ADD COLUMN type public.property_type DEFAULT 'lakas'::public.property_type,
ADD COLUMN meta JSONB DEFAULT '{}'::JSONB;

-- Step 3: Create buildings table (for Társasház management)
CREATE TABLE public.buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    meta JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Create units table (individual units within buildings or standalone properties)
CREATE TABLE public.units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    building_id UUID REFERENCES public.buildings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    unit_type public.unit_type DEFAULT 'lakas'::public.unit_type,
    meta JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unit belongs to either property or building
    CONSTRAINT unit_belongs_to_property_or_building CHECK (
        (property_id IS NOT NULL AND building_id IS NULL) OR
        (property_id IS NULL AND building_id IS NOT NULL)
    )
);

-- Step 5: Create tenant invites table
CREATE TABLE public.tenant_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    status public.invite_status DEFAULT 'pending'::public.invite_status,
    invited_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    invited_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
    responded_at TIMESTAMPTZ
);

-- Step 6: Create essential indexes
CREATE INDEX idx_properties_type ON public.properties(type);
CREATE INDEX idx_properties_landlord_type ON public.properties(landlord_id, type);
CREATE INDEX idx_buildings_property_id ON public.buildings(property_id);
CREATE INDEX idx_units_property_id ON public.units(property_id);
CREATE INDEX idx_units_building_id ON public.units(building_id);
CREATE INDEX idx_units_type ON public.units(unit_type);
CREATE INDEX idx_tenant_invites_unit_id ON public.tenant_invites(unit_id);
CREATE INDEX idx_tenant_invites_email ON public.tenant_invites(email);
CREATE INDEX idx_tenant_invites_status ON public.tenant_invites(status);

-- Step 7: Enable RLS for new tables
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_invites ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies

-- Buildings: Access through property ownership
CREATE POLICY "landlords_manage_own_buildings"
ON public.buildings
FOR ALL
TO authenticated
USING (
    property_id IN (
        SELECT id FROM public.properties 
        WHERE landlord_id = auth.uid()
    )
)
WITH CHECK (
    property_id IN (
        SELECT id FROM public.properties 
        WHERE landlord_id = auth.uid()
    )
);

-- Units: Access through property ownership or building ownership
CREATE POLICY "landlords_manage_own_units"
ON public.units
FOR ALL
TO authenticated
USING (
    (property_id IN (
        SELECT id FROM public.properties 
        WHERE landlord_id = auth.uid()
    )) OR
    (building_id IN (
        SELECT b.id FROM public.buildings b
        JOIN public.properties p ON b.property_id = p.id
        WHERE p.landlord_id = auth.uid()
    ))
)
WITH CHECK (
    (property_id IN (
        SELECT id FROM public.properties 
        WHERE landlord_id = auth.uid()
    )) OR
    (building_id IN (
        SELECT b.id FROM public.buildings b
        JOIN public.properties p ON b.property_id = p.id
        WHERE p.landlord_id = auth.uid()
    ))
);

-- Tenant invites: Access through unit ownership
CREATE POLICY "landlords_manage_tenant_invites"
ON public.tenant_invites
FOR ALL
TO authenticated
USING (
    unit_id IN (
        SELECT u.id FROM public.units u
        LEFT JOIN public.properties p ON u.property_id = p.id
        LEFT JOIN public.buildings b ON u.building_id = b.id
        LEFT JOIN public.properties bp ON b.property_id = bp.id
        WHERE p.landlord_id = auth.uid() OR bp.landlord_id = auth.uid()
    )
)
WITH CHECK (
    unit_id IN (
        SELECT u.id FROM public.units u
        LEFT JOIN public.properties p ON u.property_id = p.id
        LEFT JOIN public.buildings b ON u.building_id = b.id
        LEFT JOIN public.properties bp ON b.property_id = bp.id
        WHERE p.landlord_id = auth.uid() OR bp.landlord_id = auth.uid()
    )
);

-- Step 9: Create helper functions for property type validation
CREATE OR REPLACE FUNCTION public.validate_property_meta(
    property_type_param public.property_type,
    meta_data JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    -- Lakás validation
    IF property_type_param = 'lakas' THEN
        RETURN meta_data ? 'alapterulet' AND meta_data ? 'szobaszam';
    
    -- Ház validation  
    ELSIF property_type_param = 'haz' THEN
        RETURN meta_data ? 'telek' AND meta_data ? 'hasznos_alapterulet';
    
    -- Kereskedelmi validation
    ELSIF property_type_param = 'kereskedelmi' THEN
        RETURN meta_data ? 'alapterulet' AND meta_data ? 'funkcio';
    
    -- Iroda validation
    ELSIF property_type_param = 'iroda' THEN
        RETURN meta_data ? 'alapterulet' AND meta_data ? 'munkaallomások_max';
    
    -- Raktár validation
    ELSIF property_type_param = 'raktar' THEN
        RETURN meta_data ? 'alapterulet' AND meta_data ? 'belmagassag';
    
    -- Társasház validation
    ELSIF property_type_param = 'tarsashaz' THEN
        RETURN meta_data ? 'epites_eve';
    
    -- Egyéb validation
    ELSIF property_type_param = 'egyeb' THEN
        RETURN meta_data ? 'alapterulet' AND meta_data ? 'kulcs_jellemzok';
    
    END IF;
    
    RETURN TRUE;
END;
$$;

-- Step 10: Create sample Hungarian property data
DO $$
DECLARE
    landlord_id UUID;
    property_lakas_id UUID := gen_random_uuid();
    property_tarsashaz_id UUID := gen_random_uuid();
    building_id UUID := gen_random_uuid();
    unit1_id UUID := gen_random_uuid();
    unit2_id UUID := gen_random_uuid();
BEGIN
    -- Get existing landlord (from the existing mock data)
    SELECT up.id INTO landlord_id 
    FROM public.user_profiles up 
    WHERE up.role = 'LANDLORD' 
    LIMIT 1;

    -- Update existing property with type and meta
    UPDATE public.properties 
    SET 
        type = 'lakas'::public.property_type,
        meta = '{
            "alapterulet": 75,
            "szobaszam": 3,
            "furdoszoba_szam": 1,
            "erkely_terasz": {"van": true, "meret": 8},
            "klima": true,
            "parkolas": "garázs",
            "emelet": 2,
            "lift": true
        }'::JSONB
    WHERE name = 'Budapesti Lakás';

    -- Add new property: Társasház
    INSERT INTO public.properties (id, landlord_id, name, address, description, type, meta)
    VALUES (
        property_tarsashaz_id,
        landlord_id,
        'Váci Út Társasház',
        '1132 Budapest, Váci út 45.',
        'Modern társasház 24 lakással a XIII. kerületben',
        'tarsashaz'::public.property_type,
        '{
            "epites_eve": 2015,
            "liftek_db": 2,
            "parkolohelyek_db": 18,
            "kozos_terulet": "lobby, fitness, tetőterasz"
        }'::JSONB
    );

    -- Create building for the társasház
    INSERT INTO public.buildings (id, property_id, name, address, meta)
    VALUES (
        building_id,
        property_tarsashaz_id,
        'A épület',
        '1132 Budapest, Váci út 45/A',
        '{
            "szintek": 8,
            "lakasok_szama": 12,
            "lift": true
        }'::JSONB
    );

    -- Create units in the building
    INSERT INTO public.units (id, building_id, name, unit_type, meta)
    VALUES 
        (unit1_id, building_id, '101', 'lakas'::public.unit_type, '{
            "alapterulet": 65,
            "szobaszam": 2,
            "furdoszoba_szam": 1,
            "erkely": true,
            "berleti_dij": 250000
        }'::JSONB),
        (unit2_id, building_id, '102', 'lakas'::public.unit_type, '{
            "alapterulet": 85,
            "szobaszam": 3,
            "furdoszoba_szam": 2,
            "erkely": true,
            "berleti_dij": 320000
        }'::JSONB);

    -- Create sample tenant invites
    INSERT INTO public.tenant_invites (unit_id, email, invited_by)
    VALUES 
        (unit1_id, 'tenant1@example.com', landlord_id),
        (unit2_id, 'tenant2@example.com', landlord_id);

END $$;

-- Step 11: Create cleanup function for new test data
CREATE OR REPLACE FUNCTION public.cleanup_extended_property_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete in dependency order
    DELETE FROM public.tenant_invites WHERE email LIKE '%@example.com';
    DELETE FROM public.units WHERE name IN ('101', '102');
    DELETE FROM public.buildings WHERE name = 'A épület';
    DELETE FROM public.properties WHERE name IN ('Váci Út Társasház');
    
    -- Reset existing property meta and type
    UPDATE public.properties 
    SET type = 'lakas'::public.property_type, meta = '{}'::JSONB
    WHERE name = 'Budapesti Lakás';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup failed: %', SQLERRM;
END;
$$;