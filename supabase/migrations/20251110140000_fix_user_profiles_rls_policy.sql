-- Fix user profiles RLS policy issues
-- This migration addresses the profile creation error by updating RLS policies

-- Drop existing problematic policy
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;

-- Create more permissive RLS policies for user profile creation
CREATE POLICY "users_can_create_own_profile" ON public.user_profiles
    FOR INSERT 
    WITH CHECK (id = auth.uid());

CREATE POLICY "users_can_read_own_profile" ON public.user_profiles
    FOR SELECT 
    USING (id = auth.uid());

CREATE POLICY "users_can_update_own_profile" ON public.user_profiles
    FOR UPDATE 
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "users_can_delete_own_profile" ON public.user_profiles
    FOR DELETE 
    USING (id = auth.uid());

-- Update the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    default_plan_id UUID;
    user_role_val public.user_role;
BEGIN
    -- Get free plan ID
    SELECT id INTO default_plan_id FROM public.plans WHERE code = 'free' LIMIT 1;
    
    -- Extract role from metadata, default to LANDLORD
    user_role_val := COALESCE(
        (NEW.raw_user_meta_data->>'role')::public.user_role, 
        'LANDLORD'::public.user_role
    );
    
    -- Create user profile with proper error handling
    BEGIN
        INSERT INTO public.user_profiles (
            id, 
            email, 
            full_name,
            role,
            phone
        )
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(
                NEW.raw_user_meta_data->>'full_name', 
                NEW.raw_user_meta_data->>'fullName',
                split_part(NEW.email, '@', 1)
            ),
            user_role_val,
            NEW.raw_user_meta_data->>'phone'
        );
        
        -- Create default subscription for landlords only
        IF user_role_val = 'LANDLORD' AND default_plan_id IS NOT NULL THEN
            INSERT INTO public.subscriptions (user_id, plan_id, status)
            VALUES (NEW.id, default_plan_id, 'active'::public.subscription_status);
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        -- Log error and continue (don't block user creation)
        RAISE WARNING 'Error creating user profile for %: %', NEW.id, SQLERRM;
    END;
    
    RETURN NEW;
END;
$function$;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on user_profiles if not already enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON public.user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_lower ON public.user_profiles(lower(email));

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT SELECT ON public.plans TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;