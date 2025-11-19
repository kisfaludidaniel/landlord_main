'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

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

interface OrganizationDetailsStepProps {
  data: OrganizationDetails;
  onDataChange: (data: OrganizationDetails) => void;
  onNext: () => void;
  isValid: boolean;
}

const OrganizationDetailsStep = ({ data, onDataChange, onNext, isValid }: OrganizationDetailsStepProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'organizationName':
        if (!value.trim()) {
          newErrors[name] = 'A szervezet neve kötelező';
        } else {
          delete newErrors[name];
        }
        break;
      case 'businessRegistrationNumber':
        if (!value.trim()) {
          newErrors[name] = 'Az adószám kötelező';
        } else if (!/^\d{8}-\d{1}-\d{2}$/.test(value)) {
          newErrors[name] = 'Helyes formátum: 12345678-1-23';
        } else {
          delete newErrors[name];
        }
        break;
      case 'contactEmail':
        if (!value.trim()) {
          newErrors[name] = 'Az email cím kötelező';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[name] = 'Érvényes email címet adjon meg';
        } else {
          delete newErrors[name];
        }
        break;
      case 'contactPhone':
        if (!value.trim()) {
          newErrors[name] = 'A telefonszám kötelező';
        } else if (!/^(\+36|06)\d{8,9}$/.test(value.replace(/\s/g, ''))) {
          newErrors[name] = 'Helyes formátum: +36301234567 vagy 06301234567';
        } else {
          delete newErrors[name];
        }
        break;
      case 'postalCode':
        if (!value.trim()) {
          newErrors[name] = 'Az irányítószám kötelező';
        } else if (!/^\d{4}$/.test(value)) {
          newErrors[name] = 'Az irányítószám 4 számjegyből áll';
        } else {
          delete newErrors[name];
        }
        break;
      default:
        if (!value.trim()) {
          newErrors[name] = 'Ez a mező kötelező';
        } else {
          delete newErrors[name];
        }
    }

    setErrors(newErrors);
  };

  const handleInputChange = (name: string, value: string) => {
    onDataChange({ ...data, [name]: value });
    validateField(name, value);
  };

  const organizationTypes = [
    { value: 'individual', label: 'Magánszemély' },
    { value: 'sole_proprietor', label: 'Egyéni vállalkozó' },
    { value: 'limited_company', label: 'Korlátolt felelősségű társaság (Kft.)' },
    { value: 'joint_stock_company', label: 'Részvénytársaság (Rt.)' },
    { value: 'other', label: 'Egyéb' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Szervezeti adatok
        </h2>
        <p className="text-muted-foreground">
          Adja meg szervezete alapvető adatait a rendszer beállításához
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Organization Name */}
        <div className="md:col-span-2">
          <label htmlFor="organizationName" className="block text-sm font-medium text-foreground mb-2">
            Szervezet neve *
          </label>
          <input
            type="text"
            id="organizationName"
            value={data.organizationName}
            onChange={(e) => handleInputChange('organizationName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
              errors.organizationName ? 'border-error' : 'border-border'
            }`}
            placeholder="pl. Ingatlan Kft."
          />
          {errors.organizationName && (
            <p className="mt-1 text-sm text-error">{errors.organizationName}</p>
          )}
        </div>

        {/* Organization Type */}
        <div className="md:col-span-2">
          <label htmlFor="organizationType" className="block text-sm font-medium text-foreground mb-2">
            Szervezet típusa *
          </label>
          <select
            id="organizationType"
            value={data.organizationType}
            onChange={(e) => handleInputChange('organizationType', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Válasszon típust</option>
            {organizationTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.organizationType && (
            <p className="mt-1 text-sm text-error">{errors.organizationType}</p>
          )}
        </div>

        {/* Business Registration Number */}
        <div>
          <label htmlFor="businessRegistrationNumber" className="block text-sm font-medium text-foreground mb-2">
            Adószám *
            <span className="ml-1 text-muted-foreground text-xs">
              <Icon name="InformationCircleIcon" size={14} className="inline ml-1" />
            </span>
          </label>
          <input
            type="text"
            id="businessRegistrationNumber"
            value={data.businessRegistrationNumber}
            onChange={(e) => handleInputChange('businessRegistrationNumber', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
              errors.businessRegistrationNumber ? 'border-error' : 'border-border'
            }`}
            placeholder="12345678-1-23"
          />
          {errors.businessRegistrationNumber && (
            <p className="mt-1 text-sm text-error">{errors.businessRegistrationNumber}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Formátum: 8 számjegy - 1 számjegy - 2 számjegy
          </p>
        </div>

        {/* Contact Email */}
        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-foreground mb-2">
            Kapcsolattartó email *
          </label>
          <input
            type="email"
            id="contactEmail"
            value={data.contactEmail}
            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
              errors.contactEmail ? 'border-error' : 'border-border'
            }`}
            placeholder="kapcsolat@example.com"
          />
          {errors.contactEmail && (
            <p className="mt-1 text-sm text-error">{errors.contactEmail}</p>
          )}
        </div>

        {/* Contact Phone */}
        <div>
          <label htmlFor="contactPhone" className="block text-sm font-medium text-foreground mb-2">
            Telefonszám *
          </label>
          <input
            type="tel"
            id="contactPhone"
            value={data.contactPhone}
            onChange={(e) => handleInputChange('contactPhone', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
              errors.contactPhone ? 'border-error' : 'border-border'
            }`}
            placeholder="+36 30 123 4567"
          />
          {errors.contactPhone && (
            <p className="mt-1 text-sm text-error">{errors.contactPhone}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-foreground mb-2">
            Cím *
          </label>
          <input
            type="text"
            id="address"
            value={data.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
              errors.address ? 'border-error' : 'border-border'
            }`}
            placeholder="Fő utca 123."
          />
          {errors.address && (
            <p className="mt-1 text-sm text-error">{errors.address}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-foreground mb-2">
            Város *
          </label>
          <input
            type="text"
            id="city"
            value={data.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
              errors.city ? 'border-error' : 'border-border'
            }`}
            placeholder="Budapest"
          />
          {errors.city && (
            <p className="mt-1 text-sm text-error">{errors.city}</p>
          )}
        </div>

        {/* Postal Code */}
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-foreground mb-2">
            Irányítószám *
          </label>
          <input
            type="text"
            id="postalCode"
            value={data.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
              errors.postalCode ? 'border-error' : 'border-border'
            }`}
            placeholder="1234"
            maxLength={4}
          />
          {errors.postalCode && (
            <p className="mt-1 text-sm text-error">{errors.postalCode}</p>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-muted/50 rounded-lg p-4 mt-6">
        <div className="flex items-start space-x-3">
          <Icon name="InformationCircleIcon" size={20} className="text-accent mt-0.5" />
          <div>
            <h4 className="font-medium text-foreground mb-1">Miért szükségesek ezek az adatok?</h4>
            <p className="text-sm text-muted-foreground">
              Ezek az információk szükségesek a számlázáshoz, szerződések generálásához és a magyar jogszabályoknak való megfeleléshez.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-6">
        <button
          onClick={onNext}
          disabled={!isValid}
          className={`px-6 py-2 rounded-md font-medium transition-colors duration-200 ${
            isValid
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          Következő lépés
          <Icon name="ArrowRightIcon" size={16} className="ml-2 inline" />
        </button>
      </div>
    </div>
  );
};

export default OrganizationDetailsStep;