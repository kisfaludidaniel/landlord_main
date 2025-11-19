'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

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

interface PaymentConfigurationStepProps {
  data: PaymentConfiguration;
  onDataChange: (data: PaymentConfiguration) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const PaymentConfigurationStep = ({ data, onDataChange, onNext, onPrevious }: PaymentConfigurationStepProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (data.enableBankTransfer) {
      if (!data.bankAccountNumber.trim()) {
        newErrors.bankAccountNumber = 'A bankszámlaszám kötelező';
      } else if (!/^\d{8}-\d{8}(-\d{8})?$/.test(data.bankAccountNumber)) {
        newErrors.bankAccountNumber = 'Helyes formátum: 12345678-12345678 vagy 12345678-12345678-12345678';
      }
      
      if (!data.bankName.trim()) newErrors.bankName = 'A bank neve kötelező';
      if (!data.accountHolderName.trim()) newErrors.accountHolderName = 'A számlatulajdonos neve kötelező';
    }

    if (data.invoiceSettings.enableAutomaticInvoicing) {
      if (!data.invoiceSettings.invoicePrefix.trim()) {
        newErrors.invoicePrefix = 'A számla előtag kötelező';
      }
      if (!data.invoiceSettings.taxNumber.trim()) {
        newErrors.taxNumber = 'Az adószám kötelező';
      }
      if (!data.invoiceSettings.companyName.trim()) {
        newErrors.companyName = 'A cég neve kötelező';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('invoiceSettings.')) {
      const invoiceField = field.replace('invoiceSettings.', '');
      onDataChange({
        ...data,
        invoiceSettings: {
          ...data.invoiceSettings,
          [invoiceField]: value
        }
      });
    } else {
      onDataChange({ ...data, [field]: value });
    }
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Fizetési beállítások
        </h2>
        <p className="text-muted-foreground">
          Állítsa be a fizetési módokat és számlázási beállításokat
        </p>
      </div>

      {/* Payment Methods */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Fizetési módok</h3>

        {/* Stripe Payment */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg">
              <Icon name="CreditCardIcon" size={24} className="text-accent" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-foreground">Online kártyás fizetés (Stripe)</h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.enableStripe}
                    onChange={(e) => handleInputChange('enableStripe', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Engedélyezze a bérlőknek, hogy bankkártyával fizessenek online
              </p>
              {data.enableStripe && (
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Icon name="ExclamationTriangleIcon" size={16} className="text-warning mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-warning">Stripe beállítás szükséges</p>
                      <p className="text-xs text-warning/80 mt-1">
                        A Stripe fiók beállítását később a beállítások menüben végezheti el.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bank Transfer */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
              <Icon name="BuildingLibraryIcon" size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-foreground">Banki átutalás</h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.enableBankTransfer}
                    onChange={(e) => handleInputChange('enableBankTransfer', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Hagyományos banki átutalás bankszámlaszám megadásával
              </p>

              {data.enableBankTransfer && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Bankszámlaszám *
                      </label>
                      <input
                        type="text"
                        value={data.bankAccountNumber}
                        onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                          errors.bankAccountNumber ? 'border-error' : 'border-border'
                        }`}
                        placeholder="12345678-12345678"
                      />
                      {errors.bankAccountNumber && (
                        <p className="mt-1 text-sm text-error">{errors.bankAccountNumber}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Bank neve *
                      </label>
                      <input
                        type="text"
                        value={data.bankName}
                        onChange={(e) => handleInputChange('bankName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                          errors.bankName ? 'border-error' : 'border-border'
                        }`}
                        placeholder="OTP Bank"
                      />
                      {errors.bankName && (
                        <p className="mt-1 text-sm text-error">{errors.bankName}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Számlatulajdonos neve *
                      </label>
                      <input
                        type="text"
                        value={data.accountHolderName}
                        onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                          errors.accountHolderName ? 'border-error' : 'border-border'
                        }`}
                        placeholder="Kovács János"
                      />
                      {errors.accountHolderName && (
                        <p className="mt-1 text-sm text-error">{errors.accountHolderName}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Fizetési utasítások
                      </label>
                      <textarea
                        value={data.paymentInstructions}
                        onChange={(e) => handleInputChange('paymentInstructions', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="További információk a bérlőknek az átutalásról..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Settings */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Számlázási beállítások</h3>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-success/10 rounded-lg">
              <Icon name="DocumentTextIcon" size={24} className="text-success" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-foreground">Automatikus számlázás</h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.invoiceSettings.enableAutomaticInvoicing}
                    onChange={(e) => handleInputChange('invoiceSettings.enableAutomaticInvoicing', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Automatikus havi számlák generálása magyar jogszabályoknak megfelelően
              </p>

              {data.invoiceSettings.enableAutomaticInvoicing && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Számla előtag *
                      </label>
                      <input
                        type="text"
                        value={data.invoiceSettings.invoicePrefix}
                        onChange={(e) => handleInputChange('invoiceSettings.invoicePrefix', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                          errors.invoicePrefix ? 'border-error' : 'border-border'
                        }`}
                        placeholder="INV"
                      />
                      {errors.invoicePrefix && (
                        <p className="mt-1 text-sm text-error">{errors.invoicePrefix}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Adószám *
                      </label>
                      <input
                        type="text"
                        value={data.invoiceSettings.taxNumber}
                        onChange={(e) => handleInputChange('invoiceSettings.taxNumber', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                          errors.taxNumber ? 'border-error' : 'border-border'
                        }`}
                        placeholder="12345678-1-23"
                      />
                      {errors.taxNumber && (
                        <p className="mt-1 text-sm text-error">{errors.taxNumber}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Cég neve *
                      </label>
                      <input
                        type="text"
                        value={data.invoiceSettings.companyName}
                        onChange={(e) => handleInputChange('invoiceSettings.companyName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                          errors.companyName ? 'border-error' : 'border-border'
                        }`}
                        placeholder="Ingatlan Kft."
                      />
                      {errors.companyName && (
                        <p className="mt-1 text-sm text-error">{errors.companyName}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onPrevious}
          className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name="ArrowLeftIcon" size={16} className="mr-2 inline" />
          Előző lépés
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Következő lépés
          <Icon name="ArrowRightIcon" size={16} className="ml-2 inline" />
        </button>
      </div>
    </div>
  );
};

export default PaymentConfigurationStep;