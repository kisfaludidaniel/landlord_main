'use client';

import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/AppIcon';
import { PricingPlan, PRICING_PLANS, formatPrice, formatPropertyLimit } from '@/config/plans';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'property-limit' | 'ai-feature';
  currentPlan: PricingPlan;
  propertyLimit?: number;
}

const UpgradeModal = ({ 
  isOpen, 
  onClose, 
  type, 
  currentPlan, 
  propertyLimit 
}: UpgradeModalProps) => {
  if (!isOpen) return null;

  const getModalContent = () => {
    switch (type) {
      case 'property-limit':
        return {
          title: 'Elérted a csomagod ingatlanlimitjét',
          message: `A jelenlegi csomagod legfeljebb ${propertyLimit} ingatlant enged. Frissíts a nagyobb csomagra a folytatáshoz.`,
          primaryAction: 'Csomagok megtekintése',
          secondaryAction: 'Mégse'
        };
      case 'ai-feature':
        return {
          title: 'Ez az AI funkció nem érhető el a csomagodban',
          message: 'Az AI asszisztens a Pro és Korlátlan csomagokban érhető el.',
          primaryAction: 'Frissítés',
          secondaryAction: 'Mégse'
        };
      default:
        return {
          title: 'Frissítés szükséges',
          message: 'Ez a funkció nem érhető el a jelenlegi csomagodban.',
          primaryAction: 'Frissítés',
          secondaryAction: 'Mégse'
        };
    }
  };

  const content = getModalContent();

  const getRecommendedPlans = () => {
    const currentIndex = PRICING_PLANS.findIndex(plan => plan.id === currentPlan.id);
    return PRICING_PLANS.slice(currentIndex + 1);
  };

  const recommendedPlans = getRecommendedPlans();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-card rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
                <Icon name="ExclamationTriangleIcon" size={24} className="text-primary" />
              </div>
              <div className="ml-4 w-full">
                <h3 className="text-lg leading-6 font-medium text-foreground">
                  {content.title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    {content.message}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended plans */}
          {recommendedPlans.length > 0 && (
            <div className="px-6 pb-4">
              <h4 className="text-sm font-medium text-foreground mb-3">
                Ajánlott csomagok:
              </h4>
              <div className="space-y-2">
                {recommendedPlans.map((plan) => (
                  <div 
                    key={plan.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-foreground">
                          {plan.name}
                        </span>
                        {plan.id === 'starter' && (
                          <span className="px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                            Ajánlott
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatPropertyLimit(plan.propertyLimit)} • {plan.aiEnabled ? 'AI: igen' : 'AI: nem'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-foreground">
                        {formatPrice(plan.price)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        /hó
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="bg-muted/50 px-6 py-4 sm:flex sm:flex-row-reverse">
            <Link
              to="/subscription"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm transition-colors"
              onClick={onClose}
            >
              {content.primaryAction}
            </Link>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-border shadow-sm px-4 py-2 bg-card text-base font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
              onClick={onClose}
            >
              {content.secondaryAction}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;