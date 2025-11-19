'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';


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

interface PropertySetupStepProps {
  properties: Property[];
  onPropertiesChange: (properties: Property[]) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const PropertySetupStep = ({ properties, onPropertiesChange, onNext, onPrevious }: PropertySetupStepProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<Omit<Property, 'id'>>({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    propertyType: '',
    totalUnits: 1,
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const propertyTypes = [
    { value: 'apartment', label: 'Lakás' },
    { value: 'house', label: 'Ház' },
    { value: 'commercial', label: 'Kereskedelmi' },
    { value: 'office', label: 'Iroda' },
    { value: 'warehouse', label: 'Raktár' },
    { value: 'other', label: 'Egyéb' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Az ingatlan neve kötelező';
    if (!formData.address.trim()) newErrors.address = 'A cím kötelező';
    if (!formData.city.trim()) newErrors.city = 'A város kötelező';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Az irányítószám kötelező';
    else if (!/^\d{4}$/.test(formData.postalCode)) newErrors.postalCode = 'Az irányítószám 4 számjegyből áll';
    if (!formData.propertyType) newErrors.propertyType = 'Az ingatlan típusa kötelező';
    if (formData.totalUnits < 1) newErrors.totalUnits = 'Legalább 1 egységet meg kell adni';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddProperty = () => {
    if (!validateForm()) return;

    const newProperty: Property = {
      id: Date.now().toString(),
      ...formData
    };

    onPropertiesChange([...properties, newProperty]);
    resetForm();
  };

  const handleEditProperty = () => {
    if (!validateForm() || !editingProperty) return;

    const updatedProperties = properties.map(p => 
      p.id === editingProperty.id ? { ...editingProperty, ...formData } : p
    );

    onPropertiesChange(updatedProperties);
    resetForm();
  };

  const handleDeleteProperty = (id: string) => {
    onPropertiesChange(properties.filter(p => p.id !== id));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      postalCode: '',
      propertyType: '',
      totalUnits: 1,
      description: ''
    });
    setErrors({});
    setShowAddForm(false);
    setEditingProperty(null);
  };

  const startEdit = (property: Property) => {
    setFormData({
      name: property.name,
      address: property.address,
      city: property.city,
      postalCode: property.postalCode,
      propertyType: property.propertyType,
      totalUnits: property.totalUnits,
      description: property.description
    });
    setEditingProperty(property);
    setShowAddForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Ingatlanok beállítása
        </h2>
        <p className="text-muted-foreground">
          Adja hozzá az ingatlanokat, amelyeket kezelni szeretne
        </p>
      </div>

      {/* Existing Properties */}
      {properties.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Hozzáadott ingatlanok</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {properties.map((property) => (
              <div key={property.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                      <Icon name="BuildingOfficeIcon" size={20} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{property.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {propertyTypes.find(t => t.value === property.propertyType)?.label}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(property)}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Icon name="PencilIcon" size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteProperty(property.id)}
                      className="p-1 text-muted-foreground hover:text-error transition-colors"
                    >
                      <Icon name="TrashIcon" size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{property.address}, {property.city} {property.postalCode}</p>
                  <p>{property.totalUnits} egység</p>
                  {property.description && <p>{property.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Property Form */}
      {showAddForm ? (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              {editingProperty ? 'Ingatlan szerkesztése' : 'Új ingatlan hozzáadása'}
            </h3>
            <button
              onClick={resetForm}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name="XMarkIcon" size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Ingatlan neve *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.name ? 'border-error' : 'border-border'
                }`}
                placeholder="pl. Fő utcai lakás"
              />
              {errors.name && <p className="mt-1 text-sm text-error">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Ingatlan típusa *
              </label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.propertyType ? 'border-error' : 'border-border'
                }`}
              >
                <option value="">Válasszon típust</option>
                {propertyTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.propertyType && <p className="mt-1 text-sm text-error">{errors.propertyType}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Egységek száma *
              </label>
              <input
                type="number"
                min="1"
                value={formData.totalUnits}
                onChange={(e) => setFormData({ ...formData, totalUnits: parseInt(e.target.value) || 1 })}
                className={`w-full px-3 py-2 border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.totalUnits ? 'border-error' : 'border-border'
                }`}
              />
              {errors.totalUnits && <p className="mt-1 text-sm text-error">{errors.totalUnits}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Cím *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.address ? 'border-error' : 'border-border'
                }`}
                placeholder="Fő utca 123."
              />
              {errors.address && <p className="mt-1 text-sm text-error">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Város *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.city ? 'border-error' : 'border-border'
                }`}
                placeholder="Budapest"
              />
              {errors.city && <p className="mt-1 text-sm text-error">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Irányítószám *
              </label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.postalCode ? 'border-error' : 'border-border'
                }`}
                placeholder="1234"
                maxLength={4}
              />
              {errors.postalCode && <p className="mt-1 text-sm text-error">{errors.postalCode}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Leírás
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="További információk az ingatlanról..."
              />
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
              onClick={editingProperty ? handleEditProperty : handleAddProperty}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              {editingProperty ? 'Mentés' : 'Hozzáadás'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full p-6 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
        >
          <Icon name="PlusIcon" size={24} className="mx-auto mb-2" />
          <p className="font-medium">Ingatlan hozzáadása</p>
          <p className="text-sm">Kattintson ide új ingatlan hozzáadásához</p>
        </button>
      )}

      {/* Skip Option */}
      {properties.length === 0 && !showAddForm && (
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="InformationCircleIcon" size={20} className="text-accent mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground mb-1">Később is hozzáadhat ingatlanokat</h4>
              <p className="text-sm text-muted-foreground">
                Ha most nem szeretne ingatlanokat hozzáadni, később megteheti a főoldalon.
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

export default PropertySetupStep;