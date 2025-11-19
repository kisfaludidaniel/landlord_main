'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  isActive: boolean;
  isClickable?: boolean;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

const ProgressIndicator = ({ 
  steps, 
  currentStep, 
  onStepClick,
  className = '' 
}: ProgressIndicatorProps) => {
  const handleStepClick = (stepIndex: number, step: ProgressStep) => {
    if (step.isClickable && onStepClick) {
      onStepClick(stepIndex);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop Progress Indicator */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div
                className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                  step.isCompleted
                    ? 'bg-success border-success text-success-foreground'
                    : step.isActive
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-background border-border text-muted-foreground'
                } ${
                  step.isClickable ? 'cursor-pointer hover:scale-105' : ''
                }`}
                onClick={() => handleStepClick(index, step)}
              >
                {step.isCompleted ? (
                  <Icon name="CheckIcon" size={20} />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>

              {/* Step Label */}
              <div className="ml-3 min-w-0 flex-1">
                <p
                  className={`text-sm font-medium transition-colors duration-200 ${
                    step.isActive ? 'text-primary' : step.isCompleted ? 'text-success' : 'text-muted-foreground'
                  } ${step.isClickable ? 'cursor-pointer hover:text-foreground' : ''}`}
                  onClick={() => handleStepClick(index, step)}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </p>
                )}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div
                    className={`h-0.5 transition-colors duration-300 ${
                      steps[index + 1].isCompleted || steps[index + 1].isActive
                        ? 'bg-primary' :'bg-border'
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Progress Indicator */}
      <div className="md:hidden">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Lépés {currentStep + 1} / {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Step Info */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {steps[currentStep]?.title}
          </h3>
          {steps[currentStep]?.description && (
            <p className="text-sm text-muted-foreground">
              {steps[currentStep].description}
            </p>
          )}
        </div>

        {/* Step Navigation Dots */}
        <div className="flex justify-center space-x-2 mt-4">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => handleStepClick(index, step)}
              disabled={!step.isClickable}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                step.isCompleted
                  ? 'bg-success'
                  : step.isActive
                  ? 'bg-primary' :'bg-border'
              } ${
                step.isClickable
                  ? 'hover:scale-125 cursor-pointer' :'cursor-default'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;