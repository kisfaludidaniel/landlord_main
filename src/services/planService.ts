import { supabase } from '@/lib/supabase/client';
import { plans as staticPlans } from '@/config/plans';

export interface PlanUsage {
  currentProperties: number
  propertyLimit: number | 'unlimited'
  canAddProperty: boolean
  upgradeRequired: boolean
  suggestedPlan?: string
}

export interface EntitlementCheck {
  hasAccess: boolean
  planRequired?: string
  feature: string
}

export const planService = {
  /**
   * Get current user's plan usage and limits
   */
  async getPlanUsage(userId: string): Promise<PlanUsage> {
    try {
      // Get current subscription and plan
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plans:plan_id (
            id,
            code,
            name,
            property_limit,
            ai_enabled
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (subError) {
        // User has no subscription, return free tier limits
        const freePlan = staticPlans.find(p => p.id === 'free')
        return {
          currentProperties: 0,
          propertyLimit: freePlan?.propertyLimit || 1,
          canAddProperty: false,
          upgradeRequired: true,
          suggestedPlan: 'starter'
        }
      }

      // Get current property count
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('id')
        .eq('landlord_id', userId)
        .eq('is_active', true)

      const currentProperties = properties?.length || 0
      const plan = subscription.plans as any
      const propertyLimit = plan?.property_limit || 1

      const canAddProperty = propertyLimit === null || currentProperties < propertyLimit
      const upgradeRequired = !canAddProperty

      let suggestedPlan: string | undefined
      if (upgradeRequired) {
        // Suggest next tier plan
        const currentPlanCode = plan?.code
        const planHierarchy = ['free', 'starter', 'pro', 'unlimited']
        const currentIndex = planHierarchy.indexOf(currentPlanCode)
        if (currentIndex < planHierarchy.length - 1) {
          suggestedPlan = planHierarchy[currentIndex + 1]
        }
      }

      return {
        currentProperties,
        propertyLimit: propertyLimit === null ? 'unlimited' : propertyLimit,
        canAddProperty,
        upgradeRequired,
        suggestedPlan
      }
    } catch (error) {
      console.error('Error getting plan usage:', error)
      return {
        currentProperties: 0,
        propertyLimit: 1,
        canAddProperty: false,
        upgradeRequired: true,
        suggestedPlan: 'starter'
      }
    }
  },

  /**
   * Check if user has access to specific feature
   */
  async checkEntitlement(userId: string, featureKey: string): Promise<EntitlementCheck> {
    try {
      // Check direct entitlement
      const { data: entitlement, error: entError } = await supabase
        .from('entitlements')
        .select('enabled')
        .eq('user_id', userId)
        .eq('key', featureKey)
        .single()

      if (!entError && entitlement?.enabled) {
        return {
          hasAccess: true,
          feature: featureKey
        }
      }

      // Check plan-based access
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plans:plan_id (
            code,
            ai_enabled,
            features
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (subError || !subscription) {
        return {
          hasAccess: false,
          planRequired: 'starter',
          feature: featureKey
        }
      }

      const plan = subscription.plans as any
      
      // Check AI features
      if (featureKey === 'ai_assistant' || featureKey === 'pro_analytics') {
        if (plan?.ai_enabled) {
          return { hasAccess: true, feature: featureKey }
        } else {
          return { 
            hasAccess: false, 
            planRequired: 'pro', 
            feature: featureKey 
          }
        }
      }

      // Check other features based on plan tier
      const planFeatures = plan?.features || []
      const hasFeature = planFeatures.includes(featureKey) || 
                        this.getFeaturesByPlan(plan?.code || 'free').includes(featureKey)

      if (hasFeature) {
        return { hasAccess: true, feature: featureKey }
      }

      return {
        hasAccess: false,
        planRequired: this.getMinimumPlanForFeature(featureKey),
        feature: featureKey
      }
    } catch (error) {
      console.error('Error checking entitlement:', error)
      return {
        hasAccess: false,
        planRequired: 'starter',
        feature: featureKey
      }
    }
  },

  /**
   * Get features available for a plan
   */
  getFeaturesByPlan(planCode: string): string[] {
    const featureMap: Record<string, string[]> = {
      'free': ['ingatlan_kezeles', 'berlok_kezeles', 'alapveto_riportok'],
      'starter': ['ingatlan_kezeles', 'berlok_kezeles', 'riportok', 'dokumentum_kezeles', 'export_properties'],
      'pro': ['ingatlan_kezeles', 'berlok_kezeles', 'fejlett_riportok', 'ai_asszisztens', 'automatizalas', 'export_properties', 'finance_reports', 'auto_invoicing', 'pro_analytics'],
      'unlimited': ['ingatlan_kezeles', 'berlok_kezeles', 'teljes_riportok', 'ai_asszisztens', 'teljes_automatizalas', 'prioritasos_support', 'export_properties', 'finance_reports', 'auto_invoicing', 'maintenance_module', 'pro_analytics']
    }
    
    return featureMap[planCode] || featureMap['free']
  },

  /**
   * Get minimum plan required for a feature
   */
  getMinimumPlanForFeature(featureKey: string): string {
    const featureRequirements: Record<string, string> = {
      'ai_assistant': 'pro',
      'pro_analytics': 'pro',
      'auto_invoicing': 'pro',
      'finance_reports': 'starter',
      'export_properties': 'starter',
      'maintenance_module': 'unlimited',
      'priority_support': 'unlimited'
    }
    
    return featureRequirements[featureKey] || 'starter'
  },

  /**
   * Change user's subscription plan
   */
  async changePlan(userId: string, newPlanCode: string): Promise<{ error: Error | null }> {
    try {
      // Get the new plan
      const { data: newPlan, error: planError } = await supabase
        .from('plans')
        .select('*')
        .eq('code', newPlanCode)
        .single()

      if (planError || !newPlan) {
        return { error: new Error('A kiválasztott csomag nem található') }
      }

      // Get current subscription
      const { data: currentSub, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (subError) {
        // Create new subscription
        const { error: createError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            plan_id: newPlan.id,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })

        if (createError) {
          return { error: createError as Error }
        }
      } else {
        // Update existing subscription
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            plan_id: newPlan.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentSub.id)

        if (updateError) {
          return { error: updateError as Error }
        }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }
}