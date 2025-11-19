import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { PricingPlan, formatPrice, formatPropertyLimit, formatAiStatus } from '@/config/plans';

interface PlanSummaryProps {
  selectedPlan?: PricingPlan;
}

const PlanSummary = ({ selectedPlan }: PlanSummaryProps) => {
  // Default to free plan if none selected
  const plan = selectedPlan || {
    id: 'free',
    name: 'Ingyenes',
    price: 0,
    propertyLimit: 1,
    aiEnabled: false,
    features: [
      'Alapfunkciók',
      'Manuális adminisztráció',
      'Bérlő kezelés',
      'Dokumentumkezelés',
      'Email támogatás'
    ],
    description: 'Alapfunkciók, manuális adminisztráció, AI nélkül.'
  };

  return (
    <div className="w-full max-w-sm">
      <div className="bg-card rounded-lg border border-border p-6 shadow-subtle">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Kiválasztott csomag
          </h3>
          <p className="text-sm text-muted-foreground">
            A regisztráció után aktiválásra kerül
          </p>
        </div>

        <div className="text-center mb-6">
          {plan.id === 'starter' && (
            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-2">
              Legnépszerűbb
            </div>
          )}
          <h4 className="text-xl font-bold text-foreground mb-1">
            {plan.name}
          </h4>
          <div className="flex items-baseline justify-center space-x-1">
            <span className="text-2xl font-bold text-primary">
              {formatPrice(plan.price)}
            </span>
            <span className="text-sm text-muted-foreground">
              /hó
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {plan.description}
          </p>
        </div>

        {/* Plan Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Ingatlanok:</span>
            <span className="font-medium text-foreground">
              {formatPropertyLimit(plan.propertyLimit)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">AI funkciók:</span>
            <span className="font-medium text-foreground">
              {formatAiStatus(plan.aiEnabled)}
            </span>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <h5 className="text-sm font-medium text-foreground">
            Funkciók:
          </h5>
          <ul className="space-y-2">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0 text-success">
                  <Icon name="CheckIcon" size={16} />
                </div>
                <span className="text-sm text-foreground">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-border pt-4">
          <Link
            href="/marketing-homepage#pricing"
            className="flex items-center justify-center space-x-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <Icon name="ArrowPathIcon" size={16} />
            <span>Csomag módosítása</span>
          </Link>
        </div>
      </div>

      {/* Trial Information */}
      {plan.id !== 'free' && (
        <div className="mt-4 p-4 bg-accent/10 border border-accent/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <Icon name="InformationCircleIcon" size={20} className="text-accent flex-shrink-0 mt-0.5" />
            <div>
              <h6 className="text-sm font-medium text-foreground mb-1">
                14 napos ingyenes próbaidőszak
              </h6>
              <p className="text-xs text-muted-foreground">
                Bankkártya megadása nélkül próbálhatja ki a Pro funkciókat. 
                A próbaidőszak után automatikusan az ingyenes csomagra vált.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanSummary;