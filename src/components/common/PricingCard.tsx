'use client';

import React from 'react';
import { CheckCircleIcon, StarIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import type { PricingPlan } from '@/config/plans';
import { formatPrice } from '@/config/plans';

interface PricingCardProps {
  plan: PricingPlan;
  isSelected?: boolean;
  isRecommended?: boolean;
  onClick?: () => void;
  className?: string;
  showFeatures?: boolean;
}

export default function PricingCard({ 
  plan, 
  isSelected = false, 
  isRecommended = false, 
  onClick, 
  className = '',
  showFeatures = false
}: PricingCardProps) {
  return (
    <div
      className={`pricing-card ${
        isSelected ? 'pricing-card-selected' : ''
      } ${
        isRecommended ? 'pricing-card-recommended' : ''
      } ${className}`}
      onClick={onClick}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full flex items-center space-x-1 shadow-md">
            <StarIcon className="w-3 h-3" />
            <span>Ajánlott</span>
          </div>
        </div>
      )}
      
      <div className="text-center">
        <h3 className="font-bold text-gray-900 mb-2 text-lg">{plan.name}</h3>
        <div className="mb-4">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {formatPrice(plan.price)}
          </div>
          <p className="text-sm text-gray-600">/hónap</p>
        </div>
        
        {showFeatures && (
          <div className="text-left space-y-3 mb-6">
            <div className="flex items-center text-sm text-gray-700">
              <CheckIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              <span>
                {typeof plan.propertyLimit === 'number' 
                  ? `${plan.propertyLimit} ingatlan`
                  : 'Korlátlan ingatlan'
                }
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <CheckIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              <span>AI asszisztens: {plan.aiEnabled ? 'Igen' : 'Nem'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <CheckIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              <span>Bérlő kezelés</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <CheckIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              <span>Automatikus számlázás</span>
            </div>
          </div>
        )}

        {!showFeatures && (
          <div className="text-xs text-gray-600 space-y-1 mb-4">
            <div>
              {typeof plan.propertyLimit === 'number' 
                ? `${plan.propertyLimit} ingatlan`
                : 'Korlátlan ingatlan'
              }
            </div>
            <div>AI: {plan.aiEnabled ? 'Igen' : 'Nem'}</div>
          </div>
        )}
      </div>

      {isSelected && (
        <div className="absolute top-3 right-3">
          <CheckCircleIcon className="w-6 h-6 text-blue-500" />
        </div>
      )}
    </div>
  );
}