'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface TenantInvitation {
  id: string;
  email: string;
  name: string;
  propertyId: string;
  unitNumber: string;
  status: 'pending' | 'sent' | 'accepted';
}

interface TenantInvitationStepProps {
  invitations: TenantInvitation[];
  onInvitationsChange: (invitations: TenantInvitation[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  properties: Array<{ id: string; name: string; totalUnits: number }>;
}

const TenantInvitationStep = ({ 
  invitations, 
  onInvitationsChange, 
  onNext, 
  onPrevious, 
  properties 
}: TenantInvitationStepProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    propertyId: '',
    unitNumber: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Az email cím kötelező';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Érvényes email címet adjon meg';
    } else if (invitations.some(inv => inv.email === formData.email)) {
      newErrors.email = 'Ez az email cím már szerepel a listában';
    }

    if (!formData.name.trim()) newErrors.name = 'A név kötelező';
    if (!formData.propertyId) newErrors.propertyId = 'Válasszon ingatlant';
    if (!formData.unitNumber.trim()) newErrors.unitNumber = 'Az egység száma kötelező';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddInvitation = () => {
    if (!validateForm()) return;

    const newInvitation: TenantInvitation = {
      id: Date.now().toString(),
      email: formData.email,
      name: formData.name,
      propertyId: formData.propertyId,
      unitNumber: formData.unitNumber,
      status: 'pending'
    };

    onInvitationsChange([...invitations, newInvitation]);
    resetForm();
  };

  const handleDeleteInvitation = (id: string) => {
    onInvitationsChange(invitations.filter(inv => inv.id !== id));
  };

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      propertyId: '',
      unitNumber: ''
    });
    setErrors({});
    setShowAddForm(false);
  };

  const getPropertyName = (propertyId: string) => {
    return properties.find(p => p.id === propertyId)?.name || 'Ismeretlen ingatlan';
  };

  const getStatusBadge = (status: TenantInvitation['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs bg-warning/10 text-warning rounded-full">Függőben</span>;
      case 'sent':
        return <span className="px-2 py-1 text-xs bg-accent/10 text-accent rounded-full">Elküldve</span>;
      case 'accepted':
        return <span className="px-2 py-1 text-xs bg-success/10 text-success rounded-full">Elfogadva</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Bérlők meghívása
        </h2>
        <p className="text-muted-foreground">
          Hívja meg bérlőit, hogy csatlakozzanak a rendszerhez
        </p>
      </div>

      {/* Existing Invitations */}
      {invitations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Meghívások</h3>
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-lg">
                      <Icon name="UserIcon" size={20} className="text-accent" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{invitation.name}</h4>
                      <p className="text-sm text-muted-foreground">{invitation.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {getPropertyName(invitation.propertyId)} - {invitation.unitNumber}. egység
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(invitation.status)}
                    <button
                      onClick={() => handleDeleteInvitation(invitation.id)}
                      className="p-1 text-muted-foreground hover:text-error transition-colors"
                    >
                      <Icon name="TrashIcon" size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Invitation Form */}
      {showAddForm ? (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Új bérlő meghívása</h3>
            <button
              onClick={resetForm}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name="XMarkIcon" size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Bérlő neve *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.name ? 'border-error' : 'border-border'
                }`}
                placeholder="Kovács János"
              />
              {errors.name && <p className="mt-1 text-sm text-error">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email cím *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.email ? 'border-error' : 'border-border'
                }`}
                placeholder="kovacs.janos@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-error">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Ingatlan *
              </label>
              <select
                value={formData.propertyId}
                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.propertyId ? 'border-error' : 'border-border'
                }`}
              >
                <option value="">Válasszon ingatlant</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
              {errors.propertyId && <p className="mt-1 text-sm text-error">{errors.propertyId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Egység száma *
              </label>
              <input
                type="text"
                value={formData.unitNumber}
                onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.unitNumber ? 'border-error' : 'border-border'
                }`}
                placeholder="1A, 2B, stb."
              />
              {errors.unitNumber && <p className="mt-1 text-sm text-error">{errors.unitNumber}</p>}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Mégse
            </button>
            <button
              onClick={handleAddInvitation}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Meghívás hozzáadása
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          disabled={properties.length === 0}
          className={`w-full p-6 border-2 border-dashed rounded-lg transition-colors ${
            properties.length === 0
              ? 'border-border text-muted-foreground cursor-not-allowed'
              : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
          }`}
        >
          <Icon name="UserPlusIcon" size={24} className="mx-auto mb-2" />
          <p className="font-medium">Bérlő meghívása</p>
          <p className="text-sm">
            {properties.length === 0 
              ? 'Először adjon hozzá ingatlanokat' :'Kattintson ide új bérlő meghívásához'
            }
          </p>
        </button>
      )}

      {/* Skip Option */}
      {invitations.length === 0 && !showAddForm && (
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="InformationCircleIcon" size={20} className="text-accent mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground mb-1">Később is meghívhat bérlőket</h4>
              <p className="text-sm text-muted-foreground">
                Ha most nem szeretne bérlőket meghívni, később megteheti az ingatlanok kezelése oldalon.
              </p>
            </div>
          </div>
        </div>
      )}

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
          onClick={onNext}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Következő lépés
          <Icon name="ArrowRightIcon" size={16} className="ml-2 inline" />
        </button>
      </div>
    </div>
  );
};

export default TenantInvitationStep;