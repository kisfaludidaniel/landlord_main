'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { AuthContextType, UserProfile, Plan, Subscription, AuthResponse, SignUpProfile } from '@/types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error.message)
          return
        }
        
        if (session?.user) {
          setUser(session.user)
          await loadUserProfile(session.user.id)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            setUser(session.user)
            await loadUserProfile(session.user.id)
          } else {
            setUser(null)
            setProfile(null)
            setSubscription(null)
            setPlan(null)
          }
        } catch (error) {
          console.error('Error in auth state change:', error)
        } finally {
          setLoading(false)
        }
      }
    )

    return () => {
      authSubscription?.unsubscribe?.()
    }
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      // Load user profile with better error handling
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (profileError) {
        console.error('Error loading profile:', profileError.message)
        return
      }

      // If no profile found, create one from auth metadata
      if (!profileData) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.user_metadata) {
          const newProfile = {
            id: userId,
            email: user.email || '',
            full_name: user.user_metadata.full_name || user.user_metadata.name || '',
            role: user.user_metadata.role || 'LANDLORD',
            phone: user.user_metadata.phone || null,
            company_name: user.user_metadata.company_name || null,
            company_vat_id: user.user_metadata.company_vat_id || null,
            company_address: user.user_metadata.company_address || null
          }

          // Try to create the profile
          const { data: createdProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert(newProfile)
            .select()
            .single()

          if (createError) {
            console.error('Error creating profile:', createError.message)
            return
          }

          setProfile(createdProfile)
        }
        return
      }

      setProfile(profileData)

      // Load subscription and plan for landlords with better query
      if (profileData?.role === 'LANDLORD') {
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select(`
            *,
            plans:plan_id (*)
          `)
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (!subscriptionError && subscriptionData) {
          setSubscription(subscriptionData)
          setPlan(subscriptionData.plans as Plan)
        } else if (subscriptionError) {
          console.error('Error loading subscription:', subscriptionError.message)
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error) {
        return { data: { user: null, session: null }, error }
      }

      return { data, error: null }
    } catch (error) {
      return { 
        data: { user: null, session: null }, 
        error: error instanceof Error ? error : new Error('Bejelentkezési hiba történt') 
      }
    }
  }

  const signUp = async (email: string, password: string, profileData: SignUpProfile): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: profileData.fullName,
            role: profileData.role,
            phone: profileData.phone,
            company_name: profileData.companyName,
            company_vat_id: profileData.companyVatId,
            company_address: profileData.companyAddress
          }
        }
      })

      if (error) {
        return { data: { user: null, session: null }, error }
      }

      return { data, error: null }
    } catch (error) {
      return { 
        data: { user: null, session: null }, 
        error: error instanceof Error ? error : new Error('Regisztrációs hiba történt') 
      }
    }
  }

  const signOut = async (): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (!error) {
        setUser(null)
        setProfile(null)
        setSubscription(null)
        setPlan(null)
      }

      return { error }
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Kijelentkezési hiba történt') }
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ error: Error | null }> => {
    try {
      if (!user) {
        return { error: new Error('Nincs bejelentkezett felhasználó') }
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (!error) {
        setProfile(prev => prev ? { ...prev, ...updates } : null)
      }

      return { error }
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Profil frissítési hiba') }
    }
  }

  const hasEntitlement = async (key: string): Promise<boolean> => {
    try {
      if (!user) return false

      const { data, error } = await supabase
        .from('entitlements')
        .select('enabled')
        .eq('user_id', user.id)
        .eq('key', key)
        .maybeSingle()

      if (error) {
        console.error('Error checking entitlement:', error.message)
        return false
      }
      
      return data?.enabled === true
    } catch (error) {
      console.error('Error in hasEntitlement:', error)
      return false
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    subscription,
    plan,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    hasEntitlement
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}