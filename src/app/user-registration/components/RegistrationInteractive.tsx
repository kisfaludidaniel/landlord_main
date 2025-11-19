'use client';

import React, { useState, useEffect } from 'react';
import RegistrationForm from './RegistrationForm';
import PlanSummary from './PlanSummary';
import SecurityInfo from './SecurityInfo';
import { PRICING_PLANS, type PricingPlan } from '@/config/plans';

const RegistrationInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | undefined>();

  useEffect(() => {
    setIsHydrated(true);
    
    // Check for selected plan from URL params or localStorage
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const planId = urlParams.get('plan') || localStorage.getItem('selectedPlan');
      
      if (planId) {
        const plan = PRICING_PLANS.find((planOption) => planOption.id === planId);
        setSelectedPlan(plan);
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