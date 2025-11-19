'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Property {
  id: string;
  name: string;
  type: 'lakas' | 'haz' | 'kereskedelmi' | 'iroda' | 'raktar' | 'tarsashaz' | 'egyeb';
  buildings?: Building[];
  units?: Unit[];
}

interface Building {
  id: string;
  name: string;
  units: Unit[];
}

interface Unit {
  id: string;
  name: string;
  unit_type: string;
  isOccupied?: boolean;
}

interface TenantInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (inviteData: { unitIds: string[]; emails: string[] }) => void;
  properties: Property[];
}

const TenantInviteModal: React.FC<TenantInviteModalProps> = ({
  isOpen,
  onClose,
  onInvite,
  properties
}) => {
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [emails, setEmails] = useState<string>('');
  const [step, setStep] = useState<'property' | 'units' | 'emails'>('property');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedProperty('');
      setSelectedUnits([]);
      setEmails('');
      setStep('property');
    }
  }, [isOpen]);

  const selectedPropertyData = properties.find(p => p.id === selectedProperty);
  
  const getAvailableUnits = (): Unit[] => {
    if (!selectedPropertyData) return [];

    // For társasház type, get units from buildings
    if (selectedPropertyData.type === 'tarsashaz') {
      return selectedPropertyData.buildings?.flatMap(building => 
        building.units.filter(unit => !unit.isOccupied)
      ) || [];
    }

    // For other types, get direct units
    return selectedPropertyData.units?.filter(unit => !unit.isOccupied) || [];
  };

  const handlePropertySelect = (propertyId: string) => {
    setSelectedProperty(propertyId);
    setSelectedUnits([]);
    setStep('units');
  };

  const handleUnitToggle = (unitId: string) => {
    setSelectedUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  const handleEmailsStep = () => {
    if (selectedUnits.length === 0) return;
    setStep('emails');
  };

  const handleSubmit = () => {
    const emailList = emails
      .split('\n')
      .map(email => email.trim())
      .filter(email => email && isValidEmail(email));

    if (emailList.length === 0 || selectedUnits.length === 0) return;

    onInvite({
      unitIds: selectedUnits,
      emails: emailList
    });

    onClose();
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getEmailCount = (): number => {
    return emails
      .split('\n')
      .map(email => email.trim())
      .filter(email => email && isValidEmail(email))
      .length;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Bérlő meghívása</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {step === 'property' && 'Válassza ki az ingatlant'}
              {step === 'units' && 'Válassza ki az egységeket'}
              {step === 'emails' && 'Adja meg az email címeket'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="XMarkIcon" size={24} />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center p-4 bg-muted/30">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${step === 'property' ? 'text-primary' : step === 'units' || step === 'emails' ? 'text-foreground' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${step === 'property' ? 'border-primary bg-primary text-primary-foreground' : (step === 'units' || step === 'emails') ? 'border-green-500 bg-green-500 text-white' : 'border-border'}`}>
                {(step === 'units' || step === 'emails') ? <Icon name="CheckIcon" size={16} /> : '1'}
              </div>
              <span className="text-sm font-medium">Ingatlan</span>
            </div>
            <div className="w-8 h-0.5 bg-border"></div>
            <div className={`flex items-center space-x-2 ${step === 'units' ? 'text-primary' : step === 'emails' ? 'text-foreground' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${step === 'units' ? 'border-primary bg-primary text-primary-foreground' : step === 'emails' ? 'border-green-500 bg-green-500 text-white' : 'border-border'}`}>
                {step === 'emails' ? <Icon name="CheckIcon" size={16} /> : '2'}
              </div>
              <span className="text-sm font-medium">Egységek</span>
            </div>
            <div className="w-8 h-0.5 bg-border"></div>
            <div className={`flex items-center space-x-2 ${step === 'emails' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${step === 'emails' ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>
                3
              </div>
              <span className="text-sm font-medium">Email</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {/* Step 1: Property selection */}
          {step === 'property' && (
            <div className="space-y-4">
              <h3 className="font-medium text-foreground mb-4">Melyik ingatlan?</h3>
              <div className="space-y-3">
                {properties.map((property) => (
                  <button
                    key={property.id}
                    onClick={() => handlePropertySelect(property.id)}
                    className="w-full p-4 border border-border rounded-lg text-left hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{property.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {property.type === 'tarsashaz' ? 'Társasház' : property.type}
                        </p>
                      </div>
                      <Icon name="ChevronRightIcon" size={20} className="text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Unit selection */}
          {step === 'units' && selectedPropertyData && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setStep('property')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon name="ArrowLeftIcon" size={20} />
                </button>
                <div>
                  <h3 className="font-medium text-foreground">{selectedPropertyData.name}</h3>
                  <p className="text-sm text-muted-foreground">Válassza ki az elérhető egységeket</p>
                </div>
              </div>

              <div className="space-y-3">
                {selectedPropertyData.type === 'tarsashaz' ? (
                  // Group by buildings for társasház
                  selectedPropertyData.buildings?.map((building) => (
                    <div key={building.id} className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground border-b border-border pb-1">
                        {building.name}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 ml-4">
                        {building.units.filter(unit => !unit.isOccupied).map((unit) => (
                          <label key={unit.id} className="flex items-center space-x-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                            <input
                              type="checkbox"
                              checked={selectedUnits.includes(unit.id)}
                              onChange={() => handleUnitToggle(unit.id)}
                              className="rounded border-border"
                            />
                            <span className="text-sm text-foreground">{unit.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  // Direct units for other property types
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {getAvailableUnits().map((unit) => (
                      <label key={unit.id} className="flex items-center space-x-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                        <input
                          type="checkbox"
                          checked={selectedUnits.includes(unit.id)}
                          onChange={() => handleUnitToggle(unit.id)}
                          className="rounded border-border"
                        />
                        <span className="text-sm text-foreground">{unit.name}</span>
                      </label>
                    ))}
                  </div>
                )}

                {getAvailableUnits().length === 0 && (
                  <div className="text-center py-8">
                    <Icon name="HomeIcon" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <h4 className="font-medium text-foreground mb-2">Nincsenek elérhető egységek</h4>
                    <p className="text-muted-foreground">
                      Jelenleg minden egység foglalt ebben az ingatlanban.
                    </p>
                  </div>
                )}
              </div>

              {selectedUnits.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    {selectedUnits.length} egység kiválasztva
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Email input */}
          {step === 'emails' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setStep('units')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon name="ArrowLeftIcon" size={20} />
                </button>
                <div>
                  <h3 className="font-medium text-foreground">Email címek</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedUnits.length} egységhez küldi a meghívót
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email címek (soronként egy)
                </label>
                <textarea
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  rows={8}
                  placeholder={`tenant1@example.com
tenant2@example.com
tenant3@example.com`}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Minden bérlő minden kiválasztott egységhez kap meghívót.
                </p>
              </div>

              {emails && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700">
                    {getEmailCount()} érvényes email cím → {selectedUnits.length} egység = {getEmailCount() * selectedUnits.length} meghívó
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Mégse
          </button>
          
          {step === 'units' && (
            <button
              onClick={handleEmailsStep}
              disabled={selectedUnits.length === 0}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Tovább ({selectedUnits.length})
            </button>
          )}
          
          {step === 'emails' && (
            <button
              onClick={handleSubmit}
              disabled={getEmailCount() === 0}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Meghívók küldése
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantInviteModal;