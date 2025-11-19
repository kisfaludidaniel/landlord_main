'use client';

import React, { useState, useEffect } from 'react';
import RegistrationForm from './RegistrationForm';
import PlanSummary from './PlanSummary';
import SecurityInfo from './SecurityInfo';

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: Array<{ name: string; included: boolean }>;
  badge?: string;
}

const RegistrationInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | undefined>();

  useEffect(() => {
    setIsHydrated(true);
    
    // Check for selected plan from URL params or localStorage
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const planId = urlParams.get('plan') || localStorage.getItem('selectedPlan');
      
      if (planId) {
        // Mock plan data based on ID
        const plans: Record<string, Plan> = {
          'pro': {
            id: 'pro',
            name: 'Pro',
            price: '4 990 Ft',
            period: 'hónap',
            description: 'Professzionális ingatlankezelőknek',
            badge: 'Legnépszerűbb',
            features: [
              { name: 'Korlátlan ingatlan', included: true },
              { name: 'Haladó bérlőkezelés', included: true },
              { name: 'Automatikus számlázás', included: true },
              { name: 'Prioritásos támogatás', included: true },
              { name: 'Haladó jelentések', included: true },
              { name: 'API hozzáférés', included: true },
              { name: 'Egyedi integráció', included: false }
            ]
          },
          'pro-plus': {
            id: 'pro-plus',
            name: 'Pro + Használat',
            price: '4 990 Ft',
            period: 'hónap',
            description: 'Pro csomag + AI funkciók használat alapján',
            badge: 'Legfejlettebb',
            features: [
              { name: 'Minden Pro funkció', included: true },
              { name: 'AI szerződésgenerálás', included: true },
              { name: 'AI mérőóra leolvasás', included: true },
              { name: 'Egyedi integráció', included: true },
              { name: 'Dedikált támogatás', included: true },
              { name: 'Korlátlan API hívás', included: true },
              { name: 'White-label megoldás', included: true }
            ]
          }
        };
        
        setSelectedPlan(plans[planId]);
      }
    }
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8 justify-center items-start">
            <div className="w-full max-w-md">
              <div className="bg-card rounded-lg border border-border p-8 animate-pulse">
                <div className="h-6 bg-muted rounded mb-6"></div>
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-10 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full max-w-sm">
              <div className="bg-card rounded-lg border border-border p-6 animate-pulse">
                <div className="h-4 bg-muted rounded mb-4"></div>
                <div className="h-8 bg-muted rounded mb-6"></div>
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 justify-center items-start">
          {/* Main Registration Form */}
          <div className="w-full lg:w-auto">
            <RegistrationForm />
          </div>

          {/* Sidebar Information */}
          <div className="w-full lg:w-auto space-y-6">
            {/* Plan Summary */}
            <PlanSummary selectedPlan={selectedPlan} />
            
            {/* Security Information */}
            <SecurityInfo />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationInteractive;