'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface PlanConfirmationStepProps {
  onPrevious: () => void;
  onComplete: () => void;
  selectedFeatures: Record<string, boolean>;
}

const PlanConfirmationStep = ({ onPrevious, onComplete, selectedFeatures }: PlanConfirmationStepProps) => {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>('free');
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Ingyenes',
      price: '0 Ft',
      period: '/hó',
      description: 'Kezdőknek és kis ingatlanportfólióhoz',
      features: [
        'Legfeljebb 3 ingatlan',
        'Alapvető bérlőkezelés',
        'Egyszerű számlázás',
        'Email támogatás',
        'Karbantartási kérések',
        'Valós idejű chat',
        'Pénzügyi jelentések',
        'Kétfaktoros hitelesítés'
      ],
      limitations: [
        'Korlátozott tárhely (1 GB)',
        'Nincs AI funkció',
        'Nincs automatizáció',
        'Nincs prioritásos támogatás'
      ],
      buttonText: 'Ingyenes indítás',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '4 990 Ft',
      period: '/hó',
      description: 'Professzionális ingatlankezelőknek',
      features: [
        'Korlátlan ingatlanok',
        'Teljes bérlőkezelés',
        'AI-alapú számlázás',
        'Prioritásos támogatás',
        'Minden ingyenes funkció',
        'AI mérőóra leolvasás',
        'Automatikus időpontfoglalás',
        'Dokumentumgenerálás',
        'Automatikus emlékeztetők',
        'Fejlett jelentések',
        'API integráció',
        'Korlátlan tárhely'
      ],
      limitations: [],
      buttonText: '14 napos ingyenes próba',
      popular: true,
      trialNote: 'Bankkártya nélkül, automatikus lemondás'
    }
  ];

  const getRecommendedPlan = () => {
    const premiumFeatures = Object.entries(selectedFeatures).filter(([key, enabled]) => {
      const premiumKeys = [
        'enableUtilityMeterReadings',
        'enableAppointmentScheduling', 
        'enableDocumentManagement',
        'enableAutomatedReminders'
      ];
      return enabled && premiumKeys.includes(key);
    });

    return premiumFeatures.length > 0 ? 'pro' : 'free';
  };

  const recommendedPlan = getRecommendedPlan();

  const handlePlanSelect = (planId: 'free' | 'pro') => {
    setSelectedPlan(planId);
  };

  const handleComplete = async () => {
    setIsProcessing(true);
    
    // Simulate setup completion
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Csomag kiválasztása
        </h2>
        <p className="text-muted-foreground">
          Válassza ki a szervezete igényeinek megfelelő csomagot
        </p>
      </div>

      {/* Recommendation Banner */}
      {recommendedPlan === 'pro' && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Icon name="LightBulbIcon" size={20} className="text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-primary mb-1">Ajánlás a kiválasztott funkciók alapján</h4>
              <p className="text-sm text-primary/80">
                A kiválasztott Pro funkciók miatt a Pro csomag használatát ajánljuk. 
                14 napos ingyenes próbaidőszakkal kezdheti.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-card border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
              selectedPlan === plan.id
                ? 'border-primary shadow-subtle'
                : 'border-border hover:border-primary/50'
            } ${
              recommendedPlan === plan.id ? 'ring-2 ring-primary/20' : ''
            }`}
            onClick={() => handlePlanSelect(plan.id as 'free' | 'pro')}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-full">
                  Legnépszerűbb
                </span>
              </div>
            )}

            {/* Recommended Badge */}
            {recommendedPlan === plan.id && (
              <div className="absolute -top-3 right-4">
                <span className="bg-success text-success-foreground px-3 py-1 text-xs font-medium rounded-full">
                  Ajánlott
                </span>
              </div>
            )}

            {/* Plan Header */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center space-x-1">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              {plan.trialNote && (
                <p className="text-xs text-success mt-1">{plan.trialNote}</p>
              )}
            </div>

            {/* Features */}
            <div className="space-y-4 mb-6">
              <div>
                <h4 className="font-medium text-foreground mb-3">Tartalmazza:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <Icon name="CheckIcon" size={16} className="text-success mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {plan.limitations.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-3">Korlátozások:</h4>
                  <ul className="space-y-2">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <Icon name="XMarkIcon" size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Selection Indicator */}
            <div className="flex items-center justify-center">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === plan.id
                  ? 'border-primary bg-primary' :'border-border'
              }`}>
                {selectedPlan === plan.id && (
                  <Icon name="CheckIcon" size={16} className="text-primary-foreground" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Plan Summary */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-foreground">
              Kiválasztott csomag: {plans.find(p => p.id === selectedPlan)?.name}
            </h4>
            <p className="text-sm text-muted-foreground">
              {selectedPlan === 'pro' ?'14 napos ingyenes próbaidőszak, majd havi 4 990 Ft' :'Teljesen ingyenes, korlátlan ideig'
              }
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-foreground">
              {plans.find(p => p.id === selectedPlan)?.price}
              <span className="text-sm font-normal text-muted-foreground">
                {plans.find(p => p.id === selectedPlan)?.period}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Privacy */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          A folytatással elfogadja a{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Felhasználási Feltételeket
          </Link>{' '}
          és az{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Adatvédelmi Szabályzatot
          </Link>
          .
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onPrevious}
          disabled={isProcessing}
          className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <Icon name="ArrowLeftIcon" size={16} className="mr-2 inline" />
          Előző lépés
        </button>
        <button
          onClick={handleComplete}
          disabled={isProcessing}
          className="px-8 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
        >
          {isProcessing ? (
            <>
              <Icon name="ArrowPathIcon" size={16} className="mr-2 inline animate-spin" />
              Beállítás...
            </>
          ) : (
            <>
              Beállítás befejezése
              <Icon name="CheckIcon" size={16} className="ml-2 inline" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PlanConfirmationStep;