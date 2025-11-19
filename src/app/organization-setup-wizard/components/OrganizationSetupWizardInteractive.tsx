'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ContextualNavigation from '@/components/common/ContextualNavigation';
import ProgressIndicator from '@/components/common/ProgressIndicator';
import OrganizationDetailsStep from './OrganizationDetailsStep';
import PropertySetupStep from './PropertySetupStep';
import TenantInvitationStep from './TenantInvitationStep';
import PaymentConfigurationStep from './PaymentConfigurationStep';
import FeaturePreferencesStep from './FeaturePreferencesStep';
import PlanConfirmationStep from './PlanConfirmationStep';

interface OrganizationDetails {
  organizationName: string;
  businessRegistrationNumber: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  postalCode: string;
  organizationType: string;
}

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  propertyType: string;
  totalUnits: number;
  description: string;
}

interface TenantInvitation {
  id: string;
  email: string;
  name: string;
  propertyId: string;
  unitNumber: string;
  status: 'pending' | 'sent' | 'accepted';
}

interface PaymentConfiguration {
  enableStripe: boolean;
  enableBankTransfer: boolean;
  bankAccountNumber: string;
  bankName: string;
  accountHolderName: string;
  paymentInstructions: string;
  invoiceSettings: {
    enableAutomaticInvoicing: boolean;
    invoicePrefix: string;
    taxNumber: string;
    companyName: string;
  };
}

interface FeaturePreferences {
  enableMaintenanceRequests: boolean;
  enableUtilityMeterReadings: boolean;
  enableChatSystem: boolean;
  enableAppointmentScheduling: boolean;
  enableDocumentManagement: boolean;
  enableFinancialReporting: boolean;
  enableAutomatedReminders: boolean;
  enableTwoFactorAuth: boolean;
}

const OrganizationSetupWizardInteractive = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  // Form data states
  const [organizationDetails, setOrganizationDetails] = useState<OrganizationDetails>({
    organizationName: '',
    businessRegistrationNumber: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    city: '',
    postalCode: '',
    organizationType: ''
  });

  const [properties, setProperties] = useState<Property[]>([]);
  const [tenantInvitations, setTenantInvitations] = useState<TenantInvitation[]>([]);
  
  const [paymentConfiguration, setPaymentConfiguration] = useState<PaymentConfiguration>({
    enableStripe: false,
    enableBankTransfer: true,
    bankAccountNumber: '',
    bankName: '',
    accountHolderName: '',
    paymentInstructions: '',
    invoiceSettings: {
      enableAutomaticInvoicing: false,
      invoicePrefix: 'INV',
      taxNumber: '',
      companyName: ''
    }
  });

  const [featurePreferences, setFeaturePreferences] = useState<FeaturePreferences>({
    enableMaintenanceRequests: true,
    enableUtilityMeterReadings: false,
    enableChatSystem: true,
    enableAppointmentScheduling: false,
    enableDocumentManagement: false,
    enableFinancialReporting: true,
    enableAutomatedReminders: false,
    enableTwoFactorAuth: true
  });

  const featurePreferencesRecord = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(featurePreferences).map(([key, value]) => [key, value])
      ) as Record<string, boolean>,
    [featurePreferences]
  );

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Progress steps configuration
  const steps = [
    {
      id: 'organization-details',
      title: 'Szervezeti adatok',
      description: 'Alapvető információk',
      isCompleted: currentStep > 0,
      isActive: currentStep === 0,
      isClickable: true
    },
    {
      id: 'property-setup',
      title: 'Ingatlanok',
      description: 'Ingatlanok hozzáadása',
      isCompleted: currentStep > 1,
      isActive: currentStep === 1,
      isClickable: currentStep >= 1
    },
    {
      id: 'tenant-invitations',
      title: 'Bérlők',
      description: 'Bérlők meghívása',
      isCompleted: currentStep > 2,
      isActive: currentStep === 2,
      isClickable: currentStep >= 2
    },
    {
      id: 'payment-configuration',
      title: 'Fizetés',
      description: 'Fizetési beállítások',
      isCompleted: currentStep > 3,
      isActive: currentStep === 3,
      isClickable: currentStep >= 3
    },
    {
      id: 'feature-preferences',
      title: 'Funkciók',
      description: 'Funkciók kiválasztása',
      isCompleted: currentStep > 4,
      isActive: currentStep === 4,
      isClickable: currentStep >= 4
    },
    {
      id: 'plan-confirmation',
      title: 'Csomag',
      description: 'Csomag kiválasztása',
      isCompleted: currentStep > 5,
      isActive: currentStep === 5,
      isClickable: currentStep >= 5
    }
  ];

  // Validation functions
  const validateOrganizationDetails = () => {
    return (
      organizationDetails.organizationName.trim() !== '' &&
      organizationDetails.businessRegistrationNumber.trim() !== '' &&
      organizationDetails.contactEmail.trim() !== '' &&
      organizationDetails.contactPhone.trim() !== '' &&
      organizationDetails.address.trim() !== '' &&
      organizationDetails.city.trim() !== '' &&
      organizationDetails.postalCode.trim() !== '' &&
      organizationDetails.organizationType !== ''
    );
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (steps[stepIndex].isClickable) {
      setCurrentStep(stepIndex);
    }
  };

  const handleComplete = () => {
    // Save wizard completion state
    if (typeof window !== 'undefined') {
      localStorage.setItem('wizardCompleted', 'true');
    }
    
    // Redirect to main dashboard
    navigate('/main-dashboard');
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <ContextualNavigation isInWizard={true} />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Betöltés...</p>
          </div>
        </div>
      </div>
    );
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <OrganizationDetailsStep
            data={organizationDetails}
            onDataChange={setOrganizationDetails}
            onNext={handleNext}
            isValid={validateOrganizationDetails()}
          />
        );
      case 1:
        return (
          <PropertySetupStep
            properties={properties}
            onPropertiesChange={setProperties}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 2:
        return (
          <TenantInvitationStep
            invitations={tenantInvitations}
            onInvitationsChange={setTenantInvitations}
            onNext={handleNext}
            onPrevious={handlePrevious}
            properties={properties}
          />
        );
      case 3:
        return (
          <PaymentConfigurationStep
            data={paymentConfiguration}
            onDataChange={setPaymentConfiguration}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <FeaturePreferencesStep
            data={featurePreferences}
            onDataChange={setFeaturePreferences}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
        case 5:
          return (
            <PlanConfirmationStep
              onPrevious={handlePrevious}
              onComplete={handleComplete}
              selectedFeatures={featurePreferencesRecord}
            />
          );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ContextualNavigation isInWizard={true} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <ProgressIndicator
              steps={steps}
              currentStep={currentStep}
              onStepClick={handleStepClick}
            />
          </div>

          {/* Step Content */}
          <div className="bg-card border border-border rounded-lg shadow-subtle">
            <div className="p-6 md:p-8">
              {renderCurrentStep()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSetupWizardInteractive;