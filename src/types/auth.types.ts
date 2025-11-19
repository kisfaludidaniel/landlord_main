import { User, Session } from '@supabase/supabase-js';
import { Database } from './database.types';

export type UserRole = 'ADMIN' | 'LANDLORD' | 'TENANT'
export type PlanTier = 'free' | 'starter' | 'pro' | 'unlimited'
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due'

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type Plan = Database['public']['Tables']['plans']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']

export interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  subscription: Subscription | null
  plan: Plan | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthResponse>
  signUp: (email: string, password: string, profile: SignUpProfile) => Promise<AuthResponse>
  signOut: () => Promise<{ error: Error | null }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>
  hasEntitlement: (key: string) => Promise<boolean>
}

export interface AuthResponse {
  data: { 
    user: User | null
    session: Session | null 
  }
  error: Error | null
}

export interface SignUpProfile {
  fullName: string
  role: UserRole
  phone?: string
  companyName?: string
  companyVatId?: string
  companyAddress?: string
}

export interface AuthFormData {
  email: string
  password: string
  rememberMe?: boolean
}

export interface OnboardingData {
  role: UserRole
  profile: SignUpProfile
  selectedPlan?: PlanTier
  companyData?: {
    name: string
    vatId: string
    address: string
  }
}