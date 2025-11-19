'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { 
  PRICING_PLANS, 
  getCurrentUserPlan, 
  getCurrentPropertyCount,
  formatPrice, 
  formatPropertyLimit, 
  formatAiStatus 
} from '@/config/plans';

const SubscriptionInteractive = () => {
  const [currentPlan] = useState(getCurrentUserPlan());
  const [propertyCount] = useState(getCurrentPropertyCount());

  const handleUpgrade = (planId: string) => {
    console.log('Upgrading to plan:', planId);
    // Implement upgrade logic
  };

  const handleManageBilling = () => {
    console.log('Managing billing');
    // Implement billing management
  };

  return (
    <div className="space-y-8">
      {/* Current Plan Section */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">Jelenlegi csomag</h2>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <h3 className="text-lg font-medium text-foreground">{currentPlan.name}</h3>
              {currentPlan.id === 'starter' && (
                <span className="px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                  Jelenlegi
                </span>
              )}
            </div>
            
            <p className="text-muted-foreground mb-4">{currentPlan.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center space-x-3">
                <Icon name="CurrencyDollarIcon" size={20} className="text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Ár</div>
                  <div className="font-medium text-foreground">
                    {formatPrice(currentPlan.price)}/hó
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Icon name="BuildingOfficeIcon" size={20} className="text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Ingatlanok</div>
                  <div className="font-medium text-foreground">
                    {currentPlan.propertyLimit === "unlimited" 
                      ? `${propertyCount} / korlátlan`
                      : `${propertyCount} / ${currentPlan.propertyLimit}`
                    }
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Icon name="CpuChipIcon" size={20} className="text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">AI funkciók</div>
                  <div className="font-medium text-foreground">
                    {formatAiStatus(currentPlan.aiEnabled)}
                  </div>
                </div>
              </div>
            </div>

            {currentPlan.id !== 'free' && (
              <button
                onClick={handleManageBilling}
                className="inline-flex items-center px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Icon name="CreditCardIcon" size={16} className="mr-2" />
                Számlázás kezelése
              </button>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">
              {formatPrice(currentPlan.price)}
            </div>
            <div className="text-sm text-muted-foreground">/hó</div>
          </div>
        </div>
      </div>

      {/* Available Plans Section */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-6">Elérhető csomagok</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-card border-2 rounded-lg p-6 transition-all duration-300 hover:shadow-lg ${
                plan.id === currentPlan.id
                  ? 'border-primary bg-primary/5'
                  : plan.id === 'starter' ?'border-primary shadow-md' :'border-border hover:border-primary/50'
              }`}
            >
              {plan.id === 'starter' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    Ajánlott
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-foreground">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="text-muted-foreground text-sm">/hó</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center space-x-2">
                    <Icon name="BuildingOfficeIcon" size={14} className="text-muted-foreground" />
                    <span>{formatPropertyLimit(plan.propertyLimit)}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Icon name="CpuChipIcon" size={14} className="text-muted-foreground" />
                    <span>{formatAiStatus(plan.aiEnabled)}</span>
                  </div>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Icon name="CheckIcon" size={14} className="text-success mr-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
                {plan.features.length > 4 && (
                  <li className="text-xs text-muted-foreground">
                    +{plan.features.length - 4} további funkció
                  </li>
                )}
              </ul>

              {plan.id === currentPlan.id ? (
                <div className="w-full px-4 py-2 border border-primary bg-primary/10 text-primary text-center rounded-md text-sm font-medium">
                  Jelenlegi csomag
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    plan.id === 'starter' ?'bg-primary text-primary-foreground hover:bg-primary/90' :'bg-muted text-foreground hover:bg-muted/80 border border-border'
                  }`}
                >
                  {plan.price > currentPlan.price || (currentPlan.price === 0 && plan.price > 0)
                    ? 'Frissítés' :'Váltok erre'
                  }
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Features Comparison */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">Funkciók összehasonlítása</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-foreground">Funkció</th>
                {PRICING_PLANS.map((plan) => (
                  <th key={plan.id} className="text-center py-3 px-4 font-medium text-foreground min-w-[100px]">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-muted-foreground">Ingatlan limit</td>
                {PRICING_PLANS.map((plan) => (
                  <td key={plan.id} className="text-center py-3 px-4">
                    {formatPropertyLimit(plan.propertyLimit)}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-muted-foreground">AI asszisztens</td>
                {PRICING_PLANS.map((plan) => (
                  <td key={plan.id} className="text-center py-3 px-4">
                    {plan.aiEnabled ? (
                      <Icon name="CheckIcon" size={16} className="text-success mx-auto" />
                    ) : (
                      <Icon name="XMarkIcon" size={16} className="text-muted-foreground mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-muted-foreground">Dokumentumkezelés</td>
                {PRICING_PLANS.map((plan) => (
                  <td key={plan.id} className="text-center py-3 px-4">
                    <Icon name="CheckIcon" size={16} className="text-success mx-auto" />
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-muted-foreground">Automatikus emlékeztetők</td>
                {PRICING_PLANS.map((plan) => (
                  <td key={plan.id} className="text-center py-3 px-4">
                    {['pro', 'unlimited'].includes(plan.id) ? (
                      <Icon name="CheckIcon" size={16} className="text-success mx-auto" />
                    ) : (
                      <Icon name="XMarkIcon" size={16} className="text-muted-foreground mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-muted-foreground">Prioritásos támogatás</td>
                {PRICING_PLANS.map((plan) => (
                  <td key={plan.id} className="text-center py-3 px-4">
                    {['pro', 'unlimited'].includes(plan.id) ? (
                      <Icon name="CheckIcon" size={16} className="text-success mx-auto" />
                    ) : (
                      <Icon name="XMarkIcon" size={16} className="text-muted-foreground mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionInteractive;