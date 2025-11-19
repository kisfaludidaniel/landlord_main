export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          role: 'ADMIN' | 'LANDLORD' | 'TENANT'
          company_name: string | null
          company_vat_id: string | null
          company_address: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          role?: 'ADMIN' | 'LANDLORD' | 'TENANT'
          company_name?: string | null
          company_vat_id?: string | null
          company_address?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          role?: 'ADMIN' | 'LANDLORD' | 'TENANT'
          company_name?: string | null
          company_vat_id?: string | null
          company_address?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      plans: {
        Row: {
          id: string
          code: 'free' | 'starter' | 'pro' | 'unlimited'
          name: string
          price_huf: number
          property_limit: number | null
          ai_enabled: boolean
          features: any
          description: string | null
          is_active: boolean | null
          tier: number
          created_at: string
        }
        Insert: {
          id?: string
          code: 'free' | 'starter' | 'pro' | 'unlimited'
          name: string
          price_huf?: number
          property_limit?: number | null
          ai_enabled?: boolean
          features?: any
          description?: string | null
          is_active?: boolean | null
          tier?: number
          created_at?: string
        }
        Update: {
          id?: string
          code?: 'free' | 'starter' | 'pro' | 'unlimited'
          name?: string
          price_huf?: number
          property_limit?: number | null
          ai_enabled?: boolean
          features?: any
          description?: string | null
          is_active?: boolean | null
          tier?: number
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: 'active' | 'inactive' | 'cancelled' | 'past_due'
          current_period_start: string
          current_period_end: string
          stripe_subscription_id: string | null
          provider: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status?: 'active' | 'inactive' | 'cancelled' | 'past_due'
          current_period_start?: string
          current_period_end?: string
          stripe_subscription_id?: string | null
          provider?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: 'active' | 'inactive' | 'cancelled' | 'past_due'
          current_period_start?: string
          current_period_end?: string
          stripe_subscription_id?: string | null
          provider?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      feature_flags: {
        Row: {
          key: string
          description: string
          is_active: boolean | null
          created_at: string
        }
        Insert: {
          key: string
          description: string
          is_active?: boolean | null
          created_at?: string
        }
        Update: {
          key?: string
          description?: string
          is_active?: boolean | null
          created_at?: string
        }
      }
      entitlements: {
        Row: {
          id: string
          user_id: string
          key: string
          enabled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          key: string
          enabled?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          key?: string
          enabled?: boolean
          created_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          landlord_id: string
          name: string
          address: string
          description: string | null
          is_active: boolean | null
          type: 'lakas' | 'haz' | 'kereskedelmi' | 'iroda' | 'raktar' | 'tarsashaz' | 'egyeb'
          meta: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          landlord_id: string
          name: string
          address: string
          description?: string | null
          is_active?: boolean | null
          type?: 'lakas' | 'haz' | 'kereskedelmi' | 'iroda' | 'raktar' | 'tarsashaz' | 'egyeb'
          meta?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          landlord_id?: string
          name?: string
          address?: string
          description?: string | null
          is_active?: boolean | null
          type?: 'lakas' | 'haz' | 'kereskedelmi' | 'iroda' | 'raktar' | 'tarsashaz' | 'egyeb'
          meta?: any
          created_at?: string
          updated_at?: string
        }
      }
      buildings: {
        Row: {
          id: string
          property_id: string
          name: string
          address: string
          meta: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          name: string
          address: string
          meta?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          name?: string
          address?: string
          meta?: any
          created_at?: string
          updated_at?: string
        }
      }
      units: {
        Row: {
          id: string
          property_id: string | null
          building_id: string | null
          name: string
          unit_type: 'lakas' | 'uzlet' | 'iroda' | 'raktar' | 'egyeb'
          meta: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id?: string | null
          building_id?: string | null
          name: string
          unit_type?: 'lakas' | 'uzlet' | 'iroda' | 'raktar' | 'egyeb'
          meta?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string | null
          building_id?: string | null
          name?: string
          unit_type?: 'lakas' | 'uzlet' | 'iroda' | 'raktar' | 'egyeb'
          meta?: any
          created_at?: string
          updated_at?: string
        }
      }
      tenant_invites: {
        Row: {
          id: string
          unit_id: string
          email: string
          status: 'pending' | 'accepted' | 'declined' | 'expired'
          invited_by: string
          invited_at: string
          expires_at: string
          responded_at: string | null
        }
        Insert: {
          id?: string
          unit_id: string
          email: string
          status?: 'pending' | 'accepted' | 'declined' | 'expired'
          invited_by: string
          invited_at?: string
          expires_at?: string
          responded_at?: string | null
        }
        Update: {
          id?: string
          unit_id?: string
          email?: string
          status?: 'pending' | 'accepted' | 'declined' | 'expired'
          invited_by?: string
          invited_at?: string
          expires_at?: string
          responded_at?: string | null
        }
      }
    }
    Functions: {
      check_property_limit: {
        Args: {
          landlord_uuid: string
        }
        Returns: boolean
      }
      cleanup_test_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      validate_property_meta: {
        Args: {
          property_type_param: 'lakas' | 'haz' | 'kereskedelmi' | 'iroda' | 'raktar' | 'tarsashaz' | 'egyeb'
          meta_data: any
        }
        Returns: boolean
      }
      cleanup_extended_property_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
  }
}