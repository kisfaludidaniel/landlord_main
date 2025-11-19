'use client';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PRICING_PLANS, formatPrice, formatPropertyLimit } from '@/config/plans';
import Icon from '@/components/ui/AppIcon';

export default function LandlordPlanPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<string>('starter')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if user is authenticated and has landlord role
    if (!user) {
      navigate('/onboarding/role')
      return
    }

    if (profile?.role !== 'LANDLORD') {
      navigate('/onboarding/role')
      return
    }
  }, [user, profile, navigate])

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
  }

  const handleContinue = async () => {
    if (!selectedPlan) return

    setIsLoading(true)
    try {
      // Store selected plan for next steps
      sessionStorage.setItem('onboarding_selected_plan', selectedPlan)
      
      // For now, redirect to finish step
      // In a real implementation, this would handle Stripe subscription creation
      navigate('/onboarding/landlord/finish')
    } catch (error) {
      console.error('Plan selection error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Válassza ki a csomagját
          </h1>
          <p className="text-muted-foreground text-lg">
            Válassza ki az Önnek megfelelő csomagot az ingatlankezeléshez
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {PRICING_PLANS?.map((plan) => (
            <div
              key={plan.id}
              onClick={() => handlePlanSelect(plan.id)}
              className={`
                cursor-pointer border-2 rounded-lg p-6 transition-all duration-200 relative
                ${selectedPlan === plan.id
                  ? 'border-primary bg-primary/5 shadow-lg transform scale-105'
                  : 'border-border bg-card hover:border-primary/50 hover:shadow-md'
                }
                ${plan.id === 'starter' ? 'ring-2 ring-primary ring-opacity-50' : ''}
              `}
            >
              {/* Recommended Badge */}
              {plan.id === 'starter' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    AJÁNLOTT
                  </span>
                </div>
              )}

              <div className="text-center">
                {/* Plan Header */}
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                
                {/* Price */}
                <div className="mb-4">
                  <span className="text-3xl font-bold text-foreground">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="text-muted-foreground ml-1">Ft/hó</span>
                </div>

                {/* Property Limit */}
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-center space-x-2">
                    <Icon name="HomeIcon" size={16} className="text-primary" />
                    <span className="font-medium text-foreground">
                      {formatPropertyLimit(plan.propertyLimit)}
                    </span>
                  </div>
                </div>

                {/* AI Badge */}
                <div className="mb-4">
                  <span className={`
                    inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                    ${plan.aiEnabled
                      ? 'bg-success/20 text-success border border-success/30' :'bg-muted text-muted-foreground border border-border'
                    }
                  `}>
                    <Icon 
                      name={plan.aiEnabled ? "SparklesIcon" : "XMarkIcon"} 
                      size={14} 
                      className="mr-1" 
                    />
                    AI: {plan.aiEnabled ? 'igen' : 'nem'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>

                {/* Features */}
                <div className="space-y-2 text-left">
                  {plan.features?.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Icon name="CheckIcon" size={14} className="text-primary flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                  {plan.features && plan.features.length > 4 && (
                    <div className="text-xs text-muted-foreground pt-1">
                      +{plan.features.length - 4} további funkció
                    </div>
                  )}
                </div>

                {/* Selection Indicator */}
                {selectedPlan === plan.id && (
                  <div className="mt-4 pt-4 border-t border-primary/20">
                    <div className="flex items-center justify-center space-x-2 text-primary">
                      <Icon name="CheckCircleIcon" size={20} />
                      <span className="font-medium">Kiválasztva</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Plan Comparison Info */}
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Miért válassza a {PRICING_PLANS?.find(p => p.id === selectedPlan)?.name} csomagot?
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-2">Funkciók:</h4>
              <ul className="space-y-1">
                {PRICING_PLANS?.find(p => p.id === selectedPlan)?.features?.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Icon name="CheckIcon" size={14} className="text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Előnyök:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Bármikor lemondható</li>
                <li>• Azonnali hozzáférés minden funkcióhoz</li>
                <li>• 24/7 ügyfélszolgálat</li>
                <li>• Automatikus mentések</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/onboarding/landlord/profile')}
            className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-2"
          >
            <Icon name="ArrowLeftIcon" size={16} />
            <span>Vissza</span>
          </button>

          <button
            onClick={handleContinue}
            disabled={!selectedPlan || isLoading}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                <span>Feldolgozás...</span>
              </>
            ) : (
              <>
                <span>Csomag kiválasztása</span>
                <Icon name="ArrowRightIcon" size={16} />
              </>
            )}
          </button>
        </div>

        {/* Payment Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            A következő lépésben beállíthatja a fizetési módot. 
            Az első hónap ingyenes, és bármikor lemondhatja előfizetését.
          </p>
        </div>
      </div>
    </div>
  )
}